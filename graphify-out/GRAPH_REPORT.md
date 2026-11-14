# Graph Report - studiaworl  (2026-11-14)

## Corpus Check
- 15 files · ~35,675 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 3)

## Summary
- 322 nodes · 1021 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2d49d2f2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- esc
- painelAdmin
- app.js
- world.js
- questoes.mjs
- regressoes.mjs
- qJoga
- renderNotasMat
- data.js
- Instruções para agentes (Codex, Claude e outros)
- renderMundo
- escolheTema
- icons.js
- README.md

## God Nodes (most connected - your core abstractions)
1. `esc()` - 38 edges
2. `ic()` - 35 edges
3. `renderMateria()` - 31 edges
4. `./world.js?v=40` - 29 edges
5. `painelAdmin()` - 28 edges
6. `salvar()` - 27 edges
7. `checaTudo()` - 27 edges
8. `render()` - 27 edges
9. `renderLeitura()` - 26 edges
10. `renderArvore()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `Arquivos` --references--> `criaMundo()`  [INFERRED]
  AGENTS.md → world.js
- `contexto()` --indirect_call--> `assinatura()`  [INFERRED]
  tests/regressoes.mjs → progresso.js
- `firebaseSimulado()` --indirect_call--> `assinatura()`  [INFERRED]
  tests/regressoes.mjs → progresso.js
- `contexto()` --indirect_call--> `copiaSegura()`  [INFERRED]
  tests/regressoes.mjs → progresso.js
- `fig()` --calls--> `ic()`  [EXTRACTED]
  app.js → icons.js

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "esc"
Cohesion: 0.10
Nodes (48): abreConsulta(), abreMateria(), abreSecao(), alteraSecoes(), aplicaGrifos(), arrastavel(), arvTroca(), baralho() (+40 more)

### Community 1 - "painelAdmin"
Cohesion: 0.10
Nodes (65): aoMudarConta(), aplicaMundo(), ativo(), atualiza(), atualizaConteudo(), chaveEstado(), checaTudo(), choca() (+57 more)

### Community 2 - "app.js"
Cohesion: 0.06
Nodes (31): abaMat, acompanhar, arvAbertas, bloqueiaApp(), colAberta, consulta, CONT, CONTEUDOS (+23 more)

### Community 3 - "world.js"
Cohesion: 0.12
Nodes (33): ./world.js?v=40, ajusta(), blob(), C, cache, caixa(), carregaGLB(), clip() (+25 more)

### Community 4 - "questoes.mjs"
Cohesion: 0.10
Nodes (16): atalhosLeitura(), relatorioInicio(), destinosLeitura(), tipoLeitura(), chaveDia(), numero(), semanaDeEstudos(), bancos (+8 more)

### Community 5 - "regressoes.mjs"
Cohesion: 0.12
Nodes (13): ./conta.js?v=40, bases, carrega(), CONFIG, salva(), assinatura(), copiaSegura(), minutosDaSessao() (+5 more)

### Community 6 - "qJoga"
Cohesion: 0.19
Nodes (18): abasMat(), atalhosMat(), bancoDoAssunto(), cardsDoAssunto(), casosDe(), contaNotas(), fab(), qAplica() (+10 more)

### Community 7 - "renderNotasMat"
Cohesion: 0.15
Nodes (29): apagaGrifos(), ativaGrifos(), baixaTexto(), botaoVerGrifos(), confirma(), copiaTexto(), corNome(), esc() (+21 more)

### Community 9 - "data.js"
Cohesion: 0.18
Nodes (10): CONQUISTAS, CRIATURAS, DECOS, DIARIAS, EFEITOS, JORNADA, LOJA_CRIATURAS, LOJA_DECOS (+2 more)

### Community 10 - "Instruções para agentes (Codex, Claude e outros)"
Cohesion: 0.22
Nodes (8): Arquivos, Celular, iPad e computador, Commits, Conteúdo novo de matéria, Estilo (o dono é exigente com isso), Instruções para agentes (Codex, Claude e outros), Regras obrigatórias, Verificações

### Community 11 - "renderMundo"
Cohesion: 0.29
Nodes (8): comoGanhar(), explorando(), garanteMod(), iniciaMundo(), layoutMundo(), plural(), proximaFesta(), renderMundo()

### Community 12 - "escolheTema"
Cohesion: 0.67
Nodes (3): aplicaTema(), escolheTema(), temaMundo()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `./world.js?v=40` connect `world.js` to `data.js`, `app.js`, `renderMundo`?**
  _High betweenness centrality (0.246) - this node is a cross-community bridge._
- **Should `esc` be split into smaller, more focused modules?**
  _Cohesion score 0.09929078014184398 - nodes in this community are weakly interconnected._
- **Why does `criaMundo()` connect `world.js` to `Instruções para agentes (Codex, Claude e outros)`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Should `painelAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.10336538461538461 - nodes in this community are weakly interconnected._
- **Why does `./conta.js?v=40` connect `regressoes.mjs` to `painelAdmin`, `app.js`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `world.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12063492063492064 - nodes in this community are weakly interconnected._