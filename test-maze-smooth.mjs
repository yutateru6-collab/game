import assert from 'node:assert/strict';
import {MazeGame} from './dist/maze-engine.js';
const pack=Array.from({length:12},(_,i)=>({word:'word'+i,meaning:'意味'+i}));
const make=()=>new MazeGame(pack,{random:()=>.99});
const run=(g,seconds,hz=60)=>{for(let i=0;i<Math.round(seconds*hz);i++)g.tick(1/hz);};
const positions=[];
for(const hz of [30,60,120]){const g=make();g.move(1,0);g.tick(1/hz);assert.ok(g.player.x>1&&g.player.x<1.15,'first frame moves a fraction of a tile');run(g,1-1/hz,hz);positions.push(g.player.x);assert.ok(Math.abs(g.player.x-4.8)<1e-7);g.stop();const x=g.player.x;run(g,.2,hz);assert.equal(g.player.x,x,'release stops immediately');}
assert.ok(Math.max(...positions)-Math.min(...positions)<1e-8,'30/60/120 Hz equal distance');
{
 const g=make();g.player={x:2.85,y:1};g.move(0,1);run(g,.4);assert.ok(Math.abs(g.player.x-3)<1e-7);assert.ok(g.player.y>2,'corner assistance enters the corridor');g.move(-1,0);run(g,.6);assert.ok(g.player.x>=2.77,'cannot cross the adjacent solid pillar');
}
{
 const g=make();g.place();g.move(1,0);run(g,.52);g.move(0,1);run(g,.54);g.stop();run(g,1.5);assert.equal(g.hp,3,'starting bomb can be escaped around a corner');assert.equal(g.bombs.length,0);
}
{
 const g=make();g.flames=[{x:2,y:1,life:.65}];g.move(1,0);run(g,.3);assert.equal(g.hp,2,'continuous collision catches crossing flames');g.stop();
 const e=make();e.tick(1/60);assert.ok(e.enemies.some(a=>!Number.isInteger(a.x)||!Number.isInteger(a.y)),'enemies also move continuously');
}
{
 const g=make();g.move(1,0);g.openQuiz();const p={...g.player},time=g.time;run(g,1);assert.deepEqual(g.player,p);assert.equal(g.time,time);
}
console.log('PASS: 30/60/120 Hz, fractional movement, instant release, corner assistance, solid collision, starting escape, moving flame collision, smooth enemies, quiz freeze');
