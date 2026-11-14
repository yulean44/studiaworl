import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { assinatura, copiaSegura, minutosDaSessao } from '../progresso.js';
const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const contas = await readFile(new URL('../conta.js', import.meta.url), 'utf8');
const trecho = (inicio, fim) => app.slice(app.indexOf(inicio), app.indexOf(fim, app.indexOf(inicio)));
const clone = x => JSON.parse(JSON.stringify(x));
function armazenamento(inicial = {}) {
  const itens = new Map(Object.entries(inicial).map(([k,v]) => ['pe:' + k, JSON.stringify(v)]));
  return { getItem: k => itens.get(k) ?? null, setItem: (k,v) => itens.set(k,v), itens };
}
function contexto(inicial = {}, modulo = {}) {
  const storage = armazenamento(inicial), agendados = new Map(); let n = 0;
  const c = vm.createContext({
    console:{warn(){}}, Date, JSON, Object, assinatura, copiaSegura,
    localStorage: storage, LS: {get:(k,d)=>JSON.parse(storage.getItem('pe:'+k) || 'null') ?? d,set:(k,v)=>{storage.setItem('pe:'+k,JSON.stringify(v)); return true;}},
    S:{xp:0,upd:0,timer:null}, conta:null, contaOk:false, contaMod:modulo,
    sessaoConta:0, estadoPronto:true, appPronto:true, nuvem:'local',
    tConta:null, tSalvar:null, gravandoConta:false, gravaPendente:null, precisaSincronizar:false,
    db:null, uid:null, filaFesta:[], qSessao:null, qTimer:null, rodada:null, casoAberto:null, clearInterval:id=>agendados.delete(id), novoEstado:()=>({xp:0,upd:0,timer:null}),
    modoTeste:()=>false, chaveEstado:()=>c.conta?'estado:'+c.conta.uid:'estado',
    setTimeout:(fn)=>{agendados.set(++n,fn);return n;},clearTimeout:id=>agendados.delete(id),
    renderTopo(){},render(){},toast(){},aplicaMundo(){},diarias(){},checaTudo(){},festa(){},telaLogin(){},liberaApp(){},bloqueiaApp(){},
  });
  vm.runInContext(trecho('function salvar()', 'async function enviaNuvem()') + trecho('async function aoMudarConta(u)', '/* acessibilidade:'),c);
  return {c,storage,agendados};
}

