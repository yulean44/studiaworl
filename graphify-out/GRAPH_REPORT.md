# Graph Report - studiaworld  (2026-11-14)

## Corpus Check
- 21 files · ~38,253 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 3)

## Summary
- 400 nodes · 1140 edges · 17 communities (16 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2887f2aa`
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
- renderFoco
- avisaConteudo
- aplicaTema
- icons.js
- Planeta de Estudos
- arrastavel

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
- `Estilo (o dono é exigente com isso)` --references--> `temaDaHora()`  [INFERRED]
  AGENTS.md → app.js
- `contexto()` --indirect_call--> `assinatura()`  [INFERRED]
  tests/regressoes.mjs → progresso.js
- `firebaseSimulado()` --indirect_call--> `assinatura()`  [INFERRED]
  tests/regressoes.mjs → progresso.js
- `contexto()` --indirect_call--> `copiaSegura()`  [INFERRED]
  tests/regressoes.mjs → progresso.js

## Import Cycles
- None detected.

## Communities (17 total, 1 thin omitted)

### Community 0 - "esc"
Cohesion: 0.10
Nodes (57): abreConsulta(), abreMateria(), abreSecao(), alteraSecoes(), aplicaGrifos(), atalhosMat(), baralho(), camposMateria() (+49 more)

### Community 1 - "painelAdmin"
Cohesion: 0.13
Nodes (48): aoMudarConta(), aplicaMundo(), ativo(), atualiza(), chaveEstado(), checaTudo(), choca(), conectaNuvem() (+40 more)

### Community 2 - "app.js"
Cohesion: 0.05
Nodes (36): abaMat, acompanhar, arvAbertas, atualizaConteudo(), bloqueiaApp(), colAberta, consulta, CONT (+28 more)

### Community 3 - "world.js"
Cohesion: 0.12
Nodes (32): ajusta(), blob(), C, cache, caixa(), carregaGLB(), clip(), criaMundo() (+24 more)

### Community 4 - "questoes.mjs"
Cohesion: 0.06
Nodes (23): atalhosLeitura(), destinosLeitura(), tipoLeitura(), chaveDia(), numero(), semanaDeEstudos(), rotas(), trecho() (+15 more)

### Community 5 - "regressoes.mjs"
Cohesion: 0.13
Nodes (12): bases, carrega(), CONFIG, salva(), assinatura(), copiaSegura(), minutosDaSessao(), armazenamento() (+4 more)

### Community 6 - "qJoga"
Cohesion: 0.15
Nodes (25): abasMat(), bancoDoAssunto(), cardsDoAssunto(), casosDe(), confirma(), contaNotas(), fab(), qAplica() (+17 more)

### Community 7 - "renderNotasMat"
Cohesion: 0.21
Nodes (16): apagaGrifos(), ativaGrifos(), baixaTexto(), botaoVerGrifos(), copiaTexto(), corNome(), fechaGtool(), irParaGrifo() (+8 more)

### Community 8 - "publicar"
Cohesion: 0.06
Nodes (37): cancel-in-progress, group, GH_TOKEN, name, url, jobs, publicar, testes (+29 more)

### Community 9 - "data.js"
Cohesion: 0.18
Nodes (10): CONQUISTAS, CRIATURAS, DECOS, DIARIAS, EFEITOS, JORNADA, LOJA_CRIATURAS, LOJA_DECOS (+2 more)

### Community 10 - "Instruções para agentes (Codex, Claude e outros)"
Cohesion: 0.22
Nodes (8): Arquivos, Celular, iPad e computador, Commits, Conteúdo novo de matéria, Instruções para agentes (Codex, Claude e outros), Regras obrigatórias, Skills do projeto (`.claude/skills/`), Verificações

### Community 11 - "renderFoco"
Cohesion: 0.15
Nodes (21): comoGanhar(), decorrido(), encerraFoco(), estadoMundo(), explorando(), fig(), fmtMin(), garanteMod() (+13 more)

### Community 12 - "avisaConteudo"
Cohesion: 0.50
Nodes (3): avisaConteudo(), carregaFabrica(), carregaMaterias()

### Community 13 - "aplicaTema"
Cohesion: 0.40
Nodes (6): Estilo (o dono é exigente com isso), aplicaTema(), conferePeriodo(), temaAtivo(), temaDaHora(), temaMundo()

### Community 15 - "Planeta de Estudos"
Cohesion: 0.33
Nodes (5): Conteúdo e contas, Créditos, Planeta de Estudos, Skills e mapa do código, Verificações e publicação

### Community 16 - "arrastavel"
Cohesion: 0.67
Nodes (3): arrastavel(), arvTroca(), dgComeca()

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `criaMundo()` connect `world.js` to `Instruções para agentes (Codex, Claude e outros)`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `render()` (e.g. with `renderBancoQuestoes()` and `renderFoco()`) actually correct?**
  _`render()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Should `esc` be split into smaller, more focused modules?**
  _Cohesion score 0.10463659147869674 - nodes in this community are weakly interconnected._
- **Why does `assinatura()` connect `regressoes.mjs` to `painelAdmin`, `app.js`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `painelAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.13386524822695037 - nodes in this community are weakly interconnected._
- **Why does `temaDaHora()` connect `aplicaTema` to `app.js`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._