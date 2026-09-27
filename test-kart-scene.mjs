import assert from 'node:assert/strict';
import * as T from './dist/vendor/three.module.js';
import {KartView} from './dist/kart-renderer.js';
import {KartGame,trackAt,TRACK_LENGTH} from './dist/kart-engine.js';
// Only the GPU and text canvas are adapters; actual KartView builds and updates the Three.js scene.
globalThis.document={createElement:()=>({width:256,height:128,getContext:()=>({fillText(){}})})};
const canvas={getBoundingClientRect:()=>({width:390,height:480})};let renders=0;const device={setPixelRatio(){},setSize(){},render(scene,camera){scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);renders++;},dispose(){}};
const game=new KartGame(['a','b','c','d'].map((word,i)=>({word,meaning:'訳'+i}))),view=new KartView(canvas,game,{renderer:device});await view.load(new T.Texture({width:1536,height:1024}));
assert.equal(view.cars.length,6);assert.equal(view.pickupMeshes.size,45);const road=view.scene.children[2],edge=view.scene.children[3],ray=new T.Raycaster();view.scene.updateMatrixWorld(true);
for(let s=0;s<TRACK_LENGTH;s+=5){const p=trackAt(s);ray.set(new T.Vector3(p.x,p.y+30,p.z),new T.Vector3(0,-1,0));const hits=ray.intersectObjects(view.scene.children.filter(o=>o.geometry?.attributes?.color));assert.equal(hits[0].object,road,'terrain must not cover road');}
for(const pickup of game.pickups.filter(p=>p.kind==='pad')){const mesh=view.pickupMeshes.get(pickup.id),vertices=mesh.geometry.attributes.position;for(let i=0;i<vertices.count;i++){const v=new T.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(mesh.matrixWorld);ray.set(new T.Vector3(v.x,v.y+10,v.z),new T.Vector3(0,-1,0));const hit=ray.intersectObject(road)[0];assert.ok(hit,'pad above the road');assert.ok(v.y>hit.point.y+.01,'pad corner must not be buried');}}
for(let s=0;s<TRACK_LENGTH;s+=40){const p=trackAt(s),x=p.x+p.nx*6.65,z=p.z+p.nz*6.65;ray.set(new T.Vector3(x,p.y+10,z),new T.Vector3(0,-1,0));const hits=ray.intersectObjects([road,edge]);assert.equal(hits[0].object,edge,'yellow edge line above asphalt');}
// Exercise real camera smoothing, atlas UVs, replay and pickup visibility over a whole lap.
for(let i=0;i<2000;i++){game.distance=i/2000*TRACK_LENGTH;game.lateral=2*Math.sin(i/60);game.time=i/60;view.render(1/60);const car=view.cars[0].car;assert.equal(car.center.y,0);assert.ok(car.position.y>trackAt(game.distance).y+.1);const p=car.position.clone().add(new T.Vector3(0,1.5,0)).project(view.camera);assert.ok(Math.abs(p.x)<.9&&Math.abs(p.y)<1,'actual smoothed camera keeps car visible');}
for(let i=0;i<6;i++){const tex=view.cars[i].car.material.map;assert.equal(tex.repeat.x,1/3);assert.equal(tex.repeat.y,1/2);assert.equal(tex.offset.x,i%3/3);assert.equal(tex.offset.y,Math.floor(i/3)===0?.5:0);}
const fresh=new KartGame(game.pack);view.setGame(fresh);view.render(.016);assert.equal(view.game,fresh);assert.ok(renders>2000);view.dispose();console.log('PASS actual KartView scene: 6 sprite UV regions, hill-aligned pad corners/road edges, terrain occlusion rays, 2000 smoothed chase-camera updates, wheel baseline, replay. GPU rasterization is not tested.');