test('timer limita sessões programadas e preserva o modo livre e pausas',()=>{
  const t={dur:25,ini:0,acc:0,pausa:false};
  assert.equal(minutosDaSessao(t,120*60000),25);
  assert.equal(minutosDaSessao({...t,dur:0},120*60000),120);
  assert.equal(minutosDaSessao({...t,pausa:true,acc:3*60000},120*60000),3);
  assert.equal(minutosDaSessao({...t,ini:60000},0),0);
});
test('falha na nuvem preserva o cache v2 da conta e não usa estado anônimo',async()=>{
  const anterior={v:2,xp:500,notas:{secao:'anotação'},criaturas:['gato'],upd:100};
  const {c,storage}=contexto({'estado:A':anterior}, {carrega:async()=>{throw Error('offline');}});
  await c.aoMudarConta({uid:'A'}); c.salvar();
  assert.equal(c.S.xp,500); assert.equal(c.contaOk,false);
  assert.equal(JSON.parse(storage.getItem('pe:estado:A')).notas.secao,'anotação');
  assert.deepEqual(clone(c.S.criaturas),['gato']);
});
test('sem cache e sem nuvem, bloqueia o estado e não cria um progresso vazio da conta',async()=>{
  const {c,storage}=contexto({}, {carrega:async()=>{throw Error('offline');}});
  c.S={xp:900,upd:500}; await c.aoMudarConta({uid:'A'}); c.salvar();
  assert.equal(c.estadoPronto,false); assert.equal(storage.getItem('pe:estado:A'),null);
});
test('resposta atrasada de uma conta não substitui o progresso da próxima',async()=>{
  let resolveA;
  const {c}=contexto({}, {carrega:id=>id==='A'?new Promise(r=>resolveA=r):Promise.resolve({xp:800,upd:10})});
  const primeira=c.aoMudarConta({uid:'A'}); await c.aoMudarConta({uid:'B'});
  resolveA({xp:100,upd:1}); await primeira;
  assert.equal(c.conta.uid,'B'); assert.equal(c.S.xp,800);
});
test('conta existente não herda timer nem progresso da sessão anônima',async()=>{
  const {c}=contexto({estado:{xp:900,timer:{ini:1,dur:25}}},{carrega:async()=>({xp:400,upd:1,timer:null})});
  c.S={xp:900,timer:{ini:1,dur:25}};
  await c.aoMudarConta({uid:'A'});
  assert.equal(c.S.xp,400); assert.equal(c.S.timer,null);
});
test('versões divergentes ficam preservadas e não são enviadas automaticamente',async()=>{
  const {c,storage}=contexto({'estado:A':{xp:100,upd:1}}, {carrega:async()=>({xp:200,upd:2})});
  await c.aoMudarConta({uid:'A'});
  assert.equal(c.nuvem,'conflito'); assert.equal(c.contaOk,false);
  const copias=JSON.parse(storage.getItem('pe:copias:estado:A'));
  assert.deepEqual(copias.map(x=>x.estado.xp),[100,200]);
  assert.equal(c.S.xp,100); assert.equal(c.gravaPendente,null);
});
test('envio agendado captura UID e estado; logout cancela envios pendentes',async()=>{
  const enviados=[]; const {c}=contexto({}, {carrega:async()=>null,salva:async(id,s)=>enviados.push([id,s])});
  c.conta={uid:'A'};c.contaOk=true;c.S={xp:10,upd:0};c.salvar();
  c.S.xp=99; await c.gravaConta();
  assert.equal(enviados[0][0],'A');assert.equal(enviados[0][1].xp,10);
  c.salvar();await c.aoMudarConta(null); await c.gravaConta();assert.equal(enviados.length,1);
});
test('trocar de identidade encerra exercícios e timers sem alterar o histórico salvo',async()=>{
  for (const destino of [{uid:'B'},null]) {
    const anterior={xp:300,upd:1,questoes:{'imagem--q-1':{ok:true}},notas:{a:'preservada'}};
    const remoto={xp:800,upd:2,questoes:{}};
    const {c,storage,agendados}=contexto({'estado:A':anterior},{carrega:async()=>remoto});
    c.conta={uid:'A'};c.qSessao={mat:'imagem',resp:{'q-2':0}};
    c.rodada={cards:[{id:'privado-A',meu:true}],i:0,virado:true};c.casoAberto={i:1};
    agendados.set(99,()=>{});c.qTimer=99;
    await c.aoMudarConta(destino);
    assert.equal(c.qSessao,null);assert.equal(c.rodada,null);assert.equal(c.casoAberto,null);
    assert.equal(agendados.has(99),false);
    assert.deepEqual(JSON.parse(storage.getItem('pe:estado:A')),anterior);
    assert.deepEqual(clone(c.S.questoes || {}),{});
  }
});
test('entrar em conta existente encerra a rodada anônima',async()=>{
  const {c}=contexto({estado:{xp:100}},{carrega:async()=>({xp:700,upd:2})});
  c.qSessao={mat:'imagem',resp:{a:1}};c.rodada={cards:[{id:'anonimo'}]};
  await c.aoMudarConta({uid:'B'});
  assert.equal(c.qSessao,null);assert.equal(c.rodada,null);assert.equal(c.S.xp,700);
});
test('modo teste não substitui o estado real',()=>{
  const {c,storage}=contexto({'estado:A':{xp:500}});
  c.conta={uid:'A'};c.modoTeste=()=>true;c.S={xp:9999};c.salvar();
  assert.equal(JSON.parse(storage.getItem('pe:estado:A')).xp,500);
  assert.equal(JSON.parse(storage.getItem('pe:estadoTeste:A')).xp,9999);
});
test('cópia não descarta versões anteriores e falha explicitamente sem espaço',()=>{
  const storage=armazenamento();copiaSegura(storage,'estado:A',{xp:1});copiaSegura(storage,'estado:A',{xp:2});copiaSegura(storage,'estado:A',{xp:1});
  assert.equal(JSON.parse(storage.getItem('pe:copias:estado:A')).length,2);
  assert.throws(()=>copiaSegura({getItem:()=>null,setItem:()=>{throw Error('quota');}},'estado:A',{xp:3}),/quota/);
});
function firebaseSimulado(estado) {
  let doc={estado:clone(estado),campoExistente:'preservado'}, autenticado={uid:'A'}, escritas=0;
  const snap=()=>({exists:()=>!!doc,data:()=>clone(doc)});
  const fsM={doc:(_db,colecao,uid)=>({colecao,uid}),getDoc:async()=>snap(),runTransaction:async(_db,fn)=>fn({get:async()=>snap(),set:(_ref,d,opts)=>{assert.equal(opts.merge,true);doc={...doc,...clone(d)};escritas++;}})};
  const c=vm.createContext({assinatura,Date,Map,Error,console});
  vm.runInContext(contas.replace(/^import .*;$/m,'').replace(/export /g,'')+'\nglobalThis.api={carrega,salva,setFb:v=>fb=v};',c);
  c.api.setFb({fsM,db:{},auth:{get currentUser(){return autenticado;}}});
  return {api:c.api,doc:()=>doc,muda:d=>doc={...doc,estado:clone(d)},sai:()=>autenticado=null,escritas:()=>escritas};
}
test('Firestore mantém documentos legados e metadados ao salvar',async()=>{
  const f=firebaseSimulado({v:2,xp:500,notas:{a:'texto'}});
  assert.equal((await f.api.carrega('A')).xp,500);
  await f.api.salva('A',{v:2,xp:510,notas:{a:'texto'}});
  assert.equal(f.doc().campoExistente,'preservado');assert.equal(f.doc().estado.notas.a,'texto');
});
test('Firestore recusa sobrescrever alterações de outro aparelho',async()=>{
  const f=firebaseSimulado({xp:500});await f.api.carrega('A');f.muda({xp:700});
  await assert.rejects(f.api.salva('A',{xp:600}),e=>e.code==='progresso/conflito');
  assert.equal(f.doc().estado.xp,700);assert.equal(f.escritas(),0);
});
test('Firestore recusa gravação sem leitura inicial ou após sair da conta',async()=>{
  const f=firebaseSimulado({xp:500});await assert.rejects(f.api.salva('A',{xp:0}));
  await f.api.carrega('A');f.sai();await assert.rejects(f.api.salva('A',{xp:0}));assert.equal(f.escritas(),0);
});

