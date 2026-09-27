import {readWords} from './vocab.js';
export const KEY='vocab-castle-words-v1';
export const SAMPLE='reduce,減らす\naffect,影響を与える\npublish,出版する\ncompete,競う\nexplore,探索する\nrecognize,認識する\nemphasize,強調する\naccompany,同行する\ncrowded,混雑した\nvaluable,貴重な\naccurate,正確な\ngrant,補助金\ndestination,目的地\ncapacity,能力\nproof,証拠\nanniversary,記念日\nfound,設立する\ninclude,含む';
export function loadWords(){try{return localStorage.getItem(KEY)||SAMPLE;}catch{return SAMPLE;}}
export function saveWords(raw){const parsed=readWords(raw);if(parsed.errors.length)return parsed;try{localStorage.setItem(KEY,raw);}catch{parsed.errors.push('単語を保存できません。ブラウザの保存設定を確認してください。');}return parsed;}
