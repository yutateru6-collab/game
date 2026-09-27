export function readWords(text){
 const entries=[],errors=[],seen=new Set();
 text.replace(/^\uFEFF/,'').split(/\r?\n/).forEach((raw,i)=>{const line=raw.trim();if(!line)return;let p=line.split(/\t|,/).map(v=>v.trim()).filter(Boolean);if(p.length>=3&&/^\d+$/.test(p[0]))p=p.slice(1);let word,meaning;
 if(p.length>=2){word=p[0];meaning=p.slice(1).join('、');}else{const m=line.match(/^(?:\d+\s+)?(.+?)\s*[：:]\s*(.+)$/)||line.match(/^(?:\d+\s+)?([A-Za-z][A-Za-z'’\- ]*?)\s+([\u3000-\u9fff].*)$/u);if(m){word=m[1];meaning=m[2];}}
 if(!word||!meaning){errors.push(`${i+1}行目：英単語と訳を区切ってください`);return;}word=word.trim();meaning=meaning.trim();if(!/^[A-Za-z][A-Za-z'’\- ]*$/.test(word)||word.length>32||meaning.length>50){errors.push(`${i+1}行目：単語は32文字、訳は50文字以内で入力してください`);return;}const key=word.toLowerCase();if(seen.has(key))return;seen.add(key);entries.push({word,meaning});});
 if(entries.length<4)errors.push('４組以上の単語と日本語訳が必要です');if(new Set(entries.map(e=>e.meaning.replace(/[\s（）()・、，,;；。]/g,''))).size<2)errors.push('異なる意味の単語を含めてください');return {entries,errors};
}
