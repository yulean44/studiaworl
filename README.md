# Planeta de Estudos

Site de estudo com um planeta 3D que cresce conforme você estuda: foco, flashcards, matérias, questões, Kahoot, missões e conquistas.

Publicado em https://yulean44.github.io/studiaworl/. Site estático, sem build, framework ou dependências npm. Para executar localmente: `python3 -m http.server 4173` e abrir http://localhost:4173.

## Conteúdo e contas

Seis matérias: Medicina de Família e Comunidade, Diagnóstico por Imagem, Antibióticos, Saúde da Mulher, Psiquiatria e Cirurgia. Questões próprias, Kahoot e flashcards são bancos separados. As questões indicam o trecho do material usado como fonte.

O progresso fica no navegador e, para quem entra, no Firebase Auth/Firestore (`usuarios/{uid}`). O estado v2, as chaves `pe:` e as contas existentes devem ser preservados. Versões divergentes ficam em cópias exportáveis pelo menu da conta. O app só abre após o primeiro quadro do planeta 3D; falhas oferecem nova tentativa sem zerar dados.

## Verificações e publicação

Execute `node --test tests/*.mjs`. Não são necessárias dependências para essa suíte. Os testes cobrem preservação do progresso, conflitos, troca de conta, exercícios, atalhos de teclado, falhas de conteúdo, navegação, relatório e bancos de questões.

Para repetir a verificação de interface, execute `node tests/navegador.cjs` com o servidor local aberto e Playwright disponível no ambiente. `PLAYWRIGHT_MODULE` indica um módulo já instalado; `CHROMIUM_PATH` indica o navegador. O teste usa contas fictícias, cobre teclado, foco, quatro larguras e recuperação de conteúdo. Nunca usa uma conta real.

O workflow `.github/workflows/verificacoes.yml` roda em cada pull request e em main. O job de publicação depende do sucesso dos testes e envia ao Pages apenas os arquivos públicos. O Pages deve usar a origem **GitHub Actions**, em vez da publicação legacy por branch. Essa seleção é feita por quem administra o repositório em Settings → Pages → Build and deployment → Source. Enquanto a origem permanecer legacy, ela também pode publicar fora deste workflow; o job mostra um aviso.

Para reverter uma publicação, reverta o commit pelo Git e deixe o mesmo workflow testar e publicar a reversão. Nunca restaure arquivos de progresso de usuários como parte de um rollback do site. A versão de cache deve aumentar em todos os imports/URLs a cada alteração publicada, conforme `AGENTS.md`.

## Skills e mapa do código

Leia `AGENTS.md` e a skill pertinente em `.claude/skills/`. O mapa inicial está em `graphify-out/GRAPH_REPORT.md`.

Para atualizar o mapa, instale a ferramenta em um ambiente Python separado do site:

```sh
python3 -m venv /tmp/studia-graphify
/tmp/studia-graphify/bin/pip install graphifyy==0.9.108
/tmp/studia-graphify/bin/graphify update .
```

As referências da skill Graphify estão em `.claude/skills/graphify/references/`; a origem exata está em `ORIGEM.md` nessa pasta. Nenhuma dessas ferramentas é necessária para abrir o site.

## Créditos

Modelos 3D: Quaternius (CC0). Biblioteca: Three.js. As fontes e condições das imagens de estudo estão em `content/img/guia/FONTES.md` e `fontes.json`.
