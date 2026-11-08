import {storyScene} from './story-scenes.js';
import {dialogueView} from './events.js';
import {episodeLabel} from './story-episodes.js';
import {isBook} from './story-book.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function dialogueSample(s){
 const names=['もちまる','ダッシュ','はかせ'],variant=['mochi','dash','hakase'].indexOf(s.characterId);
 return {id:'ui-sample',title:'ひまわりの会話サンプル',characters:[{id:'player',name:names[variant]||names[0],variant:Math.max(0,variant)},{id:'rat',name:'ネズミ',variant:null},{id:'trainer',name:'トレーナー',variant:null}],lines:[
  {speakerId:'player',text:['いつか、ネズミさんといっしょに走りたいな。','ネズミさんと、同じレースを走ってみたい！','ネズミさんの走りを、もっと知りたいな。'][variant]||'いつか、いっしょに走りたいな。',expressions:{player:'happy'}},
  {speakerId:'rat',text:'こんにちは。今日は、練習の日かな？'},
  {speakerId:'trainer',text:'あわてず、一歩ずつ進んでいこう。'},
  {speakerId:null,text:'これは表示確認用の会話です。ネズミの台詞と立ち絵は仮のもので、本編の確定内容ではありません。'},
  {speakerId:'player',text:'これから、何をしてみよう？',expressions:{player:'normal'}}
 ],choices:[{id:'run',label:'走る練習を考える'},{id:'rest',label:'ひと息つく'}]};
}
// Which story this is (#30, owner 2026-10-26): 「本編 第12話」 on the first line, the title below it.
function kicker(s,v){
 const p=s.events.pending,label=episodeLabel(p.id,s.storyVersion??3,isBook(s));
 if(v.mode==='preview'&&!p.album)return '<p class="conversation-kicker">会話サンプル・仮の台詞 / 能力値は変化しません</p>';
 const note=v.mode==='preview'?'<small class="kicker-note">図鑑・読み返し（能力は変わりません）</small>':'';
 return `<p class="conversation-kicker episode-kicker">${note}<span class="kicker-episode">${esc(label||'STORY')}</span><span class="kicker-title">${esc(v.title)}</span></p>`;
}
export function dialogueMarkup(s){
 const v=dialogueView(s);if(!v)return '';const place=storyScene({...s.events.pending,scene:v.scene||s.events.pending.scene},s.turn);
 return `<div class="conversation conversation-theatre" data-dialogue-token="${esc(v.token)}">${kicker(s,v)}<div class="conversation-place">${esc(place.name)}</div><div class="conversation-stage" data-scene="${esc(place.scene)}"><canvas class="intro-stage story-stage" width="768" height="432" data-story-scene="${esc(place.scene)}" data-story-speaker="${esc(v.speakerId||'')}" aria-label="${esc(place.name)}：話し手と相手のシーン"></canvas><section class="conversation-window" aria-label="会話本文"><div class="conversation-caption"><strong id="conversation-name">${esc(v.speakerName)}</strong><small>${v.cursor+1} / ${v.total}</small></div><div class="conversation-live" aria-live="polite" aria-atomic="true"><span class="sr-only">${esc(v.speakerName)}：</span><p id="conversation-text">${esc(v.text)}</p></div><div class="conversation-controls">${v.choices.length?`<div class="conversation-choices" role="group" aria-label="会話の選択肢">${v.choices.map(c=>`<button class="secondary" data-dialogue-choice="${esc(c.id)}" data-dialogue-token="${esc(v.token)}">${esc(c.label)}</button>`).join('')}</div>`:`<button class="primary" data-action="dialogue-next" data-dialogue-token="${esc(v.token)}">${v.last?'会話を終える':'つぎへ'} <span aria-hidden="true">▼</span></button>`}</div></section></div><button class="conversation-later" data-action="close">あとで読む（続きは保存されます）</button></div>`;
}
