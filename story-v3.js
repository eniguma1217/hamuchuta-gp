// Story v3 「13番目の席」 (#30 G1, owner 2026-10-25). New runs only; runs started on story v2 keep it.
// Axis: the hero (longing) and the Cat (grudge) both aim at the twelve seats from outside. By the old
// legend, chosen by the owner, the Rat once told the Cat the wrong day for the first zodiac race;
// the Cat has finished 13th ever since, and the Rat has carried that lie for centuries.
// Each year opens with a goal and a wall in Koyori's notebook; three choices (first meeting with the
// Cat, the Cat's shortcut, the Rat's confession) come back later and in the endings. Narrative only:
// no stats, rewards, RNG or race results change.
import {isBook,bookLines,BOOK_FINAL,BOOK_ENDING,BOOK_TWEAKS} from './story-book.js';
export const CAT={id:'cat',name:'ネコ'};
const chosen=(s,id)=>s.events.history.find(h=>h.eventId===id)?.choiceId;
const said=(s,a,b,c)=>s.personalityId==='energetic'?a:s.personalityId==='cool'?b:c;
// Lines that differ by hero, not only by voice (#30, owner 2026-10-30 「主人公ごとにストーリーは少し変えて」): each hero
// has its own reason to run. Keyed by the hero; every line is written in that hero's way of speaking.
export const heroSays=(s,by)=>by[s.characterId]||by.mochi;
const L=(speakerId,text,visibleIds,expressions)=>({speakerId,text,...(visibleIds?{visibleIds}:{}),...(expressions?{expressions}:{})});
const S=(scene,speakerId,text,visibleIds,expressions)=>({...L(speakerId,text,visibleIds,expressions),scene});
export const YEAR_GOALS=[
 // The Cat never laughed at anyone (owner 2026-10-30 「猫13位で笑うな」); the wall is the Cat on the slope.
 {year:1,goal:'国内予選で、50匹から25匹に残る',wall:'まだ小さい足と、坂の上のネコ'},
 {year:2,goal:'25匹から、12匹に残る',wall:'近道したくなる気持ちと、すれ違い'},
 {year:3,goal:'国内代表になって、世界で12の席に入る',wall:'13番目のネコと、憧れの背中'}
];
export const yearGoal=s=>YEAR_GOALS[Math.min(2,Math.floor(Math.max(0,s.turn-1)/24))];
// The Cat's place in the world final: in the twelve, 13th exactly, or further back (null if absent).
export function catResult(r){const i=r?.standings?.findIndex(x=>x.species==='ネコ'||x.name==='ネコ');return i>=0?{rank:i+1,inTwelve:i<12}:null;}

