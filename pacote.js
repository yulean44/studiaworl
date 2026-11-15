/* Pacote de criatura: arraste pela linha para rasgar, a carta sobe, vira e brilha.
   Momento raro (só quando nasce uma criatura), então é onde a animação pode ter festa.
   Rastreio do dedo 1:1 com escrita direta de transform; depois, sequência com WAAPI. */

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)", EASE_IO = "cubic-bezier(0.77, 0, 0.175, 1)";
const reduz = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const PALETA = {
  comum: ["#c9d6c3", "#8fa58a", "#5f7a5b"], incomum: ["#bfe6cc", "#5fae7c", "#2f7a4c"],
  raro: ["#c6d9fb", "#6b97e6", "#2f5fc4"], lendario: ["#fbe3a6", "#e3a63c", "#a8650c"],
};
const ANEL = `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="13" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="32" cy="32" rx="27" ry="9" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(-18 32 32)"/><circle cx="27" cy="27" r="3" fill="currentColor" opacity=".5"/></svg>`;

export function abrePacote({ titulo, nome, raridade, rar = "comum", numero, total, img, aoVer, aoFechar }) {
  const [c1, c2, c3] = PALETA[rar] || PALETA.comum;
  const veu = document.createElement("div");
  veu.className = "pk-veu";
  veu.setAttribute("role", "dialog"); veu.setAttribute("aria-modal", "true"); veu.setAttribute("aria-labelledby", "pkTit");
  veu.style.setProperty("--c1", c1); veu.style.setProperty("--c2", c2); veu.style.setProperty("--c3", c3);
  veu.innerHTML = `<canvas class="pk-confete" aria-hidden="true"></canvas>
    <div class="pk-cab"><p class="pk-kick">Nova criatura</p><h3 id="pkTit">${titulo}</h3></div>
    <div class="pk-palco">
      <div class="pk-carta" aria-hidden="true"><div class="pk-carta-in">
        <div class="pk-verso">${ANEL}</div>
        <div class="pk-frente">
          <div class="pk-arte"><div class="pk-img"></div></div>
          <div class="pk-info"><b class="pk-nome"></b><span class="pk-rar"></span><em class="pk-n"></em></div>
          <i class="pk-holo"></i><i class="pk-luz"></i>
        </div>
      </div></div>
      <div class="pk-pacote">
        <div class="pk-tira"><i class="pk-tira-a"></i><i class="pk-tira-b"></i></div>
        <div class="pk-corpo"><div class="pk-emblema">${ANEL}</div><span class="pk-marca">Planeta de Estudos</span><span class="pk-sub">Pacote de criatura</span><i class="pk-foil"></i></div>
        <div class="pk-guia" aria-hidden="true"><i></i></div>
      </div>
    </div>
    <p class="pk-dica" id="pkDica">Arraste pela linha para abrir</p>
    <div class="pk-acts"><button type="button" class="btn pri" id="pkAbrir">Abrir pacote</button></div>`;
  document.body.appendChild(veu);
  const $ = s => veu.querySelector(s);
  const pacote = $(".pk-pacote"), tiraA = $(".pk-tira-a"), tiraB = $(".pk-tira-b"), corpo = $(".pk-corpo"), carta = $(".pk-carta"), cartaIn = $(".pk-carta-in"), dica = $("#pkDica"), acts = $(".pk-acts");
  $(".pk-nome").textContent = nome; $(".pk-rar").textContent = raridade; $(".pk-n").textContent = numero ? `${numero} / ${total}` : "";
  Promise.resolve(img).then(u => { if (u) $(".pk-img").innerHTML = `<img src="${u}" alt="">`; });
  const anterior = document.activeElement;
  requestAnimationFrame(() => veu.classList.add("on"));
  $("#pkAbrir").focus({ preventScroll: true });

  /* rasgo: progresso p (0–1) segue o dedo ao longo da linha */
  let p = 0, aberto = false, arrasto = null; const animsCarta = [];
  const pinta = () => {
    tiraA.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
    tiraA.style.transform = `translate(${-p * 6}px, ${-p * 10}px) rotate(${-p * 7}deg)`;
    tiraB.style.clipPath = `inset(0 0 0 ${p * 100}%)`;
  };
  pacote.addEventListener("pointerdown", e => {
    if (aberto) return;
    const r = pacote.getBoundingClientRect();
    arrasto = { x0: e.clientX - p * r.width, w: r.width, t: e.timeStamp, x: e.clientX, v: 0 };
    pacote.setPointerCapture(e.pointerId); veu.classList.add("arrastando");
  });
  pacote.addEventListener("pointermove", e => {
    if (!arrasto) return;
    const dt = Math.max(1, e.timeStamp - arrasto.t);
    arrasto.v = (e.clientX - arrasto.x) / dt; arrasto.x = e.clientX; arrasto.t = e.timeStamp;
    const bruto = (e.clientX - arrasto.x0) / arrasto.w;
    p = bruto < 0 ? bruto * .15 : Math.min(1, bruto); p = Math.max(-.04, p); pinta();
  });
  const solta = () => {
    if (!arrasto) return;
    const v = arrasto.v; arrasto = null; veu.classList.remove("arrastando");
    if (p > .5 || (v > .55 && p > .12)) rasga();
    else { const de = p, t0 = performance.now(); const volta = t => { const k = Math.min(1, (t - t0) / 200); p = de * (1 - (1 - Math.pow(1 - k, 3))); pinta(); if (k < 1) requestAnimationFrame(volta); }; requestAnimationFrame(volta); }
  };
  pacote.addEventListener("pointerup", solta); pacote.addEventListener("pointercancel", solta);
  $("#pkAbrir").addEventListener("click", () => rasga());

  function rasga() {
    if (aberto) return; aberto = true;
    dica.textContent = ""; $("#pkAbrir").disabled = true;
    if (reduz()) { p = 1; pinta(); pacote.style.opacity = 0; mostraCarta(true); return; }
    const de = p, t0 = performance.now();
    const corre = t => { const k = Math.min(1, (t - t0) / 160); p = de + (1 - de) * k; pinta(); if (k < 1) requestAnimationFrame(corre); else voa(); };
    requestAnimationFrame(corre);
  }
  function voa() {
    tiraA.animate([{ transform: tiraA.style.transform, opacity: 1 }, { transform: "translate(60px,-120px) rotate(-28deg)", opacity: 0 }], { duration: 480, easing: EASE_OUT, fill: "forwards" });
    corpo.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(70%)", opacity: 0 }], { duration: 560, delay: 220, easing: EASE_IO, fill: "forwards" });
    $(".pk-guia").animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" });
    tiraB.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 220, fill: "forwards" });
    setTimeout(() => mostraCarta(false), 160);
  }
  function mostraCarta(instante) {
    carta.classList.add("fora");
    if (instante) { cartaIn.style.transform = "rotateY(0deg)"; carta.style.transform = "none"; return pronto(); }
    animsCarta.push(carta.animate([{ transform: "translateY(18%) scale(.94)" }, { transform: "translateY(-4%) scale(1.02)", offset: .7 }, { transform: "translateY(0) scale(1)" }], { duration: 620, easing: EASE_OUT, fill: "forwards" }));
    const vira = cartaIn.animate([{ transform: "rotateY(180deg)" }, { transform: "rotateY(0deg)" }], { duration: 640, delay: 520, easing: EASE_IO, fill: "forwards" });
    animsCarta.push(vira);
    setTimeout(() => { confete(); carta.classList.add("brilha"); }, 820);
    vira.finished.then(pronto);
  }
  function pronto() {
    animsCarta.forEach(a => { try { a.commitStyles(); } catch {} a.cancel(); });
    veu.classList.add("revelado");
    acts.innerHTML = `<button type="button" class="btn" id="pkVer">Ver no planeta</button><button type="button" class="btn pri" id="pkOk">Continuar</button>`;
    $("#pkVer").addEventListener("click", () => fecha(aoVer));
    $("#pkOk").addEventListener("click", () => fecha());
    $("#pkOk").focus({ preventScroll: true });
    liga3d();
  }

  /* carta holográfica: inclina com o ponteiro, o brilho acompanha */
  function liga3d() {
    let rx = 0, ry = 0, ax = 0, ay = 0, mx = 50, my = 50, laco = 0;
    const passo = () => {
      ax += (rx - ax) * .14; ay += (ry - ay) * .14;
      carta.style.transform = `rotateX(${ax.toFixed(2)}deg) rotateY(${ay.toFixed(2)}deg)`;
      cartaIn.style.setProperty("--mx", mx + "%"); cartaIn.style.setProperty("--my", my + "%");
      laco = Math.abs(rx - ax) + Math.abs(ry - ay) > .02 ? requestAnimationFrame(passo) : 0;
    };
    const move = e => {
      const r = carta.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      if (x < -.3 || x > 1.3 || y < -.3 || y > 1.3) { rx = ry = 0; mx = my = 50; }
      else { rx = (.5 - y) * 16; ry = (x - .5) * 18; mx = Math.round(x * 100); my = Math.round(y * 100); }
      if (!laco && !reduz()) laco = requestAnimationFrame(passo);
    };
    veu.addEventListener("pointermove", move);
    veu.addEventListener("pointerleave", () => { rx = ry = 0; mx = my = 50; if (!laco) laco = requestAnimationFrame(passo); });
  }

  /* confete: uma explosão só, a partir da carta */
  function confete() {
    if (reduz()) return;
    const cv = $(".pk-confete"), ctx = cv.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const r = carta.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .45;
    const cores = [c1, c2, c3, "#ffffff", "#9fe0b0", "#f2c46e"];
    const ps = Array.from({ length: 120 }, () => {
      const a = -Math.PI / 2 + (Math.random() - .5) * 2.4, v = 380 + Math.random() * 520;
      return { x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: Math.random() * 6, vr: (Math.random() - .5) * 14, w: 5 + Math.random() * 6, h: 3 + Math.random() * 4, cor: cores[(Math.random() * cores.length) | 0], vida: 1.6 + Math.random() * .6 };
    });
    let t0 = 0;
    const q = t => {
      const dt = t0 ? Math.min(.04, (t - t0) / 1000) : .016; t0 = t;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let vivos = 0;
      for (const p of ps) {
        if ((p.vida -= dt) <= 0) continue; vivos++;
        p.vx *= .985; p.vy = p.vy * .985 + 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        ctx.save(); ctx.globalAlpha = Math.min(1, p.vida / .5); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.rot * 1.7)); ctx.fillStyle = p.cor; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      }
      if (vivos) requestAnimationFrame(q); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    requestAnimationFrame(q);
  }

  function fecha(depois) {
    veu.removeEventListener("keydown", tecla);
    veu.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-out", fill: "forwards" }).finished.then(() => {
      veu.remove(); if (anterior?.isConnected) anterior.focus?.({ preventScroll: true });
      aoFechar?.(); depois?.();
    });
  }
  const tecla = e => {
    if (e.key === "Escape") { e.preventDefault(); aberto ? fecha() : rasga(); }
    if (e.key === "Tab") { const bs = [...veu.querySelectorAll("button:not(:disabled)")]; if (!bs.length) return; const i = bs.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); bs.at(-1).focus(); } else if (!e.shiftKey && i === bs.length - 1) { e.preventDefault(); bs[0].focus(); } }
  };
  veu.addEventListener("keydown", tecla);
}
