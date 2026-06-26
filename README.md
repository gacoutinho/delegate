# 🛠️ Agent Forge

Uma plataforma para **criar, customizar e operar agentes especializados** em otimização de áreas hands-on.

A ideia é simples: você tem **áreas** (Dados, Produtividade, Dev, Marketing…), e dentro de cada área existem **agentes** — cada um especialista numa coisa. Você abre o webapp, clica num agente (ou seleciona vários para uma **equipe**), descreve a tarefa, e eles **executam de verdade**: leem os seus dados, rodam comandos, escrevem arquivos, buscam na web. Não é só resposta de chat — é trabalho feito.

O motor por baixo é o **[Claude Agent SDK](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)**, que dá aos agentes ferramentas reais (arquivos, shell, web, MCP) — o mesmo harness do Claude Code, como biblioteca.

---

## ⚡ Começando

Pré-requisitos: **[Bun](https://bun.sh)** instalado e uma **chave da API da Anthropic**.

```bash
# 1. instalar dependências
bun install

# 2. configurar a chave da API
cp .env.example .env.local
#   edite .env.local e coloque sua ANTHROPIC_API_KEY

# 3. (opcional) colocar seus dados na pasta data/
#    ex.: cp ~/Downloads/vendas.csv data/

# 4. rodar
bun run dev
```

Abra **http://localhost:3000**.

---

## 🧭 Como usar

1. **Coloque seus dados** em `data/` (CSVs, planilhas exportadas, textos…). É de lá que os agentes leem o que você já tem.
2. **Selecione um agente** clicando no card. Selecione **vários** para montá-los em equipe (eles rodam em sequência, cada um construindo sobre o trabalho do anterior).
3. **Descreva a tarefa** e clique em **Executar**. Você vê, ao vivo, cada passo: o raciocínio, cada chamada de ferramenta (⚙), e a entrega final (✓) com o custo.

---

## 🧩 Áreas e agentes que já vêm prontos

| Área | Agente | O que faz |
|------|--------|-----------|
| 📊 Dados | **Analista de CSV** | Lê seus dados em `data/` e responde com números reais (roda comandos/scripts). |
| 🗂️ Produtividade | **Organizador de Tarefas** | Vira notas/reuniões em um plano de ação priorizado, salvo em arquivo. |
| ⚙️ Dev | **Automatizador** | Escreve **e roda** scripts para automatizar tarefas técnicas. |
| 📣 Marketing | **Pesquisador de Mercado** | Pesquisa na web com fontes e entrega um briefing acionável. |

Esses são só o ponto de partida. **A graça é criar os seus** — veja [`CREATING_AGENTS.md`](./CREATING_AGENTS.md).

---

## 🏗️ Como funciona (arquitetura)

```
Você (navegador)
   │  seleciona agente(s) + descreve tarefa
   ▼
src/components/Workspace.tsx ──POST──▶ /api/run  (SSE, streaming ao vivo)
                                          │
                                          ▼
                              src/lib/runner.ts
                                          │  query() do Claude Agent SDK
                                          ▼
                            Claude Agent SDK (harness do Claude Code)
                              · Read / Write / Edit  (arquivos)
                              · Bash                 (comandos reais)
                              · WebSearch / WebFetch (web)
                              · MCP                  (integrações)
                                          │
                            executa em ./ (lê data/, escreve onde precisar)
```

- **Agentes = arquivos Markdown** em `agents/<área>/<id>.md` (frontmatter + instruções). Versionáveis no Git, legíveis, e o próprio Claude Code consegue criá-los/editá-los.
- **`areas.config.json`** define as áreas (emoji, título, descrição).
- **`src/lib/agents.ts`** carrega os arquivos; **`src/lib/runner.ts`** transforma uma definição em uma execução do Agent SDK e normaliza o stream de eventos.
- **`/api/run`** transmite os eventos por **SSE** para a interface renderizar ao vivo.

---

## ⚠️ Sobre execução real e segurança

Para que os agentes **executem de fato** (e não só descrevam o que fariam), eles rodam com `permissionMode: "bypassPermissions"` — ou seja, **sem pedir confirmação a cada passo**. Eles têm acesso de leitura/escrita ao diretório do projeto e ao shell.

- Rode isto **na sua máquina, com dados que são seus**. É uma ferramenta pessoal/local.
- Trate `data/` como a pasta de trabalho. Faça backup de arquivos importantes.
- Não exponha este app na internet pública sem antes trocar o modo de permissão por um gate (`canUseTool`) — o código já está pronto para isso em `src/lib/runner.ts`.
- A chave da API fica só em `.env.local` (já no `.gitignore`). Nunca commite.

---

## 📁 Estrutura

```
agent-forge/
├─ agents/                 # 🧠 os agentes (Markdown) — edite/crie aqui
│  ├─ dados/analista-csv.md
│  ├─ produtividade/organizador.md
│  ├─ dev/automatizador.md
│  └─ marketing/pesquisador.md
├─ areas.config.json       # definição das áreas
├─ data/                   # 📥 seus dados de entrada (e saídas dos agentes)
├─ src/
│  ├─ app/
│  │  ├─ page.tsx           # dashboard (áreas → agentes)
│  │  └─ api/
│  │     ├─ agents/route.ts # lista agentes/áreas
│  │     └─ run/route.ts    # executa agente(s) e faz streaming SSE
│  ├─ components/
│  │  ├─ Dashboard.tsx      # grid + seleção + equipe
│  │  └─ Workspace.tsx      # execução ao vivo
│  └─ lib/
│     ├─ agents.ts          # carrega definições
│     └─ runner.ts          # ponte com o Claude Agent SDK
└─ CREATING_AGENTS.md       # como criar novos agentes
```

---

## 🗺️ Próximos passos (ideias)

- Integrações MCP (Slack, Notion, ClickUp, Gmail, Drive) por agente.
- Empacotar como app de desktop (Tauri) sem reescrever.
- Equipe em paralelo / orquestrador, além de sequencial.
- Editor de agentes na própria interface.

Construído com Next.js + Bun + Claude Agent SDK.