export function v3Main(s,stage){
 const name=s.individualName;
 if(stage==='prologue')return {id:'main-prologue',title:'三歩先の印と、13番目',ids:['trainer','seedshop','rat',CAT.id],lines:[
  S('slope',null,'夕暮れのひまわりタウン。神社へ続く坂の途中で、小さな足が止まった。'),
  S('slope','trainer',`${name}、今日はここまで。足、ぷるぷるしてる。`,undefined,{trainer:'worried'}),
  S('slope','player',said(s,'あとちょっとで旗だったのに！ 明日は届くぜ！','旗まで、あと少しでした。……もう一本だけ、お願いします。','旗のところで、種を食べる予定だったのにぃ〜。')),
  S('slope','trainer','昨日より三歩、先まで来たよ。ほら、ノートに印。'),
  S('slope','player',said(s,'……そんな小さいこと、書いてたのかよ？','……そんな小さな差まで、記録していたんですか。','……そんなちっちゃいこと、書いてたのぉ？')),
  S('slope','trainer','小さいから書くんだよ。忘れちゃうから。'),
  S('slope','seedshop','おう、いつもの2匹。そこにいると危ねえぞ。もうすぐ、決定戦が来る。',['player','trainer','seedshop']),
  S('slope','trainer','あ……今日だった。世界十二支決定戦。最後の坂が、この町を通るんだ。',['player','trainer']),
  S('slope',null,'坂の両側に、町じゅうの動物が集まってきた。遠くから、地面をふるわせる足音が近づいてくる。',['player','trainer']),
  S('slope',null,'何百年も席を守ってきた十二支が、風みたいに坂を駆け上がっていく。',['player','trainer']),
  S('slope',null,'先頭はネズミ。小さな背中が、大きな動物たちの前を走っていた。',['player','rat']),
  S('slope',null,'すれちがう一瞬、ネズミの小さな声が聞こえた。「積み重ねた一歩を、今日の走りに」。',['player','rat']),
  S('slope',null,'坂の上で、歓声がはじけた。ゴールを切ったのは、ネズミだった。',['player','trainer']),
  S('slope',null,'十二の席が決まったあとも、坂を上ってくる足音があった。13番目、ネコだった。',['player','cat']),
  S('slope',null,'息は切れているのに、ネコは一度も下を向かなかった。最後の一歩まで、まっすぐゴールを見ていた。',['player','cat']),
  S('slope','seedshop','あのネコは、何百年も毎回この坂を走ってる。一度も休まずに、だ。……あれも、強さだな。',['player','seedshop']),
  S('slope',null,'坂の上の神社では、十二の席が並ぶ長いテーブルに、祝いのごちそうが運ばれていった。',['player','trainer']),
  // Each hero's own reason to run (#30, owner 2026-10-30 「主人公ごとにストーリーは少し変えて」, pick 「走る理由が違う」).
  ...heroSays(s,{
   dash:['今、目の前を風が通った……！ オレ、あの背中を抜きたい！ 一番前を走る風になるんだ！'],
   hakase:['はむちゅたーが十二支の席に座った記録は、一度もありません。','……前例がないのは、「できない」の証明ではありません。わたしが、最初の一行になります。'],
   mochi:['あの長いテーブル……十二の席で、みんなで「いただきます」するんだぁ。','ぼくも、あそこに座りたいなぁ。……ひとりじゃなくて、こよりも、みんなも一緒に。']
  }).map(t=>S('slope','player',t,['player','trainer'],{player:'determined'})),
  S('note','trainer','国内の50匹から、3年かけて代表は1匹だけ。その1匹が、世界の12の席を争うんだ。'),
  S('note','player',said(s,'……無理だって、思うか？','……無理だと、思いますか。','……ぼくには、無理かなぁ？')),
  S('note','trainer','諦めた顔を見るほうが、僕はこわいかな。'),
  S('note','player',said(s,'じゃあ、オレのトレーナーになってくれ！ オレのこと、一番よく見てるだろ！','では、わたしのトレーナーになってください。わたしを一番よく見ているのは、こよりです。','じゃあ、ぼくのトレーナーになってよぉ。ぼくのこと、一番よく見てるでしょ？')),
  S('note','trainer','僕も初めてだよ。無茶したら、止めるからね。',undefined,{trainer:'worried'}),
  S('note','player',said(s,'止めたら、次の走り方も一緒に考えてくれよな！','止めたあとの一歩も、一緒に考えてください。','うん。休んだら、また一緒に走ろうねぇ。')),
  S('note','trainer','……わかった。明日から、ノートを持ってくる。',undefined,{trainer:'happy'}),
  S('morning',null,'翌朝。古びた回し車と、小さな机。2匹の3年間が、ここから始まる。')
 ]};
 if(stage==='year1')return {id:'main-year1',title:'観客席の、ふたつの影',ids:['trainer','rat',CAT.id],extra:{progress:{'rat-met':1,'rat-recognition':1}},lines:[
  L(null,'予選の走路。観客席から、ネズミが小さな一匹を見つめていた。',['rat']),
  L('rat','転んでも、また前へ……。あんな目を、どこかで見たことがある。',['rat']),
  L(null,`${s.lastRace?.kind==='repechage'?'復活戦を越えた夕方。':'25匹に残った夕方。'}主人公は、空いたコースを見ていた。`,['player','trainer']),
  L('trainer','ちょっと、受付に書類を出してくる！ すぐ戻るから！',['player','trainer']),
  L('player',said(s,'……ネズミさん、来てたのか。いつか、ぜったい勝つぜ。','……ネズミさんが、来ていたんですね。いつかは、勝ちたいです。','……ネズミさん、来てたんだぁ。いつかは、勝ちたいなぁ。'),['player']),
  L('rat','うん。ぼくも、きみと走ってみたいな。',['player','rat']),
  L('player',said(s,'だろ？ だから――……って、ネズミさん！？','そうでしょう。ですから――……ネ、ネズミさん！？','でしょ？ だから――……ね、ネズミさん！？'),['player','rat'],{player:'surprised'}),
  L('rat',`${name}、だね。さっきの走り、気になって。`,['player','rat']),
  L(null,'そのとき、観客席の一番上で、何かがのびをした。',['player','rat','cat'],{cat:'sleepy'}),
  L('cat','……やっぱり、来てたか。',['rat','cat']),
  L('rat','……やあ。',['rat','cat']),
  L('cat','……ふん。',['rat','cat']),
  L(null,'それだけで、ネコは行ってしまった。ネズミは、しばらくその背中を見ていた。',['player','rat']),
  L('rat','あのネコはね、ぼくの、古いともだちなんだ。',['player','rat'],{rat:'sad'}),
  L('player',said(s,'ともだち？ ぜんぜん、そう見えなかったぜ！','……そうは、見えませんでした。','ともだちなのに、種、半分こしないのぉ？'),['player','rat']),
  L('rat','そうだね。……いつか、話すよ。同じスタートで会おう。',['player','rat']),
  ...heroSays(s,{dash:['そのときは、オレが前を走ってるからな！'],hakase:['次に会うときは、もっと近い記録でお見せします。'],mochi:['そのときは、ゴールのあとで一緒にごはん食べようねぇ。']}).map(t=>L('player',t,['player','rat'])),
  L('trainer','戻ったよ。……えっ！？ ご、ご挨拶……！',['player','trainer','rat'],{trainer:'surprised'}),
  L(null,'用意していた言葉は、2匹ともひとつも出なかった。')
 ]};
 if(stage==='year2')return {id:'main-year2',title:'ベンチの、へたくそな字',ids:['trainer'],extra:{progress:{'trainer-believes':1}},lines:[
  L(null,s.lastRace?.kind==='repechage'?'復活戦を越えて、最後の12匹に残った。':'最後の12匹に残った。掲示板の名前を、2匹で何度も見た。'),
  L('trainer','僕たちの練習が、ここまで届いたんだ。……本当に、十二支まで行けるかもしれない。',undefined,{trainer:'happy'}),
  L('player',said(s,'「かも」じゃねえ、行くんだよ。一緒に！','その記録を、もう一度伸ばしましょう。2匹のやり方で。','うん。ごはんも練習も、明日からまた一緒ねぇ。')),
  L(null,'帰り道のベンチに、ひっかき傷みたいな字が残っていた。'),
  L(null,'「来られるなら、世界で。――13番目」'),
  L('trainer','……あのネコ、字、へたくそだね。'),
  L('player',said(s,'おう。でも、ちゃんと読めたぜ。','ええ。でも、ちゃんと読めました。','うん。でも、ちゃんと読めたよぉ。')),
  ...heroSays(s,{dash:['あいつも世界で待ってる。……抜く背中が、ふたつになったな！'],hakase:['13番目からの招待状ですね。……証明を見届ける相手が、またひとり増えました。'],mochi:['ネコも、来るんだねぇ。……長いテーブル、ネコのぶんの席もあるといいなぁ。']}).map(t=>L('player',t)),
  L(null,'心配して隣を歩いていた幼なじみが、初めて、同じ先を見て笑った。')
 ]};
 if(stage==='final'){const first=chosen(s,'cat-first'),told=chosen(s,'rat-confession')==='tell';
  return {id:'main-final',title:'同じスタートライン',ids:['trainer','rival','rat',CAT.id,'rabbit','dragon','ox','snake','horse','sheep','rooster','monkey','tiger','dog','boar'],extra:{progress:{'world-met':1,'rat-recognition':3}},lines:[
  L(null,'世界大会の控え場所。こよりが、三年分の練習ノートを積み上げた。',['player','trainer']),
  L('trainer','最初の坂の印、まだここにあるよ。小さな一歩も、なくなってない。',['player','trainer']),
  ...s.races.filter(r=>r.kind!=='zodiac').slice(-3).map(r=>L(null,`ノートには「${r.title}・${r.rank}位」。実際に走った一戦ずつが残っている。`,['player','trainer'])),
  ...(isBook(s)?bookLines(BOOK_FINAL.koyori,s):[]),
  L('trainer',s.events.storyProgress['notebook-page-seen']?'「もし、だめだったら」のページ、覚えてる？ 今は「もう一度、一緒に作戦を立てる」って書き足したよ。':'最後のページは、まだ空けてあるよ。どんな結果でも、その次の作戦は一緒に考えよう。',['player','trainer']),
  L('player',said(s,'じゃあ「一番でゴール」って書いとくぜ！','勝敗の欄は、まだ空けておきましょう。今日、一緒に書きます。','ぼくは「みんなで、いちばんいい種、半分こ」って書くよぉ。'),['player','trainer']),
  ...(isBook(s)?bookLines(BOOK_FINAL.potechi,s):s.lastRace?.standings?.some(x=>x.id==='domestic-0')?[L('rival','きみに勝ちたかったな、ぼく。……世界では、ぼくのぶんも本気で走って。',['player','rival']),L('player',said(s,'おう！ 帰ったら、また勝負だ！','はい。帰ったら、また勝負しましょう。','うん。帰ったら、また勝負しようねぇ。'),['player','rival'])]:[]),
  L(null,'控え場所のすみで、ネコが一番早く準備を終えていた。前の日から、ここにいたらしい。',['player','cat']),
  L('cat',first==='talk-back'?'あの日、言い返してきたやつだ。……走って取るんだろ？ 見せてみろ。':first==='seed'?'あの日の種、うまかった。……だから今日は、手加減しない。':'あの日、黙って見送ったやつだ。今日は、黙って抜かれるなよ。',['player','cat']),
  L('player',said(s,'もちろんだ！ 12番目にも13番目にも、負けねえ！','席は、走って取ります。','……種のお礼なら、ゴールで聞くねぇ。'),['player','cat']),
  ...(isBook(s)?[...bookLines(BOOK_FINAL.cat,s),...bookLines(BOOK_FINAL.ratCat,s)]:[
  L('rat','……ネコ。',['rat','cat']),
  L('cat',told?'……話は、ゴールのあとで聞いてやる。':'話すことなんか、ない。',['rat','cat']),
  L('rat',`${name}。今日は、ぼくも本気で行く。手加減はしない。`,['player','rat'])]),
  L('rabbit','その小さな足で、どこまで届くか見せてね。',['player','rabbit']),
  L('dragon','空は広いけど、今日はみんな同じ地面を走るんだねえ。',['player','dragon']),
  L('sheep','持ち物、順番、準備よし。……あっ、ネコさんもう来てる！',['sheep','rooster']),
  L('rooster','あいつは毎回、前の日から来てるんだ！ 見習え！',['sheep','rooster']),
  L('tiger','イヌ、あの、その……今日も、よろしく。',['tiger','dog']),
  L('dog','……うん。',['tiger','dog']),
  ...heroSays(s,{dash:['ネズミさんの背中まで、あと一本。……今日は、抜く。'],hakase:['証明の最後の一行は、ゴールで書きます。'],mochi:['ゴールしたら、あの長いテーブルで……こよりと、いただきますするんだぁ。']}).map(t=>L('player',t,['player','trainer'],{player:'determined'})),
  L(null,'同じ空。同じ走路。小さな足も、大きな足も、13番目の足も、ひとつの合図を待つ。',['player','rat','cat'])
 ]};}
 throw new Error('Unknown v3 stage: '+stage);
}

