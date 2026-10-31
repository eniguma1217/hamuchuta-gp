import {dialogueView} from './events.js';
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
export function dialogueMarkup(s){
 const v=dialogueView(s);if(!v)return '';
 return `<div class="conversation" data-dialogue-token="${esc(v.token)}"><p class="conversation-kicker">${v.mode==='preview'?'会話サンプル・仮の台詞 / 能力値は変化しません':'STORY / '+esc(v.title)}</p><div class="conversation-cast" aria-label="会話の参加者">${v.characters.map(c=>`<div class="conversation-character ${c.speaking?'is-speaking':'is-listening'}" data-character-id="${esc(c.id)}" data-speaking="${c.speaking}" data-expression="${esc(c.expression)}"><div class="conversation-portrait">${c.variant===null||c.variant===undefined?'<span class="conversation-placeholder" aria-hidden="true"></span><small class="portrait-pending">立ち絵準備中</small>':`<canvas width="66" height="60" data-talk-portrait="${c.variant}" data-expression="${esc(c.expression)}" aria-hidden="true"></canvas>`}</div><span class="conversation-character-name">${esc(c.name)}</span><span class="conversation-speaker-status">${c.speaking?'発言中':'　'}</span></div>`).join('')}</div><section class="conversation-window" aria-label="会話本文"><div class="conversation-caption"><strong id="conversation-name">${esc(v.speakerName)}</strong><small>${v.cursor+1} / ${v.total}</small></div><div class="conversation-live" aria-live="polite" aria-atomic="true"><span class="sr-only">${esc(v.speakerName)}：</span><p id="conversation-text">${esc(v.text)}</p></div><div class="conversation-controls">${v.choices.length?`<div class="conversation-choices" role="group" aria-label="会話の選択肢">${v.choices.map(c=>`<button class="secondary" data-dialogue-choice="${esc(c.id)}" data-dialogue-token="${esc(v.token)}">${esc(c.label)}</button>`).join('')}</div>`:`<button class="primary" data-action="dialogue-next" data-dialogue-token="${esc(v.token)}">${v.last?'会話を終える':'つぎへ'} <span aria-hidden="true">▼</span></button>`}</div></section><button class="conversation-later" data-action="close">あとで読む（続きは保存されます）</button></div>`;
}
