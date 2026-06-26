# 🧠 Creating agents

An agent is just a **Markdown** file inside `agents/<area>/`. No code. The filename (without `.md`) becomes the agent's `id`, and the folder defines the area.

## Anatomy of an agent

```markdown
---
name: CSV Analyst                            # name shown on the card
description: Reads your data and answers...   # card text
model: claude-opus-4-8                        # optional (default: claude-opus-4-8)
tools: [Read, Bash, Glob, Grep, Write]        # optional: allowed tools
examples:                                     # optional: UI suggestions
  - "Which 5 products grew the most in sales.csv?"
---
This is the agent's SYSTEM PROMPT — who it is, how it thinks,
what it should always/never do, and the delivery format.
```

- **Frontmatter** (between `---`): metadata.
- **Body**: the agent's instructions (system prompt). This is where the specialization lives.

### The `tools` field

A list of built-in tools the agent may use. Omit it to allow all. The main ones:

| Tool | For |
|------|-----|
| `Read` / `Write` / `Edit` | Read and write files |
| `Bash` | Run shell commands (scripts, conversions, calculations) |
| `Glob` / `Grep` | Find files and search inside them |
| `WebSearch` / `WebFetch` | Search and read web pages |

Give each agent **only what it needs** — a researcher doesn't need `Bash`; an automator does.

## Creating a new area

Edit `areas.config.json` and add an item to the `areas` array:

```json
{ "id": "sales", "emoji": "💰", "title": "Sales", "description": "Pipeline, proposals, follow-ups." }
```

Then create the folder `agents/sales/` and put the agent files there.

## 🤝 Let Claude Code create the agents for you

The fastest way to customize: ask **Claude Code** (from the project root). For example:

> "Create an agent in the `data` area called `spreadsheet-cleaner` that takes a messy
> spreadsheet in `data/`, normalizes columns and dates, removes duplicates, and saves
> a clean version. Use Read, Bash, Write. Add 3 examples."

Claude Code writes `agents/data/spreadsheet-cleaner.md` in the right format, and it shows up in the UI on the next refresh.

## Tips for a good agent

1. **Be specific in the system prompt.** "You are a pragmatic data analyst who always works with the real numbers" beats "help with data".
2. **Make it materialize the result** (write a file) when it makes sense — not just a chat reply.
3. **Ask it to lead with the conclusion**, then the detail — deliveries become more useful.
4. **Say what NOT to do** (don't invent numbers, don't run destructive commands without an explicit request).
5. **Test and iterate.** Run a real task, see where it stumbles, tweak the file.