// Mandatory scenes by turn: [turn, id, title, lines(s), ids, extra].
export const v3Timeline=[
 [1,'goal-y1','1年目の目標',s=>[
  L(null,'朝の練習場。こよりが、ノートの最初のページに大きく書いた。'),
  L('trainer',`1年目の目標。「${YEAR_GOALS[0].goal}」。`),
  L('player',said(s,'25匹なんて、半分じゃん！ いけるぜ！','半分に残る。……つまり、半分には負けられません。','25匹かぁ。……種、25粒ぶんくらい頑張ればいいのかなぁ？')),
  L('trainer','壁は、「まだ小さい足」。それから……'),
  L('player',said(s,'それから、なんだよ？','それから、何ですか？','それからぁ？')),
  L('trainer','……それは、そのうち書くよ。'),
  L(null,'ページのすみに、空いたままの一行が残った。')
 ],['trainer'],{scene:'training-morning'}],
 [4,'child-first','小さな後ろ姿',s=>[
  L('child','また練習？ ちょびも！ ねえ、その走り方、教えて。'),
  L('player',said(s,'よーし、ついてこい！ ……転んだら、一緒に起きればいいからな。','では、ついてきてください。……転んだら、一緒に起き上がりましょう。','いいよぉ、ついておいで。……転んだら、一緒に起きればいいからねぇ。')),
  L('trainer','先輩ぶってるけど、自分もよく転ぶんだよね。'),
  L('child','じゃあ、転び方も教えて！')
 ],['child','trainer']],
 [8,'cat-first','試食のネコ',s=>[
  L(null,'種屋の店先。試食の皿が、いつのまにか空っぽになっていた。',['player','trainer','seedshop']),
  L('seedshop','おい、そこの。試食は1粒ずつだって言ったろ。',['seedshop','cat']),
  L('cat','1粒ずつ、食べたよ。……12回。',['seedshop','cat']),
  L('player',said(s,'あっ……あの日、最後まで坂を走ってたネコだ……！','あっ……あの日、最後まで坂を走っていた……！','あっ……あの日、最後まで坂を走ってた子だぁ……！'),['player','cat'],{player:'surprised'}),
  L('cat','……見てたのか。順位じゃなくて、走ってたほうを覚えてるやつは、めずらしい。',['player','cat']),
  L('trainer','この子、十二支をめざしてるんです。今日から練習を始めて――',['player','trainer','cat']),
  L('cat','ふうん。あこがれで席が空くなら、おれはとっくに座ってる。',['player','cat']),
  L(null,'ネコは空の皿をきれいに並べ直して、背中を向けた。',['player','cat'])
 ],['trainer','seedshop',CAT.id],{scene:'seedshop',progress:{'cat-met':1},choices:[{id:'talk-back',label:'「座れないなら、走って取る！」'},{id:'quiet',label:'何も言えずに見送る'},{id:'seed',label:'自分の種を、1粒差し出す'}]}],
 [12,'rival-first','種、食べ放題じゃないの？',s=>[
  L(null,'1年目、はじめての大会。受付前で、ぽてちが「早食い競技あり！」のポスターをじっと見ている。',['player','trainer','rival']),
  L('rival','ねえ、種はどこで食べられるの？ 食べ放題だと思って来たんだけど。'),
  L('player',said(s,'競技だぜ！ 本気で食べるんだ！','競技です。食べ放題という意味ではありません。','……ぼくも、食べ放題だと思ったぁ。')),
  L('rival','「きょうぎ」……それって、おいしいの？'),
  L(null,'こよりが抱えていた種の袋を取り落とした。その瞬間、ぽてちの前足が見えなくなった。'),
  L(null,'床の種が、あっという間にぽてちのほお袋へ消えている。'),
  L('player',said(s,'い、今のナシ！ 見えなかったぜ！','……計測できなかった、と記録しておきます。','……ぼくより、はやいねぇ。')),
  L('rival',`${s.individualName}だね。おぼえた。ゴールしたら、一緒に種を食べよう。`),
  L(null,'ぽてちは何もない場所で、こてんとつまずいた。本人はまったく気づいていない。')
 ],['trainer','rival']],
 [16,'trainer-worry','休むのも、前へ進むこと',s=>[
  L(null,'主人公が眠ったあと。こよりは、ノートを閉じられずにいた。',['trainer']),
  L('trainer','十二支なんて、夢のまた夢だ。……でも、あんな顔で走るんだもん。',['trainer'],{trainer:'worried'}),
  L(null,'翌日。予選が近づいて、主人公はもう一周を言い張った。'),
  L('player',said(s,'あと一周！ ネコに笑われたままじゃ、終われねえ！','あと一周。予選までに、差を縮めたいんです。','あと一周……そしたら、おやつにするからぁ。')),
  L('trainer',s.energy<40?'今日は足が上がってない。転んで出られなくなったら、元も子もないよ。':'無理してないか、気になるんだ。少しだけ話して帰ろう。',undefined,{trainer:'worried'}),
  L('player',said(s,'出るだけじゃ、だめなんだよ！','出場するだけでは、意味がありません。','出るだけじゃ……だめなんだよぉ。')),
  L(null,'言いすぎたと、2匹とも思った。先に口を開いたのは、こよりだった。'),
  L('trainer','夢を止めたいわけじゃない。どこまで背中を押していいのか、まだ分からないんだ。'),
  L('player',said(s,'……わかった。今日は帰る。でも明日も、見てろよ。','……わかりました。今日は帰ります。でも明日も、見ていてください。','……うん。今日は帰る。でも明日も、見ててねぇ。'))
 ],['trainer']],
 [20,'cat-slope','坂の上の、13番目',s=>[
  L(null,'日の暮れた、神社へ続く坂。誰もいないはずの石段を、影が駆け上がっていった。',['player','cat']),
  L('cat','……何の用だ。こんな時間に。',['player','cat']),
  L('player',said(s,'勝負しろ！ 坂の上まで！','坂の上まで、一本だけ。お願いします。','坂の上に、おいしいものある？ ……じゃなくて、勝負！'),['player','cat']),
  L('cat','……一本だけな。',['player','cat']),
  L(null,'合図はなかった。気づいたときには、ネコはもう坂の上で、しっぽをたたんで座っていた。',['player','cat']),
  L('player',said(s,'は、はやすぎだろ……。','……速すぎます。','は、はやすぎるよぉ……。'),['player','cat'],{player:'sad'}),
  L('cat','その足で、世界？ 十二支の連中は、おれより速いぞ。',['player','cat']),
  L('player',said(s,'じゃあ、もっと速くなってやる！','差は分かりました。明日から、縮めます。','……今日はここまで。でも、明日も来るねぇ。'),['player','cat'],{player:'determined'}),
  L('cat','……好きにしろ。おれは毎晩、ここにいる。一度も、遅れたことはない。',['player','cat']),
  L(null,'最後のひとことだけ、少し低い声だった。',['player','cat'])
 ],[CAT.id],{scene:'slope'}],
 [25,'goal-y2','2年目の目標',s=>[
  L(null,'2年目の朝。こよりがノートの新しいページを開いた。'),
  L('trainer',`2年目の目標。「${YEAR_GOALS[1].goal}」。`),
  L('player',said(s,'で、壁は？','壁は、何ですか？','壁はぁ？')),
  L('trainer','……「近道したくなる気持ち」。去年の僕たちを見てたら、そう思った。'),
  L('player',said(s,'近道なんかしないって！ ……たぶんな！','書いておくのは、賢明です。','近道って、種屋さんへのぉ？')),
  L('trainer','それは近道してもいいよ。')
 ],['trainer'],{scene:'training-morning'}],
 [28,'cat-shortcut','ネコの近道',s=>[
  L(null,'練習場に、見慣れない影がひとつ。ネコが回し車の上で寝そべっていた。',['player','trainer','cat'],{cat:'sleepy'}),
  L('cat','起きたら、たまたまここだった。……おまえ、去年より速くなったな。',['player','cat']),
  L('player',said(s,'ほんとか！？ 見てたのか！？','……見ていたんですか。','ほめられた？ いま、ほめられたぁ？'),['player','cat']),
  L('cat','だが、まだ遅い。おれのやり方を教えてやる。一晩じゅう走って、朝まで止まらない。体が、勝手に前へ出るようになる。',['player','cat']),
  L('trainer','だめです！ そんな練習、足をこわします！',['player','trainer','cat'],{trainer:'worried'}),
  L('cat','こわれる前に、席を取れ。……おれは、何百年もそうしてきた。',['trainer','cat']),
  L(null,'こよりと、ネコ。2匹の視線が、主人公に集まった。',['player','trainer','cat'])
 ],['trainer',CAT.id],{scene:'training',choices:[{id:'try',label:'ネコのやり方を、試してみる'},{id:'koyori',label:'こよりのやり方で行く'},{id:'own',label:'両方聞いて、自分で決める'}]}],
 [32,'rat-imitation','だめだったときのページ',s=>[
  L(null,'2年目の春。こよりが忘れた練習ノートをひろうと、最後のページが開いた。'),
  L(null,'「もし、だめだったら」。その下に、負けた日の声のかけ方が、何通りも書かれていた。'),
  ...(chosen(s,'cat-shortcut')==='try'?[L(null,'あの夜から、こよりはあまり話さなくなっていた。')]:[]),
  L('player',said(s,'最初から、負けると思ってたのかよ！','……どうして、このページを先に書いたんですか。','……これ、いつ書いたのぉ？')),
  L('trainer','最初のころ。負けて、走るのまで嫌いになっちゃったら、何て言えばいいか分からなくて。',undefined,{trainer:'worried'}),
  L('player',said(s,'ネコは勝つことしか考えてない。こよりは、負けることばっかりだ！','ネコは勝つことしか見ていません。こよりは、負けることしか見ていません。','……勝つことも、ちょっとは考えてほしかったなぁ。')),
  L(null,'こよりは何も言わずに、ノートを抱えて部屋に戻った。'),
  L('player',said(s,'……今の、言いすぎた。くそっ。','……今のは、言いすぎました。','……今の、言いすぎちゃった。'))
 ],['trainer']],
 [38,'coach-return','ひとりでは見えないこと',s=>{const pick=chosen(s,'cat-shortcut');return [
  L('rival','きみのトレーナー、いいなあ。昨日よりよくなったところ、ちゃんと知ってるんだね。',['player','rival']),
  L('player',said(s,'……オレ、こよりのこと、こわがらせてたかもしれない。','数字しか見ていなかったのは……わたしかもしれません。','……こより、ずっと一人で心配してたんだねぇ。'),['player','rival']),
  L(null,'主人公は、ノートの最後のページを思い出して、こよりのところへ戻った。',['player','trainer']),
  L('player',said(s,'ごめん！ 負けたときより、一緒に勝つことを考えようぜ！','このページに、次にできることを書きましょう。2匹で。','いちばんいい種、半分こしよう。……こわいことも、半分こねぇ。'),['player','trainer']),
  L('trainer',pick==='try'?'あの夜、石段で転んだって、種屋さんから聞いた。……ばか。':pick==='koyori'?'ネコより僕を選んでくれたって、ちゃんと覚えてる。……うれしかった。':'「自分で決める」って言ったとき、ちょっと、かっこよかった。',['player','trainer']),
  L('player',pick==='try'?said(s,'……おう。ばかだった。','……はい。愚かでした。','……うん。ばかだったよぉ。'):said(s,'……へへっ。','……ふふ。','……えへへ。'),['player','trainer']),
  L('trainer','あのページは消さない。こわかったのは本当だから。でも、次からは勝つための作戦も書こう。',['player','trainer'],{trainer:'happy'}),
  L('player',said(s,'おう。オレの走り、もう一度、一緒に考えてくれ。','はい。わたしの走りを、もう一度、一緒に考えてください。','うん。ぼくの走り、もう一度、一緒に考えてねぇ。'),['player','trainer'])
 ];},['trainer','rival']],
 [42,'rat-confession','ネズミの昔話',s=>[
  L(null,'夕方の神社。石段の上に、ネズミがひとりで座っていた。',['player','rat']),
  L('rat',`やあ、${s.individualName}。……いつか話すって言ったね。あのネコのこと。`,['player','rat']),
  L('rat','大昔、最初の十二支を決めるかけっこがあった。ネコは、ぼくに日にちをきいたんだ。',['player','rat']),
  L('rat','ぼくは……一日あとの日を教えた。一番になりたくて。席がひとつでも減るのが、こわくて。',['player','rat'],{rat:'sad'}),
  L(null,'夕焼けの音だけが、しばらく続いた。',['player','rat']),
  L('player',said(s,'うそだろ……ネズミさんが？','……ネズミさんが、うそを。','……うそ、ついたのぉ？'),['player','rat'],{player:'surprised'}),
  L('rat','うん。だから、あのネコは何百年も13番目にいる。ぼくは、何百年も謝れていない。',['player','rat'],{rat:'sad'}),
  L('rat','きみが憧れてくれたネズミは、そういうネズミなんだ。……がっかりしたかい？',['player','rat'])
 ],['rat'],{scene:'shrine',progress:{'rat-past':1},choices:[{id:'tell',label:'「ネコに、ちゃんと言おう」'},{id:'keep',label:'「……今は、聞かなかったことにする」'}]}],
 [44,'festival-2','増えた旗',s=>[
  L('tanuki','今年の旗は、こっちの通りにも！ 応援の札、去年より増えたねえ。'),
  L('child','ちょびも練習してるんだ。きみがいない日も、ひとりで。'),
  L('player',said(s,'……そっか。じゃあ今度、一緒に走ろうぜ！','……そうですか。では今度、一緒に走りましょう。','……そっかぁ。じゃあ、また今度、一緒に走ろうねぇ。')),
  L('tanuki','あれ、旗がひとつ足りない……と思ったら、ネコさんの形の旗がある。だれが作ったの？'),
  L('child','……ちょび。13番目って、かっこいいから。')
 ],['tanuki','child','trainer']],
 [49,'goal-y3','3年目の目標',s=>[
  L(null,'3年目の朝。ノートは、もうずいぶん厚くなっていた。'),
  L('trainer',`3年目の目標。「${YEAR_GOALS[2].goal}」。`),
  L('player',said(s,'……壁は？','壁は、何ですか？','壁はぁ？')),
  L('trainer','「13番目のネコ」と……「憧れの背中」。'),
  L('player',said(s,'どっちも、追い越すぜ！','どちらも、超えるべき相手です。','……どっちも、すごく速いねぇ。……でも、行く。'),undefined,{player:'determined'}),
  L('trainer','あと、もうひとつ。「ちゃんと食べて、ちゃんと寝る」。'),
  L('player',said(s,'それ、壁かよ？','それは、壁なんですか？','それ、壁なのぉ？')),
  L('trainer','きみには壁だよ。')
 ],['trainer'],{scene:'training-morning'}],
 [56,'cat-past','13番目の理由',s=>{const told=chosen(s,'rat-confession')==='tell';return [
  L(null,'春の神社。日なたで、ネコが丸くなっていた。めずらしく、寝息をたてている。',['player','cat'],{cat:'sleepy'}),
  L('player',said(s,'ネコでも、寝るんだな……。','……寝ているところは、初めて見ます。','……気持ちよさそう。ぼくも寝たいなぁ。'),['player','cat'],{cat:'sleepy'}),
  L('cat','……寝てない。目を閉じてただけだ。',['player','cat'],{cat:'calm'}),
  ...(told?[
   L('player',said(s,'ネズミさんから、聞いたぜ。最初のかけっこの日のこと。','ネズミさんから、聞きました。最初のかけっこの日のことを。','ネズミさんから、聞いたよぉ。最初のかけっこの日のこと。'),['player','cat']),
   L('cat','……あいつが、自分で言ったのか。',['player','cat'],{cat:'surprised'}),
   L('cat','知ってたさ。何百年も前から。でも、あいつの口から聞いたことは、一度もなかった。',['player','cat']),
   L('player',said(s,'ネズミさん、ずっと謝りたかったんだってよ！','謝りたかった、と言っていました。何百年も。','……ネズミさん、ずっとつらそうだったよぉ。'),['player','cat']),
   L('cat','……ふん。今さら。……今さら、だ。',['player','cat']),
   L(null,'しっぽが、ゆっくり二回揺れた。',['player','cat'])
  ]:[
   L('cat','……おまえ、知ってるんだろ。あいつから聞いた顔をしてる。',['player','cat']),
   L('player',said(s,'……おう。','……はい。','……うん。'),['player','cat']),
   L('cat','おれは、だまされた日に遅れた。それから何百年、毎回走って、毎回13番目だ。',['player','cat']),
   L('cat','あいつは、一度も謝りに来ない。……来られても、困るけどな。',['player','cat'])
  ]),
  L('cat','世界で会おう。12の席、ひとつはおれがもらう。……おまえの席でも、かまわない。',['player','cat']),
  L(null,'ネコは起き上がって、坂の上へ走っていった。今日は、振り返らなかった。',['player'])
 ];},[CAT.id],{scene:'shrine'}],
 [64,'festival-3','坂の向こうへ',s=>[
  L('tanuki','お祭りの支度は任せて。世界への見送り……まだ早いか。まずは次の一戦だね！'),
  L(null,'広場のすみで、小さな子がひとり、短い足を何度も動かしていた。'),
  L('child','ここまで走って、ちょっと休んで、また走るんだ。きみみたいに。'),
  L('seedshop','おう、差し入れは2匹ぶんだ。……いや、坂の上のやつのぶんも入れとくか。')
 ],['tanuki','child','seedshop']],
 [70,'trainer-confession','ずっと隣にいた',s=>[
  L('trainer','代表決定戦の前に、言っておきたい。最初、十二支なんて無理だって思ってた。'),
  L('trainer','傷ついてほしくなくて。でも、それだけを理由にして、夢まで信じてなかった。',undefined,{trainer:'worried'}),
  L('player',said(s,'……知ってたぜ。','……知っていました。','……知ってたよぉ。')),
  L('trainer','えっ。',undefined,{trainer:'surprised'}),
  L('player',said(s,'でも、毎日来てくれたじゃん。オレより心配して、オレよりノート書いてさ。','信じきれなくても、隣にはいてくれました。その行動を、ずっと見ていました。','いつもごはんも、休む場所も、次の練習も考えてくれた。ぼく、ちゃんと知ってるよぉ。')),
  L('player',said(s,'だから、ここまで来られたんだ。最後も一緒に、作戦立てようぜ！','だから、ここまで来られました。最後も一緒に、作戦を立てましょう。','だから、ここまで来られたんだよぉ。最後も一緒に、作戦立てようねぇ。')),
  L('trainer','……うん。今は、本気で信じてる。2匹のやり方で、行こう。',undefined,{trainer:'happy'})
 ],['trainer']]
];

