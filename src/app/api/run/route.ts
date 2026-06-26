import { loadAgents, type AgentDef } from "@/lib/agents";
import { runAgent, runTeam, type AgentEvent } from "@/lib/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Agent runs can be long (minutes). No artificial timeout.
export const maxDuration = 800;

export async function POST(req: Request) {
  const body = (await req.json()) as { agentIds?: string[]; task?: string };
  const agentIds = body.agentIds ?? [];
  const task = (body.task ?? "").trim();

  if (agentIds.length === 0 || !task) {
    return new Response(JSON.stringify({ error: "Provide agentIds and task." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY is not set. Create a .env.local (see .env.example)." }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  const all = loadAgents();
  const selected: AgentDef[] = agentIds
    .map((id) => all.find((a) => a.id === id))
    .filter((a): a is AgentDef => Boolean(a));

  if (selected.length === 0) {
    return new Response(JSON.stringify({ error: "No valid agent." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (ev: AgentEvent) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));

      try {
        const generator =
          selected.length === 1
            ? (async function* () {
                yield* runAgent(selected[0], task);
                yield { kind: "done" } as AgentEvent;
              })()
            : runTeam(selected, task);

        for await (const ev of generator) send(ev);
      } catch (err) {
        send({ kind: "error", agent: "system", text: err instanceof Error ? err.message : String(err) });
        send({ kind: "done" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
