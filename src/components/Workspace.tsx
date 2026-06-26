"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentSummary } from "@/lib/agents";
import type { ForgeEvent } from "@/lib/runner";

type Item = ForgeEvent & { _id: number };

export default function Workspace({
  agents,
  onClose,
}: {
  agents: AgentSummary[];
  onClose: () => void;
}) {
  const [task, setTask] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [running, setRunning] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const counter = useRef(0);
  const isTeam = agents.length > 1;
  const nameOf = (id: string) => agents.find((a) => a.id === id)?.name ?? id;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [items]);

  const push = (ev: ForgeEvent) =>
    setItems((prev) => [...prev, { ...ev, _id: counter.current++ }]);

  async function run() {
    if (!task.trim() || running) return;
    setRunning(true);
    push({ kind: "assistant", agent: "__user", text: task } as ForgeEvent);
    const sentTask = task;
    setTask("");

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agentIds: agents.map((a) => a.id), task: sentTask }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        push({ kind: "error", agent: "system", text: err.error ?? "Falha na requisição." });
        setRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          try {
            const ev = JSON.parse(json) as ForgeEvent;
            if (ev.kind === "done") setRunning(false);
            else push(ev);
          } catch {
            /* ignora frames parciais */
          }
        }
      }
    } catch (e) {
      push({ kind: "error", agent: "system", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="ws-overlay" onClick={onClose}>
      <div className="ws" onClick={(e) => e.stopPropagation()}>
        <div className="ws-head">
          <div>
            <div className="ws-title">
              {isTeam ? `Equipe: ${agents.map((a) => a.name).join(" → ")}` : agents[0]?.name}
            </div>
            <div className="ws-sub">
              {isTeam ? "Os agentes executam em sequência, um sobre o trabalho do outro." : "Descreva a tarefa. O agente vai executá-la de verdade."}
            </div>
          </div>
          <button className="ws-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="ws-body" ref={bodyRef}>
          {items.length === 0 && (
            <div className="empty-hint">
              Descreva uma tarefa abaixo e clique em Executar.
              {agents[0]?.examples && agents[0].examples.length > 0 && (
                <>
                  <br />
                  <br />
                  Exemplos:
                  <br />
                  {agents[0].examples.map((ex, i) => (
                    <div key={i} style={{ marginTop: 6 }}>
                      <button className="btn-ghost" onClick={() => setTask(ex)}>
                        {ex}
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {items.map((it) => (
            <EventView key={it._id} ev={it} isTeam={isTeam} nameOf={nameOf} />
          ))}

          {running && (
            <div className="evt-system">
              <span className="spinner" />
              trabalhando…
            </div>
          )}
        </div>

        <div className="ws-foot">
          <textarea
            value={task}
            placeholder="Ex.: Liste os arquivos em data/ e me diga o que tem em cada um."
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run();
            }}
            disabled={running}
          />
          <button className="btn" onClick={run} disabled={running || !task.trim()}>
            {running ? "Executando…" : "Executar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EventView({
  ev,
  isTeam,
  nameOf,
}: {
  ev: ForgeEvent;
  isTeam: boolean;
  nameOf: (id: string) => string;
}) {
  const who = (id: string) => (isTeam ? nameOf(id) : "Agente");

  switch (ev.kind) {
    case "assistant":
      if (ev.agent === "__user")
        return <div className="evt evt-user">{ev.text}</div>;
      return (
        <div className="evt evt-assistant">
          <div className="who">{who(ev.agent)}</div>
          {ev.text}
        </div>
      );
    case "start":
      return <div className="evt-system">▶ {ev.agentName}</div>;
    case "system":
      return <div className="evt-system">{ev.text}</div>;
    case "tool":
      return (
        <div className="evt evt-tool">
          <span className="tool-name">⚙ {ev.name}</span>
          <pre>{prettyInput(ev.input)}</pre>
        </div>
      );
    case "result":
      return (
        <div className="evt evt-result">
          <div className="who">✓ {who(ev.agent)} concluiu</div>
          {ev.text}
          {typeof ev.costUsd === "number" && (
            <div className="cost" style={{ marginTop: 8 }}>
              {ev.numTurns} turnos · ${ev.costUsd.toFixed(4)}
            </div>
          )}
        </div>
      );
    case "error":
      return <div className="evt evt-error">⚠ {ev.text}</div>;
    default:
      return null;
  }
}

function prettyInput(input: unknown): string {
  try {
    const s = JSON.stringify(input, null, 2);
    return s.length > 1500 ? s.slice(0, 1500) + "\n… (truncado)" : s;
  } catch {
    return String(input);
  }
}
