export const W = 400, H = 800, PLAYER_Y = 690;
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function segmentHit(ax, ay, bx, by, cx, cy, r) {
  const dx=bx-ax, dy=by-ay, length=dx*dx+dy*dy;
  const t=length?clamp(((cx-ax)*dx+(cy-ay)*dy)/length,0,1):0;
  return Math.hypot(ax+dx*t-cx,ay+dy*t-cy)<=r ? t : null;
}
const TYPES = {
  grunt:{hp:2,speed:22,r:13,damage:8,color:'#ae8bfb'},
  runner:{hp:1,speed:47,r:10,damage:7,color:'#fcb85b'},
  brute:{hp:15,speed:13,r:26,damage:24,color:'#69d6ef'},
  splitter:{hp:5,speed:21,r:18,damage:12,color:'#92f596'},
  shard:{hp:1,speed:57,r:8,damage:5,color:'#b0ff8f'},
  boss:{hp:480,speed:0,r:57,damage:100,color:'#ff747e'}
};
export class SiegeGame {
  constructor(pack,{random=Math.random,onEvent=()=>{}}={}) {
    this.pack=pack;this.rng=random;this.event=onEvent;this.mode='play';
    this.time=0;this.power=1;this.hp=100;this.score=0;this.kills=0;this.correct=0;this.answered=0;
    this.player={x:200,targetX:200,angle:0};this.aim=null;this.aimTTL=0;
    this.enemies=[];this.shots=[];this.orbs=[];this.particles=[];this.rings=[];this.labels=[];
    this.queue=[];this.gate=null;this.gateIndex=0;this.nextGate=0;this.totalGates=8;
    this.deck=[];this.missed=new Map();this.fireClock=0;this.jam=0;this.combo=0;this.comboClock=0;
    this.shake=0;this.flash=0;this.bossStarted=false;this.bossTime=0;this.boss=null;this.bossAttack=0;this.warning=null;
    this.stats={fired:0,hits:0,breaches:0,wrong:0};this.serial=0;this.newGate();
  }
  shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){let j=Math.floor(this.rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  newGate(){
    if(!this.deck.length)this.deck=this.shuffle(this.pack);
    const target=this.deck.pop();
    const norm=s=>s.replace(/[\s（）()・、，,;；。]/g,'');
    let candidates=this.pack.filter(e=>e.word!==target.word&&norm(e.meaning)!==norm(target.meaning));
    if(!candidates.length)candidates=this.pack.filter(e=>e.word!==target.word);
    const other=candidates[Math.floor(this.rng()*candidates.length)];
    const side=this.rng()<.5?0:1, operations=[['+',1],['×',2],['+',2],['×',2],['+',3],['×',2],['+',4],['×',2]];
    this.gate={target,words:side===0?[target,other]:[other,target],side,age:0,duration:5.5,intent:false,operation:operations[this.gateIndex],y:340};
    this.event('question',this.gate);
  }
  moveTo(x){this.player.targetX=clamp(x,38,362);if(this.gate)this.gate.intent=true;}
  chooseLane(side){this.moveTo(side===0?105:295);this.aim=null;}
  aimTo(x,y){this.aim={x:clamp(x,12,388),y:clamp(y,130,640)};}
  resolveGate(){
    const g=this.gate;
    const side=Math.abs(this.player.x-200)<18?-1:(this.player.x<200?0:1);
    const correct=g.intent&&side===g.side;
    const before=this.power;
    this.answered++;
    if(correct){
      this.correct++;this.power=clamp(g.operation[0]==='×'?this.power*g.operation[1]:this.power+g.operation[1],1,24);
      this.hp=Math.min(100,this.hp+5);this.score+=200;this.burst(this.player.x,PLAYER_Y-30,'#f3d788',28,'star');
      this.event('correct',{word:g.target.word,meaning:g.target.meaning,before,power:this.power});
    }else{
      this.power=Math.max(1,Math.floor(this.power/2));this.jam=1.5;this.stats.wrong++;
      this.missed.set(g.target.word,g.target);this.damage(12,'単語ゲート');
      this.event('wrong',{word:g.target.word,meaning:g.target.meaning,before,power:this.power,unanswered:!g.intent||side===-1});
    }
    this.gate=null;this.gateIndex++;this.nextGate=this.time+3.4;
    this.spawnWave(this.gateIndex);if(this.hp<=0)this.end(false,'単語ゲートで砦の耐久が尽きた');
  }
  makeEnemy(type,x,y){
    const a=TYPES[type];const e={...a,maxHp:a.hp,type,x,y,baseX:x,id:++this.serial,t:0,hit:0,phase:this.rng()*6.28,dead:false,stage:0};
    this.enemies.push(e);return e;
  }
  spawnWave(wave){
    const count=14+wave*4;
    for(let i=0;i<count;i++){
      let type='grunt';
      if(wave>=2&&i%6===0)type='runner';
      if(wave>=3&&i%11===0)type='brute';
      if(wave>=5&&i%9===0)type='splitter';
      const column=i%7,row=Math.floor(i/7);
      this.queue.push({at:this.time+row*.55,type,x:55+column*48+(this.rng()-.5)*9,y:150-row*4});
    }
  }
  damage(amount,reason){
    if(this.mode!=='play')return;
    this.hp=Math.max(0,this.hp-amount);this.shake=.35;this.flash=.3;this.combo=0;
    this.event('damage',{amount,reason});if(this.hp<=0)this.end(false,reason);
  }
  burst(x,y,color,count,kind='chip'){
    for(let i=0;i<count;i++){const a=this.rng()*Math.PI*2,s=25+this.rng()*120;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.35+this.rng()*.45,max:.8,color,size:2+this.rng()*5,spin:this.rng()*8,angle:0,kind});}
  }
  kill(e){
    if(e.dead)return;e.dead=true;this.kills++;this.combo++;this.comboClock=1.1;
    this.score+=e.type==='brute'?90:e.type==='boss'?2000:20;
    if(e.type==='splitter'){
      this.rings.push({x:e.x,y:e.y,r:10,life:.4,color:e.color});
      this.makeEnemy('shard',clamp(e.x-15,30,370),e.y);this.makeEnemy('shard',clamp(e.x+15,30,370),e.y);
      this.burst(e.x,e.y,e.color,12,'glow');
    }else if(e.type==='brute'||e.type==='boss'){
      this.shake=.18;this.rings.push({x:e.x,y:e.y,r:15,life:.6,color:e.color});this.burst(e.x,e.y,e.color,28,'chip');
    }else if(e.type==='runner'||e.type==='shard')this.burst(e.x,e.y,e.color,9,'streak');
    else this.burst(e.x,e.y,e.color,10,'chip');
    this.event('kill',{type:e.type});
    if(e.type==='boss')this.end(true,'魔王ゴーレムを撃破');
  }
  startBoss(){
    this.bossStarted=true;this.bossTime=0;this.boss=this.makeEnemy('boss',200,150);this.bossAttack=3;
    this.event('boss',{});
  }
  volley(){
    const p=this.player;
    let angle=this.aim?Math.atan2(this.aim.x-p.x,PLAYER_Y-36-this.aim.y):0;
    angle=clamp(angle,-1.4,1.4);p.angle=angle;
    for(let i=0;i<this.power;i++){
      const offset=(i-(this.power-1)/2)*Math.min(7,84/this.power);
      const originX=p.x+offset,originY=PLAYER_Y-36;
      const a=this.aim?clamp(Math.atan2(this.aim.x-originX,originY-this.aim.y),-1.4,1.4):angle+offset*.0012;
      this.shots.push({x:originX,y:originY,px:originX,py:originY,vx:Math.sin(a)*650,vy:-Math.cos(a)*650,damage:1,r:3,life:1.25});
      this.stats.fired++;
    }
    this.event('fire',{power:this.power});
  }
  update(dt){
    if(this.mode!=='play')return;
    dt=Math.min(dt,.04);this.time+=dt;
    this.player.x+=(this.player.targetX-this.player.x)*Math.min(1,dt*16);
    this.shake=Math.max(0,this.shake-dt);this.flash=Math.max(0,this.flash-dt);
    this.jam=Math.max(0,this.jam-dt);
    this.comboClock-=dt;if(this.comboClock<=0)this.combo=0;
    if(this.gate){this.gate.age+=dt;this.gate.y=340+(this.gate.age/this.gate.duration)*310;if(this.gate.age>=this.gate.duration)this.resolveGate();}
    else if(this.gateIndex<this.totalGates&&this.time>=this.nextGate)this.newGate();
    else if(this.gateIndex>=this.totalGates&&!this.bossStarted&&this.time>=this.nextGate+2)this.startBoss();
    for(let i=this.queue.length-1;i>=0;i--)if(this.queue[i].at<=this.time){let e=this.queue.splice(i,1)[0];this.makeEnemy(e.type,e.x,e.y);}
    this.fireClock+=dt;if(this.jam<=0&&this.fireClock>=.17){this.fireClock=0;this.volley();}
    const movement=this.gate?.55:1;
    for(const e of this.enemies){
      if(e.dead)continue;e.t+=dt;e.hit=Math.max(0,e.hit-dt);
      if(e.type==='boss'){
        this.bossTime+=dt;e.x=200+Math.sin(e.t*.7)*112;e.y=150+this.bossTime*9;
        const stage=e.hp<e.maxHp*.33?2:e.hp<e.maxHp*.66?1:0;
        if(stage>e.stage){e.stage=stage;this.spawnWave(4);this.event('bossRage',{stage});}
        this.bossAttack-=dt;
        if(this.bossAttack<.85&&!this.warning)this.warning={x:this.player.x,life:.85};
        if(this.bossAttack<=0){
          const tx=this.warning?.x??this.player.x;
          for(let k=-1;k<=1;k++){const a=Math.atan2(tx+k*45-e.x,PLAYER_Y-e.y);this.orbs.push({x:e.x,y:e.y+35,vx:Math.sin(a)*210,vy:Math.cos(a)*210,r:10});}
          this.bossAttack=2.8-stage*.35;this.warning=null;
        }
        if(e.y>600)this.end(false,'魔王が砦に到達した');
      }else{
        e.y+=e.speed*dt*movement;
        if(e.type==='runner'||e.type==='shard')e.x=clamp(e.baseX+Math.sin(e.t*3+e.phase)*24,25,375);
        if(e.y>=PLAYER_Y-25){e.dead=true;this.stats.breaches++;this.burst(e.x,e.y,'#ff756b',9);this.damage(e.damage,'敵が防衛ラインを突破');}
      }
    }
    for(let i=this.shots.length-1;i>=0;i--){
      const b=this.shots[i];b.px=b.x;b.py=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
      let hit=null,nearest=Infinity;
      for(const e of this.enemies){if(e.dead)continue;const t=segmentHit(b.px,b.py,b.x,b.y,e.x,e.y,e.r+b.r);if(t!==null&&t<nearest){nearest=t;hit=e;}}
      if(hit){hit.hp-=b.damage;hit.hit=.075;this.stats.hits++;if(hit.type!=='boss'&&hit.type!=='brute')hit.y-=1.4;
        if(hit.hp<=0)this.kill(hit);else if(this.rng()<.35)this.burst(b.x,b.y,'#ffe3a9',2,'spark');
        this.shots.splice(i,1);
      }else if(b.y<100||b.x<-30||b.x>430||b.life<=0)this.shots.splice(i,1);
    }
    for(let i=this.orbs.length-1;i>=0;i--){const b=this.orbs[i];b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(Math.hypot(b.x-this.player.x,b.y-PLAYER_Y)<29){this.orbs.splice(i,1);this.damage(12,'魔王の弾に命中');}
      else if(b.y>780||b.x<-30||b.x>430)this.orbs.splice(i,1);
    }
    this.enemies=this.enemies.filter(e=>!e.dead);
    for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=85*dt;p.life-=dt;p.angle+=p.spin*dt;}
    this.particles=this.particles.filter(p=>p.life>0).slice(-600);
    for(const r of this.rings){r.r+=110*dt;r.life-=dt;}this.rings=this.rings.filter(r=>r.life>0);
  }
  end(win,reason){if(this.mode!=='play')return;this.mode=win?'won':'lost';this.event('end',{win,reason});}
}
