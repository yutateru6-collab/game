import {loadWords,saveWords,SAMPLE} from './word-store.js';
import {readWords} from './vocab.js';
import {uniquePairs} from './memory-engine.js';
const $=id=>document.getElementById(id),input=$('words'),error=$('error'),count=$('wordCount');
const routes={memory:'memory.html',tank:'tank.html',bomb:'bomb.html',factory:'factory.html',maze:'maze.html'};
input.value=loadWords();
function update(){const p=readWords(input.value);count.textContent=p.errors.length?'単語セットを確認しよう':p.entries.length+'語であそぶ';$('wordPreview').textContent=p.errors.length?p.errors[0]:p.entries.slice(0,3).map(p=>p.word).join('・');$('saved').textContent='';}
function openEditor(){const editor=$('wordEditor');editor.open=true;editor.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});input.focus({preventScroll:true});}
function showError(message){error.textContent=message;input.setAttribute('aria-invalid','true');openEditor();}
function validFor(game,entries){return !['memory','factory','maze'].includes(game)||uniquePairs(entries).length>=4;}
function save(){const p=saveWords(input.value);if(p.errors.length){showError(p.errors[0]);return false;}error.textContent='';input.removeAttribute('aria-invalid');$('saved').textContent=p.entries.length+'語を保存しました。上のゲームで遊べます。';return true;}
input.addEventListener('input',()=>{error.textContent='';input.removeAttribute('aria-invalid');update();});update();
$('editWords').onclick=openEditor;$('saveWords').onclick=save;
$('sample').onclick=()=>{input.value=SAMPLE;error.textContent='';input.removeAttribute('aria-invalid');update();$('saved').textContent='サンプルを入れました。「この単語を保存」で確定します。';};
for(const button of document.querySelectorAll('[data-game]'))button.onclick=()=>{const p=readWords(input.value);if(p.errors.length){showError(p.errors[0]);return;}let game=button.dataset.game;if(game==='random'){const eligible=Object.keys(routes).filter(g=>validFor(g,p.entries));game=eligible[Math.floor(Math.random()*eligible.length)];}if(!routes[game])return;if(!validFor(game,p.entries)){showError('このゲームには、異なる訳の単語を4組以上入れてください。');return;}if(!save())return;location.href=routes[game];};

try{const n=Number(localStorage.getItem('party-stars-v1'))||0;const badge=document.createElement('p');badge.className='home-hint';badge.textContent='★ 集めたスター '+n+' 個';document.querySelector('.section-heading').before(badge);}catch{}
