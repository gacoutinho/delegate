/**
 * Carregador de agentes.
 *
 * Cada agente é um arquivo Markdown em `agents/<area>/<id>.md` com frontmatter.
 * Isso é de propósito: é fácil de versionar no Git, fácil de ler, e o próprio
 * Claude Code consegue criar/editar esses arquivos para customizar a plataforma.
 *
 *   ---
 *   name: Analista de CSV
 *   description: Lê um CSV e responde perguntas analíticas sobre ele.
 *   model: claude-opus-4-8            # opcional
 *   tools: [Read, Bash, Write, Glob]  # opcional: lista de ferramentas permitidas
 *   examples:
 *     - "Quais os 5 produtos que mais cresceram em vendas.csv?"
 *   ---
 *   <corpo em markdown = system prompt / instruções do agente>
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Area = {
  id: string;
  emoji: string;
  title: string;
  description: string;
};

export type AgentDef = {
  id: string;
  area: string;
  name: string;
  description: string;
  model?: string;
  /** Lista de ferramentas built-in permitidas (Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch...). */
  tools?: string[];
  /** Sugestões de tarefas mostradas na interface. */
  examples?: string[];
  /** Corpo do markdown = system prompt do agente. */
  systemPrompt: string;
  filePath: string;
};

const ROOT = process.cwd();
const AGENTS_DIR = path.join(ROOT, "agents");
const AREAS_FILE = path.join(ROOT, "areas.config.json");

export function loadAreas(): Area[] {
  const raw = JSON.parse(fs.readFileSync(AREAS_FILE, "utf8")) as { areas: Area[] };
  return raw.areas;
}

export function loadAgents(): AgentDef[] {
  if (!fs.existsSync(AGENTS_DIR)) return [];
  const agents: AgentDef[] = [];

  for (const area of fs.readdirSync(AGENTS_DIR)) {
    const areaDir = path.join(AGENTS_DIR, area);
    if (!fs.statSync(areaDir).isDirectory()) continue;

    for (const file of fs.readdirSync(areaDir)) {
      if (!file.endsWith(".md")) continue;
      const filePath = path.join(areaDir, file);
      const parsed = matter(fs.readFileSync(filePath, "utf8"));
      const fm = parsed.data as Record<string, unknown>;
      const id = file.replace(/\.md$/, "");

      agents.push({
        id,
        area: typeof fm.area === "string" ? fm.area : area,
        name: typeof fm.name === "string" ? fm.name : id,
        description: typeof fm.description === "string" ? fm.description : "",
        model: typeof fm.model === "string" ? fm.model : undefined,
        tools: Array.isArray(fm.tools) ? (fm.tools as string[]) : undefined,
        examples: Array.isArray(fm.examples) ? (fm.examples as string[]) : undefined,
        systemPrompt: parsed.content.trim(),
        filePath,
      });
    }
  }

  return agents;
}

export function getAgent(id: string): AgentDef | undefined {
  return loadAgents().find((a) => a.id === id);
}

/** Versão "leve" do agente para enviar ao cliente (sem o system prompt completo). */
export type AgentSummary = Omit<AgentDef, "systemPrompt" | "filePath">;

export function toSummary(a: AgentDef): AgentSummary {
  const { systemPrompt: _s, filePath: _f, ...rest } = a;
  return rest;
}
