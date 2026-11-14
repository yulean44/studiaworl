/* Falhas parciais não removem matérias já carregadas nem alteram progresso. */
export async function carregaMaterias(ids, buscar = fetch) {
  const resultados = await Promise.all(ids.map(async id => {
    const controle = new AbortController(), limite = setTimeout(() => controle.abort(), 15000);
    try {
      const resposta = await buscar(`content/${id}.json?v=44`, { signal: controle.signal });
      if (!resposta.ok) throw new Error("Conteúdo indisponível");
      const m = await resposta.json();
      if (m?.id !== id || !Array.isArray(m.secoes) || !Array.isArray(m.cards)) throw new Error("Conteúdo inválido");
      return { materia: m };
    } catch { return { falha: id }; }
    finally { clearTimeout(limite); }
  }));
  return { materias: resultados.filter(r => r.materia).map(r => r.materia), falhas: resultados.filter(r => r.falha).map(r => r.falha) };
}
