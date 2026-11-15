# Instruções para agentes (Codex, Claude e outros)

Site de estudo pessoal **Planeta de Estudos**, publicado no GitHub Pages:
https://yulean44.github.io/studiaworl/ — um planeta 3D low-poly que vai se enchendo de criaturas e enfeites conforme o dono estuda (missões, foco, flashcards, matérias com seções).

Site estático, sem build: HTML + JS em módulos ES, three.js 0.160 via importmap (jsdelivr). Não adicionar bundler, framework nem `package.json`.

## Arquivos

| Arquivo | O que tem |
|---|---|
| `index.html` | Todo o CSS (temas por `:root[data-tema=...]`), importmap e a casca da página |
| `app.js` | Toda a lógica: telas (`VIEWS`), matérias/seções, menu lateral em árvore, grifos e notas, foco, flashcards, missões, admin, contas |
| `world.js` | O planeta 3D (`criaMundo`), terreno, água, grama e pedrinhas, modelos, câmera, layouts e `ceu({hora, nuvens})` (luz pela hora e cobertura de nuvens) |
| `data.js` | Criaturas, enfeites, jornada, conquistas, missões diárias, curva de XP |
| `conta.js` | Login e salvamento no Firebase (Auth + Firestore, doc `usuarios/{uid}`) |
| `progresso.js` | Assinatura estável do estado, cópias locais e limite de tempo das sessões |
| `icons.js` | Ícones SVG de traço fino: `ic(nome, classe)` |
| `figuras.js` | Ícones 3D em webp (data URI) |
| `content/*.json` | Conteúdo das matérias (seções com `id`, `titulo`, `grupo`, `html`); imagens em `content/img/` |
| `m/*.js` | Modelos 3D em base64 (o Pages não serve .glb do jeito certo) |
| `kahoot.html` | Quiz estilo Kahoot por matéria |
| `diahora.js` | Céu do dia no topo (sol e lua pela hora real; abre a aparência) |
| `pacote3d.js` | Pacote de criatura em 3D (three.js): embalagem metálica estufada, rasgo que curva, carta com shader holográfico, confete 3D |
| `pacote.js` | Versão em HTML do pacote, usada sem WebGL ou com "reduzir movimento" |
| `mapa-revisoes.js` | Mapa de revisões dos flashcards: blocos por estado, partículas ao mudar, contador "para dominar" |

## Regras obrigatórias

1. **Cache:** todo import e a tag `<script>` usam `?v=N`. A cada mudança publicada, aumente o N em **todos** os arquivos de uma vez (ex.: `grep -rl '?v=31' --include=*.js --include=*.html . | xargs sed -i 's/?v=31/?v=32/g'`). Sem isso o iPhone continua com a versão antiga.
2. **Antes de mexer:** `git pull`. Mais de um agente trabalha neste repositório.
3. **Estado do usuário** fica em `localStorage` com prefixo `pe:` e no Firestore. Nunca apague nem renomeie chaves existentes sem migração.
4. Nada de segredos no código. A config do Firebase em `conta.js` é pública por natureza e pode ficar.
5. **O app só abre após o primeiro quadro do planeta 3D.** Falha de carregamento ou perda de contexto bloqueia o app e oferece nova tentativa, sem zerar progresso.
6. **Preservar contas e versões do progresso:** manter projeto Firebase, UIDs, documento `usuarios/{uid}` e estado v2. Antes de substituir versões divergentes, preservar cópias em `pe:copias:estado:<uid>`. Não sobrescrever outra versão da nuvem sem conferir a base lida; a transação deve recusar conflitos. Cópias são exportáveis pelo menu da conta.

## Verificações

`node --test tests/questoes.mjs` valida o banco de questões (campo `questoes`): estrutura, 1 alternativa certa e se o `fonte.trecho` está mesmo no texto da seção citada. `node tests/questoes.mjs` mostra a distribuição por tipo, nível e gabarito.

Rodar tudo: `node --test tests/*.mjs`.

`node --test tests/regressoes.mjs` verifica preservação de estado, troca de conta, conflitos no Firestore com SDK simulado e limite do timer, sem acessar contas reais. Não precisa de `package.json` nem dependências.

## Skills do projeto (`.claude/skills/`)

O Claude Code carrega sozinho; outros agentes leiam o `SKILL.md` correspondente. **ChatGPT/Codex:** comece por `docs/CHATGPT.md` (ordem de leitura e prompt pronto).

