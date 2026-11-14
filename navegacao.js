export function tipoLeitura(secao) {
  if (!secao) return null;
  if (secao.id === "gsiglas") return "siglas";
  if (/^Resumo/.test(secao.grupo || "")) return "resumo";
  if (/^(Guia|Kahoot destrinchado)/.test(secao.grupo || "")) return "prioritario";
  return null;
}

// Usa os pares e referências existentes, incluindo guias que abrangem vários assuntos.
export function destinosLeitura(secoes, sid, memoria = {}, referencia = null) {
  const atual = secoes.find(s => s.id === sid), tipo = tipoLeitura(atual);
  const referenciaPara = (a, b) => (a.html || "").includes(`data-sec="${b.id}"`);
  const relacionadas = (a, b) => a.par === b.id || b.par === a.id || referenciaPara(a, b) || referenciaPara(b, a);
  return Object.fromEntries(["prioritario", "resumo", "siglas"].map(destino => {
    const opcoes = secoes.filter(s => tipoLeitura(s) === destino);
    const anterior = opcoes.find(s => s.id === memoria[destino]);
    let alvo;
    if (destino === tipo) alvo = atual;
    else if (tipo === "siglas") alvo = anterior;
    else if (atual) {
      alvo = destino === "resumo" && opcoes.find(s => s.id === referencia);
      alvo ||= anterior && relacionadas(atual, anterior) ? anterior : null;
      alvo ||= opcoes.find(s => s.id === atual.par);
      alvo ||= opcoes.find(s => relacionadas(atual, s));
    }
    return [destino, (alvo || anterior || opcoes[0])?.id || null];
  }));
}
