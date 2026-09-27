import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MemoryGame,uniquePairs} from './dist/memory-engine.js';
const pack=Array.from({length:18},(_,i)=>({word:'word'+i,meaning:'意味'+i}));
{
const g=new MemoryGame(pack,{random:()=>.3});assert.equal(g.cards.length,8);assert.equal(g.flip(0),false);g.tick(7);assert.equal(g.phase,'play');assert.equal(g.remaining,90,'preview does not consume play time');assert.ok(g.cards.every(c=>!g.visible(c)));
const a=0,b=g.cards.findIndex(c=>c.pair!==g.cards[a].pair);assert.equal(g.flip(a),true);assert.equal(g.flip(a),false);g.flip(b);assert.equal(g.mistakes,1);assert.equal(g.phase,'resolve');assert.equal(g.flip(2),false,'third flip is locked');g.tick(1.2);assert.equal(g.selected.length,0);assert.equal(g.phase,'play');assert.equal(g.review.size,2);assert.equal(g.peek(),true);assert.equal(g.peek(),false);assert.equal(g.flip(0),false);g.tick(3.1);assert.equal(g.hintTime,0);
}
{
const g=new MemoryGame(pack);const seen=[];while(g.phase!=='done'){if(g.phase==='preview'){seen.push(...g.pairs.map(p=>p.word));g.begin();}else if(g.phase==='play'){const c=g.cards.find(c=>!c.matched),partner=g.cards.find(c2=>c2.pair===c.pair&&c2.id!==c.id);g.flip(c.id);g.flip(partner.id);assert.equal(g.flip(c.id),false);g.tick(.7);}else g.tick(2);}
assert.ok(g.win);assert.equal(g.matches,15);assert.equal(g.moves,15);assert.equal(new Set(seen).size,15,'unused vocabulary appears before recycling');assert.ok(g.score>1500);const score=g.score;g.tick(100);g.flip(0);assert.equal(g.score,score,'end score cannot be farmed');
}
{
const g=new MemoryGame(pack.slice(0,4));for(let r=0;r<3;r++){assert.equal(new Set(g.pairs.map(p=>p.word)).size,4);g.begin();while(g.phase==='play'){const c=g.cards.find(c=>!c.matched),partner=g.cards.find(o=>o.pair===c.pair&&o.id!==c.id);g.flip(c.id);g.flip(partner.id);g.tick(.7);}if(g.phase==='between')g.tick(2);}assert.ok(g.win,'4-word input remains playable over 3 rounds');
const time=new MemoryGame(pack);time.begin();time.tick(90);assert.equal(time.phase,'done');assert.equal(time.win,false);assert.equal(time.review.size,4);
assert.equal(uniquePairs([{word:'a',meaning:'同じ'},{word:'b',meaning:'同じ '},{word:'A',meaning:'別'}]).length,1);assert.throws(()=>new MemoryGame(pack.slice(0,3)));
}
for(const [js,html]of[['dist/memory.js','dist/memory.html'],['dist/world-game.js','dist/tank.html']]){const source=fs.readFileSync(js,'utf8'),page=fs.readFileSync(html,'utf8');for(const m of source.matchAll(/\$\('([^']+)'\)/g))assert.ok(page.includes(`id="${m[1]}"`),m[1]);}
console.log('PASS: preview, pair matching, mismatch lock, hints, scoring, 3-room victory, time-out, vocabulary cycling, duplicate meanings, UI references');
