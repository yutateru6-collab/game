const norm=s=>s.replace(/[\s（）()・、，,;；。]/g,'');
export class BombGame{
 constructor(pack,{random=Math.random}={}){this.pack=pack;if(pack.length<4||new Set(pack.map(p=>norm(p.meaning))).size<2)throw Error('異なる訳を含む4組以上の単語が必要です。');this.random=random;this.deck=[];this.truthDeck=[];this.round=0;this.stars=[0,0];this.correct=0;this.answered=0;this.streak=0;this.bestStreak=0;this.score=0;this.review=new Map();this.owner=0;this.nextRound();}
 shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 question(){if(!this.deck.length)this.deck=this.shuffle(this.pack);if(!this.truthDeck.length)this.truthDeck=this.shuffle([true,true,true,false,false,false]);const entry=this.deck.pop(),truth=this.truthDeck.pop();const others=this.pack.filter(p=>norm(p.meaning)!==norm(entry.meaning));this.q={entry,meaning:truth?entry.meaning:others[Math.floor(this.random()*others.length)].meaning,truth};}
 nextRound(){this.round++;this.total=16+this.random()*6;this.fuse=this.total;this.phase='ready';this.delay=2;this.owner=this.round%2===1?0:1;this.feedback='';this.boomOwner=null;this.question();}
 beginTurn(){if(this.owner===0){this.phase='player';this.question();}else{this.phase='cpu';this.delay=1.2+this.random()*1.5;this.cpuCorrect=this.random()<.78;}}
 answer(value){if(this.phase!=='player'||typeof value!=='boolean')return null;this.answered++;const correct=value===this.q.truth;if(correct){this.correct++;this.streak++;this.bestStreak=Math.max(this.bestStreak,this.streak);this.score+=100+Math.min(this.streak-1,4)*20;this.feedback='正解！ パス！';this.pass();}else{this.streak=0;this.review.set(this.q.entry.word,this.q.entry);this.feedback=`${this.q.entry.word} ＝ ${this.q.entry.meaning}`;this.phase='wrong';this.delay=1.35;}return correct;}
 pass(){this.from=this.owner;this.owner=1-this.owner;this.phase='pass';this.delay=.4;}
 explode(){this.boomOwner=this.owner;this.stars[1-this.owner]++;if(this.owner===0&&this.q)this.review.set(this.q.entry.word,this.q.entry);this.phase='round';this.delay=0;this.feedback=this.owner===0?'あなたのところで、ドカン！':'CPUのところで、ドカン！';}
 continue(){if(this.phase!=='round')return false;if(this.stars.some(n=>n>=3)){this.phase='done';this.win=this.stars[0]>=3;}else this.nextRound();return true;}
 tick(dt){if(!Number.isFinite(dt)||dt<=0||['done','round'].includes(this.phase))return;dt=Math.min(dt,.1);if(this.phase==='ready'){this.delay-=dt;if(this.delay<=0)this.beginTurn();return;}
 this.fuse=Math.max(0,this.fuse-dt);if(this.fuse<=0){this.explode();return;}
 if(this.phase==='player')return;this.delay-=dt;if(this.delay>0)return;
 if(this.phase==='pass')this.beginTurn();else if(this.phase==='wrong')this.beginTurn();else if(this.phase==='cpu'){if(this.cpuCorrect){this.feedback='CPUが正解！';this.pass();}else{this.feedback='CPUが間違えた！';this.phase='cpuWrong';this.delay=1.2;}}else if(this.phase==='cpuWrong')this.beginTurn();
 }
}
