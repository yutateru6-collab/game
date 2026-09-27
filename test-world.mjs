import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {WorldGame,roadWidth,END_Z,segmentHit} from './dist/world-engine.js';
const pack=['reduce','affect','publish','compete'].map((word,i)=>({word,meaning:['減らす','影響する','出版する','競う'][i]}));
const tick=(g,n)=>{for(let i=0;i<n;i++)g.update(1/60);};
{
 const g=new WorldGame(pack);g.enemies=[];g.setMove(1,0);tick(g,30);assert.ok(g.player.x>100);g.setMove(-1,0);tick(g,30);assert.ok(Math.abs(g.player.x)<1);g.setMove(0,1);tick(g,30);assert.ok(g.player.z>210);g.setMove(0,-1);tick(g,30);assert.ok(g.player.z<110);g.setMove(1,1);assert.ok(Math.hypot(g.input.x,g.input.z)<=1.00001);assert.notEqual(g.camera.z,g.player.z);
}
{
 const g=new WorldGame(pack);g.enemies=[];g.player.x=-290;g.player.z=640;g.setMove(0,1);tick(g,120);assert.ok(g.player.z<690,'wall blocks tank');assert.ok(!g.solid(g.player.x,g.player.z,g.player.r));
 g.player.x=400;g.player.z=1170;tick(g,60);assert.ok(g.player.z<1200,'narrow bridge has a real boundary');
}
{
 const g=new WorldGame(pack);g.enemies=[];g.player.z=499;g.activate(g.gates[0]);g.player.x=g.activeGate.side===0?-120:120;g.setMove(0,1);tick(g,1);assert.equal(g.correct,1);assert.equal(g.power,3);g.setMove(0,-1);tick(g,20);g.setMove(0,1);tick(g,20);assert.equal(g.correct,1,'gate cannot be farmed');assert.ok(g.currentLock());
 g.player.z=900;assert.equal(g.blocked(0,920),true,'exit locked while enemies remain');
 for(const e of [...g.enemies])g.kill(e);g.setMove(0,0);tick(g,1);assert.equal(g.currentLock(),undefined);assert.equal(g.blocked(0,920),false);
}
{
 const g=new WorldGame(pack);g.enemies=[];g.player.z=210;g.activate(g.gates[0]);tick(g,550);assert.equal(g.correct,0);assert.equal(g.answered,1);assert.equal(g.power,1);assert.ok(g.hp<100);
 const e=g.makeEnemy('grunt',g.player.x+70,g.player.z,0);g.charge=100;assert.equal(g.shockwave(),true);assert.equal(g.charge,5,'a shockwave kill starts recharging the next shot');assert.ok(e.dead);
}
{
 const g=new WorldGame(pack);g.enemies=[];let e=g.makeEnemy('shield',100,300,0);e.angle=Math.PI;g.hurt(e,10,100,100,false);assert.equal(e.hp,16.5);g.hurt(e,10,100,500,false);assert.equal(e.hp,6.5,'flanking bypasses frontal shield');
 const s=g.makeEnemy('splitter',200,350,0);g.kill(s);assert.equal(g.enemies.filter(e=>e.type==='shard').length,2);
 const b=g.barrels[0],victim=g.makeEnemy('grunt',b.x+50,b.z,0);g.explode(b);assert.ok(victim.dead);assert.equal(g.stats.barrels,1);
 assert.equal(segmentHit(0,0,100,0,50,30,5),null);assert.equal(segmentHit(0,0,100,0,50,0,5),.5);
}
{
 const camera=new THREE.PerspectiveCamera(54,.5,10,6000);camera.position.set(0,1320,-1020);camera.lookAt(0,0,380);camera.updateMatrixWorld();const p=new THREE.Vector3(0,0,100).project(camera);assert.ok((1-p.y)/2>.5&&(1-p.y)/2<.8,'tank remains in lower visible battlefield');console.log('Tank screen position',((1-p.y)/2).toFixed(3));
}
{
 const camera=new THREE.PerspectiveCamera(54,.5,10,6000);camera.position.set(0,1320,-1020);camera.lookAt(0,0,380);camera.updateMatrixWorld();
 assert.ok(new THREE.Vector3(-120,0,100).project(camera).x>0,'positive game X renders on screen right after world reflection');
 const g=new WorldGame(pack);g.aimDirection(1,0);g.setMove(0,1);tick(g,20);assert.equal(g.manualAim.z,g.player.z,'stick heading follows moving tank');assert.equal(g.manualAim.x-g.player.x,900);
}
const js=fs.readFileSync('dist/world-game.js','utf8'),html=fs.readFileSync('dist/index.html','utf8');for(const m of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(html.includes(`id="${m[1]}"`),'UI element '+m[1]);
console.log('PASS: 4-way / diagonal movement, camera math, walls, bridge, one-use gates, doors, timeout, shockwave, shields, splitters, barrels, collisions, UI references');
// A grid navigator exercises real movement; it never teleports or changes combat state.
function path(g,tx,tz){
 const size=45,key=(x,z)=>x+','+z,world=(x,z)=>({x:x*size,z:z*size});
 const sx=Math.round(g.player.x/size),sz=Math.round(g.player.z/size),gx=Math.round(tx/size),gz=Math.round(tz/size);
 const root={x:sx,z:sz,parent:null},queue=[root],seen=new Set([key(sx,sz)]);let best=root,bestD=Infinity;
 for(let head=0;head<queue.length;head++){
  const n=queue[head],d=Math.hypot(n.x-gx,n.z-gz);if(d<bestD){best=n;bestD=d;}if(d===0)break;
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
   const x=n.x+dx,z=n.z+dz,k=key(x,z),p=world(x,z);if(seen.has(k)||x< -10||x>10||z<1||z>108||g.blocked(p.x,p.z,32))continue;
   if(dx&&dz&&(g.blocked(n.x*size,p.z,32)||g.blocked(p.x,n.z*size,32)))continue;
   seen.add(k);queue.push({x,z,parent:n});
  }
 }
 let n=best;while(n.parent&&n.parent!==root)n=n.parent;
 return n===root?null:world(n.x,n.z);
}
if(process.argv.includes('--journey')){
 let seed=4;const g=new WorldGame(pack,{random:()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296)});let waypoint=null,nextPlan=0;
 for(let f=0;f<60*600&&g.mode==='play';f++){
  let tx=0,tz=g.player.z+200;const gate=g.activeGate,lock=g.currentLock();
  if(gate){tx=((process.argv.includes('--wrong')?1-gate.side:gate.side)===0?-1:1)*Math.min(160,roadWidth(g.player.z)-65);tz=gate.z+65;}
  else if(lock||g.boss&&!g.bossDead){const enemies=g.enemies.filter(e=>!e.dead).sort((a,b)=>Math.hypot(a.x-g.player.x,a.z-g.player.z)-Math.hypot(b.x-g.player.x,b.z-g.player.z)),e=enemies[0];if(e){const dx=g.player.x-e.x,dz=g.player.z-e.z,l=Math.hypot(dx,dz)||1;g.aimAt(e.x,e.z);if(l<230){tx=g.player.x+dx/l*190-dz/l*110;tz=g.player.z+dz/l*190+dx/l*110;}else if(l>500||[.25,.5,.75].some(t=>g.solid(g.player.x+(e.x-g.player.x)*t,g.player.z+(e.z-g.player.z)*t,3))){tx=e.x;tz=e.z;}else{tx=g.player.x+Math.cos(g.time*.7)*160;tz=g.player.z+Math.sin(g.time*.7)*100;}}}
  else{const next=g.gates.find(g=>!g.resolved);tz=next?next.z-220:END_Z;tx=0;g.autoAim();}
  tx=Math.max(-roadWidth(tz)+65,Math.min(roadWidth(tz)-65,tx));tz=Math.max(80,Math.min(END_Z,tz));
  if(g.time>nextPlan||!waypoint){waypoint=path(g,tx,tz);nextPlan=g.time+.25;}
  if(waypoint){const dx=waypoint.x-g.player.x,dz=waypoint.z-g.player.z,l=Math.hypot(dx,dz);if(l>10)g.setMove(dx/l,dz/l);else {waypoint=null;g.setMove(0,0);}}else g.setMove(0,0);
  if(g.charge>=100&&g.enemies.some(e=>Math.hypot(e.x-g.player.x,e.z-g.player.z)<350))g.shockwave();g.update(1/60);
 }
 assert.equal(g.mode,process.argv.includes('--wrong')?'lost':'won','full journey outcome');
 console.log('Journey',JSON.stringify({mode:g.mode,time:Math.round(g.time),z:Math.round(g.player.z),hp:g.hp,gates:g.answered,correct:g.correct,kills:g.kills,boss:g.boss?.hp,enemies:g.enemies.length,lock:g.currentLock()?.id}));
}
