import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FactoryGame} from './dist/factory-engine.js';
import {MazeGame,DIRECTIONS} from './dist/maze-engine.js';
const pack=Array.from({length:12},(_,i)=>({word:'word'+i,meaning:'意味'+i}));
for(const skip of[0,3]){const g=new FactoryGame(pack);const omitted=new Set();for(let f=0;f<2000&&g.mode==='play';f++){for(const item of [...g.items]){if(omitted.size<skip&&!omitted.has(item.id))omitted.add(item.id);if(!omitted.has(item.id))g.drop(item.id,item.bin);}g.tick(.05);}assert.equal(g.mode,'won');assert.equal(g.sorted,18-skip);console.log('Factory completion',g.sorted,Math.round(60-g.remaining)+'s');}
{
 const g=new FactoryGame(pack),i=g.items[0];assert.equal(g.drop(i.id,(i.bin+1)%3),false);assert.equal(g.lives,4);assert.equal(g.drop(i.id,i.bin),null,'wrong parcel locks against answer-spam');assert.equal(g.lives,4);for(let n=0;n<9;n++)g.tick(.1);assert.equal(g.drop(i.id,i.bin),true);assert.equal(g.drop(i.id,i.bin),null);assert.equal(g.sorted,1);
 const idle=new FactoryGame(pack);for(let i=0;i<1000&&idle.mode==='play';i++)idle.tick(.1);assert.equal(idle.mode,'lost');assert.equal(idle.sorted,0);
}
{
 const g=new MazeGame(pack);assert.equal(g.move(-1,0),false);assert.equal(g.place(),true);assert.equal(g.place(),false);assert.equal(g.ammo,0);assert.equal(g.move(1,0),true);g.tick(.2);g.tick(.1);assert.equal(g.move(-1,0),false,'cannot walk back onto bomb');
 assert.equal(g.openQuiz(),true);const time=g.time,bombLife=g.bombs[0].life;for(let i=0;i<40;i++)g.tick(.1);assert.equal(g.time,time);assert.equal(g.bombs[0].life,bombLife,'quiz freezes the battlefield');const answer=g.quiz.choices.indexOf(g.quiz.target);assert.equal(g.answerQuiz((answer+1)%3),false);assert.equal(g.answerQuiz(answer),null);assert.equal(g.ammo,0);g.closeQuiz();g.openQuiz();assert.equal(g.answerQuiz(g.quiz.choices.indexOf(g.quiz.target)),true);assert.equal(g.ammo,2);g.closeQuiz();
}
{
 const g=new MazeGame(pack,{random:()=>.99});g.grid[1][2]=2;g.bombs=[{x:1,y:1,life:0}];g.explode(g.bombs[0]);assert.equal(g.grid[1][2],0);assert.ok(!g.flames.some(f=>f.x===3&&f.y===1),'first crate stops the blast');g.check();assert.equal(g.hp,2,'own blast hurts');g.check();assert.equal(g.hp,2,'invulnerability prevents repeated frame damage');assert.ok(!g.flames.some(f=>f.x===0||f.y===0),'hard walls block flames');
}
{
 const g=new MazeGame(pack,{random:()=>.99});g.player={x:1,y:1};g.enemies=[{x:5,y:7},{x:6,y:7},{x:7,y:7}];g.bombs=[{x:5,y:7,life:.1},{x:7,y:7,life:2}];g.tick(.1);assert.equal(g.bombs.length,0,'bombs chain');assert.equal(g.kills,3);assert.equal(g.mode,'play','must reach exit after kills');g.flames=[];g.player={x:6,y:7};g.move(1,0);assert.equal(g.mode,'won');
 const idle=new MazeGame(pack);idle.time=.01;idle.tick(.1);assert.equal(idle.mode,'lost');
}
for(let seed=1;seed<=100;seed++){let n=seed;const g=new MazeGame(pack,{random:()=>((n=(n*1664525+1013904223)>>>0)/4294967296)});const seen=new Set(['1,1']),queue=[{x:1,y:1}];let escape=false;for(const p of queue){if(p.x!==1&&p.y!==1)escape=true;for(const[dx,dy]of DIRECTIONS){const x=p.x+dx,y=p.y+dy,k=x+','+y;if(!seen.has(k)&&!g.blocked(x,y)){seen.add(k);queue.push({x,y});}}}assert.ok(escape,'starting bomb always has a reachable corner escape');const all=new Set(['1,1']),q=[{x:1,y:1}];for(const p of q)for(const[dx,dy]of DIRECTIONS){const x=p.x+dx,y=p.y+dy,k=x+','+y;if(g.grid[y]?.[x]!==undefined&&g.grid[y][x]!==1&&!all.has(k)){all.add(k);q.push({x,y});}}assert.ok(all.has('7,7'),'exit connected after breakable crates are removed');}
for(const name of ['factory','maze']){const js=fs.readFileSync('dist/'+name+'.js','utf8'),html=fs.readFileSync('dist/'+name+'.html','utf8');for(const m of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(html.includes('id="'+m[1]+'"'),m[1]);}
console.log('PASS: delivery, recovery, drop lock, idle defeat, maze collisions, quiz freeze/refill, blast shielding, chains, damage, exit, 100 starting maps and UI references');
