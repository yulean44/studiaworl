import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const bancos = [['mfc',33],['antibioticos',24],['psiquiatria',25],['cirurgia',28],['saude-mulher',46]];
test('DPI da professora permanece integralmente preservado',async()=>{
 const bytes=await readFile(new URL('../content/imagem.json',import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'2b2566be99fc3d0b73a959655fad07df07a63c337b35c0ccdb52cfc7608f3c9b');
});
test('os cinco Kahoots mantêm numeração e gabaritos válidos para o jogador',async()=>{
 for(const [mat,total] of bancos){
  const d=JSON.parse(await readFile(new URL(`../content/${mat}.json`,import.meta.url),'utf8'));
  assert.equal(d.kahoot.length,total);assert.deepEqual(d.kahoot.map(q=>q.n),Array.from({length:total},(_,i)=>i+1));
  const ids=new Set(d.secoes.map(s=>s.id));
  for(const q of d.kahoot){assert.equal(q.tipo,'q');assert.equal(q.opcoes.length,4);assert.equal(new Set(q.opcoes).size,4);assert.ok(Number.isInteger(q.certa)&&q.certa>=0&&q.certa<4);assert.ok(q.explica&&q.pergunta);assert.ok(q.tempo>0);assert.ok(q.secoes.every(s=>ids.has(s)),`${mat}/${q.n}`);}
 }
});
test('a prática pelos guias prioritários encontra questões em todos os seus blocos principais',async()=>{
 for(const [mat] of bancos){
  const d=JSON.parse(await readFile(new URL(`../content/${mat}.json`,import.meta.url),'utf8'));
  const guias=mat==='mfc'?['g1','g2']:['g1','g2','g3','g4','g5','g6'];
  for(const guia of guias)assert.ok(d.kahoot.some(q=>q.secoes.includes(guia)),`${mat}/${guia}`);
 }
});
