"use client";

import { useEffect, useState } from "react";
import { Logo } from "./logos";

type ConnectorView = {
  id: string;
  name: string;
  category: string;
  transport: string;
  url: string;
  auth: "token" | "oauth" | "none";
  authHint: string;
  enabled: boolean;
  hasToken: boolean;
  effectiveUrl: string;
  connected: boolean;
};

export default function Connectors() {
  const [connectors, setConnectors] = useState<ConnectorView[]>([]);
  const [active, setActive] = useState<ConnectorView | null>(null);
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/connectors")
      .then((r) => r.json())
      .then((d) => setConnectors(d.connectors ?? []))
      .catch(() => {});
  }, []);

  function open(c: ConnectorView) {
    setActive(c);
    setUrl(c.effectiveUrl);
    setToken("");
  }

  async function save(patch: { enabled?: boolean; url?: string; token?: string }) {
    if (!active) return;
    setSaving(true);
    try {
      const res = await fetch("/api/connectors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: active.id, ...patch }),
      });
      const d = await res.json();
      if (d.connectors) setConnectors(d.connectors);
    } finally {
      setSaving(false);
      setActive(null);
    }
  }

  const connectedCount = connectors.filter((c) => c.connected).length;

  return (
    <section className="connectors">
      <div className="conn-head">
        <span className="conn-title">Connectors</span>
        <span className="conn-sub">
          Connect your apps so agents can act in them. {connectedCount > 0 ? `${connectedCount} connected.` : "Click a logo to connect."}
        </span>
      </div>

      <div className="conn-strip">
        {connectors.map((c) => (
          <button
            key={c.id}
            className={`conn-chip${c.connected ? " on" : ""}`}
            onClick={() => open(c)}
            title={c.connected ? `${c.name} — connected` : `Connect ${c.name}`}
          >
            <Logo id={c.id} name={c.name} />
            <span className="conn-name">{c.name}</span>
            <span className={`conn-dot${c.connected ? " on" : ""}`} aria-hidden="true" />
          </button>
        ))}
      </div>

      {active && (
        <div className="conn-overlay" onClick={() => setActive(null)}>
          <div className="conn-modal" onClick={(e) => e.stopPropagation()}>
            <div className="conn-modal-head">
              <Logo id={active.id} name={active.name} />
              <div>
                <div className="conn-modal-title">{active.name}</div>
                <div className="conn-modal-cat">{active.category} · {active.transport.toUpperCase()} MCP</div>
              </div>
              <button className="x" onClick={() => setActive(null)} aria-label="Close">×</button>
            </div>

            <label className="conn-label">MCP endpoint URL</label>
            <input
              className="conn-input"
              value={url}
              placeholder="https://mcp.example.com/mcp"
              onChange={(e) => setUrl(e.target.value)}
            />

            <label className="conn-label">
              Access token {active.hasToken && <span className="conn-saved">• saved</span>}
            </label>
            <input
              className="conn-input"
              type="password"
              value={token}
              placeholder={active.hasToken ? "•••••••• (leave blank to keep)" : "paste token"}
              onChange={(e) => setToken(e.target.value)}
            />
            <p className="conn-hint">{active.authHint}</p>

            <div className="conn-actions">
              {active.connected && (
                <button
                  className="ghost"
                  disabled={saving}
                  onClick={() => save({ enabled: false })}
                >
                  Disconnect
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button className="ghost" disabled={saving} onClick={() => setActive(null)}>
                Cancel
              </button>
              <button
                className="btn"
                disabled={saving || !url.trim()}
                onClick={() =>
                  save({ enabled: true, url, ...(token.trim() ? { token } : {}) })
                }
              >
                {saving ? "Saving…" : active.connected ? "Save" : "Connect"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
