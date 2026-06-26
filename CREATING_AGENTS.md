# 🧠 Criando agentes

Um agente é só um arquivo **Markdown** dentro de `agents/<área>/`. Sem código. O nome do arquivo (sem `.md`) vira o `id` do agente, e a pasta define a área.

## Anatomia de um agente

```markdown
---
name: Analista de CSV                       # nome exibido no card
description: Lê seus dados e responde...     # texto do card
model: claude-opus-4-8                       # opcional (default: claude-opus-4-8)
tools: [Read, Bash, Glob, Grep, Write]       # opcional: ferramentas permitidas
examples:                                    # opcional: sugestões na interface
  - "Quais os 5 produtos que mais cresceram em vendas.csv?"
---
Aqui vai o SYSTEM PROMPT do agente — quem ele é, como pensa,
o que deve sempre/nunca fazer, e o formato da entrega.
```

- **Frontmatter** (entre `---`): metadados.
- **Corpo**: as instruções do agente (system prompt). É aqui que mora a especialização.

### Campo `tools` (ferramentas)

Lista de ferramentas built-in que o agente pode usar. Se omitir, ele tem acesso a todas. As principais:

| Ferramenta | Para quê |
|-----------|----------|
| `Read` / `Write` / `Edit` | Ler e escrever arquivos |
| `Bash` | Rodar comandos no shell (scripts, conversões, cálculos) |
| `Glob` / `Grep` | Encontrar arquivos e buscar dentro deles |
| `WebSearch` / `WebFetch` | Buscar e ler páginas da web |

Dê a cada agente **só o que ele precisa** — um pesquisador não precisa de `Bash`; um automatizador precisa.

## Criando uma área nova

Edite `areas.config.json` e adicione um item ao array `areas`:

```json
{ "id": "vendas", "emoji": "💰", "title": "Vendas", "description": "Pipeline, propostas, follow-ups." }
```

Depois crie a pasta `agents/vendas/` e coloque os arquivos dos agentes ali.

## 🤝 Deixe o Claude Code criar os agentes para você

A forma mais rápida de customizar: peça ao **Claude Code** (na raiz do projeto). Ex.:

> "Crie um agente na área `dados` chamado `limpeza-planilha` que recebe uma planilha
> bagunçada em `data/`, normaliza colunas e datas, remove duplicatas e salva uma versão
> limpa. Use Read, Bash, Write. Adicione 3 exemplos."

O Claude Code escreve o arquivo `agents/dados/limpeza-planilha.md` no formato certo, e ele aparece na interface no próximo refresh.

## Dicas para um bom agente

1. **Seja específico no system prompt.** "Você é um analista de dados pragmático que sempre trabalha com os números reais" funciona melhor que "ajude com dados".
2. **Mande materializar o resultado** (escrever arquivo) quando fizer sentido — não só responder no chat.
3. **Peça para começar pela conclusão** e depois detalhar — entregas ficam mais úteis.
4. **Diga o que NÃO fazer** (não inventar números, não rodar comandos destrutivos sem pedido explícito).
5. **Teste e itere.** Rode uma tarefa real, veja onde ele tropeça, ajuste o arquivo.
