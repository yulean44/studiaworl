import { test } from 'node:test';
import assert from 'node:assert/strict';
import { semanaDeEstudos } from '../relatorio.js';
test('a semana usa sete datas locais, inclusive na virada do mês e do ano',()=>{
 const r=semanaDeEstudos({},new Date(2026,0,3,0,10));
 assert.deepEqual(r.dias.map(d=>d.chave),['2025-12-28','2025-12-29','2025-12-30','2025-12-31','2026-01-01','2026-01-02','2026-01-03']);
 assert.equal(r.dias.filter(d=>d.hoje).length,1);assert.equal(r.dias.at(-1).dia,3);
});
test('totais e taxa usam apenas os últimos sete dias; a taxa é ponderada pelo número de respostas',()=>{
 const d={'2025-12-26':{min:999,cards:999,ok:999},'2025-12-28':{min:30,cards:10,ok:9,err:1},'2026-01-02':{min:45,cards:2,ok:1,err:1},'2026-01-03':{lidas:2}};
 const antes=JSON.stringify(d),r=semanaDeEstudos(d,new Date(2026,0,3));
 assert.equal(r.min,75);assert.equal(r.cards,12);assert.equal(r.taxa,83);assert.equal(r.ativos,3);assert.equal(JSON.stringify(d),antes);
});
test('conta nova ou registro antigo incompleto não inventa atividade ou percentual de acerto',()=>{
 const r=semanaDeEstudos({'2026-01-03':{min:12,cards:0}},new Date(2026,0,3));
 assert.equal(r.min,12);assert.equal(r.taxa,null);assert.equal(r.cards,0);
 const vazio=semanaDeEstudos(null,new Date(2026,0,3));assert.equal(vazio.ativos,0);assert.equal(vazio.taxa,null);
});
test('valores inválidos não quebram o gráfico nem alteram registros originais',()=>{
 const d={'2026-01-03':{min:-5,cards:NaN,ok:Infinity,err:0,lidas:1}},r=semanaDeEstudos(d,new Date(2026,0,3));
 assert.equal(r.min,0);assert.equal(r.cards,0);assert.equal(r.taxa,null);assert.equal(r.ativos,1);assert.equal(d['2026-01-03'].min,-5);
});