test('abertura exige planeta renderizado e estado pronto; falha bloqueia sem zerar estado',()=>{
  const elementos={nav:{inert:true},inicioApp:{hidden:false},inicioStatus:{textContent:''},inicioTentar:{hidden:true}};
  const main={inert:true}, classes=new Set(['iniciando']);let telas=0;
  const c=vm.createContext({
    appPronto:false,planetaPronto:false,estadoPronto:true,S:{xp:500},
    document:{body:{classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}},querySelector:()=>main},
    $:s=>elementos[s.slice(1)],diarias(){},lerHash:()=>null,LS:{get:()=> 'inicio'},VIEWS:[['inicio']],
    viaHash:false,show:()=>telas++,checaTudo(){},atualiza(){},
  });
  vm.runInContext(trecho('function bloqueiaApp(', 'let contaIniciando ='),c);
  c.liberaApp();assert.ok(classes.has('iniciando'));assert.equal(telas,0);
  c.planetaPronto=true;c.estadoPronto=false;c.liberaApp();assert.equal(telas,0);
  c.estadoPronto=true;c.liberaApp();assert.equal(telas,1);assert.equal(main.inert,false);assert.equal(elementos.inicioApp.hidden,true);
  c.bloqueiaApp('Planeta indisponível',()=>{});assert.equal(main.inert,true);assert.equal(c.S.xp,500);assert.equal(elementos.inicioTentar.hidden,false);
});
