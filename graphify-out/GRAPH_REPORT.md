# Graph Report - studiaworld  (2026-11-14)

## Corpus Check
- 20 files · ~37,323 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 3)

## Summary
- 389 nodes · 1111 edges · 16 communities (15 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b807727d`
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
- publicar
- data.js
- Instruções para agentes (Codex, Claude e outros)
- renderMundo
- avisaConteudo
- arrastavel
- icons.js
- Planeta de Estudos

## God Nodes (most connected - your core abstractions)
1. `esc()` - 38 edges
2. `ic()` - 35 edges
3. `renderMateria()` - 31 edges
4. `render()` - 28 edges
5. `painelAdmin()` - 28 edges
6. `salvar()` - 27 edges
7. `checaTudo()` - 27 edges
8. `renderLeitura()` - 26 edges
9. `renderArvore()` - 25 edges
10. `renderTopo()` - 24 edges

## Surprising Connections (you probably didn't know these)
- `Arquivos` --references--> `criaMundo()`  [INFERRED]
  AGENTS.md → world.js
- `contexto()` --indirect_call--> `assinatura()`  [INFERRED]
  tests/regressoes.mjs → progresso.js
- `contexto()` --indirect_call--> `copiaSegura()`  [INFERRED]
  tests/regressoes.mjs → progresso.js
- `firebaseSimulado()` --indirect_call--> `assinatura()`  [INFERRED]
  tests/regressoes.mjs → progresso.js
- `fig()` --calls--> `ic()`  [EXTRACTED]
  app.js → icons.js

## Import Cycles
- None detected.

## Communities (16 total, 1 thin omitted)

### Community 0 - "esc"
Cohesion: 0.12
Nodes (46): abreConsulta(), abreMateria(), abreSecao(), alteraSecoes(), atalhosMat(), baralho(), camposMateria(), cardsCompartilhados() (+38 more)

### Community 1 - "painelAdmin"
Cohesion: 0.10
Nodes (64): aoMudarConta(), aplicaMundo(), ativo(), atualiza(), atualizaConteudo(), bloqueiaApp(), chaveEstado(), checaTudo() (+56 more)

### Community 2 - "app.js"
Cohesion: 0.06
Nodes (33): abaMat, acompanhar, arvAbertas, colAberta, consulta, CONT, CONTEUDOS, conteudosFalhos (+25 more)

### Community 3 - "world.js"
Cohesion: 0.12
Nodes (32): ajusta(), blob(), C, cache, caixa(), carregaGLB(), clip(), criaMundo() (+24 more)

### Community 4 - "questoes.mjs"
Cohesion: 0.06
Nodes (22): atalhosLeitura(), relatorioInicio(), destinosLeitura(), tipoLeitura(), chaveDia(), numero(), semanaDeEstudos(), bancos (+14 more)

### Community 5 - "regressoes.mjs"
Cohesion: 0.13
Nodes (12): bases, carrega(), CONFIG, salva(), assinatura(), copiaSegura(), minutosDaSessao(), armazenamento() (+4 more)

### Community 6 - "qJoga"
Cohesion: 0.14
Nodes (27): abasMat(), bancoDoAssunto(), cardsDoAssunto(), casosDe(), confirma(), contaNotas(), fab(), qAplica() (+19 more)

### Community 7 - "renderNotasMat"
Cohesion: 0.19
Nodes (20): apagaGrifos(), aplicaGrifos(), ativaGrifos(), baixaTexto(), botaoVerGrifos(), copiaTexto(), corNome(), fechaGtool() (+12 more)

### Community 8 - "publicar"
Cohesion: 0.06
Nodes (35): cancel-in-progress, group, name, url, jobs, publicar, testes, name (+27 more)

### Community 9 - "data.js"
Cohesion: 0.18
Nodes (10): CONQUISTAS, CRIATURAS, DECOS, DIARIAS, EFEITOS, JORNADA, LOJA_CRIATURAS, LOJA_DECOS (+2 more)

### Community 10 - "Instruções para agentes (Codex, Claude e outros)"
Cohesion: 0.20
Nodes (9): Arquivos, Celular, iPad e computador, Commits, Conteúdo novo de matéria, Estilo (o dono é exigente com isso), Instruções para agentes (Codex, Claude e outros), Regras obrigatórias, Skills do projeto (`.claude/skills/`) (+1 more)

### Community 11 - "renderMundo"
Cohesion: 0.20
Nodes (11): aplicaTema(), comoGanhar(), estadoMundo(), explorando(), fig(), garanteMod(), iniciaMundo(), plural() (+3 more)

### Community 12 - "avisaConteudo"
Cohesion: 0.50
Nodes (3): avisaConteudo(), carregaFabrica(), carregaMaterias()

### Community 13 - "arrastavel"
Cohesion: 0.67
Nodes (3): arrastavel(), arvTroca(), dgComeca()

### Community 15 - "Planeta de Estudos"
Cohesion: 0.33
Nodes (5): Conteúdo e contas, Créditos, Planeta de Estudos, Skills e mapa do código, Verificações e publicação

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `criaMundo()` connect `world.js` to `Instruções para agentes (Codex, Claude e outros)`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `render()` (e.g. with `renderFoco()` and `renderInicio()`) actually correct?**
  _`render()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `esc` be split into smaller, more focused modules?**
  _Cohesion score 0.12270531400966184 - nodes in this community are weakly interconnected._
- **Why does `Arquivos` connect `Instruções para agentes (Codex, Claude e outros)` to `world.js`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `painelAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.10168650793650794 - nodes in this community are weakly interconnected._
- **Why does `assinatura()` connect `regressoes.mjs` to `painelAdmin`, `app.js`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._