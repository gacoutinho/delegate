/**
 * Runner — the bridge between an agent definition and the Claude Agent SDK.
 *
 * The Agent SDK (`query`) runs the Claude Code harness as a library: the agent
 * really reads/writes files, runs shell commands, searches the web, etc. Here we
 * normalize the SDK's message stream into simple `AgentEvent`s, which the
 * /api/run route streams over SSE and the UI renders.
 */
import { query } from "@anthropic-ai/claude-agent-sdk";
import type { AgentDef } from "./agents";
import { enabledMcpServers, connectorContextNote } from "./connectors";

/** Agents' working directory: the project root.
 *  User inputs live in `data/`; outputs usually go to `data/` too. */
const CWD = process.cwd();

const DEFAULT_MODEL = process.env.DELEGATE_DEFAULT_MODEL || "claude-opus-4-8";

export type AgentEvent =
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
 * Run a single agent on a task and produce a stream of AgentEvents.
 * The agent's final text is surfaced (via the `result.text` event) so the
 * "team" mode can chain agents together.
 */
export async function* runAgent(
  agent: AgentDef,
  task: string,
): AsyncGenerator<AgentEvent> {
  yield { kind: "start", agent: agent.id, agentName: agent.name };

  // Connected apps (Slack, Notion, GitHub…) become MCP tools available to the
  // agent. A failing/auth-pending server doesn't break the run (MCP startup is
  // non-blocking) — its tools simply won't be available.
  const mcpServers = enabledMcpServers();
  const note = connectorContextNote();
  const systemPrompt = note ? `${agent.systemPrompt}\n\n${note}` : agent.systemPrompt;

  const response = query({
    prompt: task,
    options: {
      model: agent.model || DEFAULT_MODEL,
      // Keep the full Claude Code agent behavior (reliable tool use) and append
      // this agent's specific instructions (+ connected integrations note).
      systemPrompt: { type: "preset", preset: "claude_code", append: systemPrompt },
      allowedTools: agent.tools,
      mcpServers: Object.keys(mcpServers).length ? mcpServers : undefined,
      cwd: CWD,
      // Don't load local settings.json/CLAUDE.md — behavior comes from the
      // agent file, reproducibly.
      settingSources: [],
      // Real, autonomous execution (no interactive prompt). See the README note.
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
              text: `model ${message.model} · tools: ${message.tools.join(", ")}`,
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
            yield { kind: "error", agent: agent.id, text: `model error: ${message.error}` };
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
 * Team mode: run several agents in sequence. Each agent receives the original
 * task + a summary of what the previous agents delivered, so it can build on
 * their work (files on disk + context text).
 */
export async function* runTeam(
  agents: AgentDef[],
  task: string,
): AsyncGenerator<AgentEvent> {
  const priorResults: { name: string; text: string }[] = [];

  for (const agent of agents) {
    let prompt = task;
    if (priorResults.length > 0) {
      const context = priorResults
        .map((r) => `### Output from "${r.name}"\n${r.text}`)
        .join("\n\n");
      prompt =
        `Original team task:\n${task}\n\n` +
        `The previous agents already worked on this (the files they created are ` +
        `on disk). Build on their work.\n\n${context}`;
    }

    let finalText = "";
    for await (const ev of runAgent(agent, prompt)) {
      if (ev.kind === "result") finalText = ev.text;
      // Don't propagate each individual agent's "done" in team mode.
      if (ev.kind !== "done") yield ev;
    }
    priorResults.push({ name: agent.name, text: finalText });
  }

  yield { kind: "done" };
}
