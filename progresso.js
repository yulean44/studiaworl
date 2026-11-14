/* Compatível com o estado v2 e com as chaves pe: já existentes. */
export function assinatura(valor) {
  const normaliza = v => Array.isArray(v) ? v.map(normaliza) : v && typeof v === "object"
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, normaliza(v[k])])) : v;
  return JSON.stringify(normaliza(valor));
}

export function copiaSegura(storage, chave, estado) {
  if (!estado) return;
  const destino = "pe:copias:" + chave, texto = assinatura(estado);
  const copias = JSON.parse(storage.getItem(destino) || "[]");
  if (copias.some(c => assinatura(c.estado) === texto)) return;
  // Se não houver espaço, a substituição deve ser interrompida, nunca silenciosa.
  copias.push({ quando: Date.now(), estado });
  storage.setItem(destino, JSON.stringify(copias));
}

export function minutosDaSessao(timer, agora = Date.now()) {
  if (!timer) return 0;
  const ms = Math.max(0, timer.acc + (timer.pausa ? 0 : agora - timer.ini));
  return Math.floor((timer.dur > 0 ? Math.min(ms, timer.dur * 60000) : ms) / 60000);
}
