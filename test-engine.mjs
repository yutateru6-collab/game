import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SiegeGame,segmentHit} from './dist/engine.js';
import {readWords} from './dist/vocab.js';
const pack=readWords('1\treduce\t減らす\n2 affect 影響する\npublish:出版する\ncompete,競う').entries;
assert.equal(pack.length,4);
assert.ok(readWords('reduce').errors.length);
assert.ok(readWords('a,同じ\nb,同じ\nc,同じ\nd,同じ').errors.length);
assert.equal(readWords('reduce,減らす\naffect,影響する\npublish,出版する\ncompete,競う\nreduce,減らす').entries.length,4);
assert.equal(segmentHit(0,0,100,0,50,0,5),.5);
assert.equal(segmentHit(0,0,100,0,50,30,5),null);
function empty(){const g=new SiegeGame(pack);g.gate=null;g.nextGate=Infinity;g.fireClock=-999;return g;}
function bullet(x){return {x,y:310,px:x,py:310,vx:0,vy:-650,damage:1,r:3,life:1};}
{
 const g=empty(),target=g.makeEnemy('grunt',100,295),other=g.makeEnemy('grunt',270,295);
 g.shots.push(bullet(100));g.update(.03);assert.equal(target.hp,1);assert.equal(other.hp,2);assert.equal(g.kills,0);
 g.shots.push(bullet(200));g.update(.03);assert.equal(target.hp,1);assert.equal(other.hp,2);
 g.shots.push(bullet(100));g.update(.03);assert.equal(g.kills,1);assert.equal(other.hp,2);
}
{
 const g=empty();g.aimTo(40,350);g.volley();assert.ok(g.shots[0].vx<0);g.shots=[];g.aimTo(360,350);g.volley();assert.ok(g.shots[0].vx>0);
 g.shots=[];g.power=12;g.volley();assert.equal(g.shots.length,12);
}
{
 const g=empty(),e=g.makeEnemy('splitter',150,300);g.kill(e);assert.equal(g.enemies.filter(e=>e.type==='shard').length,2);
 const brute=g.makeEnemy('brute',200,400);assert.equal(brute.hp,15);g.kill(brute);assert.ok(g.rings.length>0);
}
{
 const g=empty();g.makeEnemy('grunt',50,664.9);g.update(.03);assert.equal(g.hp,92);assert.equal(g.stats.breaches,1);
 g.startBoss();g.boss.y=599;assert.equal(g.mode,'play');assert.ok(g.boss.hp>0);
}
const outcomes={};
for(const strategy of ['correct_aim','one_wrong','two_wrong','wrong_aim','correct_straight','idle']){
 outcomes[strategy]=[];
 for(let seed0=1;seed0<=5;seed0++){
  let seed=seed0;const g=new SiegeGame(pack,{random:()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296)});let gate=null;
  for(let f=0;f<120*60&&g.mode==='play';f++){
   if(g.gate&&g.gate!==gate){gate=g.gate;const wrong=strategy==='wrong_aim'||(strategy==='one_wrong'&&g.gateIndex===3)||(strategy==='two_wrong'&&[2,5].includes(g.gateIndex));if(strategy!=='idle')g.chooseLane(wrong?1-gate.side:gate.side);}
   if(!['idle','correct_straight'].includes(strategy)){const e=g.enemies.filter(e=>!e.dead).sort((a,b)=>b.y-a.y)[0];if(e)g.aimTo(e.x,e.y+e.speed*.5);}
   if(g.bossStarted&&g.warning)g.moveTo(g.warning.x<200?320:80);g.update(1/60);
  }
  if(['correct_aim','one_wrong'].includes(strategy))assert.equal(g.mode,'won',strategy+' seed '+seed0);
  if(['idle','wrong_aim','correct_straight'].includes(strategy))assert.equal(g.mode,'lost',strategy+' seed '+seed0);
  assert.ok(g.stats.hits<=g.stats.fired);
  outcomes[strategy].push({result:g.mode,seconds:Math.round(g.time),hp:g.hp,correct:g.correct,kills:g.kills});
 }
}
const html=fs.readFileSync('dist/index.html','utf8'),js=fs.readFileSync('dist/game.js','utf8');
for(const m of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(html.includes(`id="${m[1]}"`),'missing UI '+m[1]);
for(const asset of ['golem.webp','cannon.webp','castle.webp'])assert.ok(fs.existsSync('dist/assets/'+asset));
console.log('PASS: vocabulary, real collision / misses, direction, bullet count, enemy durability / split, breach damage, 30 full simulations, UI references');
console.log(JSON.stringify(outcomes,null,2));
