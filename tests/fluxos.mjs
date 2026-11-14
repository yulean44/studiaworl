import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const app=await readFile(new URL('../app.js',import.meta.url),'utf8');
const trecho=(a,b)=>app.slice(app.indexOf(a),app.indexOf(b,app.indexOf(a)));
test('Enter e Espaço respeitam botões e links; o atalho ainda vira o cartão',()=>{
  const ouvintes=[];let viradas=0;
  const c=vm.createContext({atual:'revisao',modalAberto:false,document:{activeElement:{},addEventListener:(tipo,fn)=>ouvintes.push(fn)},vira:()=>viradas++,responde:()=>{}});
  vm.runInContext(trecho('document.addEventListener("keydown", e => {\n  if (atual !== "revisao"','/* ========================================================='),c);
  for (const tagName of ['BUTTON','A','INPUT','SELECT','TEXTAREA']) for (const key of ['Enter',' ']) {
    let cancelou=false;const alvo={tagName,isContentEditable:false,closest:()=>tagName==='A'||tagName==='BUTTON'?{}:null};
    c.document.activeElement=alvo;ouvintes[0]({key,target:alvo,preventDefault:()=>cancelou=true});
    assert.equal(cancelou,false,tagName);assert.equal(viradas,0);
  }
  c.document.activeElement={tagName:'DIV',isContentEditable:false,closest:()=>null};
  ouvintes[0]({key:' ',target:c.document.activeElement,preventDefault(){}});assert.equal(viradas,1);
});
test('falha parcial é registrada e tentar novamente mantém matérias já carregadas',async()=>{
  const ids=['mfc','imagem'];let falha=true;
  const fetcher=async url=>({ok:!url.includes('mfc')||!falha,json:async()=>({id:url.includes('mfc')?'mfc':'imagem',secoes:[],cards:[]})});
  const c=vm.createContext({CONTEUDOS:ids,FABRICA:[],conteudosFalhos:[],fetch:fetcher,console:{warn(){}},carregaMaterias:async lista=>{
    const materias=[],falhas=[];for(const id of lista){const r=await fetcher(id);r.ok?materias.push(await r.json()):falhas.push(id);}return {materias,falhas};
  }});
  vm.runInContext(trecho('async function carregaFabrica(', 'async function conectaNuvem('),c);
  await c.carregaFabrica();assert.deepEqual(Array.from(c.conteudosFalhos),['mfc']);assert.equal(c.FABRICA.length,1);
  falha=false;await c.carregaFabrica(['mfc']);assert.equal(c.FABRICA.length,2);assert.equal(c.conteudosFalhos.length,0);
  falha=true;await c.carregaFabrica(['mfc']);assert.equal(c.FABRICA.length,2,'falha na nova tentativa não remove conteúdo em memória');
});
test('uma confirmação antiga de entrega não corrige a rodada de outra conta',async()=>{
  let confirmar;let corrigiu=0;
  const antiga={sessao:1,lista:['a'],resp:{}};
  const c=vm.createContext({sessaoConta:1,estadoPronto:true,qSessao:antiga,qTimer:4,Date,clearInterval(){},confirma:()=>new Promise(r=>confirmar=r),qCorrige:()=>corrigiu++,qResultado:()=>corrigiu++});
  vm.runInContext(trecho('function qAtiva(', 'function qRegistra(')+trecho('async function qEntrega(', 'function qCorrige('),c);
  const entrega=c.qEntrega({},{});
  c.sessaoConta=2;c.qSessao={sessao:2,lista:['b'],resp:{b:0}};
  confirmar(true);await entrega;
  assert.equal(corrigiu,0);assert.equal(c.qSessao.fim,undefined);assert.equal(antiga.fim,undefined);
});
test('uma rodada ativa pode ser entregue normalmente',async()=>{
  let corrigiu=0;
  const c=vm.createContext({sessaoConta:3,estadoPronto:true,qSessao:{sessao:3,lista:['a'],resp:{a:0}},qTimer:1,Date,clearInterval(){},qCorrige:()=>corrigiu++,qResultado(){}});
  vm.runInContext(trecho('function qAtiva(', 'function qRegistra(')+trecho('async function qEntrega(', 'function qCorrige('),c);
  await c.qEntrega({},{});assert.equal(corrigiu,1);assert.ok(c.qSessao.fim);
});

test('mensagens de Kahoot só pontuam a janela e sessão atuais',()=>{
  let recebe;let xp=0;
  const janela={}, f={contentWindow:janela,dataset:{sessao:'2'},style:{}};
  const c=vm.createContext({location:{origin:'https://estudo.test'},sessaoConta:2,estadoPronto:true,$:()=>f,addEventListener:(_t,fn)=>recebe=fn,S:{kahootDia:{}},hoje:()=> '2026-11-14',ganhaXP:n=>xp+=n,diaObj:()=>({}),toast(){},checaTudo(){},salvar(){},renderTopo(){}});
  vm.runInContext(trecho('addEventListener("message", e => {','/* ---------- casos clínicos'),c);
  const msg={origin:'https://estudo.test',source:janela,data:{tipo:'kahoot-fim',mat:'mfc',acertos:3}};
  recebe({...msg,source:{}});assert.equal(xp,0);
  f.dataset.sessao='1';recebe(msg);assert.equal(xp,0);
  f.dataset.sessao='2';c.estadoPronto=false;recebe(msg);assert.equal(xp,0);
  c.estadoPronto=true;recebe(msg);assert.equal(xp,10);recebe(msg);assert.equal(xp,10);
});
