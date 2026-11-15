/* Pacote de criatura em 3D (three.js): embalagem estufada de papel metálico, tira que rasga e se curva,
   carta com espessura e brilho holográfico, confete 3D. Se não houver WebGL ou o aparelho pedir menos
   movimento, quem chama usa a versão em HTML (pacote.js). */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const PALETA = {
  comum: ["#c8dcbe", "#7fa476", "#4b6b45"], incomum: ["#b9ecc9", "#4fae74", "#1f6a3c"],
  raro: ["#cddfff", "#6b97e6", "#2650b0"], lendario: ["#fde7ae", "#e3a63c", "#97570a"],
};
const PW = 1.16, PH = 1.62, TEAR = .87, CW = 1.0, CH = 1.4, CT = .014;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeBack = t => { const c = 1.45; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

export function podePacote3d() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

/* ---------- texturas desenhadas em canvas ---------- */
function anel(g, x, y, r, cor, lw) {
  g.save(); g.strokeStyle = cor; g.lineWidth = lw; g.globalAlpha = .95;
  g.beginPath(); g.arc(x, y, r * .48, 0, 7); g.stroke();
  g.translate(x, y); g.rotate(-.32); g.beginPath(); g.ellipse(0, 0, r, r * .33, 0, 0, 7); g.stroke();
  g.globalAlpha = .5; g.fillStyle = cor; g.beginPath(); g.arc(-r * .18, -r * .18, r * .11, 0, 7); g.fill(); g.restore();
}
function texPacote([c1, c2, c3], verso) {
  const w = 512, h = Math.round(512 * PH / PW), cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const g = cv.getContext("2d");
  const gr = g.createLinearGradient(0, 0, w * .6, h); gr.addColorStop(0, c1); gr.addColorStop(.5, c2); gr.addColorStop(1, c3);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const brilho = g.createRadialGradient(w * .32, h * .3, 10, w * .32, h * .3, w * .9); brilho.addColorStop(0, "rgba(255,255,255,.35)"); brilho.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = brilho; g.fillRect(0, 0, w, h);
  /* faixas seladas (frisos) em cima e embaixo */
  const fr = (y0, y1) => { g.fillStyle = "rgba(0,0,0,.10)"; for (let x = 0; x < w; x += 9) g.fillRect(x, y0, 3, y1 - y0); g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(0, y1 - 2, w, 2); };
  fr(0, h * (1 - TEAR) - 4); fr(h * .93, h);
  if (!verso) {
    g.setLineDash([10, 8]); g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(w * .05, h * (1 - TEAR)); g.lineTo(w * .95, h * (1 - TEAR)); g.stroke(); g.setLineDash([]);
    anel(g, w / 2, h * .48, w * .2, "#ffffff", 7);
    g.fillStyle = "rgba(255,255,255,.96)"; g.textAlign = "center";
    g.font = "500 22px Jost, sans-serif"; g.letterSpacing = "6px"; g.fillText("PLANETA DE ESTUDOS", w / 2, h * .66);
    g.letterSpacing = "0px"; g.font = "400 22px Jost, sans-serif"; g.globalAlpha = .82; g.fillText("Pacote de criatura", w / 2, h * .705); g.globalAlpha = 1;
  } else {
    g.globalAlpha = .25; for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) anel(g, w * (.12 + i * .19), h * (.2 + j * .11), 22, "#ffffff", 3); g.globalAlpha = 1;
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function texCarta({ nome, raridade, numero, total, cores: [c1, c2, c3] }) {
  const w = 512, h = Math.round(512 * CH / CW), cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const g = cv.getContext("2d");
  const desenha = img => {
    g.clearRect(0, 0, w, h);
    const f = g.createLinearGradient(0, 0, w, h); f.addColorStop(0, "#ffffff"); f.addColorStop(1, "#f2eee6"); g.fillStyle = f; g.fillRect(0, 0, w, h);
    g.strokeStyle = c2; g.globalAlpha = .55; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); g.globalAlpha = 1;
    const ax = 26, ay = 26, aw = w - 52, ah = h * .66;
    const ar = g.createRadialGradient(w / 2, ay + ah * .38, 10, w / 2, ay + ah * .4, aw * .8); ar.addColorStop(0, "#ffffff"); ar.addColorStop(.55, c1); ar.addColorStop(1, c2);
    g.save(); g.beginPath(); g.roundRect(ax, ay, aw, ah, 20); g.clip(); g.fillStyle = ar; g.fillRect(ax, ay, aw, ah);
    g.globalAlpha = .18; anel(g, w / 2, ay + ah * .5, aw * .42, "#ffffff", 4); g.globalAlpha = 1;
    if (img) { const s = aw * .86; g.shadowColor = "rgba(20,30,50,.3)"; g.shadowBlur = 24; g.shadowOffsetY = 12; g.drawImage(img, w / 2 - s / 2, ay + ah / 2 - s / 2, s, s); g.shadowColor = "transparent"; }
    g.restore();
    g.textAlign = "left"; g.fillStyle = "#1d2a3a"; g.font = "500 40px Jost, sans-serif"; g.fillText(nome, 34, ay + ah + 62);
    g.fillStyle = c3; g.font = "500 20px Jost, sans-serif"; g.letterSpacing = "5px"; g.fillText(raridade.toUpperCase(), 34, ay + ah + 100); g.letterSpacing = "0px";
    if (numero) { g.textAlign = "right"; g.fillStyle = "#6b7686"; g.font = "400 22px Jost, sans-serif"; g.fillText(`${numero} / ${total}`, w - 34, ay + ah + 62); }
    g.textAlign = "center"; g.fillStyle = "rgba(29,42,58,.35)"; g.font = "400 16px Jost, sans-serif"; g.letterSpacing = "4px"; g.fillText("PLANETA DE ESTUDOS", w / 2, h - 30); g.letterSpacing = "0px";
  };
  desenha(null);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { t, desenha: img => { desenha(img); t.needsUpdate = true; } };
}
function texVerso([c1, c2, c3]) {
  const w = 512, h = Math.round(512 * CH / CW), cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const g = cv.getContext("2d");
  const r = g.createRadialGradient(w * .3, h * .15, 10, w * .5, h * .5, h * .8); r.addColorStop(0, c1); r.addColorStop(.55, c2); r.addColorStop(1, c3);
  g.fillStyle = r; g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 14; g.strokeRect(22, 22, w - 44, h - 44);
  anel(g, w / 2, h / 2, w * .26, "#ffffff", 9);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function texSombra() {
  const cv = document.createElement("canvas"); cv.width = cv.height = 128; const g = cv.getContext("2d");
  const r = g.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, "rgba(10,15,30,.45)"); r.addColorStop(1, "rgba(10,15,30,0)");
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(cv);
}

/* ---------- geometria ---------- */
function retanguloArredondado(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
function uvNormaliza(geo, w, h) {
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + .5, p.getY(i) / h + .5);
  uv.needsUpdate = true; return geo;
}
/* metade estufada (frente ou verso) de uma faixa do pacote, entre v0 e v1 da altura total */
function metadeEstufada(v0, v1, lado) {
  const segX = 40, segY = Math.max(4, Math.round(60 * (v1 - v0)));
  const geo = new THREE.PlaneGeometry(PW, PH * (v1 - v0), segX, segY);
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const u = uv.getX(i), vl = uv.getY(i), v = v0 + vl * (v1 - v0);
    const y = (v - .5) * PH;
    const crimp = sm(.035, .095, v) * sm(TEAR + .005, TEAR - .05, v) ;
    const borda = Math.pow(Math.sin(Math.PI * u), .55);
    const ruga = (Math.sin(u * 17.3 + v * 5.1) * Math.sin(v * 23.7 + u * 3.3) + Math.sin(u * 41 - v * 13) * .4) * .0016;
    const z = (.085 * borda * crimp + ruga * crimp + .004) * lado;
    p.setXYZ(i, p.getX(i) * (1 - .02 * crimp * (1 - borda)), y, z);
    uv.setXY(i, lado > 0 ? u : 1 - u, v);
  }
  if (lado < 0) { const idx = geo.index.array; for (let i = 0; i < idx.length; i += 3) { const t = idx[i]; idx[i] = idx[i + 2]; idx[i + 2] = t; } }
  geo.computeVertexNormals(); geo.userData.base = Float32Array.from(p.array); return geo;
}

