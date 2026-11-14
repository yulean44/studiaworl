// Valida o banco de questões (campo "questoes" de content/*.json).
// Regra principal: toda questão sai do material do site — aponta uma seção existente
// e o trecho citado em fonte.trecho está, palavra por palavra, no texto dessa seção.
// Rodar: node --test tests/questoes.mjs   (relatório: node tests/questoes.mjs)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const TIPOS = ["recordacao", "compreensao", "aplicacao", "caso"];
const NIVEIS = ["facil", "medio", "dificil"];
const PROIBIDAS = /todas as (alternativas )?anteriores|nenhuma das (alternativas )?anteriores|todas est[aã]o corretas/i;
const texto = html => String(html || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim().toLowerCase();
const norm = t => texto(t).replace(/[“”"]/g, "").replace(/\s*([.,;:])\s*/g, "$1 ").trim();

export function valida(mat) {
  const erros = [], avisos = [], qs = mat.questoes || [];
  const secs = Object.fromEntries((mat.secoes || []).map(s => [s.id, s]));
  const kahoot = new Set((mat.kahoot || []).filter(k => k.pergunta).map(k => texto(k.pergunta)));
  const ids = new Set();
  qs.forEach((q, n) => {
    const e = msg => erros.push(`${mat.id} · ${q.id || "#" + (n + 1)}: ${msg}`);
    if (!q.id) e("sem id"); else if (ids.has(q.id)) e("id repetido"); else ids.add(q.id);
    if (!secs[q.secao]) e(`secao "${q.secao}" não existe`);
    if (!TIPOS.includes(q.tipo)) e(`tipo inválido "${q.tipo}"`);
    if (!NIVEIS.includes(q.nivel)) e(`nivel inválido "${q.nivel}"`);
    if (!texto(q.enunciado)) e("enunciado vazio");
    const alts = q.alternativas || [];
    if (alts.length < 4 || alts.length > 5) e(`precisa de 4 ou 5 alternativas (tem ${alts.length})`);
    if (alts.filter(a => a.certa === true).length !== 1) e("precisa de exatamente 1 alternativa certa");
    alts.forEach((a, i) => { if (!texto(a.t)) e(`alternativa ${"ABCDE"[i]} sem texto`); if (!texto(a.porque)) e(`alternativa ${"ABCDE"[i]} sem "porque"`); if (PROIBIDAS.test(texto(a.t))) e(`alternativa ${"ABCDE"[i]} usa "todas/nenhuma das anteriores"`); });
    const ts = alts.map(a => texto(a.t)); if (new Set(ts).size !== ts.length) e("alternativas repetidas");
    if (!texto(q.explica)) e("sem explica");
    const f = q.fonte || {};
    if (!secs[f.secao]) e(`fonte.secao "${f.secao}" não existe`);
    else if (!texto(f.trecho)) e("fonte.trecho vazio");
    else if (!norm(secs[f.secao].html).includes(norm(f.trecho))) e(`fonte.trecho não está no texto da seção ${f.secao}: "${String(f.trecho).slice(0, 70)}"`);
    if (q.fora !== undefined && texto(q.fora).length < 15) e('"fora" precisa dizer o dado e a fonte');
    if (q.img && !existsSync(join(RAIZ, q.img))) e(`imagem não encontrada: ${q.img}`);
    if (kahoot.has(texto(q.enunciado))) e("copia uma pergunta do Kahoot");
    if (/\b(INCORRETA|EXCETO|FALSA)\b/i.test(q.enunciado || "") && !/<strong>\s*(INCORRETA|EXCETO|FALSA)\s*<\/strong>/.test(q.enunciado)) e("enunciado negativo sem <strong>");
  });
  if (qs.length) {
    const pos = [0, 0, 0, 0, 0]; qs.forEach(q => { const i = (q.alternativas || []).findIndex(a => a.certa); if (i >= 0) pos[i]++; });
    const maxA = Math.max(...(qs.some(q => (q.alternativas || []).length === 5) ? pos : pos.slice(0, 4)));
    if (qs.length >= 12 && maxA / qs.length > 0.4) avisos.push(`${mat.id}: gabarito concentrado (A–E: ${pos.join("/")})`);
    const por = k => Object.fromEntries((k === "tipo" ? TIPOS : NIVEIS).map(v => [v, qs.filter(q => q[k] === v).length]));
    avisos.push(`${mat.id}: ${qs.length} questões · tipos ${JSON.stringify(por("tipo"))} · níveis ${JSON.stringify(por("nivel"))} · gabarito ${pos.join("/")}`);
  }
  return { erros, avisos };
}

const materias = () => readdirSync(join(RAIZ, "content")).filter(f => f.endsWith(".json")).map(f => JSON.parse(readFileSync(join(RAIZ, "content", f), "utf8")));

test("banco de questões: estrutura e fidelidade ao material", () => {
  const erros = materias().flatMap(m => valida(m).erros);
  assert.deepEqual(erros, [], "\n" + erros.join("\n"));
});

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1] && !process.argv.includes("--test")) {
  for (const m of materias()) { const r = valida(m); r.avisos.forEach(a => console.log(a)); r.erros.forEach(e => console.log("ERRO", e)); }
}
