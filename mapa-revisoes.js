/* Mapa de revisões: cada flashcard é um bloquinho colorido pelo estado.
   Ao responder, o bloco se desfaz em partículas e volta no grupo novo; o contador "para dominar" acompanha.
   Canvas único, laço de animação só enquanto há algo se movendo. */

const CATS = [
  { k: "dom", nome: "Dominados", cor: "--acc" },
  { k: "apr", nome: "Aprendendo", cor: "--acc2" },
  { k: "err", nome: "Errados", cor: "--bad" },
  { k: "novo", nome: "Nunca vistos", cor: "--line2" },
];
const ORDEM = Object.fromEntries(CATS.map((c, i) => [c.k, i]));
export const estadoCard = st => !st ? "novo" : st.b >= 3 ? "dom" : st.err > 0 && st.b === 0 ? "err" : "apr";

const reduz = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const easeOut = t => 1 - Math.pow(1 - t, 3);

export function criaMapaRevisoes() {
  const el = document.createElement("section");
  el.className = "mapa-rev vidro";
  el.setAttribute("aria-label", "Mapa dos seus flashcards");
  el.innerHTML = `<div class="mr-topo">
      <div class="mr-num"><b id="mrNum">0</b><span>para dominar</span><em id="mrTot"></em></div>
      <div class="mr-leg" role="group" aria-label="Estados dos cards">${CATS.map(c => `<button type="button" class="mr-chip" data-cat="${c.k}" aria-pressed="false"><i style="background:var(${c.cor})"></i>${c.nome}<em data-n="${c.k}">0</em></button>`).join("")}</div>
    </div>
    <div class="mr-tela"><canvas aria-hidden="true"></canvas></div>`;
  const cv = el.querySelector("canvas"), ctx = cv.getContext("2d"), tela = el.querySelector(".mr-tela");
  const num = el.querySelector("#mrNum"), tot = el.querySelector("#mrTot");

  let blocos = new Map(), parts = [], cores = {}, W = 0, H = 0, S = 9, G = 3, foco = null, fixo = null;
  let laco = 0, ultimo = 0, scan = null, primeira = true, numAtual = 0, numAnim = null;

  function leCores() {
    const cs = getComputedStyle(el);
    CATS.forEach(c => { cores[c.k] = cs.getPropertyValue(c.cor).trim() || "#999"; });
  }
  function dimensiona() {
    W = tela.clientWidth; S = W < 420 ? 7 : 9; G = W < 420 ? 2 : 3;
    const cols = Math.max(8, Math.floor((W + G) / (S + G)));
    const lista = [...blocos.values()].sort((a, b) => ORDEM[a.cat] - ORDEM[b.cat] || a.ord - b.ord);
    lista.forEach((b, i) => { b.tx = (i % cols) * (S + G); b.ty = Math.floor(i / cols) * (S + G); });
    const linhas = Math.max(1, Math.ceil(lista.length / cols));
    H = linhas * (S + G) - G;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function desenha(dt) {
    ctx.clearRect(0, 0, W, H);
    let ativo = false;
    const k = 1 - Math.exp(-dt * 14), sel = fixo || foco;
    for (const b of blocos.values()) {
      const dx = b.tx - b.x, dy = b.ty - b.y;
      if (Math.abs(dx) > .1 || Math.abs(dy) > .1) { b.x += dx * k; b.y += dy * k; ativo = true; } else { b.x = b.tx; b.y = b.ty; }
      const alvoA = sel && sel !== b.cat ? .18 : 1;
      if (b.espera > 0) { b.espera -= dt; ativo = true; continue; }
      if (Math.abs(alvoA - b.a) > .01) { b.a += (alvoA - b.a) * k; ativo = true; } else b.a = alvoA;
      if (scan !== null && b.tx > scan) continue;
      ctx.globalAlpha = b.a; ctx.fillStyle = cores[b.cat];
      ctx.beginPath(); ctx.roundRect(b.x, b.y, S, S, S > 8 ? 2.5 : 2); ctx.fill();
    }
    if (parts.length) {
      ativo = true;
      parts = parts.filter(p => (p.v -= dt) > 0);
      for (const p of parts) {
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 40 * dt;
        const f = p.v / p.vida;
        ctx.globalAlpha = f; ctx.fillStyle = p.cor;
        const s = p.s * (.4 + .6 * f); ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
    }
    ctx.globalAlpha = 1;
    return ativo;
  }
  function quadro(t) {
    const dt = Math.min(.05, (t - (ultimo || t)) / 1000); ultimo = t;
    let ativo = false;
    if (scan !== null) {
      scan += dt * Math.max(600, W * 1.6);
      ativo = true;
      if (scan > W + S) scan = null;
    }
    ativo = desenha(dt) || ativo;
    if (scan !== null) {
      ctx.globalAlpha = .55; ctx.fillStyle = cores.apr; ctx.fillRect(scan, 0, 1.5, H); ctx.globalAlpha = 1;
    }
    laco = ativo ? requestAnimationFrame(quadro) : 0;
    if (!laco) ultimo = 0;
  }
  const anima = () => { if (!laco) laco = requestAnimationFrame(quadro); };

  function explode(b) {
    if (reduz()) return;
    const cor = cores[b.cat];
    for (let i = 0; i < 9; i++) parts.push({ x: b.x + S / 2, y: b.y + S / 2, vx: (Math.random() - .5) * 70, vy: -20 - Math.random() * 50, s: 2 + Math.random() * 2.5, cor, vida: .55 + Math.random() * .3, v: .55 + Math.random() * .3 });
  }

  function contador(alvo) {
    if (reduz() || primeira) { numAtual = alvo; num.textContent = alvo; return; }
    const de = numAtual, t0 = performance.now();
    cancelAnimationFrame(numAnim);
    const passo = t => { const p = Math.min(1, (t - t0) / 480); numAtual = Math.round(de + (alvo - de) * easeOut(p)); num.textContent = numAtual; if (p < 1) numAnim = requestAnimationFrame(passo); };
    numAnim = requestAnimationFrame(passo);
  }

  /* cards: [{ id, cat }] — chamado a cada render da tela de flashcards */
  function atualiza(cards) {
    leCores();
    const novos = new Map(), cont = { dom: 0, apr: 0, err: 0, novo: 0 };
    cards.forEach((c, i) => {
      cont[c.cat]++;
      const velho = blocos.get(c.id);
      if (velho) {
        velho.ord = i;
        if (velho.cat !== c.cat) { explode(velho); velho.cat = c.cat; velho.a = 0; velho.espera = reduz() ? 0 : .18; }
        novos.set(c.id, velho);
      } else novos.set(c.id, { id: c.id, cat: c.cat, ord: i, x: 0, y: 0, tx: 0, ty: 0, a: primeira ? 1 : 0 });
    });
    blocos = novos;
    const antesW = W; dimensiona();
    if (primeira || antesW !== W) for (const b of blocos.values()) { if (primeira) { b.x = b.tx; b.y = b.ty; } }
    CATS.forEach(c => { el.querySelector(`[data-n="${c.k}"]`).textContent = cont[c.k]; });
    const pend = cards.length - cont.dom;
    contador(pend);
    tot.textContent = `de ${cards.length} cards`;
    el.setAttribute("aria-label", `Mapa dos flashcards: ${pend} para dominar de ${cards.length}. ${CATS.map(c => `${cont[c.k]} ${c.nome.toLowerCase()}`).join(", ")}.`);
    if (primeira && !reduz() && cards.length) scan = 0;
    primeira = false;
    anima();
  }

  /* destaque por categoria: passar o mouse mostra, tocar fixa */
  el.querySelectorAll(".mr-chip").forEach(b => {
    const cat = b.dataset.cat;
    b.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") { foco = cat; anima(); } });
    b.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") { foco = null; anima(); } });
    b.addEventListener("focus", () => { foco = cat; anima(); });
    b.addEventListener("blur", () => { foco = null; anima(); });
    b.addEventListener("click", () => {
      fixo = fixo === cat ? null : cat;
      el.querySelectorAll(".mr-chip").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.cat === fixo)));
      anima();
    });
  });
  cv.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    let achou = null;
    for (const b of blocos.values()) if (x >= b.tx && x <= b.tx + S && y >= b.ty && y <= b.ty + S) { achou = b.cat; break; }
    if (achou !== foco) { foco = achou; anima(); }
  });
  cv.addEventListener("pointerleave", () => { foco = null; anima(); });
  new ResizeObserver(() => { if (tela.clientWidth && tela.clientWidth !== W) { dimensiona(); for (const b of blocos.values()) { b.x = b.tx; b.y = b.ty; } anima(); } }).observe(tela);

  return { el, atualiza };
}
