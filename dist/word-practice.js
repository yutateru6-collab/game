const KEY='party-word-practice-v1';
const identity=p=>JSON.stringify([p.word.toLowerCase(),p.meaning]);
function read(){try{const d=JSON.parse(globalThis.localStorage.getItem(KEY)||'{}');return d&&typeof d==='object'&&!Array.isArray(d)?d:{};}catch{return {};}}
export function recordPractice(pair,correct){const data=read(),key=identity(pair),old=data[key],misses=Number.isFinite(old?.misses)?old.misses:0;data[key]={misses:correct?Math.max(0,misses-1):Math.min(10,misses+2),at:Date.now()};const trimmed=Object.fromEntries(Object.entries(data).sort((a,b)=>(b[1]?.at||0)-(a[1]?.at||0)).slice(0,3000));try{globalThis.localStorage.setItem(KEY,JSON.stringify(trimmed));}catch{}}
export function reviewFirst(pack){const data=read();return [...pack].sort((a,b)=>(data[identity(b)]?.misses||0)-(data[identity(a)]?.misses||0));}