// The player's reply to each v3 choice, shown as its own short scene right after.
export function v3Answer(s,id,choice){
 if(id==='cat-first'){const reply={
  'talk-back':[L('player',said(s,'座れないなら、走って取る！ 見てろよ！','席は空くものじゃない。走って取るものです。','席がないなら……走って、取りに行く。'),['player','cat'],{player:'determined'}),L('cat','……ふうん。言い返してきたのは、久しぶりだ。',['player','cat']),L(null,'しっぽが一度だけ揺れた。',['player','cat'])],
  quiet:[L(null,'言い返す言葉が、のどで止まった。ネコの背中は、すぐに角を曲がった。',['player','trainer']),L('trainer','……今のは、気にしなくていいよ。',['player','trainer']),L('player',said(s,'……気にする。だから、走るんだ。','記録しておいてください。今日の、悔しい顔を。','……おなか、すいてたのかなぁ、あのネコ。'),['player','trainer'])],
  seed:[L('player',said(s,'これ、オレの種！ 腹へってるなら、食え！','試食の代わりに、どうぞ。','これ、いちばんいい種。……あげるねぇ。'),['player','cat']),L('cat','……施しは、いらない。',['player','cat']),L(null,'そう言いながら、ネコは種をくわえて行った。',['player','cat'])]
 }[choice];if(!reply)return null;
  return {id:'cat-first-answer',title:'空いていた一行',ids:['trainer',CAT.id],extra:{scene:'seedshop'},lines:[...reply,L(null,'その夜、こよりはノートの空いた一行に書き足した。「壁：笑ったネコ」。',['player','trainer'])]};}
 if(id==='cat-shortcut'){const reply={
  try:[L('player',said(s,'一晩だけ！ 一晩だけ試すぜ！','一晩だけ。結果を見て判断します。','……一晩だけ、やってみるねぇ。'),['player','trainer','cat']),L('trainer','……っ。勝手にして！',['player','trainer'],{trainer:'worried'}),L(null,'こよりはノートを抱えて帰ってしまった。その夜、坂の石段は思ったより長かった。',['player'])],
  koyori:[L('player',said(s,'オレは、こよりと考えた走りで行く！','わたしは、こよりの記録を信じます。','こよりのやり方がいいなぁ。ごはんの時間もあるし。'),['player','trainer','cat']),L('cat','……そうか。じゃあ、13番目にもなれないな。',['player','cat']),L(null,'ネコの言葉が、思ったより胸に残った。',['player','trainer'])],
  own:[L('player',said(s,'どっちも聞いた！ で、オレが決める！','両方の理由を聞いたうえで、わたしが決めます。','ねえ、どっちも、ちょっとずつじゃだめぇ？'),['player','trainer','cat']),L('cat','……ふん。めんどうなやつだ。',['player','cat']),L('trainer','……それ、たぶん一番大変だよ。',['player','trainer'],{trainer:'happy'})]
 }[choice];if(!reply)return null;return {id:'cat-shortcut-answer',title:'近道の答え',ids:['trainer',CAT.id],extra:{scene:'training'},lines:reply};}
 if(id==='rat-confession'){const reply={
  tell:[L('player',said(s,'がっかりした！ でも、言わなきゃ始まらないだろ！ ネコに伝えに行くぜ！','がっかりしました。だから、伝えるべきです。わたしが、話してきます。','……がっかりした。でも、ネズミさん、ずっとつらかったんだねぇ。ネコにも、教えてあげよう。'),['player','rat']),L('rat','……ありがとう。きみは、ぼくより勇気があるね。',['player','rat'])],
  keep:[L('player',said(s,'……今は、走ることだけ考える。','この話は、わたしが持っていていい話ではない気がします。','……今日は、聞かなかったことにするねぇ。'),['player','rat']),L('rat','そうだね。……ぼくが、自分で言わなきゃいけないことだ。',['player','rat'])]
 }[choice];if(!reply)return null;return {id:'rat-confession-answer',title:'憧れの背中',ids:['rat'],extra:{scene:'shrine'},lines:[...reply,L(null,'憧れの背中が、少しだけ小さく見えた。それでも、目をそらす気にはならなかった。',['player','rat'])]};}
 return null;
}

