# Usar o ChatGPT neste repositório

O ChatGPT (Codex ou o chat com o conector do GitHub) não carrega `.claude/skills/` sozinho. Ele precisa ler os arquivos certos antes de mexer.

## Ordem de leitura

1. `AGENTS.md` (regras do site, estilo, testes, cache `?v=N`).
2. O `SKILL.md` da etapa, em `.claude/skills/<nome>/SKILL.md`:
   - mudança no visual: `frontend-ui-engineering`
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
- rodar: for t in tests/*.mjs; do node --test $t; done
```

## Atualizar o Kahoot de uma matéria

Editar só o campo `kahoot` de `content/<materia>.json` (não misturar com `cards` nem `questoes`), conferir com `node --test tests/kahoot.mjs`, aumentar o `?v=N` e publicar.
