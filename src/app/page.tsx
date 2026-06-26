import { loadAreas, loadAgents, toSummary } from "@/lib/agents";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default function Home() {
  const areas = loadAreas();
  const agents = loadAgents().map(toSummary);

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          Agent <span>Forge</span>
        </div>
        <div className="cost">{agents.length} agentes · {areas.length} áreas</div>
      </div>
      <p className="subtitle">
        Áreas hands-on, cada uma com agentes especializados. Clique para selecionar,
        descreva a tarefa e eles <strong>executam de verdade</strong> — leem seus dados,
        rodam comandos, escrevem arquivos. Selecione vários para trabalharem em equipe.
      </p>

      <Dashboard areas={areas} agents={agents} />
    </div>
  );
}
