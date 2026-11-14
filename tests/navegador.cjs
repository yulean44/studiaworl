const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.STUDIA_URL || 'http://127.0.0.1:4173';
const fixtures=new Map();
async function prepara(page){
 await page.route(/^https:\/\/(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)\//,async r=>{
   const url=r.request().url();
   if(!fixtures.has(url)) fixtures.set(url,execFileSync('curl',['--fail','--silent','--show-error','--max-time','20',url],{maxBuffer:5*1024*1024}));
   await r.fulfill({body:fixtures.get(url),contentType:url.includes('fonts.googleapis.com')?'text/css':url.includes('fonts.gstatic.com')?'font/ttf':'application/javascript',headers:{'access-control-allow-origin':'*'}});
 });
 await page.route('**/conta.js?*',r=>r.fulfill({contentType:'application/javascript',body:'export async function iniciaConta(cb){await cb(null);}'}));
 await page.addInitScript(()=>{
  localStorage.setItem('pe:semConta','true');
  window.__draws=0;
  const get=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(...args){
   const gl=get.apply(this,args);
   if(gl&&/^webgl/.test(args[0])&&!gl.__counted){
    gl.__counted=true;
    for(const k of ['drawArrays','drawElements']){const f=gl[k];gl[k]=function(...a){window.__draws++;return f.apply(this,a);};}
   }
   return gl;
  };
 });
}

(async()=>{
const out=process.env.STUDIA_EVIDENCIAS || '/tmp/studiaworld-verificacao';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:1280,height:900},hasTouch:true,locale:'pt-BR',timezoneId:'America/Sao_Paulo'});await prepara(p);
const erros=[];p.on('pageerror',e=>erros.push(e.message));
await p.goto(base+'/#revisao');await p.locator('body:not(.iniciando)').waitFor({timeout:45000});
assert.ok(await p.evaluate(()=>window.__draws>0));
await p.locator('#rVira').click();await p.locator('#rOk').focus();await p.keyboard.press('Enter');
assert.match(await p.locator('.roundbar').innerText(),/2 \/ 20/);console.log('PASS Enter em Acertei registra e avança');
await p.locator('#rVira').click();await p.locator('#rErr').focus();await p.keyboard.press('Space');
assert.match(await p.locator('.roundbar').innerText(),/3 \/ 20/);console.log('PASS Espaço em Errei registra e avança');
await p.screenshot({path:out+'/flashcards-teclado.png'});
await p.goto(base+'/#materias/imagem');await p.locator('[data-am="questoes"]').click();await p.locator('#qTreino').click();await p.locator('[data-qa]').first().click();
assert.equal(await p.evaluate(()=>document.activeElement.id),'qFeedback');await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'qReler');
await p.locator('#qProx').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'qEnunciado');console.log('PASS foco no resultado e na próxima questão');
await p.screenshot({path:out+'/questoes-foco.png'});
await p.locator('#arvore [data-arv-view="questoes"]').click();await p.locator('#qMateria').waitFor();
assert.match(p.url(),/#questoes\//);assert.equal(await p.locator('#qMateria option').count(),6);
assert.ok(await p.locator('#qSair').isVisible());await p.locator('#qSair').click();await p.getByRole('dialog').getByRole('button',{name:'Sair',exact:true}).click();
for(const mat of ['mfc','imagem','antibioticos','psiquiatria','cirurgia','saude-mulher']){
 await p.locator('#qMateria').selectOption(mat);assert.ok(p.url().endsWith('#questoes/'+mat));assert.ok(await p.locator('#qTreino').isEnabled());
}
await p.locator('#qMateria').selectOption('mfc');await p.locator('#qTreino').click();await p.keyboard.press('1');assert.equal(await p.evaluate(()=>document.activeElement.id),'qFeedback');
await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>document.activeElement.id),'qEnunciado');
await p.goto(base+'/#questoes/imagem');await p.locator('#qMateria').waitFor();assert.equal(await p.locator('#qMateria').inputValue(),'imagem');
console.log('PASS aba Questões: seis matérias, URL própria e respostas por teclado');
for(const width of [320,390,768,1280]){
 await p.setViewportSize({width,height:900});
 for(const hash of ['#inicio','#materias','#materias/mfc/g1','#foco','#revisao','#questoes/mfc','#missoes','#progresso']){
  await p.goto(base+'/'+hash);await p.locator('body:not(.iniciando)').waitFor({timeout:45000});await p.evaluate(()=>document.fonts.ready);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${width} ${hash}`);
 }
 await p.goto(base+'/#questoes/mfc');await p.locator('#qMateria').waitFor();
 const nav=await p.locator('#nav .navbtn').evaluateAll(bs=>bs.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,right:r.right,y:r.y,bottom:r.bottom,w:r.width,h:r.height}}));
 assert.equal(nav.length,8);for(const r of nav){assert.ok(r.x>=0 && r.right<=width+1);assert.ok(r.w>=44 && r.h>=44);}
 await p.locator('#nav [aria-current=page]').evaluate(async el=>Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{}))));
 await p.screenshot({path:out+'/aba-questoes-'+width+'.png'});
 console.log('PASS 8 áreas e oito destinos acessíveis em',width);
}
const f=await b.newPage({viewport:{width:390,height:844}});await prepara(f);let bloqueia=true;
await f.route('**/content/mfc.json?*',r=>bloqueia?r.abort():r.continue());
await f.goto(base+'/#materias');await f.locator('body:not(.iniciando)').waitFor({timeout:45000});await f.locator('#conteudoTentar').waitFor();
assert.match(await f.locator('#conteudoStatus').innerText(),/Seu progresso foi mantido/);await f.screenshot({path:out+'/materia-indisponivel-390.png'});
bloqueia=false;await f.locator('#conteudoTentar').click();await f.locator('#conteudoStatus').waitFor({state:'hidden'});assert.equal(await f.locator('[data-arv-abre="mfc"]').count(),1);console.log('PASS falha visível e nova tentativa recupera MFC');
const a=await b.newPage({viewport:{width:1280,height:900}});await prepara(a);await a.unroute('**/conta.js?*');
await a.route('**/conta.js?*',r=>r.fulfill({contentType:'application/javascript',body:`
 export async function iniciaConta(cb){globalThis.__trocaTeste=cb;await cb({uid:'teste-A',nome:'Conta A'});}
 export async function carrega(uid){return {v:2,upd:1,xp:0,questoes:uid==='teste-A'?{'imagem--salva':{ok:true,n:1}}:{}};}
 export async function salva(){};`}));
await a.goto(base+'/#materias/imagem');await a.locator('body:not(.iniciando)').waitFor({timeout:45000});
await a.locator('[data-am="questoes"]').click();await a.locator('#qSim').click();await a.locator('[data-qa]').first().click();
await a.evaluate(()=>globalThis.__trocaTeste({uid:'teste-B',nome:'Conta B'}));await a.locator('#qTreino').waitFor();
assert.equal(await a.locator('#qEntrega').count(),0);
assert.deepEqual(await a.evaluate(()=>JSON.parse(localStorage.getItem('pe:estado:teste-B')).questoes),{});
assert.equal(await a.evaluate(()=>JSON.parse(localStorage.getItem('pe:estado:teste-A')).questoes['imagem--salva'].ok),true);
console.log('PASS troca A → B encerra simulado e preserva históricos separados');
assert.deepEqual(erros,[]);await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
