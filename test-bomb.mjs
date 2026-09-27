import assert from 'node:assert/strict';
import fs from 'node:fs';
import {BombGame} from './dist/bomb-engine.js';
const pack=[{word:'reduce',meaning:'減らす'},{word:'publish',meaning:'出版する'},{word:'compete',meaning:'競う'},{word:'explore',meaning:'探索する'}];
const tick=(g,t)=>{for(let i=0;i<Math.ceil(t/.02);i++)g.tick(.02);};
{
 const g=new BombGame(pack,{random:()=>.3});assert.equal(g.answer(true),null);tick(g,2.1);assert.equal(g.phase,'player');const truth=g.q.truth;assert.equal(g.answer(truth),true);assert.equal(g.owner,1);assert.equal(g.answer(!truth),null,'cannot spam both buttons');assert.equal(g.correct,1);tick(g,.5);assert.equal(g.phase,'cpu');assert.equal(g.answer(true),null,'cannot answer CPU turn');
}
{
 const g=new BombGame(pack,{random:()=>.2});tick(g,2.1);const p=g.q.entry;assert.equal(g.answer(!g.q.truth),false);assert.equal(g.owner,0);assert.equal(g.phase,'wrong');const fuse=g.fuse;assert.equal(g.answer(g.q.truth),null);tick(g,1.4);assert.equal(g.phase,'player');assert.ok(g.fuse<fuse-1.3);assert.ok(g.review.has(p.word));g.fuse=.01;tick(g,.02);assert.equal(g.stars[1],1);assert.equal(g.phase,'round');assert.equal(g.answer(true),null);const frozen=g.fuse;tick(g,3);assert.equal(g.fuse,frozen);g.continue();assert.equal(g.round,2);
}
for(const strategy of ['correct','wrong','idle']){
 let wins=0,totalCorrect=0;for(let seed=1;seed<=15;seed++){let s=seed;const g=new BombGame(pack,{random:()=>((s=(s*1664525+1013904223)>>>0)/4294967296)});let reaction=0;
 for(let f=0;f<20000&&g.phase!=='done';f++){if(g.phase==='round'){g.continue();reaction=0;}if(g.phase==='player'){reaction+=.05;if(reaction>=.7&&strategy!=='idle'){g.answer(strategy==='correct'?g.q.truth:!g.q.truth);reaction=0;}}else reaction=0;g.tick(.05);}
 assert.equal(g.phase,'done','match must finish');assert.ok(g.round<=5);if(g.win)wins++;totalCorrect+=g.correct;
 }console.log(strategy,{wins,outOf:15,totalCorrect});if(strategy==='correct')assert.ok(wins>=10);else assert.equal(wins,0,'incorrect/idle play must not win');
}
const source=fs.readFileSync('dist/bomb.js','utf8'),html=fs.readFileSync('dist/bomb.html','utf8');for(const m of source.matchAll(/\$\('([^']+)'\)/g))assert.ok(html.includes(`id="${m[1]}"`),m[1]);
console.log('PASS: pass, CPU turn, wrong-answer penalty, spam lock, explosion, 5-round bound, victory/defeat and UI references');
