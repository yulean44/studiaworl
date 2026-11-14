import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {carregaMaterias} from '../conteudo.js';
test('o carregamento separa HTTP, rede e JSON inválido de matérias válidas',async()=>{
 const r=await carregaMaterias(['mfc','imagem','cirurgia','psiquiatria'],async url=>{
  if(url.includes('imagem'))return {ok:false};
  if(url.includes('cirurgia'))throw Error('offline');
  if(url.includes('psiquiatria'))return {ok:true,json:async()=>({id:'outra'})};
  return {ok:true,json:async()=>({id:'mfc',secoes:[],cards:[]})};
 });
 assert.deepEqual(r.materias.map(m=>m.id),['mfc']);assert.deepEqual(r.falhas,['imagem','cirurgia','psiquiatria']);
});
test('uma conexão travada expira e a matéria pode ser carregada na nova tentativa',async()=>{
 const fonte=await readFile(new URL('../conteudo.js',import.meta.url),'utf8');let expira;
 const c=vm.createContext({AbortController,setTimeout:fn=>{expira=fn;return 1},clearTimeout(){}});
 vm.runInContext(fonte.replace('export async','async'),c);
 const pendente=c.carregaMaterias(['mfc'],(_url,{signal})=>new Promise((_r,reject)=>signal.addEventListener('abort',()=>reject(Error('timeout')))));
 expira();const r=await pendente;assert.deepEqual(Array.from(r.falhas),['mfc']);
 const recuperado=await carregaMaterias(['mfc'],async()=>({ok:true,json:async()=>({id:'mfc',secoes:[],cards:[]})}));
 assert.equal(recuperado.materias.length,1);assert.equal(recuperado.falhas.length,0);
});
