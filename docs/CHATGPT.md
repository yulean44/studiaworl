# Usar o ChatGPT neste repositório

O ChatGPT (Codex ou o chat com o conector do GitHub) não carrega `.claude/skills/` sozinho. Ele precisa ler os arquivos certos antes de mexer.

## Ordem de leitura

1. `AGENTS.md` (regras do site, estilo, testes, cache `?v=N`).
2. O `SKILL.md` da etapa, em `.claude/skills/<nome>/SKILL.md`:
   - mudança no visual: `frontend-design` (direção estética) e `frontend-ui-engineering` (implementação)
   - conferir o visual antes de publicar: `web-design-guidelines` (regras em `regras.md` da mesma pasta)
   - 3D (planeta, pacote de criatura): `threejs-fundamentals` e o `threejs-*` do assunto (shaders, materiais, animação, desempenho)
   - polimento e auditoria visual: `impeccable`
   - animação de interface: `animate` e `choreograph`
   - mudança pequena em código: `ponytail`
   - antes de publicar: `ponytail-review` e `code-review-and-quality`
   - matéria nova ou Kahoot: seção "Conteúdo novo de matéria" do `AGENTS.md`
3. Para achar onde está cada coisa no código: `graphify-out/GRAPH_REPORT.md`.

## Prompt para colar no ChatGPT

```
Repositório: yulean44/studiaworl (Planeta de Estudos, GitHub Pages).
Antes de qualquer mudança, leia AGENTS.md e docs/CHATGPT.md e siga as regras.
Leia também o SKILL.md indicado em docs/CHATGPT.md para esta tarefa.
Tarefa: <descreva aqui>
Regras que não podem falhar:
- git pull antes; commit como yulean44, mensagem curta em português.
- aumentar o ?v=N em todos os arquivos ao publicar.
- não mudar a identidade visual: Jost, tema claro, verdes suaves, ícones finos, sem emoji.
- usar só as variáveis CSS (--ink, --muted, --acc...), nunca cor fixa.
- conferir em 390px (iPhone), iPad e computador.
- rodar: node --test tests/*.mjs
```

## Atualizar o Kahoot de uma matéria

Editar só o campo `kahoot` de `content/<materia>.json` (não misturar com `cards` nem `questoes`), conferir com `node --test tests/kahoot.mjs`, aumentar o `?v=N` e publicar.

## Kit "web designer" (reel de 5 skills)

| Item | Aqui no site |
|---|---|
| frontend-design (Anthropic) | instalada em `.claude/skills/frontend-design` |
| Web Interface Guidelines (Vercel) | instalada em `.claude/skills/web-design-guidelines`, com cópia local das regras |
| Chrome DevTools MCP | não fica no repositório; cada um liga no próprio app (abaixo). A skill `browser-testing-with-devtools` usa ele |
| shadcn MCP e Magic MCP (21st.dev) | não usar: geram componentes React/Tailwind e o site é HTML + JS puro, sem build |

Ligar o Chrome DevTools MCP no seu computador:
- Claude Code: `claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest`
- Codex: em `~/.codex/config.toml`, adicionar `[mcp_servers.chrome-devtools]` com `command = "npx"` e `args = ["-y", "chrome-devtools-mcp@latest"]`

Ao usar `frontend-design` aqui: a identidade do site manda. Jost, tema claro, verdes suaves, rótulos em maiúsculas espaçadas e ícones finos ficam como estão, mesmo onde a skill sugere outra coisa.
