import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const app=await readFile(new URL('../app.js',import.meta.url),'utf8');
const trecho=(a,b)=>app.slice(app.indexOf(a),app.indexOf(b,app.indexOf(a)));
function rotas(hash){
 const c=vm.createContext({location:{hash},VIEWS:[],atual:'questoes',matQuestoes:'mfc',sub:{tela:'sec',mat:'imagem',sid:'r1'}});
 vm.runInContext(app.match(/const VIEWS = (.*);/)[0].replace('const VIEWS','VIEWS')+trecho('function hashDe()', 'function sincronizaHash()')+trecho('function lerHash()', 'window.addEventListener("popstate"'),c);return c;
}
test('Questões tem rota própria e mantém a matéria ao copiar ou voltar pelo endereço',()=>{
 const c=rotas('#questoes/imagem');assert.equal(c.lerHash(),'questoes');assert.equal(c.matQuestoes,'imagem');assert.equal(c.hashDe(),'#questoes/imagem');
 assert.equal(c.sub.sid,'r1','a aba não altera a seção de leitura');
 c.location.hash='#questoes';assert.equal(c.lerHash(),'questoes');assert.equal(c.matQuestoes,null);
});
