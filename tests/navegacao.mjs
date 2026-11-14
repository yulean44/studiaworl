import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { tipoLeitura, destinosLeitura } from '../navegacao.js';
const materias = await Promise.all(['mfc','imagem','antibioticos','saude-mulher','psiquiatria','cirurgia'].map(async id => JSON.parse(await readFile(new URL(`../content/${id}.json`, import.meta.url), 'utf8'))));
test('siglas não herdam o tipo prioritário do seu grupo', () => {
  for (const m of materias) assert.equal(tipoLeitura(m.secoes.find(s => s.id === 'gsiglas')), 'siglas');
});
test('as seis matérias oferecem os três destinos, mesmo por link direto às siglas', () => {
  for (const m of materias) for (const s of m.secoes) {
    const rotas = destinosLeitura(m.secoes, s.id);
    for (const [tipo, id] of Object.entries(rotas)) assert.equal(tipoLeitura(m.secoes.find(x => x.id === id)), tipo, `${m.id}/${s.id}/${tipo}`);
  }
});
test('prioritário e resumo mantêm o assunto pareado', () => {
  for (const m of materias) for (const s of m.secoes) {
    const par = m.secoes.find(x => x.id === s.par);
    if (par && tipoLeitura(par) !== tipoLeitura(s)) assert.equal(destinosLeitura(m.secoes, s.id)[tipoLeitura(par)], par.id, `${m.id}/${s.id}`);
  }
});
test('voltar do resumo preserva o bloco de imagem escolhido quando vários levam ao mesmo capítulo', () => {
  const m = materias.find(m => m.id === 'imagem');
  assert.equal(destinosLeitura(m.secoes, 'r4', {prioritario:'k5'}).prioritario, 'k5');
});
test('voltar das siglas recupera os últimos assuntos da matéria', () => {
  const m = materias.find(m => m.id === 'cirurgia');
  assert.deepEqual(destinosLeitura(m.secoes, 'gsiglas', {prioritario:'g6',resumo:'r6'}), {prioritario:'g6',resumo:'r6',siglas:'gsiglas'});
});
test('MFC usa a referência do trecho visível e o vínculo de retorno', () => {
  const m = materias.find(m => m.id === 'mfc');
  assert.equal(destinosLeitura(m.secoes, 'g2', {}, 'r5').resumo, 'r5');
  assert.equal(destinosLeitura(m.secoes, 'r5', {prioritario:'g2'}).prioritario, 'g2');
});
test('memória obsoleta não abre seção excluída nem altera a lista de conteúdo', () => {
  const m = materias.find(m => m.id === 'cirurgia'), antes = JSON.stringify(m.secoes);
  assert.equal(destinosLeitura(m.secoes,'gsiglas',{prioritario:'apagada'}).prioritario,'g0');
  assert.equal(JSON.stringify(m.secoes),antes);
});
