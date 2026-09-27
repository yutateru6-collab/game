export const normalizeMeaning=s=>s.replace(/[\s（）()・、，,;；。]/g,'');
export function uniquePairs(pack){const words=new Set(),meanings=new Set();return pack.filter(p=>{const w=p.word.toLowerCase(),m=normalizeMeaning(p.meaning);if(words.has(w)||meanings.has(m))return false;words.add(w);meanings.add(m);return true;});}
export class MemoryGame{
 constructor(pack,{random=Math.random}={}){this.pack=uniquePairs(pack);if(this.pack.length<4)throw Error('宝箱には、異なる訳の単語を4組以上入れてください。');this.random=random;this.deck=this.shuffle(this.pack);this.cursor=0;this.round=0;this.score=0;this.combo=0;this.bestCombo=0;this.moves=0;this.mistakes=0;this.matches=0;this.hints=0;this.remaining=90;this.review=new Map();this.nextRound();}
 shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 nextRound(){this.round++;const n=Math.min(this.pack.length,this.round+3);this.pairs=[];for(let i=0;i<n;i++)this.pairs.push(this.deck[this.cursor++%this.deck.length]);this.cards=this.shuffle(this.pairs.flatMap((p,i)=>[{pair:i,kind:'word',text:p.word},{pair:i,kind:'meaning',text:p.meaning}])).map((c,i)=>({...c,id:i,matched:false}));this.selected=[];this.phase='preview';this.delay=7;this.hintUsed=false;this.hintTime=0;this.lastMatch=null;this.lastOutcome=null;}
 begin(){if(this.phase==='preview'){this.phase='play';this.delay=0;}}
 flip(id){if(this.phase!=='play'||this.hintTime>0)return false;const c=this.cards[id];if(!c||c.matched||this.selected.includes(id))return false;this.selected.push(id);if(this.selected.length===2){this.moves++;const a=this.cards[this.selected[0]],b=this.cards[this.selected[1]];this.phase='resolve';if(a.pair===b.pair&&a.kind!==b.kind){a.matched=b.matched=true;this.matches++;this.combo++;this.bestCombo=Math.max(this.bestCombo,this.combo);this.score+=100+Math.min(this.combo-1,4)*25;this.lastMatch=this.pairs[a.pair];this.lastOutcome='match';this.delay=.65;}else{this.combo=0;this.mistakes++;this.lastOutcome='miss';this.delay=1.15;for(const card of[a,b]){const pair=this.pairs[card.pair];this.review.set(pair.word,pair);}}}return true;}
 peek(){if(this.phase!=='play'||this.hintUsed||this.selected.length)return false;this.hintUsed=true;this.hintTime=3;this.hints++;this.combo=0;this.score=Math.max(0,this.score-50);return true;}
 visible(c){return this.phase==='preview'||this.phase==='done'||this.hintTime>0||c.matched||this.selected.includes(c.id);}
 tick(dt){if(!Number.isFinite(dt)||dt<=0||this.phase==='done')return;
 if(this.phase==='preview'){this.delay=Math.max(0,this.delay-dt);if(!this.delay)this.begin();return;}
 if(this.phase==='between'){this.delay-=dt;if(this.delay<=0)this.nextRound();return;}
 this.remaining=Math.max(0,this.remaining-dt);this.hintTime=Math.max(0,this.hintTime-dt);
 if(this.remaining===0){this.finish(this.round===3&&this.cards.every(c=>c.matched));return;}
 if(this.phase==='resolve'){this.delay-=dt;if(this.delay<=0){this.selected=[];if(this.cards.every(c=>c.matched)){if(this.round===3)this.finish(true);else{this.phase='between';this.delay=1.5;}}else this.phase='play';}}
 }
 finish(win){this.phase='done';this.win=win;if(win)this.score+=Math.ceil(this.remaining)*5;else for(const c of this.cards)if(!c.matched){const p=this.pairs[c.pair];this.review.set(p.word,p);}}
}
