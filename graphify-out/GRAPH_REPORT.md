# Graph Report - studiaworld  (2026-11-14)

## Corpus Check
- 21 files · ~37,985 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 3)

## Summary
- 397 nodes · 1132 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3d39c4e0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- esc
- painelAdmin
- app.js
- world.js
- questoes.mjs
- regressoes.mjs
- renderQuestoes
- esc
- publicar
- data.js
- Instruções para agentes (Codex, Claude e outros)
- renderMundo
- avisaConteudo
- abasMat
- icons.js
- Planeta de Estudos
- renderRevisao

## God Nodes (most connected - your core abstractions)
1. `esc()` - 39 edges
2. `ic()` - 35 edges
3. `renderMateria()` - 31 edges
4. `render()` - 29 edges
5. `painelAdmin()` - 28 edges
6. `salvar()` - 27 edges
7. `checaTudo()` - 27 edges
8. `renderLeitura()` - 27 edges
9. `renderArvore()` - 25 edges
10. `renderTopo()` - 24 edges

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

## Communities (17 total, 2 thin omitted)

### Community 0 - "esc"
Cohesion: 0.13
Nodes (41): abreConsulta(), abreMateria(), abreSecao(), alteraSecoes(), camposMateria(), cardsCompartilhados(), editaMateria(), fechaArvore() (+33 more)

### Community 1 - "painelAdmin"
Cohesion: 0.11
Nodes (62): aoMudarConta(), aplicaMundo(), ativo(), atualiza(), atualizaConteudo(), chaveEstado(), checaTudo(), choca() (+54 more)

### Community 2 - "app.js"
Cohesion: 0.05
Nodes (36): abaMat, acompanhar, arrastavel(), arvAbertas, arvTroca(), bloqueiaApp(), colAberta, consulta (+28 more)

### Community 3 - "world.js"
Cohesion: 0.12
Nodes (32): ajusta(), blob(), C, cache, caixa(), carregaGLB(), clip(), criaMundo() (+24 more)

### Community 4 - "questoes.mjs"
Cohesion: 0.05
Nodes (25): atalhosLeitura(), relatorioInicio(), carregaMaterias(), destinosLeitura(), tipoLeitura(), chaveDia(), numero(), semanaDeEstudos() (+17 more)

### Community 5 - "regressoes.mjs"
Cohesion: 0.13
Nodes (12): bases, carrega(), CONFIG, salva(), assinatura(), copiaSegura(), minutosDaSessao(), armazenamento() (+4 more)

### Community 6 - "renderQuestoes"
Cohesion: 0.30
Nodes (12): bancoDoAssunto(), cardsDoAssunto(), qAplica(), qChave(), qFiltro(), qReg(), questoesDe(), questoesDoAssunto() (+4 more)

### Community 7 - "esc"
Cohesion: 0.11
Nodes (38): apagaGrifos(), aplicaGrifos(), atalhosMat(), ativaGrifos(), baixaTexto(), botaoVerGrifos(), confirma(), copiaTexto() (+30 more)

### Community 8 - "publicar"
Cohesion: 0.06
Nodes (37): cancel-in-progress, group, GH_TOKEN, name, url, jobs, publicar, testes (+29 more)

### Community 9 - "data.js"
Cohesion: 0.18
Nodes (10): CONQUISTAS, CRIATURAS, DECOS, DIARIAS, EFEITOS, JORNADA, LOJA_CRIATURAS, LOJA_DECOS (+2 more)

### Community 10 - "Instruções para agentes (Codex, Claude e outros)"
Cohesion: 0.20
Nodes (9): Arquivos, Celular, iPad e computador, Commits, Conteúdo novo de matéria, Estilo (o dono é exigente com isso), Instruções para agentes (Codex, Claude e outros), Regras obrigatórias, Skills do projeto (`.claude/skills/`) (+1 more)

### Community 11 - "renderMundo"
Cohesion: 0.25
Nodes (9): aplicaTema(), comoGanhar(), escolheTema(), explorando(), garanteMod(), iniciaMundo(), plural(), renderMundo() (+1 more)

### Community 13 - "abasMat"
Cohesion: 0.60
Nodes (5): abasMat(), casosDe(), contaNotas(), fab(), temKahoot()

### Community 15 - "Planeta de Estudos"
Cohesion: 0.33
Nodes (5): Conteúdo e contas, Créditos, Planeta de Estudos, Skills e mapa do código, Verificações e publicação

### Community 17 - "renderRevisao"
Cohesion: 0.67
Nodes (4): baralho(), novaRodada(), renderRevisao(), vira()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `criaMundo()` connect `world.js` to `Instruções para agentes (Codex, Claude e outros)`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `render()` (e.g. with `renderBancoQuestoes()` and `renderFoco()`) actually correct?**
  _`render()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Should `esc` be split into smaller, more focused modules?**
  _Cohesion score 0.12560975609756098 - nodes in this community are weakly interconnected._
- **Why does `Arquivos` connect `Instruções para agentes (Codex, Claude e outros)` to `world.js`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `painelAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.10735060814383923 - nodes in this community are weakly interconnected._
- **Why does `assinatura()` connect `regressoes.mjs` to `painelAdmin`, `app.js`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05398110661268556 - nodes in this community are weakly interconnected._