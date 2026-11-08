// The talks of 夏合宿 and 年ごとのできごと (#30, owner 2026-11-08). Every hero line is written three ways
// (ダッシュ, はかせ, もちまる, as said() in the other story files).
import {yearEventOf,campPlaceOf,CAMP_PLACES,OMIKUJI,omikujiDraw,keyName} from './year-events.js';
const said=(s,a,b,c)=>s.personalityId==='energetic'?a:s.personalityId==='cool'?b:c;
const L=(speakerId,text,visibleIds,expressions)=>({speakerId,text,...(visibleIds?{visibleIds}:{}),...(expressions?{expressions}:{})});
const pt=['player','trainer'],pr=['player','rival'];

// 今年のできごと, told at the start of each year.
export function yearLines(s,year){
 const e=yearEventOf(s,year);if(!e)return [];
 return [
  L(null,`${year}年目のはじめ。こよりが、ノートの表紙に小さな札をはさんだ。`,pt),
  L('trainer',`種屋さんに聞いたんだけど、今年は「${e.name}」なんだって。`,pt),
  L('trainer',e.say,pt),
  L('player',said(s,'へえ！ じゃあ、それをうまく使ってやるぜ！','その年に合わせて、練習を組み立てましょう。','そうなんだぁ。……いい年になるといいねぇ。'),pt),
  L(null,`こよりはノートのすみに書き足した。「${e.name}：${e.info}」`,pt)
 ];
}

// 夏合宿: setting off (with the choice of where), a day with Potechi there, and the morning they leave.
export const CAMP_CHOICES=CAMP_PLACES.map(p=>({id:p.id,label:`${p.name}（${p.keys.map(keyName).join('・')}がよく伸びる）`}));
export function campStartLines(s,year){
 return [
  L(null,year===2?'2年目の夏。こよりが、大きな地図を机いっぱいに広げた。':'3年目の夏。こよりが、去年の地図をもう一度広げた。',pt),
  L('trainer',year===2?'夏のあいだ、町を離れて合宿しよう。4回ぶん、いつもより思いきり練習できるよ。':'最後の夏だね。今年も合宿に行こう。代表決定戦の前の、いちばん大事な4回だよ。',pt),
  L('trainer','行き先は三つ。海なら、砂浜を走って足腰をきたえる。山なら、坂道と岩場でねばり強く。森なら、静かな小屋で勉強して、木の実もたっぷり。',pt),
  L('player',said(s,'どこでもいいぜ！ 全部、強くなるためだ！','行き先で、伸びる力が変わりますね。よく考えて選びます。','どこがいちばん、ごはんがおいしいかなぁ……。'),pt),
  L('trainer','合宿のあいだは、町には行けないからね。どこにする？',pt)
 ];
}
export function campAnswerLines(s,place){
 return {
  sea:[L(null,'潮の香りのする合宿所に着いた。目の前は、どこまでも続く砂浜だった。',pt),
   L('player',said(s,'砂浜ダッシュだ！ 足がとられても、負けねえ！','砂の上は、一歩ごとに力が逃げます。だから鍛えられるんですね。','わぁ、海だぁ……。貝がら、食べられる？'),pt),
   L('trainer','食べられないよ。……さあ、砂浜ダッシュから始めよう！',pt,{trainer:'happy'})],
  mountain:[L(null,'山の合宿所は、朝の空気が冷たかった。宿の前から、細い坂道が上へ続いている。',pt),
   L('player',said(s,'この坂、全部のぼってやる！','岩場は、足の置き方が大事ですね。迷路の練習にもなりそうです。','坂道……。てっぺんに、おいしいものある？'),pt),
   L('trainer','てっぺんで、お弁当にしよう。それまでは、がんばって。',pt,{trainer:'happy'})],
  forest:[L(null,'森の合宿所は、木の葉の音しか聞こえなかった。小屋の机には、古い本が積んである。',pt),
   L('player',said(s,'静かすぎて落ち着かねえ……でも、やるぜ！','勉強には、ちょうどいい静けさです。','木の実が、いっぱい落ちてるよぉ……！'),pt),
   L('trainer','勉強と、木の実の早食い。どっちも、ここならたっぷりできるね。',pt,{trainer:'happy'})]
 }[place.id];
}
export function campMidLines(s,year){
 const place=campPlaceOf(s,year);if(!place)return [];
 const last=year===3?[L('rival','これが、最後の夏の合宿だね。……代表決定戦で、会おうね。',pr)]:[];
 return {
  sea:[L(null,'合宿の三日目。砂浜に、見覚えのある足あとが続いていた。',pr),
   L('rival','あ、きみだ。ぼくも、ここで合宿してるの。海の種、しょっぱくておいしいよ。',pr,{rival:'happy'}),
   L('player',said(s,'ぽてちもかよ！ じゃあ、砂浜で勝負だ！','偶然ですね。……では、砂浜を一本、競いましょう。','ぽてちだぁ。……海の種、ぼくにもちょうだい。'),pr),...last,
   L(null,'波打ちぎわを、2匹の足あとが並んで続いた。',pr)],
  mountain:[L(null,'合宿の三日目。坂道の途中で、ぽてちが岩に座って休んでいた。',pr),
   L('rival','やっほー。山の上の種屋さん、どこか知らない？ もう三回、道に迷ったの。',pr),
   L('player',said(s,'山に種屋はねえよ！ ……てっぺんまで一緒に行くか！','……地図を見せましょうか。一緒に登りましょう。','いっしょに登ろう。てっぺんで、お弁当わけてあげる。'),pr),...last,
   L(null,'てっぺんで食べたお弁当は、いつもの倍おいしかった。',pr)],
  forest:[L(null,'合宿の三日目。森の小屋の窓から、ぽてちがのぞいていた。',pr),
   L('rival','ここ、木の実の早食い大会があるって聞いたの。……ないの？',pr),
   L('player',said(s,'ねえよ！ ……でも、二匹でやればあるのと同じだな！','開催はされていません。……ですが、二匹でやれば成立します。','ないけど……二匹でやろうよぉ。'),pr),...last,
   L(null,'その日の夕方、森の小屋の前で、小さな早食い大会が開かれた。',pr)]
 }[place.id];
}
// Year 3's camp, after ネズミの昔話: the Rat's family trains at the same place each summer (a visit the town cannot give
// during the camp, so ネコとネズミ keeps its pace).
export function campRatLines(s){
 const place=campPlaceOf(s,3);if(!place)return [];const pr2=['player','rat'];
 const meet=said(s,'ネズミさん！ 一緒に走らせてくれ！','偶然……ではないんですね。一本、お願いします。','ネズミさんだぁ。朝ごはんの前に、いっしょに走ろぉ。');
 return {
  sea:[L(null,'合宿の二日目。夜明けの砂浜を、小さな影が走っていた。',pr2),
   L('rat','やあ。……ぼくの一族の夏の合宿所も、この浜なんだ。父さんの代から、ずっと。',pr2,{rat:'happy'}),L('player',meet,pr2),
   L('rat','百段のかわりに、波打ちぎわを十本。……ついてこられたら、ね。',pr2),
   L(null,'朝日が昇るころ、砂浜には大きさのちがう足あとが、二本並んでいた。',pr2)],
  mountain:[L(null,'合宿の二日目。夜明けの山道で、小さな影が岩から岩へ跳んでいた。',pr2),
   L('rat','やあ。……ぼくの一族は、夏はこの山で走るんだ。父さんの代から、ずっと。',pr2,{rat:'happy'}),L('player',meet,pr2),
   L('rat','岩場は、一歩目が大事だよ。……低く、ね。',pr2),
   L(null,'山のてっぺんで、二匹の白い息がまざった。',pr2)],
  forest:[L(null,'合宿の二日目。夜明けの森で、小さな影が木の根をよけながら走っていた。',pr2),
   L('rat','やあ。……ぼくの一族は、夏はこの森で走るんだ。父さんの代から、ずっと。',pr2,{rat:'happy'}),L('player',meet,pr2),
   L('rat','根っこの多い道は、足もとを見すぎないこと。……前を見て、ね。',pr2),
   L(null,'木もれ日の中を、二匹の足音が並んで抜けていった。',pr2)]
 }[place.id];
}
export function campEndLines(s,year){
 const place=campPlaceOf(s,year);if(!place)return [];
 return [
  L(null,`${year}年目の夏が終わる。${place.place}を出る朝、こよりがノートをめくった。`,pt),
  L('trainer',`4回ぶん、ちゃんと書いてあるよ。${place.keys.map(keyName).join('も')}も、いっぱい伸びたね。`,pt,{trainer:'happy'}),
  L('player',said(s,'へへっ、町に帰ったら、みんなに見せてやる！','合宿の記録は、あとで見返します。いい夏でした。','帰ったら、種屋さんの種がたべたいなぁ。'),pt),
  ...(year===3?[L('trainer','……次の夏は、もう合宿じゃないね。代表決定戦、がんばろう。',pt)]:[]),
  L(null,'帰りの道は、来たときより少しだけ短く感じた。',pt)
 ];
}

