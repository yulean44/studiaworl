/* Céu do dia: sol e lua atravessam o céu sobre colinas low-poly conforme a hora real.
   Ao abrir, o dia corre rápido da madrugada até agora (uma vez). Tocar abre a aparência. */

// cor do céu (topo, horizonte) ao longo do dia, em horas
const CEU = [
  [0, "#121c33", "#22314f"], [4.5, "#1a2644", "#3a3f63"], [5.5, "#8fa6cf", "#f3cfb0"], [7, "#bcd9f0", "#eef4f2"],
  [11, "#a9d3f0", "#e8f4fb"], [14, "#c3dcea", "#f8eedb"], [16.5, "#f0c58c", "#fbe5bd"], [18, "#c88a7a", "#f5b47e"],
  [19, "#4a4f86", "#b98a8f"], [20.5, "#1c2847", "#2e3c60"], [24, "#121c33", "#22314f"],
];
const NASCE = 5.5, POE = 18.5;
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
function ceu(h) {
  let i = 0; while (h >= CEU[i + 1][0]) i++;
  const [h0, a0, b0] = CEU[i], [h1, a1, b1] = CEU[i + 1], t = (h - h0) / (h1 - h0);
  return [mix(a0, a1, t), mix(b0, b1, t)];
}
const noiteDe = h => h < 4.5 || h > 20.5 ? 1 : h < 6 ? (6 - h) / 1.5 : h > 18.5 ? (h - 18.5) / 2 : 0;
const periodo = h => h >= 5 && h < 12 ? "manhã" : h >= 12 && h < 18 ? "tarde" : "noite";

/* posição do astro: o sol faz o arco de dia, a lua faz o arco de noite */
function astro(h) {
  const dia = h >= NASCE && h <= POE;
  const f = dia ? (h - NASCE) / (POE - NASCE) : ((h < NASCE ? h + 24 : h) - POE) / (24 - (POE - NASCE));
  return { dia, x: 10 + f * 100, y: 27 - Math.sin(Math.PI * f) * 17 };
}

/* colinas em facetas, como o terreno do planeta */
const COLINAS = [
  ["0,44 0,30 14,26 22,32", "#7fae6a"], ["0,44 22,32 34,44", "#6a9a58"], ["22,32 14,26 40,24 34,44", "#8dbb75"],
  ["34,44 40,24 58,31 52,44", "#719f5c"], ["52,44 58,31 76,27 72,44", "#86b46e"], ["72,44 76,27 94,22 90,44", "#78a862"],
  ["90,44 94,22 108,29 104,44", "#8fbd77"], ["104,44 108,29 120,25 120,44", "#6f9d5a"], ["58,31 76,27 66,36", "#9cc583"],
  ["94,22 108,29 100,31", "#a4cb8a"],
];
const ESTRELAS = [[16, 9], [30, 15], [47, 7], [63, 13], [82, 8], [97, 15], [111, 10], [38, 21], [72, 19]];

export function criaDiaHora(aoTocar) {
  const el = document.createElement("button");
  el.type = "button"; el.className = "diahora"; el.id = "btTema";
  el.innerHTML = `<svg viewBox="0 0 120 44" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="dhCeu" x1="0" y1="0" x2="0" y2="1"><stop offset="0"/><stop offset="1"/></linearGradient>
    <radialGradient id="dhSol"><stop offset="0" stop-color="#fffbe8"/><stop offset=".55" stop-color="#ffe7a8"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
    <rect width="120" height="44" fill="url(#dhCeu)"/>
    <g class="dh-estrelas">${ESTRELAS.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? .55 : .8}" fill="#fff"/>`).join("")}</g>
    <g class="dh-astro"><circle class="dh-brilho" r="9" fill="url(#dhSol)"/><circle class="dh-disco" r="3.6"/><circle class="dh-sombra" r="3.3" cx="2.3" cy="-1.5"/></g>
    <g class="dh-colinas" transform="translate(0 8)">${COLINAS.map(([p, c]) => `<polygon points="${p}" fill="${c}"/>`).join("")}</g>
    <rect class="dh-veu" width="120" height="44" fill="#14203a"/>
  </svg><span class="dh-reflexo"></span>`;
  const [s0, s1] = el.querySelectorAll("stop"), g = el.querySelector(".dh-astro"), disco = el.querySelector(".dh-disco"),
    sombra = el.querySelector(".dh-sombra"), brilho = el.querySelector(".dh-brilho"), est = el.querySelector(".dh-estrelas"), veu = el.querySelector(".dh-veu");
  function pinta(h) {
    const [a, b] = ceu(h), n = noiteDe(h), p = astro(h);
    s0.setAttribute("stop-color", a); s1.setAttribute("stop-color", b);
    g.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
    disco.setAttribute("fill", p.dia ? "#fff6d6" : "#eef2ff");
    sombra.setAttribute("fill", a); sombra.style.opacity = p.dia ? 0 : 1;
    brilho.style.opacity = p.dia ? 1 : .35;
    est.style.opacity = n.toFixed(2); veu.style.opacity = (n * .55).toFixed(2);
  }
  const agora = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
  function atualiza() {
    const h = agora();
    pinta(h);
    const r = Math.floor(h), m = Math.round((h - r) * 60);
    el.title = `${String(r).padStart(2, "0")}h${String(m).padStart(2, "0")} · ${periodo(h)}`;
    el.setAttribute("aria-label", `Céu de agora: ${periodo(h)}. Abrir aparência`);
  }
  /* o dia corre da madrugada até agora em 1,6 s, uma única vez */
  function corre() {
    const fim = agora(), ini = 4, dur = 1600, t0 = performance.now();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return atualiza();
    const span = (fim - ini + 24) % 24;
    const passo = now => { const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3); pinta((ini + span * e) % 24); if (t < 1) requestAnimationFrame(passo); else atualiza(); };
    requestAnimationFrame(passo);
  }
  el.addEventListener("click", aoTocar);
  atualiza(); setInterval(atualiza, 60000);
  return { el, atualiza, corre };
}
