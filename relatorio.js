const numero = x => Number.isFinite(x) && x > 0 ? x : 0;
const chaveDia = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Somente leitura: usa os registros diários existentes do estado v2.
export function semanaDeEstudos(registros = {}, agora = new Date()) {
  const dias = Array.from({ length: 7 }, (_, i) => {
    const data = new Date(agora); data.setHours(12, 0, 0, 0); data.setDate(data.getDate() - 6 + i);
    const chave = chaveDia(data), d = registros?.[chave] || {};
    return { chave, dia: data.getDate(), hoje: i === 6,
      rotulo: data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }),
      min: numero(d.min), cards: numero(d.cards), ok: numero(d.ok), err: numero(d.err), lidas: numero(d.lidas) };
  });
  const soma = campo => dias.reduce((n, d) => n + d[campo], 0);
  const min = soma("min"), cards = soma("cards"), ok = soma("ok"), err = soma("err");
  return { dias, min, cards, taxa: ok + err ? Math.round(ok / (ok + err) * 100) : null,
    ativos: dias.filter(d => d.min || d.cards || d.lidas).length };
}