// お正月のおみくじ.
export function omikujiLines(s,year){
 const o=omikujiDraw(s,year),bad=o.id==='kyo';
 return [
  L(null,`${year}年目のお正月。神社の石段は、初詣の動物たちでにぎわっていた。`,pt),
  L('trainer','おみくじ、引いてみる？',pt),
  L('player',said(s,'当然だ！ 大吉しか出ねえぜ！','運も、記録しておきましょう。','おみくじって、食べられる？'),pt),
  L(null,'がらがらと箱を振ると、細い棒が一本、ころんと出てきた。',pt),
  L(null,`「${o.name}」。`,pt),
  L('trainer',o.say,pt,bad?{trainer:'worried'}:{trainer:'happy'}),
  L('player',bad?said(s,'凶……！？ 上等だ、ここから上がるだけだ！','……結果は結果です。ここから上げていきます。','……凶って、おいしくないやつ？'):said(s,'へへっ、今年も行けるぜ！','いい結果です。でも、油断はしません。','やったぁ。ごほうびに、お餅たべよぉ。'),pt,bad?{player:'sad'}:{player:'happy'}),
  L(null,`こよりはノートのすみに書いた。「おみくじ：${o.name}（${o.info}）」`,pt)
 ];
}
// What each result changes right away (the luck that lasts is read by year-events.js).
export const OMIKUJI_EFFECTS={daikichi:{mood:25},chukichi:{mood:25},shokichi:{energy:10},kichi:{mood:25},suekichi:{energy:15},kyo:{mood:-25}};
export {OMIKUJI};
