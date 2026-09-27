import {uniquePairs} from './memory-engine.js';
export const FISH=[{name:'ソーダフィッシュ',icon:'🐟',size:24},{name:'サンゴバタフライ',icon:'🐠',size:35},{name:'まんまるフグ',icon:'🐡',size:42},{name:'ブルーセイル',icon:'🐟',size:88},{name:'王冠ゴールデン',icon:'🐠',size:120}];
const shuffle=(a,r)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export class FishingGame{
 constructor(entries,rng=Math.random){this.pack=uniquePairs(entries);if(this.pack.length<4)throw Error('異なる訳の単語を4組以上用意してください。');this.rng=rng;this.deck=shuffle(this.pack,rng);this.round=0;this.catches=[];this.misses=[];this.streak=0;this.phase='ready';this.paused=false;}
 next(){if(!['ready','caught','escaped'].includes(this.phase))return false;if(this.round===5){this.phase='done';return true;}this.pair=this.deck[this.round%this.deck.length];this.options=shuffle([this.pair,...shuffle(this.pack.filter(x=>x!==this.pair),this.rng).slice(0,3)],this.rng);this.fish=FISH[this.round];this.round++;this.phase='quiz';this.reason='';this.elapsed=0;this.progress=0;this.tension=25;this.held=false;this.danger=0;return true;}
 answer(index){if(this.paused||this.phase!=='quiz'||!this.options[index])return false;if(this.options[index]!==this.pair){this.misses.push(this.pair);this.escape('えさが合わなかった！');return false;}this.phase='reel';return true;}
 get surge(){return this.elapsed%4.2>=2.5;}
 hold(value){this.held=!!value&&!this.paused&&this.phase==='reel';}
 pause(value){this.paused=value;this.held=false;}
 escape(reason){this.phase='escaped';this.reason=reason;this.held=false;this.streak=0;}
 tick(dt){if(this.phase!=='reel'||this.paused)return;let remaining=Math.min(Math.max(dt,0),.25);while(remaining>0&&this.phase==='reel'){const s=Math.min(remaining,1/120);remaining-=s;this.elapsed+=s;const hard=1+(this.round-1)*.10;
 this.tension=Math.max(0,this.tension+(this.held?(this.surge?49:20)*hard:-43)*s);
 this.progress=Math.max(0,this.progress+(this.held?(this.surge?5:18)/hard:-2.5)*s);
 if(this.tension>80)this.danger+=s;
 if(this.tension>=100){this.escape('糸が切れた！ 暴れたら離そう');break;}
 if(this.elapsed>=22){this.escape('逃げられた！ おとなしい時に巻こう');break;}
 if(this.progress>=100){this.phase='caught';this.held=false;this.streak++;const grade=this.danger<.3?'S':this.danger<1.5?'A':'B';this.catch={...this.fish,grade,size:Math.round(this.fish.size*(grade==='S'?1.25:grade==='A'?1.1:1)),points:grade==='S'?45:grade==='A'?30:20};this.catches.push(this.catch);}
 }}
}
