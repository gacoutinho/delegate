/**
 * Connectors — third-party apps the agents can use, exposed as MCP servers.
 *
 * Catalog lives in `connectors.config.json`. The per-install state (which ones
 * are enabled, their endpoint URL and access token) is saved locally in
 * `connectors.local.json`, which is git-ignored so secrets never leave the
 * machine. Tokens are NEVER sent back to the browser — the client only learns
 * whether a token is set.
 */
import fs from "node:fs";
import path from "node:path";
import type { McpServerConfig } from "@anthropic-ai/claude-agent-sdk";

export type Transport = "http" | "sse" | "stdio";

export type Connector = {
  id: string;
  name: string;
  category: string;
  transport: Transport;
  /** Default MCP endpoint (editable per install). */
  url: string;
  auth: "token" | "oauth" | "none";
  authHint: string;
};

export type ConnectorState = {
  enabled?: boolean;
  /** Overrides the catalog URL when set. */
  url?: string;
  token?: string;
};

/** What the browser is allowed to see — never the raw token. */
export type ConnectorView = Omit<Connector, never> & {
  enabled: boolean;
  hasToken: boolean;
  effectiveUrl: string;
  connected: boolean;
};

const ROOT = process.cwd();
const CATALOG_FILE = path.join(ROOT, "connectors.config.json");
const STATE_FILE = path.join(ROOT, "connectors.local.json");

export function loadCatalog(): Connector[] {
  const raw = JSON.parse(fs.readFileSync(CATALOG_FILE, "utf8")) as { connectors: Connector[] };
  return raw.connectors;
}

function loadState(): Record<string, ConnectorState> {
  if (!fs.existsSync(STATE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) as Record<string, ConnectorState>;
  } catch {
    return {};
  }
}

function saveState(state: Record<string, ConnectorState>) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n", "utf8");
}

/** A connector is "connected" when enabled and reachable (has a URL). */
function isConnected(c: Connector, s: ConnectorState): boolean {
  return Boolean(s.enabled && (s.url || c.url));
}

export function listConnectors(): ConnectorView[] {
  const state = loadState();
  return loadCatalog().map((c) => {
    const s = state[c.id] ?? {};
    const effectiveUrl = s.url || c.url;
    return {
      ...c,
      enabled: Boolean(s.enabled),
      hasToken: Boolean(s.token),
      effectiveUrl,
      connected: isConnected(c, s),
    };
  });
}

export function updateConnector(
  id: string,
  patch: { enabled?: boolean; url?: string; token?: string },
): ConnectorView[] {
  const catalog = loadCatalog();
  if (!catalog.some((c) => c.id === id)) throw new Error(`Unknown connector: ${id}`);

  const state = loadState();
  const cur = state[id] ?? {};
  state[id] = {
    enabled: patch.enabled ?? cur.enabled,
    url: patch.url !== undefined ? patch.url.trim() || undefined : cur.url,
    // An empty token string means "clear it".
    token: patch.token !== undefined ? patch.token.trim() || undefined : cur.token,
  };
  saveState(state);
  return listConnectors();
}

/**
 * Build the `mcpServers` record passed to the Agent SDK for every run.
 * Only enabled connectors with a URL are included. A failing/auth-pending
 * server doesn't break the run — MCP startup is non-blocking.
 */
export function enabledMcpServers(): Record<string, McpServerConfig> {
  const state = loadState();
  const servers: Record<string, McpServerConfig> = {};

  for (const c of loadCatalog()) {
    const s = state[c.id] ?? {};
    if (!isConnected(c, s)) continue;
    const url = s.url || c.url;
    const headers = s.token ? { Authorization: `Bearer ${s.token}` } : undefined;

    if (c.transport === "sse") {
      servers[c.id] = { type: "sse", url, headers };
    } else {
      servers[c.id] = { type: "http", url, headers };
    }
  }
  return servers;
}

/** A short note appended to the agent's system prompt listing what's connected. */
export function connectorContextNote(): string {
  const connected = listConnectors().filter((c) => c.connected);
  if (connected.length === 0) return "";
  const names = connected.map((c) => c.name).join(", ");
  return (
    `Connected integrations available to you as MCP tools: ${names}. ` +
    `Use them when the task calls for it (their tools are named like ` +
    `mcp__<service>__<action>). If a connected tool fails to authenticate, ` +
    `say so plainly instead of guessing.`
  );
}
