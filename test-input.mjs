import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {WorldGame,roadWidth,areaName,END_Z,clamp} from './dist/world-engine.js';
import {readWords} from './dist/vocab.js';
import {bindGameLifecycle} from './dist/game-lifecycle.js';
// Event-level regression of the real UI handlers, using a minimal DOM adapter.
// This is not a browser rendering or iPhone test.
class Element extends EventTarget{constructor(){super();this.style={};this.value='';this.textContent='';const s=new Set(['hidden']);this.classList={contains:x=>s.has(x),add:x=>s.add(x),remove:x=>s.delete(x),toggle:(x,on)=>on?s.add(x):s.delete(x)};this.knob={style:{}};}querySelector(){return this.knob;}setPointerCapture(){}getBoundingClientRect(){return {left:0,top:0,width:100,height:100};}}
const els=new Map(),doc=new EventTarget(),win=new EventTarget();doc.hidden=false;doc.getElementById=id=>{if(!els.has(id))els.set(id,new Element());return els.get(id);};const ctx={WorldGame,roadWidth,areaName,END_Z,clamp,readWords,bindGameLifecycle,document:doc,window:win,localStorage:{getItem:()=>null,setItem:()=>{}},performance:{now:()=>0},requestAnimationFrame:()=>{},WorldView:class{dispose(){}},console};
vm.createContext(ctx);const code=fs.readFileSync('dist/world-game.js','utf8').replace(/^import .*;\n/gm,'');vm.runInContext(code+'\nglobalThis.inspect=()=>({game,paused,pointers});',ctx);doc.getElementById('sampleButton').onclick();assert.equal(ctx.inspect().paused,false);
const pointer=(type,id,x,y)=>{const e=new Event(type,{cancelable:true});Object.assign(e,{pointerId:id,clientX:x,clientY:y});return e;};const move=doc.getElementById('moveStick'),aim=doc.getElementById('aimStick');
move.dispatchEvent(pointer('pointerdown',1,80,20));assert.ok(ctx.inspect().game.input.x>0);assert.ok(ctx.inspect().game.input.z>0);aim.dispatchEvent(pointer('pointerdown',2,80,50));assert.equal(ctx.inspect().pointers.size,2,'two thumbs are supported');assert.equal(ctx.inspect().paused,false);
move.dispatchEvent(pointer('pointercancel',1,80,20));assert.equal(ctx.inspect().game.input.x,0);assert.equal(ctx.inspect().paused,false);aim.dispatchEvent(pointer('lostpointercapture',2,80,50));assert.equal(ctx.inspect().pointers.size,0);
for(let i=0;i<20;i++){move.dispatchEvent(pointer('pointerdown',i+3,80,20));win.dispatchEvent(new Event('blur'));assert.equal(ctx.inspect().paused,false,'focus loss must never open pause');assert.equal(doc.getElementById('pauseOverlay').classList.contains('hidden'),true);assert.ok(ctx.inspect().game.input.x>0,'active touch survives transient blur');move.dispatchEvent(pointer('pointerup',i+3,80,20));assert.equal(ctx.inspect().game.input.x,0);}
doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(ctx.inspect().paused,true);doc.hidden=false;doc.getElementById('resumeButton').onclick();assert.equal(ctx.inspect().paused,false);win.dispatchEvent(new Event('pagehide'));assert.equal(ctx.inspect().paused,true);
console.log('PASS: real joystick handlers, dual touch, cancellation, lost capture, 20 blur events without pause, background pause, manual resume');
