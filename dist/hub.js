import {loadWords,saveWords,SAMPLE} from './word-store.js';
import {readWords} from './vocab.js';
import {uniquePairs} from './memory-engine.js';
const input=document.querySelector('#words'),error=document.querySelector('#error'),count=document.querySelector('#wordCount');input.value=loadWords();
function update(){const p=readWords(input.value);count.textContent=p.errors.length?'4組以上の単語と訳を入力':p.entries.length+'語をセット中';}
input.addEventListener('input',update);update();
document.querySelector('#sample').onclick=()=>{input.value=SAMPLE;error.textContent='';update();};
for(const button of document.querySelectorAll('[data-game]'))button.onclick=()=>{const p=saveWords(input.value);if(!p.errors.length&&button.dataset.game==='memory'&&uniquePairs(p.entries).length<4)p.errors.push('宝箱には、異なる訳の単語を4組以上入れてください。');if(p.errors.length){error.textContent=p.errors[0];document.querySelector('#wordEditor').open=true;input.focus();return;}location.href=button.dataset.game==='memory'?'memory.html':'tank.html';};
