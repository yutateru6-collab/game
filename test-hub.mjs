import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {readWords} from './dist/vocab.js';
import {uniquePairs} from './dist/memory-engine.js';
import {loadWords,saveWords,SAMPLE,KEY} from './dist/word-store.js';
const html=fs.readFileSync('dist/index.html','utf8'),code=fs.readFileSync('dist/hub.js','utf8').replace(/^import .*;\n/gm,'');
class Element extends EventTarget{constructor(){super();this.value='';this.textContent='';this.dataset={};this.attrs={};}setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}focus(){this.focused=true;}scrollIntoView(){this.scrolled=true;}}
function setup(fail=false){const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(fail)throw Error('storage blocked');data.set(k,v);}};const els=new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));const buttons=[...html.matchAll(/data-game="([^"]+)"/g)].map(m=>Object.assign(new Element(),{dataset:{game:m[1]}}));const ctx={document:{getElementById:id=>{assert.ok(els.has(id),'missing '+id);return els.get(id);},querySelectorAll:()=>buttons},loadWords,saveWords,SAMPLE,readWords,uniquePairs,matchMedia:()=>({matches:true}),location:{href:''},Math};vm.createContext(ctx);vm.runInContext(code,ctx);return {els,buttons,ctx,data};}
for(const game of ['tank','memory','bomb','maze','factory','fishing']){const t=setup();assert.equal(t.els.get('wordCount').textContent,'18語であそぶ');t.buttons.find(b=>b.dataset.game===game).onclick();assert.equal(t.ctx.location.href,game+'.html');assert.equal(t.data.get(KEY),SAMPLE);}
{
 const t=setup();t.els.get('words').value='bad input';t.buttons[0].onclick();assert.equal(t.ctx.location.href,'');assert.equal(t.data.size,0);assert.equal(t.els.get('wordEditor').open,true);assert.ok(t.els.get('error').textContent);assert.equal(t.els.get('words').attrs['aria-invalid'],'true');
}
{
 const t=setup();t.els.get('words').value='one,同じ\ntwo,同じ\nthree,同じ\nfour,別';t.buttons.find(b=>b.dataset.game==='memory').onclick();assert.equal(t.ctx.location.href,'');assert.equal(t.data.size,0,'incompatible game must not overwrite storage');for(let i=0;i<30;i++){t.buttons.find(b=>b.dataset.game==='random').onclick();assert.ok(['tank.html','bomb.html'].includes(t.ctx.location.href),'random chooses compatible game');}
}
{
 const t=setup(true);t.buttons[0].onclick();assert.equal(t.ctx.location.href,'');assert.match(t.els.get('error').textContent,/保存できません/);
}
{
 const t=setup();t.els.get('saveWords').onclick();assert.equal(t.data.get(KEY),SAMPLE);assert.match(t.els.get('saved').textContent,/保存しました/);t.els.get('editWords').onclick();assert.equal(t.els.get('wordEditor').open,true);assert.equal(t.els.get('words').focused,true);
}
for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(m[1].startsWith('data:'))continue;assert.ok(fs.existsSync('dist/'+m[1]),'asset missing '+m[1]);}
assert.equal([...html.matchAll(/data-game=/g)].length,7);
console.log('PASS: all six routes, seven launch buttons, vocabulary save/edit, invalid input, incompatible vocabulary, eligible random routing, storage failure, asset references. DOM adapter only; no browser rendering claims.');
