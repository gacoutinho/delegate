/**
 * Agent loader.
 *
 * Each agent is a Markdown file at `agents/<area>/<id>.md` with frontmatter.
 * This is intentional: easy to version in Git, easy to read, and Claude Code
 * itself can create/edit these files to customize the platform.
 *
 *   ---
 *   name: CSV Analyst
 *   description: Reads a CSV and answers analytical questions about it.
 *   model: claude-opus-4-8            # optional
 *   tools: [Read, Bash, Write, Glob]  # optional: allow-list of tools
 *   examples:
 *     - "Which 5 products grew the most in sales.csv?"
 *   ---
 *   <markdown body = the agent's system prompt / instructions>
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
  /** Allow-list of built-in tools (Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch...). */
  tools?: string[];
  /** Task suggestions shown in the UI. */
  examples?: string[];
  /** Markdown body = the agent's system prompt. */
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

/** Lightweight agent shape for the client (without the full system prompt). */
export type AgentSummary = Omit<AgentDef, "systemPrompt" | "filePath">;

export function toSummary(a: AgentDef): AgentSummary {
  const { systemPrompt: _s, filePath: _f, ...rest } = a;
  return rest;
}