- **Comece pelo mapa:** `graphify-out/GRAPH_REPORT.md` mostra as funções centrais e os grupos do código. Depois de mexer no código, rode `graphify update .` (o `.graphifyignore` já deixa de fora modelos, figuras e conteúdo).
- **Escolher a etapa:** `using-agent-skills` indica qual das skills do Agent Skills usar (planejar, implementar, testar, revisar, publicar).
- **Mudança enxuta:** `ponytail` (menor mudança que resolve; reaproveitar o que já existe).
- **Visual:** `frontend-design` para direção estética (sem trocar a identidade abaixo) e `web-design-guidelines` para conferir antes de publicar.
- **Animação:** `animate`, `choreograph`, `gestures` e `animation-performance` (Emil Kowalski) e `motion-design` (LottieFiles): curvas, durações, gestos e desempenho.
- **Antes de publicar:** `ponytail-review` ou `code-review-and-quality`, rodando todos os testes de `tests/`.
- Fontes: addyosmani/agent-skills (MIT), DietrichGebert/ponytail (MIT), Graphify-Labs/graphify (Apache 2.0/MIT), anthropics/skills (Apache 2.0), vercel-labs/agent-skills e web-interface-guidelines (MIT), emilkowalski/skills (MIT), LottieFiles/motion-design-skill (MIT); licenças dentro de cada pasta.

## Estilo (o dono é exigente com isso)

- **Bom gosto, limpo, pouco texto.** Instruções curtas; nada de blocos explicativos longos, chips de "em poucas palavras" ou passo a passo enfeitado.
- **Sem emojis** na interface. Ícones de traço fino de `icons.js`; os ícones 3D só quando o estilo 3D está ligado.
- Fonte **Jost**. Rótulos pequenos em maiúsculas espaçadas; títulos de documento em caixa normal.
- **Tema automático é o padrão** (`temaDaHora` em `app.js`): Amanhecer das 5h às 12h, Golden hour (`dourado`) das 12h às 18h, Noite estelar das 18h às 5h. Temas fixos continuam opcionais. Use sempre as variáveis CSS (`--ink`, `--muted`, `--faint`, `--acc`, `--acc2`, `--solid`, `--line`, `--glass2`, `--glass3`, `--forte`, `--doc`, `--modal-bg`, `--veu`), nunca cores fixas.
- Vidro/transparência discreta, tons de verde suaves, nada saturado.
- Ajustes finos de visual vão no bloco "refino leve" no fim do CSS de `index.html`, sem mudar fonte, cores dos temas nem ícones.
- A área de Matérias usa a paleta de caderno (`--n-*`, bloco "estudo em estilo de documento" no fim do CSS: cinza de papel, texto #37352f, azul #0075de para links) e segue o estilo de documentos: menu lateral fixo em pastas (matéria › grupo › seção), trilha "Matérias › … " no topo e a seção como página.

## Celular, iPad e computador

- Tem que funcionar bem em **iPhone (390px), iPad e computador**. Testar também 320px.
- Sem rolagem lateral; alvos de toque ≥ 44px em `pointer:coarse`; respeitar `env(safe-area-inset-*)` e usar `100dvh`.
- Respeitar `prefers-reduced-motion`.
- Acessibilidade: botões reais (`<button>`), `aria-label` em botões só com ícone, foco visível, Enter/Espaço funcionando.

## Conteúdo novo de matéria

Novo arquivo em `content/<id>.json`, no mesmo formato dos existentes, e o id adicionado à lista `CONTEUDOS` em `app.js`. Seções agrupadas por `grupo` (ex.: "Guia de estudo", "Resumo completo").

Três coisas separadas, cada uma com sua aba: **`kahoot`** (o Kahoot da professora, aba Kahoot), **`cards`** (flashcards) e **`questoes`** (banco de questões próprio, aba Questões). Não misturar.

Formato de cada item de `questoes`:
`{ "id": "q-r2-01", "secao": "r2", "tags": [], "tipo": "recordacao|compreensao|aplicacao|caso", "nivel": "facil|medio|dificil", "enunciado": "html curto", "img": "content/img/... (opcional)", "alternativas": [{ "t": "...", "certa": false, "porque": "1 frase" }, ...4 ou 5], "explica": "...", "pegadinha": "(opcional)", "dica": "(opcional)", "fonte": { "secao": "r2", "trecho": "frase copiada da seção" }, "fora": "dado externo + fonte (opcional)" }`.
Toda questão sai do material da matéria; o que vier de fora vai em `fora`, com a fonte. Rodar `node --test tests/questoes.mjs` antes de publicar.

## Commits

Mensagens curtas em português, descrevendo a mudança para o usuário (ex.: "Grifos: borracha e desfazer").