/* ---------- holográfico da carta ---------- */
function materialHolo(map) {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: map }, t: { value: 0 }, incl: { value: new THREE.Vector2() }, forca: { value: 0 } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform sampler2D map; uniform float t; uniform vec2 incl; uniform float forca; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      void main(){
        vec4 b=texture2D(map,vUv);
        float arte = step(.05,vUv.x)*step(vUv.x,.95)*step(.31,vUv.y)*step(vUv.y,.965);
        float moldura = 1.-step(.012,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));
        float m = max(arte*.85, moldura);
        float fase = vUv.x*.9 + vUv.y*.7 + incl.x*1.4 + incl.y*1.1 + t*.04;
        vec3 iri = .5+.5*cos(6.2832*(fase+vec3(0.,.33,.67)));
        float faixa = exp(-pow((vUv.x*.8+vUv.y*.6-(.7+incl.y*1.1-incl.x*.6))*5.,2.));
        vec2 g=floor(vUv*vec2(90.,126.)); float s=h(g); float pisca=step(.985,s)*pow(.5+.5*sin(t*3.+s*40.+incl.x*20.),8.);
        float luz = .93+.12*max(dot(vN,normalize(vec3(.35,.55,1.))),0.);
        vec3 c = b.rgb*luz;
        c += iri*m*.16*forca + faixa*.32*forca*(.4+.6*m) + pisca*m*.9*forca;
        float fres = pow(1.-max(dot(vN,vV),0.),3.); c += fres*.12;
        gl_FragColor=vec4(c,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

export function abrePacote3d({ titulo, nome, raridade, rar = "comum", numero, total, img, aoVer, aoFechar }) {
  const cores = PALETA[rar] || PALETA.comum;
  const veu = document.createElement("div");
  veu.className = "pk-veu pk3";
  veu.setAttribute("role", "dialog"); veu.setAttribute("aria-modal", "true"); veu.setAttribute("aria-labelledby", "pkTit");
  veu.innerHTML = `<canvas class="pk3-tela" aria-hidden="true"></canvas>
    <div class="pk-cab"><p class="pk-kick">Nova criatura</p><h3 id="pkTit">${titulo}</h3></div>
    <div class="pk-palco pk3-palco" aria-hidden="true"></div>
    <p class="pk-dica" id="pkDica" aria-live="polite">Arraste pela linha para abrir</p>
    <div class="pk-acts"><button type="button" class="btn pri" id="pkAbrir">Abrir pacote</button></div>
    <p class="sr-only" id="pkRes" aria-live="polite"></p>`;
  document.body.appendChild(veu);
  const $ = s => veu.querySelector(s), cv = $(".pk3-tela"), palco = $(".pk3-palco"), dica = $("#pkDica"), acts = $(".pk-acts");
  const anterior = document.activeElement;
  requestAnimationFrame(() => veu.classList.add("on"));
  $("#pkAbrir").focus({ preventScroll: true });

  /* cena */
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, .1, 50);
  const pmrem = new THREE.PMREMGenerator(renderer), env = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environment = env;
  scene.add(new THREE.HemisphereLight("#ffffff", "#8a94a8", .6));
  const key = new THREE.DirectionalLight("#fff6ea", 1.6); key.position.set(1.5, 2.2, 3); scene.add(key);
  const flash = new THREE.PointLight("#ffffff", 0, 6); flash.position.set(0, .2, 1.4); scene.add(flash);
  const raiz = new THREE.Group(); scene.add(raiz);

  /* pacote: corpo + tira (frente e verso estufados) */
  const tFrente = texPacote(cores, false), tVerso = texPacote(cores, true);
  const matFoil = map => new THREE.MeshPhysicalMaterial({ map, metalness: .32, roughness: .34, clearcoat: 1, clearcoatRoughness: .18, iridescence: .32, iridescenceIOR: 1.3, iridescenceThicknessRange: [200, 480], transparent: true, envMapIntensity: .55 });
  const mF = matFoil(tFrente), mV = matFoil(tVerso);
  const pacote = new THREE.Group(), corpo = new THREE.Group(), tira = new THREE.Group();
  const corpoF = new THREE.Mesh(metadeEstufada(0, TEAR, 1), mF), corpoV = new THREE.Mesh(metadeEstufada(0, TEAR, -1), mV);
  const tiraF = new THREE.Mesh(metadeEstufada(TEAR, 1, 1), mF), tiraV = new THREE.Mesh(metadeEstufada(TEAR, 1, -1), mV);
  corpo.add(corpoF, corpoV); tira.add(tiraF, tiraV); pacote.add(corpo, tira); raiz.add(pacote);

  /* carta: frente holográfica, verso, borda com espessura */
  const cartaTex = texCarta({ nome, raridade, numero, total, cores });
  Promise.resolve(img).then(u => { if (!u) return; const im = new Image(); im.onload = () => cartaTex.desenha(im); im.src = u; });
  const forma = retanguloArredondado(CW, CH, .055);
  const holo = materialHolo(cartaTex.t);
  const frente = new THREE.Mesh(uvNormaliza(new THREE.ShapeGeometry(forma, 8), CW, CH), holo); frente.position.z = CT / 2 + .0005;
  const verso = new THREE.Mesh(uvNormaliza(new THREE.ShapeGeometry(forma, 8), CW, CH), new THREE.MeshPhysicalMaterial({ map: texVerso(cores), metalness: .2, roughness: .35, clearcoat: .8 }));
  verso.rotation.y = Math.PI; verso.position.z = -CT / 2 - .0005;
  const borda = new THREE.Mesh(new THREE.ExtrudeGeometry(forma, { depth: CT, bevelEnabled: false, curveSegments: 8 }), new THREE.MeshStandardMaterial({ color: "#f3efe7", roughness: .6 }));
  borda.position.z = -CT / 2;
  const carta = new THREE.Group(); carta.add(frente, verso, borda);
  /* a carta só existe depois do rasgo: antes ela atravessaria a embalagem quando o pacote balança */
  carta.scale.set(.94, .94, .25); carta.position.set(0, .05, 0); carta.rotation.y = Math.PI; carta.visible = false; raiz.add(carta);

  /* aura atrás da carta (aparece na revelação; mais forte em raro e lendário) */
  const forteRar = rar === "lendario" ? 1 : rar === "raro" ? .75 : rar === "incomum" ? .5 : .35;
  const auraTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"); const r = g.createRadialGradient(128, 128, 0, 128, 128, 128); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.25, "rgba(255,255,255,.55)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); return t; })();
  const aura = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: auraTex, color: cores[1], transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  aura.position.z = -.25; raiz.add(aura);
  const NB = rar === "lendario" ? 60 : rar === "raro" ? 36 : 0, brilhos = [];
  const geoB = new THREE.BufferGeometry(), posB = new Float32Array(Math.max(1, NB) * 3);
  geoB.setAttribute("position", new THREE.BufferAttribute(posB, 3));
  const matB = new THREE.PointsMaterial({ color: rar === "lendario" ? "#ffe6a3" : "#d6e6ff", size: .035, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const pontos = new THREE.Points(geoB, matB); pontos.frustumCulled = false; raiz.add(pontos);
  for (let i = 0; i < NB; i++) brilhos.push({ a: Math.random() * 6.28, r: .75 + Math.random() * .45, y: (Math.random() - .5) * 1.5, v: .25 + Math.random() * .45, f: Math.random() * 6.28 });

  /* sombra de contato */
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(1.8, .5), new THREE.MeshBasicMaterial({ map: texSombra(), transparent: true, depthWrite: false }));
  sombra.position.set(0, -PH / 2 - .14, -.2); sombra.rotation.x = -Math.PI / 2.4; raiz.add(sombra);

  /* confete */
  const N = 190, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(.06, .034), new THREE.MeshStandardMaterial({ metalness: .45, roughness: .35, side: THREE.DoubleSide }), N);
  const coresConf = [...cores, "#ffffff", "#9fe0b0", "#f2c46e", "#8fd6ff"].map(c => new THREE.Color(c));
  const ps = []; const o3 = new THREE.Object3D();
  for (let i = 0; i < N; i++) { conf.setColorAt(i, coresConf[i % coresConf.length]); ps.push({ vivo: false }); o3.scale.setScalar(0); o3.updateMatrix(); conf.setMatrixAt(i, o3.matrix); }
  conf.frustumCulled = false; raiz.add(conf);

  /* enquadramento: o palco do HTML define onde e de que tamanho o pacote aparece */
  function enquadra() {
    const W = innerWidth, H = innerHeight; renderer.setSize(W, H, false); camera.aspect = W / H;
    const r = palco.getBoundingClientRect(), alvo = 1.95, tg = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const d = (alvo * H / Math.max(120, r.height)) / (2 * tg); camera.position.set(0, 0, d); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
    const visH = 2 * d * tg, visW = visH * camera.aspect;
    raiz.position.x = ((r.left + r.width / 2) / W - .5) * visW; raiz.position.y = -((r.top + r.height / 2) / H - .5) * visH;
  }
  enquadra(); addEventListener("resize", enquadra);

  /* estado */
  let p = 0, fase = "entra", t0 = performance.now(), ultimo = t0, arrasto = null;
  const incl = { x: 0, y: 0, ax: 0, ay: 0 }, tiraVel = new THREE.Vector3(), tiraRot = new THREE.Vector3();
  let tFase = 0, revelouConf = false;

  /* rasgo: a parte já rasgada da tira gira para cima e para frente em volta da linha */
  function curvaTira() {
    const xT = -PW / 2 + p * (PW + .06), yL = (TEAR - .5) * PH;
    for (const m of [tiraF, tiraV]) {
      const pos = m.geometry.attributes.position, b = m.geometry.userData.base;
      for (let i = 0; i < pos.count; i++) {
        const x = b[i * 3], y = b[i * 3 + 1], z = b[i * 3 + 2], d = xT - x;
        if (d <= 0) { pos.setXYZ(i, x, y, z); continue; }
        const a = Math.min(1.25, d * 2.6), dy = y - yL;
        pos.setXYZ(i, x - d * .05, yL + dy * Math.cos(a) - z * Math.sin(a) * .3, z * Math.cos(a) + dy * Math.sin(a) + d * .12);
      }
      pos.needsUpdate = true; m.geometry.computeVertexNormals(); m.geometry.computeBoundingSphere();
    }
  }

  /* telas → progresso do rasgo */
  const larguraTela = () => { const a = new THREE.Vector3(-PW / 2, 0, 0).applyMatrix4(pacote.matrixWorld).project(camera), b = new THREE.Vector3(PW / 2, 0, 0).applyMatrix4(pacote.matrixWorld).project(camera); return { x0: (a.x + 1) / 2 * innerWidth, w: (b.x - a.x) / 2 * innerWidth }; };
  cv.style.touchAction = "none";
  veu.addEventListener("pointerdown", e => {
    if (fase !== "espera" || e.target.closest("button")) return;
    const L = larguraTela(); arrasto = { x0: L.x0 - p * L.w, w: L.w, x: e.clientX, t: e.timeStamp, v: 0 };
    veu.setPointerCapture(e.pointerId); veu.classList.add("arrastando"); dica.textContent = "";
  });
  veu.addEventListener("pointermove", e => {
    const W = innerWidth, H = innerHeight;
    incl.x = clamp((e.clientX / W - .5) * 2, -1, 1); incl.y = clamp((e.clientY / H - .5) * 2, -1, 1);
    if (!arrasto) return;
    const dt = Math.max(1, e.timeStamp - arrasto.t); arrasto.v = (e.clientX - arrasto.x) / dt; arrasto.x = e.clientX; arrasto.t = e.timeStamp;
    const bruto = (e.clientX - arrasto.x0) / arrasto.w; p = clamp(bruto < 0 ? bruto * .15 : bruto, 0, 1); curvaTira();
  });
  const solta = () => {
    if (!arrasto) return; const v = arrasto.v; arrasto = null; veu.classList.remove("arrastando");
    if (p > .5 || (v > .55 && p > .12)) rasga(); else { fase = "volta"; tFase = 0; }
  };
  veu.addEventListener("pointerup", solta); veu.addEventListener("pointercancel", solta);
  $("#pkAbrir").addEventListener("click", () => rasga());

  function rasga() {
    if (fase === "rasga" || fase === "voa" || fase === "revela" || fase === "pronto") return;
    fase = "rasga"; tFase = 0; dica.textContent = ""; $("#pkAbrir").disabled = true; veu.classList.add("abrindo");
  }
  function soltaTira() {
    fase = "voa"; tFase = 0; navigator.vibrate?.(12);
    pacote.rotation.set(0, 0, 0); pacote.position.set(0, 0, 0); carta.visible = true;
    tira.updateMatrixWorld(); tiraVel.set(.9, 2.6, 1.6); tiraRot.set(-2.2, .6, 2.8);
    [mF, mV].forEach(m => { m.transparent = true; });
  }
  function explodeConfete() {
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2, el = Math.random() * .9 + .3, v = 2.2 + Math.random() * 2.6;
      ps[i] = { vivo: true, x: carta.position.x, y: carta.position.y + .15, z: carta.position.z - .05, vx: Math.cos(a) * Math.cos(el) * v, vy: Math.sin(el) * v * 1.2 + .8, vz: Math.sin(a) * Math.cos(el) * v * .7 + .6,
        rx: Math.random() * 6, ry: Math.random() * 6, rz: Math.random() * 6, wr: (Math.random() - .5) * 18, vida: 2.2 + Math.random() * .8 };
    }
    flash.intensity = 6;
  }
  function pronto() {
    fase = "pronto";
    $("#pkRes").textContent = `${nome}, ${raridade}`;
    veu.classList.add("revelado");
    acts.innerHTML = `<button type="button" class="btn" id="pkVer">Ver no planeta</button><button type="button" class="btn pri" id="pkOk">Continuar</button>`;
    $("#pkVer").addEventListener("click", () => fecha(aoVer)); $("#pkOk").addEventListener("click", () => fecha());
    $("#pkOk").focus({ preventScroll: true });
  }

  function quadro(now) {
    const dt = Math.min(.05, (now - ultimo) / 1000); ultimo = now; tFase += dt;
    const tt = (now - t0) / 1000;
    incl.ax += (incl.x - incl.ax) * Math.min(1, dt * 7); incl.ay += (incl.y - incl.ay) * Math.min(1, dt * 7);
    key.position.set(1.5 + incl.ax * 1.6, 2.2 - incl.ay * 1.2, 3);

    if (fase === "entra") {
      const k = clamp(tFase / .75, 0, 1), e = easeBack(k);
      pacote.position.y = (1 - e) * 1.4; pacote.rotation.z = (1 - e) * .18; pacote.rotation.x = (1 - e) * -.4;
      if (k >= 1) { fase = "espera"; tFase = 0; }
    }
    if (fase === "espera" || fase === "volta") {
      const bob = Math.sin(tt * 1.6) * .018;
      const ciclo = (tt % 4.2) - 3.4, cutuca = fase === "espera" && !arrasto && p === 0 && ciclo > 0 ? Math.sin(ciclo * 14) * Math.exp(-ciclo * 5) * .07 : 0;
      pacote.position.y = bob; pacote.rotation.y = incl.ax * .32 + Math.sin(tt * .9) * .05; pacote.rotation.x = incl.ay * .18; pacote.rotation.z = cutuca;
    }
    if (fase === "volta") { p = Math.max(0, p - dt * 5 * Math.max(.2, p)); curvaTira(); if (p <= 0) fase = "espera"; }
    if (fase === "rasga") {
      const k = Math.min(1, dt * 14); pacote.rotation.x *= 1 - k; pacote.rotation.y *= 1 - k; pacote.rotation.z *= 1 - k; pacote.position.y *= 1 - k;
      p = Math.min(1, p + dt * 5.5); curvaTira(); if (p >= 1) soltaTira();
    }
    if (fase === "voa" || fase === "revela" || fase === "pronto") {
      if (tira.visible) {
        tira.position.x += tiraVel.x * dt; tira.position.y += tiraVel.y * dt; tira.position.z += tiraVel.z * dt; tiraVel.y -= 7 * dt;
        tira.rotation.x += tiraRot.x * dt; tira.rotation.y += tiraRot.y * dt; tira.rotation.z += tiraRot.z * dt;
        if (tira.position.y < -4) tira.visible = false;
      }
    }
    if (fase === "voa") {
      /* a carta sobe de dentro do pacote; o pacote desce e some */
      const k = clamp(tFase / .7, 0, 1), e = easeOut(k);
      carta.position.y = .05 + e * .7;
      if (tFase > .32) { const q = easeOut(clamp((tFase - .32) / .6, 0, 1)); pacote.position.y = -q * 2.6; mF.opacity = mV.opacity = 1 - q; sombra.material.opacity = 1 - q; }
      if (k >= 1) { fase = "revela"; tFase = 0; }
    }
    if (fase === "revela") {
      /* vem para frente e vira, com um passo além no fim (mola) */
      const k = clamp(tFase / .95, 0, 1), e = easeBack(k), m = easeOut(clamp(tFase / .6, 0, 1));
      carta.position.y = .75 - m * .83; carta.position.z = m * .35; carta.scale.set(.94 + m * .1, .94 + m * .1, .25 + m * .75);
      carta.rotation.y = Math.PI * (1 - e) + incl.ax * .3 * k; carta.rotation.x = incl.ay * .2 * k;
      holo.uniforms.forca.value = sm(.45, 1, k);
      if (!revelouConf && k > .55) { revelouConf = true; explodeConfete(); }
      if (k >= 1) { pronto(); }
    }
    if (fase === "pronto") {
      carta.rotation.y = incl.ax * .42 + Math.sin(tt * .8) * .03; carta.rotation.x = incl.ay * .28 + Math.sin(tt * 1.1) * .02;
      carta.position.y = -.08 + Math.sin(tt * 1.4) * .012;
    }
    holo.uniforms.t.value = tt; holo.uniforms.incl.value.set(carta.rotation.y, carta.rotation.x);
    if (fase === "revela" || fase === "pronto") {
      const alvo = (fase === "pronto" ? .35 + Math.sin(tt * 1.8) * .06 : .55) * forteRar;
      aura.material.opacity += (alvo - aura.material.opacity) * Math.min(1, dt * 4);
      aura.position.set(carta.position.x, carta.position.y, carta.position.z - .25);
      if (NB) {
        matB.opacity += (.9 - matB.opacity) * Math.min(1, dt * 3);
        for (let i = 0; i < NB; i++) { const b = brilhos[i]; b.a += b.v * dt; posB[i * 3] = carta.position.x + Math.cos(b.a) * b.r; posB[i * 3 + 1] = carta.position.y + b.y + Math.sin(tt * 1.3 + b.f) * .05; posB[i * 3 + 2] = carta.position.z + Math.sin(b.a) * b.r * .35 - .1; }
        geoB.attributes.position.needsUpdate = true; matB.size = .03 + Math.sin(tt * 4) * .006;
      }
    }
    flash.intensity *= Math.exp(-dt * 5);

    /* confete com gravidade, arrasto do ar e giro */
    let vivos = 0;
    for (let i = 0; i < N; i++) {
      const c = ps[i]; if (!c.vivo) continue;
      if ((c.vida -= dt) <= 0) { c.vivo = false; o3.scale.setScalar(0); o3.updateMatrix(); conf.setMatrixAt(i, o3.matrix); continue; }
      vivos++;
      c.vx *= 1 - dt * 1.4; c.vz *= 1 - dt * 1.4; c.vy = c.vy * (1 - dt * 1.1) - 4.2 * dt;
      c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt; c.rx += c.wr * dt; c.ry += c.wr * .7 * dt;
      o3.position.set(c.x, c.y, c.z); o3.rotation.set(c.rx, c.ry, c.rz); o3.scale.setScalar(Math.min(1, c.vida * 1.5)); o3.updateMatrix(); conf.setMatrixAt(i, o3.matrix);
    }
    if (vivos || revelouConf) conf.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);
    /* resolução adaptativa: se os primeiros quadros pesarem, baixa a densidade de pixels */
    if (amostras < 40) { amostras++; somaDt += dt; if (amostras === 40 && somaDt / 40 > .024 && renderer.getPixelRatio() > 1.25) { renderer.setPixelRatio(1.25); enquadra(); } }
  }
  let amostras = 0, somaDt = 0;
  cv.style.opacity = "0";
  const comeca = () => { ultimo = t0 = performance.now(); cv.style.opacity = ""; renderer.setAnimationLoop(quadro); };
  (renderer.compileAsync ? renderer.compileAsync(scene, camera).catch(() => {}) : Promise.resolve()).then(comeca);

  function fecha(depois) {
    veu.removeEventListener("keydown", tecla);
    veu.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-out", fill: "forwards" }).finished.then(() => {
      renderer.setAnimationLoop(null); removeEventListener("resize", enquadra);
      scene.traverse(o => { o.geometry?.dispose?.(); const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach(m => { Object.values(m).forEach(v => v?.isTexture && v.dispose()); m.dispose(); }); });
      env.dispose(); pmrem.dispose(); renderer.dispose(); renderer.forceContextLoss?.();
      veu.remove(); if (anterior?.isConnected) anterior.focus?.({ preventScroll: true });
      aoFechar?.(); depois?.();
    });
  }
  const tecla = e => {
    if (e.key === "Escape") { e.preventDefault(); fase === "pronto" ? fecha() : rasga(); }
    if (e.key === "Tab") { const bs = [...veu.querySelectorAll("button:not(:disabled)")]; if (!bs.length) return; const i = bs.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); bs.at(-1).focus(); } else if (!e.shiftKey && i === bs.length - 1) { e.preventDefault(); bs[0].focus(); } }
  };
  veu.addEventListener("keydown", tecla);
  return true;
}