// Extra ending lines for the Cat and the Rat (success / world loss / domestic losses).
export function v3EndingLines(s){
 // A run with the four stories ends them in story-book.js (the Cat beside the Rat, the white pebble, the shared seed).
 if(isBook(s))return bookLines(BOOK_ENDING,s);
 const r=s.lastRace,cat=catResult(r),met=s.events.storyProgress['cat-met'],told=chosen(s,'rat-confession')==='tell',invite=said(s,'次は一緒に練習しようぜ！ 坂の上まで！','次は、坂で一緒に練習しませんか。','今度、種、半分こしようねぇ。練習のあとに。');
 if(s.ending==='zodiac_member'){
  if(cat?.inTwelve)return [L('cat','……13番目じゃ、なかった。',['player','cat']),L('rat',told?'ネコ。……あの日、うその日にちを教えて、ごめん。何百年も、言えなくて。':'ネコ。……ずっと言えなかった。あの日、うその日にちを教えて、ごめん。',['rat','cat'],{rat:'sad'}),L('cat','……おそい。何百年、おそい。',['rat','cat']),L('cat','……でも、聞いた。',['rat','cat']),L(null,'二匹のあいだに、何百年ぶりの沈黙と、ほんの少しの笑い声。',['player','rat','cat'])];
  if(cat)return [L('cat',cat.rank===13?'また13番目か。……でも、今日は悪くない。':'今日は13番目にもなれなかった。おまえのせいだぞ。',['player','cat']),L('player',invite,['player','cat']),L('cat','……毎晩、坂の上にいる。勝手に来い。',['player','cat'])];
  return [];
 }
 if(s.ending==='zodiac_loss'){
  if(cat?.inTwelve)return [L('cat','……席は、もらった。おまえのぶんまで、走っておいた。',['player','cat']),L('player',said(s,'次は、オレが取る！','次は、わたしの番です。','……次は、ぼくも座りたいなぁ。'),['player','cat']),L('cat','……ああ。待ってる。',['player','cat'])];
  if(cat)return [L('cat','二匹とも、外か。……ふん。次は、二匹で取りに来るか。',['player','cat']),L('player',said(s,'おう！ 次は、二匹でな！','次は、二匹とも12の中に。','……うん。次は、二匹でねぇ。'),['player','cat'])];
  return [];
 }
 if(met)return [L(null,'帰り道の坂の上に、ネコが座っていた。',['player','cat']),L('cat','……まだ、走れる足だろ。',['player','cat'])];
 return [];
}

