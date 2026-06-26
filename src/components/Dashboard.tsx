"use client";

import { useState } from "react";
import type { Area, AgentSummary } from "@/lib/agents";
import Workspace from "./Workspace";

export default function Dashboard({
  areas,
  agents,
}: {
  areas: Area[];
  agents: AgentSummary[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const selectedAgents = selected
    .map((id) => agents.find((a) => a.id === id))
    .filter((a): a is AgentSummary => Boolean(a));

  return (
    <>
      {areas.map((area) => {
        const list = agents.filter((a) => a.area === area.id);
        if (list.length === 0) return null;
        return (
          <section className="area-section" key={area.id}>
            <div className="area-head">
              <span className="area-emoji">{area.emoji}</span>
              <span className="area-title">{area.title}</span>
              <span className="area-desc">— {area.description}</span>
            </div>
            <div className="grid">
              {list.map((agent) => {
                const isSel = selected.includes(agent.id);
                return (
                  <button
                    key={agent.id}
                    className={`card${isSel ? " selected" : ""}`}
                    onClick={() => toggle(agent.id)}
                  >
                    <span className="card-select">{isSel ? "✓ selecionado" : "selecionar"}</span>
                    <div className="card-name">{agent.name}</div>
                    <div className="card-desc">{agent.description}</div>
                    {agent.tools && (
                      <div className="card-meta">
                        {agent.tools.slice(0, 5).map((t) => (
                          <span className="tag" key={t}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {selectedAgents.length > 0 && (
        <div className="teambar">
          <div className="names">
            {selectedAgents.length === 1 ? (
              <>Agente: <strong>{selectedAgents[0].name}</strong></>
            ) : (
              <>
                Equipe ({selectedAgents.length}):{" "}
                <strong>{selectedAgents.map((a) => a.name).join(" → ")}</strong>{" "}
                <span style={{ color: "var(--text-faint)" }}>(executam em sequência)</span>
              </>
            )}
          </div>
          <button className="btn-ghost" onClick={() => setSelected([])}>
            limpar
          </button>
          <button className="btn" onClick={() => setOpen(true)}>
            Trabalhar →
          </button>
        </div>
      )}

      {open && (
        <Workspace agents={selectedAgents} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
