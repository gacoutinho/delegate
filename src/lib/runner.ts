/**
 * Runner — a ponte entre uma definição de agente e o Claude Agent SDK.
 *
 * O Agent SDK (`query`) roda o harness do Claude Code como biblioteca: o agente
 * realmente lê/escreve arquivos, roda comandos no shell, busca na web, etc.
 * Aqui a gente normaliza o fluxo de mensagens do SDK em `ForgeEvent`s simples,
 * que a rota /api/run transmite por SSE e a interface renderiza.
 */
import path from "node:path";
import { query } from "@anthropic-ai/claude-agent-sdk";
import type { AgentDef } from "./agents";

/** Diretório de trabalho dos agentes: a raiz do projeto.
 *  Entradas do usuário ficam em `data/`; saídas costumam ir para `data/` também. */
const CWD = process.cwd();

const DEFAULT_MODEL = process.env.AGENT_FORGE_DEFAULT_MODEL || "claude-opus-4-8";

export type ForgeEvent =
  | { kind: "start"; agent: string; agentName: string }
  | { kind: "system"; agent: string; text: string }
  | { kind: "assistant"; agent: string; text: string }
  | { kind: "tool"; agent: string; name: string; input: unknown }
  | { kind: "result"; agent: string; text: string; costUsd?: number; numTurns?: number; isError?: boolean }
  | { kind: "error"; agent: string; text: string }
  | { kind: "done" };

function envForSdk(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

/**
 * Roda um único agente com uma tarefa e produz um stream de ForgeEvents.
 * O texto final do agente é retornado também (via o evento `result.text`)
 * para que o modo "equipe" possa encadear agentes.
 */
export async function* runAgent(
  agent: AgentDef,
  task: string,
): AsyncGenerator<ForgeEvent> {
  yield { kind: "start", agent: agent.id, agentName: agent.name };

  const response = query({
    prompt: task,
    options: {
      model: agent.model || DEFAULT_MODEL,
      // Mantém todo o comportamento do agente do Claude Code (uso de ferramentas
      // confiável) e adiciona as instruções específicas deste agente.
      systemPrompt: { type: "preset", preset: "claude_code", append: agent.systemPrompt },
      allowedTools: agent.tools,
      cwd: CWD,
      // Não carrega settings.json/CLAUDE.md locais — o comportamento vem do
      // arquivo do agente, de forma reproduzível.
      settingSources: [],
      // Execução real e autônoma (sem prompt interativo). Veja o aviso no README.
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      env: envForSdk(),
    },
  });

  try {
    for await (const message of response) {
      switch (message.type) {
        case "system":
          if (message.subtype === "init") {
            yield {
              kind: "system",
              agent: agent.id,
              text: `modelo ${message.model} · ferramentas: ${message.tools.join(", ")}`,
            };
          }
          break;

        case "assistant": {
          for (const block of message.message.content) {
            if (block.type === "text" && block.text.trim()) {
              yield { kind: "assistant", agent: agent.id, text: block.text };
            } else if (block.type === "tool_use") {
              yield { kind: "tool", agent: agent.id, name: block.name, input: block.input };
            }
          }
          if (message.error) {
            yield { kind: "error", agent: agent.id, text: `erro do modelo: ${message.error}` };
          }
          break;
        }

        case "result": {
          yield {
            kind: "result",
            agent: agent.id,
            text: message.subtype === "success" ? message.result : `(${message.subtype})`,
            costUsd: message.total_cost_usd,
            numTurns: message.num_turns,
            isError: message.is_error,
          };
          break;
        }
      }
    }
  } catch (err) {
    yield {
      kind: "error",
      agent: agent.id,
      text: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Modo equipe: roda vários agentes em sequência. Cada agente recebe a tarefa
 * original + um resumo do que os agentes anteriores entregaram, podendo
 * construir sobre o trabalho deles (arquivos no disco + texto de contexto).
 */
export async function* runTeam(
  agents: AgentDef[],
  task: string,
): AsyncGenerator<ForgeEvent> {
  const priorResults: { name: string; text: string }[] = [];

  for (const agent of agents) {
    let prompt = task;
    if (priorResults.length > 0) {
      const context = priorResults
        .map((r) => `### Entrega de "${r.name}"\n${r.text}`)
        .join("\n\n");
      prompt =
        `Tarefa original da equipe:\n${task}\n\n` +
        `Os agentes anteriores já trabalharam nisto (os arquivos que eles ` +
        `criaram estão no disco). Construa sobre o trabalho deles.\n\n${context}`;
    }

    let finalText = "";
    for await (const ev of runAgent(agent, prompt)) {
      if (ev.kind === "result") finalText = ev.text;
      // Não propaga o "done" de cada agente individual no modo equipe.
      if (ev.kind !== "done") yield ev;
    }
    priorResults.push({ name: agent.name, text: finalText });
  }

  yield { kind: "done" };
}