// One line from a rival during the race or on the result's review tab.
export function rivalRaceLine(who,event,name){
 const lines={
  rival:{passed:'ぽてち「あっ、抜かれた！ ……種、あげないからね！」',overtaken:'ぽてち「おさきに〜！ ゴールで種、待ってるね！」',near:'ぽてち「となり、走ってるね！ たのしいね！」'},
  cat:{passed:'ネコ「……ちっ。やるじゃないか」',overtaken:'ネコ「13番目は、おれの場所じゃない」',near:`ネコ「ついてこれるか、${name}」`},
  rat:{passed:'ネズミ「来たね……！ 待ってたよ」',overtaken:'ネズミ「まだまだ、ぼくも走れるよ」',near:'ネズミ「同じスタートで、会えたね」'}
 };return lines[who]?.[event]||null;
}
export function rivalReviewLine(s,r){
 const hero=r.rank;if(r.kind==='zodiac'){const cat=catResult(r);if(!cat)return null;return cat.rank<hero?`ネコ「今日はおれが前だ。……でも、おまえの足音、ずっと聞こえてた」`:`ネコ「……おまえの背中を見て走るのは、悪くなかった」`;}
 const p=r.standings.findIndex(x=>x.id==='domestic-0')+1;if(!p)return null;return p<hero?'ぽてち「今日はぼくの勝ち！ 種、半分あげるね」':'ぽてち「負けちゃった。……次は、もっと速く食べて、もっと速く走る！」';
}

