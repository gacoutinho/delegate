import { loadAreas, loadAgents, toSummary } from "@/lib/agents";
import Dashboard from "@/components/Dashboard";
import Connectors from "@/components/Connectors";

export const dynamic = "force-dynamic";

export default function Home() {
  const areas = loadAreas();
  const agents = loadAgents().map(toSummary);

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span>Delegate</span>
        </div>
        <div className="cost">{agents.length} agents · {areas.length} areas</div>
      </div>
      <p className="subtitle">
        Hands-on areas, each with specialized agents. Click to pick one, describe
        the task, and they <strong>actually execute</strong> — read your data, run
        commands, write files. Pick several to make them work as a team.
      </p>

      <Connectors />

      <Dashboard areas={areas} agents={agents} />
    </div>
  );
}
