import * as Today from './story-today.js';
import {queueEvent} from './events.js';
export const RAT_ID='rat';
export const NPCS=[{id:'rat',name:'ネズミ',favorite:'speed'},{id:'tiger',name:'トラ',favorite:'intelligence'},{id:'rabbit',name:'ウサギ',favorite:null},{id:'dragon',name:'ドラゴン',favorite:'stamina'}];
const variant=s=>['mochi','dash','hakase'].indexOf(s.characterId);
export const individualName=s=>s.individualName||{mochi:'もちまる',dash:'ダッシュ',hakase:'はかせ'}[s.characterId]||'はむちゅたー';
function reaction(s,energetic,cool,hungry){return s.personalityId==='energetic'?energetic:s.personalityId==='cool'?cool:hungry;}
export function trainingReaction(s,outcome,helper,key,helpers){
 if(Today.isToday(s))return Today.trainingReaction(s,outcome,helper,key,helpers);
 if(outcome==='failure')return reaction(s,'足がもつれて、ごろん。「い、今のは地面の調査！」','「失敗は消せません。だから、次の記録に使います」ノートをそっと開いた。','握った種を離せず、ころん。「おやつには勝てなかった……次こそ！」');
 if(helper)return {rat:'ネズミ「力を抜いて。きみの一歩は、きみの速さでいい」',tiger:'トラ「べ、勉強なら怖くない。隣にいてくれる？」',rabbit:'ウサギ「悪くないわね。今の一歩、明日も忘れないでよ」',dragon:'ドラゴン「続けるのがこつじゃ。……今、何周目だったかのう」'}[helper.id];
 return outcome==='great'?reaction(s,'「見た？ 今の一歩！」しっぽまで得意げに揺れた。','「昨日より、少し正確です」口元だけ、ふっとゆるんだ。','「ごはんの前に、もう一歩！」ほっぺも少し誇らしげ。'):reaction(s,'「あの背中に、今日もちょっと近づいた！」','「一歩ぶん、前へ。これでいい」','「よく動いたぶん、ごはんもおいしい。明日も続けよう」');
}
const line=(speakerId,text)=>({speakerId,text});
function cast(s,extra=[]){return [{id:'player',name:individualName(s),variant:variant(s)},{id:RAT_ID,name:'ネズミ',variant:null},...extra];}
export function endingDefinition(s){
 if(Today.isToday(s))return Today.endingDefinition(s);
 const name=individualName(s),success=s.ending==='zodiac_member',characters=cast(s,[{id:'friend',name:'小さなはむちゅたー',variant:0},{id:'crowd',name:'見守ってきた仲間',variant:null},{id:'announcer',name:'司会',variant:null}]);
 let lines;
 if(success)lines=[
  line(null,`掲示板の12の枠に、${name}の名前があった。いつもの小さな体。いつもの短い足。けれど、見つめる目が少し変わっていた。`),
  line('announcer','新たに十二支となった、12匹を紹介します！'),
  ...s.lastRace.standings.slice(0,12).filter(x=>x.id!=='player').map((x,i)=>({...line('announcer',x.species+'！'),callSpecies:x.species,callIndex:i+1})),
  line('friend','あの子、ぼくらと同じ、はむちゅたーだったよね。'),
  line('crowd','うん。毎日、転んでもまた走っていた子だよ。'),
  line('friend','ぼくも……あんなハムスターになりたい。'),
  line('crowd',`${name}みたいな、ハムスターにね。`),
  {...line('announcer',`そして、最後の一匹は――ハムスター！ ${name}！`),callSpecies:'hamster',callIndex:12},
  line('rat',`${name}。きみと本気で競えて、うれしかった。今度はぼくも、きみの背中を追いかけるよ。`),
  {...line('player',reaction(s,'へへ。じゃあ、またいっしょに走ろう！','次も、同じスタートラインで。約束です。','うん。次のレースも……そのあとのごはんも、いっしょに！')),expressions:{player:'happy',rat:'happy'}},
  line(null,'照れて返事をしようとしたら、ほっぺから種がひとつ、ころん。「むぐっ」……仲間がそっと笑った。'),
  line(null,'少し後のひまわりタウン。小さなはむちゅたーが、代表募集の紙の前で足を止めた。'),
  line('friend','ぼくも、あのスタートラインに立ちたい。'),
  line(null,`${name}という名前も、はむちゅたーとして走った3年間も、ずっとそのまま。誰かに憧れた小さな一匹が、いま、誰かの憧れになった。`),
  line(null,'あこがれは、つづいていく。')
 ];
 else if(s.ending==='domestic_loss')lines=[line(null,`${s.turn===24?'1年目':'2年目'}の国内選抜。復活戦の掲示板にも、通過の印はつかなかった。`),line('player',reaction(s,'くやしいな……でも、走ったことは、なくならないよね。','ここまでの記録は、次の一歩に使えます。','今日はちょっと、しょっぱい気分。明日はちゃんと、おいしい日にしよう。')),line('rat','挑んだ足あとまで、順位は消せないよ。きみの走りを、覚えている。'),line(null,`${name}の挑戦はここでひと区切り。仲間と過ごした日々は、育成記録に残った。`)];
 else if(s.ending==='representative_loss')lines=[line(null,'3年目の代表決定戦。12匹の中で、代表の座に届いたのは別の一匹だった。'),line('player',reaction(s,'あと少しじゃなくても、くやしいものはくやしいや。','届かなかった差を、ちゃんと見ておきます。','ほっぺはいっぱいなのに、胸はぽっかりするね。')),line('rat',`${name}、3年間走ってきたことを、ぼくは知っている。今日は、最後まで顔を上げて帰ろう。`),line(null,'世界大会への道はここで閉じた。けれど、努力した日々まで閉じることはない。')];
 else lines=[line(null,`世界十二支決定戦、${s.lastRace?.rank}位。12の枠に、今日は届かなかった。`),line('rat',`${name}。きみは同じスタートラインに立ち、本気で競った相手だ。ありがとう。`),line('player',reaction(s,'今度こそ、あの背中を追いこすからね！','次に必要な一歩が、見えた気がします。','ネズミさん、速かったなあ。ぼくも、まだまだ走りたい。')),line(null,'憧れの背中と、同じ風の中を走った。その一日も、3年間の確かな結末だった。')];
 return {id:'main-ending',title:success?'きみが、誰かの憧れになる日':'小さな足あと',mandatory:true,characters,lines,progress:{'ending-read':1,'rat-recognition':success?4:3}};
}
export function mainDefinition(s,stage){
 if(Today.isToday(s))return Today.mainDefinition(s,stage);
 if(stage==='ending')return endingDefinition(s);
 const name=individualName(s),text={
  prologue:[line(null,'テレビの小さな画面を、ネズミが駆け抜けた。何百年も十二支の座を守ってきた種族。その誇り高い走りに、小さな胸が跳ねた。'),line('player',reaction(s,'あのネズミさんと、いっしょに走ってみたい！','あの走りを、もっと近くで見たい。できれば、同じコースで。','あんなに走ったら、おなかもすくかな。……ぼくも、いっしょに走りたい。')),line(null,'選んだのは、3年間の小さな一歩。まだ誰も知らない、はむちゅたーの挑戦が始まる。')],
  year1:[line('rat',`${name}、だね。今日の走り、ちゃんと見ていたよ。`),line('player',reaction(s,'名前、覚えてくれたの！？ もう一回走れそう！','覚えていてくれたんですね。次はもっといい走りを。','えっ、名前！？ ほっぺの中まで、うれしくなっちゃった。')),line('rat','いい一歩だった。でも、次も手加減はしないよ。')],
  year2:[line('rat',`${name}。前より、足取りに迷いがないね。積み重ねてきたんだね。`),line('player',reaction(s,'うん！ あと1年で、同じスタートに立つよ！','毎日の記録が、少しずつ走りになりました。','走って、食べて、また走って。ちゃんと、続けてきたよ。')),line('rat','最後の12匹に残ったのは、きみの努力だ。代表決定戦の走りも、見届けるよ。')],
  final:[line(null,'国内代表になったのは、一匹だけ。はむちゅたーの代表として、50種類の動物が集う世界大会へ。'),line('rat',`${name}。今日はファンとしてじゃない。同じ優勝を目指す、ひとりの競争相手として会えたね。`),line('player',reaction(s,'やっと、いっしょに走れる。今日は追いこすつもりだよ！','憧れは、そのままです。でも、今日は勝ちに来ました。','同じスタートに立てたね。ぼくも、ぜんぶ出し切るよ。')),line('rat','うん。ぼくも全力で走る。いいレースにしよう。')]
 }[stage];
 const result=s.lastRace,rival=result?.standings?.filter(x=>x.id!=='player'&&x.species==='hamster').sort((a,b)=>Math.abs(result.standings.indexOf(a)+1-result.rank)-Math.abs(result.standings.indexOf(b)+1-result.rank))[0],extra=[];
 if(stage==='prologue')text.splice(1,0,line('rat','一歩ずつ積み重ねてきた。それを、今日は全部出す。――テレビの中のネズミは、まっすぐ前を見ていた。'));
 if(stage==='year1'){
  text.splice(1,0,line('rat',result?.kind==='repechage'?'落ちたあと、もう一度スタートに立ったね。簡単なことじゃないよ。':'ゴールしたあとも、きみは後ろを振り返って仲間を迎えていたね。'));
  text[text.length-1]=line('rat','世界で会える日まで、ぼくも走り続ける。きみの名前、覚えておくよ。');
 }
 if((stage==='year1'||stage==='year2')&&rival){extra.push({id:'rival',name:rival.name,variant:s.rivals.find(x=>x.id===rival.id)?.variant??1});text.push(line('rival',stage==='year1'?'今日はきみの背中を見た。でも、次は横に並ぶからね。':'一年前より、ずっと速くなったね。ぼくも、ここで終わる気はないよ。'),line('player',reaction(s,'じゃあ、次も全力で！ 勝つつもりで待ってるから！','はい。互いの記録を、もう一度塗り替えましょう。','うん。勝負は本気。そのあと、ごはんは一緒にね。')));}
 if(stage==='final')text.splice(2,0,line('rat','憧れてくれた気持ちには、ありがとう。でも、今日のレーンに手加減は持ってきていない。'));
 return {id:'main-'+stage,title:{prologue:'小さな画面、大きな背中',year1:'名前を覚えてくれた日',year2:'積み重ねた足あと',final:'同じスタートライン'}[stage],mandatory:true,characters:cast(s,extra),lines:text,progress:{'rat-recognition':{prologue:0,year1:1,year2:2,final:3}[stage]}};
}
export function queueMain(s,stage){return queueEvent(s,[mainDefinition(s,stage)],'main-check-'+stage);}
const daily=[['種の行列','ひまわりの種を一列に並べた。どれが先頭かで、全員同じ顔をしている。'],['大きな足あと','地面に大きな足あとを描いてみた。自分の足は、真ん中にちょこんと収まった。'],['昼寝の研究','昼寝の時間を計るつもりが、時計より先に眠ってしまった。研究は、また明日。'],['ほっぺの点検','ほっぺの中を点検した。種がひとつ。夢は、数えきれないほど。']];
const friendships=[['並んで帰ろう','帰り道は、仲間と同じ速さで歩いた。勝負じゃない時間も、けっこういい。'],['ノートのすみ','トレーナーのノートのすみに、小さな足あとが描いてあった。今日のぶんも、ひとつ増えた。'],['応援の声','少し遠くから、仲間が名前を呼んでくれた。足より先に、耳がぴんと立った。']];
const chats={rat:['靴ひもを結び直すネズミ。誰より速くても、準備は丁寧だった。','ネズミと一緒に、ゆっくり歩いた。速く走る話を、ゆっくりする時間。'],tiger:['葉っぱの音にトラがびくっ。「い、いまのは準備運動だ！」そういうことにしておこう。','トラが応援の練習をしていた。小さな声だったけれど、ちゃんと届いた。'],rabbit:['「近道？ その前に、まっすぐ走れる？」ウサギは笑って、一緒にコーナーを回ってくれた。','ウサギがフォームを直してくれた。「かわいいだけで勝てるほど、コースは甘くないのよ」'],dragon:['ドラゴンが真剣な顔で地図を見ていた。上下が逆だった。道理で、川が空にあった。','ドラゴンが「肩の力を抜いて」と言った。肩がどこにあるか、一緒にしばらく考えた。']};
export function randomDefinitions(s){
 if(Today.isToday(s))return Today.randomDefinitions(s);
 const make=(id,title,text,effects={},extra=[],requires=[])=>({id,title,characters:cast(s,extra),lines:[line(null,text),line('player',reaction(s,'よし、次も一歩ずつ！','こういう時間も、悪くありません。','元気が出たら、おなかもすいてきた。'))],effects,requires,weight:1});
 const words={rat:['速さだけが全部じゃないよ。止まったあと、どう走り出すかも見ている。','きみと走る日のために、ぼくも昨日の自分を追いこしておく。'],tiger:['音にびっくりしただけだ！ ……となり、歩いてくれるか？','大きい声は、まだ苦手だ。でも応援したい気持ちは、本物だぞ。'],rabbit:['できたことまで小さく言わないの。きみが伸びたぶん、私も本気になるわ。','転んだ回数を数えた？ なら、立った回数もちゃんと数えなさいよ。'],dragon:['道は間違えたが、いい景色には会えた。……ここ、どこじゃ？','急がなくても、やめずに進めば遠くへ行ける。わしも、まだ修行中じゃ。']};
 return [...daily.map(([title,text],i)=>({...make('daily-'+i,title,text,{mood:5}),...(i===0?{choices:[{id:'arrange',label:'もう一度、きれいに並べる',effects:{stats:[0,0,0,1,0]}},{id:'snack',label:'ひとつ、いただきます',effects:{energy:4}}]}:{})})),...friendships.map(([title,text],i)=>make('friendship-'+i,title,text,{trainerBond:5})),...NPCS.flatMap(n=>chats[n.id].map((text,i)=>{const d=make('npc-'+n.id+'-'+i,n.name+'とひと息',text,{npcRelations:{[n.id]:8}},n.id==='rat'?[]:[{id:n.id,name:n.name,variant:null}],i?['npc-'+n.id+'-0']:[]);d.lines.splice(1,0,{...line(n.id,words[n.id][i]),expressions:{[n.id]:i?'happy':'determined'}});return d;}))];
}
