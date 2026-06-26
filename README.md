# 🤝 Delegate

A platform to **create, customize and operate specialized agents** that optimize hands-on areas.

The idea is simple: you have **areas** (Data, Productivity, Dev, Marketing…), and inside each area live **agents** — each a specialist at one thing. You open the webapp, pick an agent (or several, as a **team**), describe the task, and they **actually execute**: read your data, run commands, write files, search the web. It's not just a chat reply — it's work done.

The engine underneath is the **[Claude Agent SDK](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)**, which gives agents real tools (files, shell, web, MCP) — the same harness as Claude Code, as a library.

---

## ⚡ Getting started

Requirements: **[Bun](https://bun.sh)** installed and an **Anthropic API key**.

```bash
# 1. install dependencies
bun install

# 2. configure your API key
cp .env.example .env.local
#   edit .env.local and set your ANTHROPIC_API_KEY

# 3. (optional) drop your data into the data/ folder
#    e.g. cp ~/Downloads/sales.csv data/

# 4. run
bun run dev
```

Open **http://localhost:3000**.

> No keys ship in this repo. Everyone provides their own `ANTHROPIC_API_KEY` in `.env.local` (git-ignored).

---

## 🧭 How to use it

1. **Drop your data** into `data/` (CSVs, exported spreadsheets, text…). That's where agents read what you already have.
2. **Pick an agent** by clicking its card. Pick **several** to form a team (they run in sequence, each building on the previous one's work).
3. **Describe the task** and click **Run**. You watch it live: the reasoning, every tool call (⚙), and the final delivery (✓) with the cost.

---

## 🧩 Agents that ship by default

| Area | Agent | What it does |
|------|-------|--------------|
| 📊 Data | **CSV Analyst** | Reads your data in `data/` and answers with real numbers (runs commands/scripts). |
| 🗂️ Productivity | **Task Organizer** | Turns notes/meetings into a prioritized action plan, saved to a file. |
| ⚙️ Dev | **Automator** | Writes **and runs** scripts to automate technical tasks. |
| 📣 Marketing | **Market Researcher** | Searches the web with sources and delivers an actionable briefing. |

These are just the starting point. **The fun part is making your own** — see [`CREATING_AGENTS.md`](./CREATING_AGENTS.md).

---

## 🏗️ How it works (architecture)

```
You (browser)
   │  pick agent(s) + describe task
   ▼
src/components/Workspace.tsx ──POST──▶ /api/run  (SSE, live streaming)
                                          │
                                          ▼
                              src/lib/runner.ts
                                          │  query() from the Claude Agent SDK
                                          ▼
                            Claude Agent SDK (Claude Code harness)
                              · Read / Write / Edit  (files)
                              · Bash                 (real commands)
                              · WebSearch / WebFetch (web)
                              · MCP                  (integrations)
                                          │
                            executes in ./ (reads data/, writes where needed)
```

- **Agents = Markdown files** at `agents/<area>/<id>.md` (frontmatter + instructions). Git-versionable, readable, and Claude Code itself can create/edit them.
- **`areas.config.json`** defines the areas (emoji, title, description).
- **`src/lib/agents.ts`** loads the files; **`src/lib/runner.ts`** turns a definition into an Agent SDK run and normalizes the event stream.
- **`/api/run`** streams events over **SSE** for the UI to render live.

---

## ⚠️ About real execution and safety

So that agents **actually execute** (instead of just describing what they would do), they run with `permissionMode: "bypassPermissions"` — i.e. **without asking for confirmation at each step**. They have read/write access to the project directory and the shell.

- Run this **on your own machine, with data that's yours**. It's a local/personal tool.
- Treat `data/` as the working folder. Back up important files.
- Don't expose this app on the public internet without first swapping the permission mode for a gate (`canUseTool`) — the code is ready for that in `src/lib/runner.ts`.
- The API key stays only in `.env.local` (already git-ignored). Never commit it.

---

## 📁 Structure

```
delegate/
├─ agents/                    # 🧠 the agents (Markdown) — edit/create here
│  ├─ data/csv-analyst.md
│  ├─ productivity/task-organizer.md
│  ├─ dev/automator.md
│  └─ marketing/market-researcher.md
├─ areas.config.json          # area definitions
├─ data/                      # 📥 your input data (and agent outputs)
├─ src/
│  ├─ app/
│  │  ├─ page.tsx              # dashboard (areas → agents)
│  │  └─ api/
│  │     ├─ agents/route.ts    # lists agents/areas
│  │     └─ run/route.ts       # runs agent(s) and streams over SSE
│  ├─ components/
│  │  ├─ Dashboard.tsx         # grid + selection + team
│  │  └─ Workspace.tsx         # live execution
│  └─ lib/
│     ├─ agents.ts             # loads definitions
│     └─ runner.ts             # bridge to the Claude Agent SDK
└─ CREATING_AGENTS.md          # how to create new agents
```

---

## 🗺️ Roadmap (ideas)

- Per-agent MCP integrations (Slack, Notion, ClickUp, Gmail, Drive).
- Package as a desktop app (Tauri) without rewriting.
- Parallel / orchestrated teams, beyond sequential.
- An in-app agent editor.

Built with Next.js + Bun + the Claude Agent SDK.