// Each hero's own three scenes (#30, owner 2026-10-30 「主人公ごとにストーリーは少し変えて」, pick 「走る理由が違う＋
// 専用の話を3話ずつ」): もちまる wants a seat at the long table for everyone, ダッシュ wants to be the wind in front,
// はかせ wants to prove a little hamster can reach a seat. One a year, on turns with no other main scene.
// [turn, id, title, lines(s), ids, extra]; only the run's own hero sees them.
export const HERO_SERIES={mochi:'もちまるの話',dash:'ダッシュの話',hakase:'はかせの話'};
const HERO_TIMELINE={
 mochi:[
  [18,'hero-mochi-1','半分こ',s=>[
   L(null,`練習のあと。${s.individualName}は、ほお袋から種を出して、きれいに並べはじめた。`,['player','trainer']),
   L('trainer','……それ、全部ひとりで食べるの？'),
   L('player','ちがうよぉ。こより、ちょび、ぽてち、種屋さん……ひとつずつ、みんなのぶん。'),
   L('child','ちょびのもある！',['player','child']),
   L('player','あのねぇ、決定戦の日、坂の上のテーブル、見たでしょ？ 十二の席で、みんなで「いただきます」してたの。'),
   L('player','ぼく、あそこに座りたいんだぁ。……ひとりじゃなくて、みんなで食べられる席に。'),
   L('trainer',`……それが、${s.individualName}の走る理由？`),
   L('player','うん。おなかいっぱいより、みんないっぱいがいいなぁ。'),
   L(null,'その日の種は、いつもより少しだけ、おいしかった。')
  ],['trainer','child'],{scene:'training'}],
  [46,'hero-mochi-2','13枚目のお皿',s=>[
   L(null,'夜の坂。ピクニックの敷物に、お皿が13枚並んでいた。',['player','trainer']),
   L('trainer','12の席に、もうひとつ？'),
   L('player','うん。13枚目は、ネコのぶん。……来るかなぁ。'),
   L(null,'しばらくして、石段の上から影が降りてきた。',['player','cat']),
   L('cat','……なんだ、これは。',['player','cat']),
   L('player','ネコの席だよぉ。いっしょに、食べよ？',['player','cat']),
   L('cat','……何百年も、席なんか用意されたことはなかった。',['player','cat']),
   L(null,'ネコは何も言わずに座って、13枚目のお皿の種を、一粒ずつ食べた。',['player','cat']),
   L('cat','……12回じゃ、足りないな。',['player','cat']),
   L('player','えへへ。おかわり、あるよぉ。',['player','cat'])
  ],['trainer',CAT.id],{scene:'slope'}],
  [62,'hero-mochi-3','長いテーブルの約束',s=>[
   L(null,`最後の年の夜。${s.individualName}は、めずらしく種を食べずに、窓の外を見ていた。`),
   L('trainer','……おなか、痛いの？',undefined,{trainer:'worried'}),
   L('player','ううん。……ぼくね、ちっちゃいころ、ごはんはいつも、ひとりだったの。'),
   L('player','こよりが種を半分こしてくれた日から、ごはんが、おいしくなったんだぁ。'),
   L('player','だから、あの長いテーブルに、こよりの席もつくりたいの。……トレーナーも、座れるかなぁ。'),
   L('trainer','……座れなくても、隣に立ってる。いちばん近くで、いただきますって言う。',undefined,{trainer:'happy'}),
   L('player','えへへ。約束だよぉ。')
  ],['trainer'],{scene:'bedroom'}]
 ],
 dash:[
  [18,'hero-dash-1','坂のタイム',s=>[
   L(null,`夕暮れの坂。${s.individualName}は、旗のところから坂の上まで、何度も走っていた。`,['player','trainer']),
   L('trainer','14秒2。……昨日より、0.3秒速いよ。'),
   L('player','ネズミさんは、この坂を何秒で上ったんだ？'),
   L('trainer','……たぶん、5秒くらい。'),
   L('player','5秒！？ ……へへっ、燃えてきたぜ！'),
   L('player','あの日、目の前を風が通ったんだ。オレ、あの風になりたい。一番前を走る風に！',undefined,{player:'determined'}),
   L('trainer','じゃあ、まずは14秒を切ろう。風は、一日じゃ吹かないよ。'),
   L('player','おう！ 明日は13秒台だ！')
  ],['trainer'],{scene:'slope'}],
  [46,'hero-dash-2','一番じゃなかった日',s=>[
   L(null,'練習場のかけっこ。ゴールで先に笑ったのは、ぽてちだった。',['player','rival']),
   L('rival','やったぁ。きょうは、ぼくの勝ち。種、ひと粒もらうね。',['player','rival']),
   L('player','……くそっ。一番じゃなきゃ、意味ねえのに。',['player','rival'],{player:'sad'}),
   L('rival','そう？ ぼく、きみと走ると、いつもたのしいよ。一番でも、二番でも。',['player','rival']),
   L('player','……たのしい、か。そんなこと、考えたこともなかったぜ。',['player','rival']),
   L('trainer',`${s.individualName}が前を走ると、ちょびも、ぽてちも、ついていこうとするんだ。……知ってた？`,['player','trainer']),
   L('player','……オレが前を走るのは、置いていくためじゃなくて――みんなに、風を見せるためか。',['player','trainer'],{player:'determined'}),
   L('player','よし、ぽてち、もう一本！ 次は勝つ。そんで、一緒に種食おうぜ！',['player','rival'])
  ],['rival','trainer'],{scene:'training-dusk'}],
  [62,'hero-dash-3','追い越すための背中',s=>[
   L(null,`朝いちばんの神社。石段を往復するネズミの横に、${s.individualName}が並んだ。`,['player','rat']),
   L('player','ネズミさん！ 一本、勝負してくれ！',['player','rat']),
   L('rat','……いいよ。',['player','rat']),
   L(null,'石段の上で、ネズミは半歩だけ前にいた。三年前には、背中しか見えなかった距離だった。',['player','rat']),
   L('rat','速くなったね。……ねえ、ぼくの背中は、追いかけるためにあるんじゃない。追い越されるためにあるんだ。',['player','rat']),
   L('player','……言ったな？ 世界で、ぜったい抜くからな！',['player','rat'],{player:'determined'}),
   L('rat','うん。待ってる。……前でね。',['player','rat'])
  ],['rat'],{scene:'shrine'}]
 ],
 hakase:[
  [18,'hero-hakase-1','前例ゼロ',s=>[
   L(null,`種屋の奥。${s.individualName}は、古い決定戦の記録帳を一冊ずつめくっていた。`,['player','seedshop']),
   L('seedshop','そんな古いもん、何に使うんだ。'),
   L('player','はむちゅたーが十二支の席に座った記録を、探しています。'),
   L(null,'最後の一冊を閉じても、その名前はどこにもなかった。'),
   L('player','……ゼロ件です。何百年分の記録で、一度も。'),
   ...(isBook(s)?bookLines(BOOK_TWEAKS['hero-hakase-1'],s):[]),
   L('seedshop','……そうか。'),
   L('player','ゼロは、「できない」の証明ではありません。「まだ、誰もやっていない」の記録です。',undefined,{player:'determined'}),
   L('player','わたしが、最初の一件になります。……それを、証明したいんです。'),
   L('trainer','じゃあ、そのための記録は、僕がつける。最初の一件の、最初の一ページから。',['player','trainer'])
  ],['seedshop','trainer'],{scene:'seedshop'}],
  [46,'hero-hakase-2','計算の外側',s=>[
   L(null,'夜。机の上に、計算の紙が何枚も散らばっていた。'),
   L('player','今の伸び方だと、十二支に届く確率は……三割です。足りません。'),
   L('trainer','その計算、ちょびが毎日応援に来てることは入ってる？'),
   L('player','……入っていません。数値にできないので。'),
   L('trainer','種屋さんの差し入れは？ ぽてちと走った日は？ ネコとの勝負は？'),
   L('player','……どれも、入っていません。'),
   L('trainer','僕のノートだと、そういう日のあと、きみはいつも記録を伸ばしてる。',undefined,{trainer:'happy'}),
   L(null,'計算の紙のすみに、小さく一行が書き足された。「計算の外側：みんな」。'),
   L('player','……訂正します。確率は、まだ分かりません。分からないほうが、いい気がします。')
  ],['trainer'],{scene:'bedroom'}],
  [62,'hero-hakase-3','証明の最後の一行',s=>[
   L(null,`最後の年の朝。${s.individualName}のノートの一ページ目に、ずっと同じ一行が書いてあった。`),
   L(null,'「証明：小さな足でも、十二の席に届く。」その下は、空欄のままだった。'),
   L('child','ねえ、その下、なんで書かないの？',['player','child']),
   L('player','証明の最後の一行は、ゴールのあとでしか書けないからです。',['player','child']),
   L('child','じゃあ、ちょびが代わりに書いてあげる！ 「ちょびも、とどく」！',['player','child']),
   L('player','……それは、次の証明ですね。わたしのが終わったら、ちょびの番です。',['player','child']),
   L('trainer','ふふ。証明が、つながってくね。',['player','trainer'],{trainer:'happy'})
  ],['trainer','child'],{scene:'training-morning'}]
 ]
};
export const HERO_IDS=Object.fromEntries(Object.entries(HERO_TIMELINE).map(([hero,list])=>[hero,list.map(t=>t[1])]));
export function heroTimeline(s){return HERO_TIMELINE[s.characterId]||[];}
