// Rare events (#30, owner 2026-10-30 「途中のレアイベントでさらにゲットできるようにして　パワプロとかウマ娘
// イメージで」; picks: about 1–2 a run, the nine talents plus gold ones). Each talent has one short scene; the
// talent is given when the talk is over (events.js applies effects.talent). Hero lines follow the three ways
// of speaking (owner pick 「一人称・語尾まで全部書き分ける」): energetic ダッシュ「オレ…だぜ！」, cool はかせ
// 「…です」, hungry もちまる「ぼく…だよぉ」.
import {TALENT_POOL,GOLD_POOL} from './individuality.js';
// Chance after a turn with no other talk; tuned so a run gets about 1.5 (balance in docs/qa/talent-rare-v69).
export const RARE_CHANCE=.035,RARE_MAX=3,GOLD_SHARE=.35;
// Rolls from the event seed and the turn (a reload rolls the same); salt keeps the three rolls apart.
export function rareRoll(s,salt){let z=(s.events.seed^Math.imul(s.turn+1,0x2545f491)^Math.imul(salt,0x9e3779b9))>>>0;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;return ((z^(z>>>16))>>>0)/4294967296;}
// Which talent this rare event gives: gold about a third of the time, never one the run already has.
export function rareTalentPick(s){
 const owned=new Set([s.talentId,...(s.extraTalents||[])]),gold=GOLD_POOL.filter(id=>!owned.has(id)),normal=TALENT_POOL.filter(id=>!owned.has(id));
 const list=gold.length&&(rareRoll(s,2)<GOLD_SHARE||!normal.length)?gold:normal;return list.length?list[Math.floor(rareRoll(s,3)*list.length)]:null;
}
// [title, scene, ids, lines(s, L, say)]; say(s, energetic, cool, hungry).
export const RARE_SCENES={
 pouch:['ほお袋の詰め方','seedshop',['seedshop'],(s,L,say)=>[
  L('seedshop','おい、ほお袋の使い方がなっちゃいねえ。右と左、同じだけ詰めろ。'),
  L(null,'言われたとおりに詰めると、ふしぎと体が軽い。走っても、種がひと粒もこぼれない。'),
  L('player',say(s,'すげえ！ 詰めたまま走れるぜ！ オレ、どこまででも行ける！','左右の重さをそろえると、走りがぶれない……。理にかなっています。','いっぱい詰めても、重くないよぉ。……ぼく、これ得意かも。')),
  L('seedshop','それが分かりゃ一人前だ。……詰めた分は、持ってけ。')]],
 rocket:['角までの競争','town',['rival'],(s,L,say)=>[
  L('rival','ねえ、あの角まで競争しよ！ よーい、どん！'),
  L(null,'石だたみの道を、2匹で全力で走った。足が、勝手に次の一歩を出していく。'),
  L('player',say(s,'今の、足がいつもより先に出たぜ！ オレ、速くなってる！','一歩目の蹴りが、今までと違いました。……もう一度、確かめたいです。','わぁ、足がくるくる回るよぉ。ぼく、こんなに速かったっけ。')),
  L('rival','はあ、はあ……。きみ、今日の足、ずるいよ。')]],
 insight:['夜のノート','bedroom',['trainer'],(s,L,say)=>[
  L(null,'夜。こよりのノートをめくっていると、ばらばらだった印が、一本の線につながった。'),
  L('player',say(s,'わかったぜ！ 疲れる前に、作戦を変えればいいんだ！','……分かりました。失敗した日は、いつも同じ時間です。','あっ、ごはんの前の日は、いつも走れてるよぉ。')),
  L('trainer','……え。それ、僕がずっと気づかなかったやつだ。',undefined,{trainer:'happy'})]],
 wheel:['直したての回し車','workshop',['beaver'],(s,L,say)=>[
  L('beaver','回し車、きしんでたから直しといたぞ。乗ってみな。'),
  L(null,'回すたびに、カラカラと軽い音。足と車が、ひとつになったみたいだった。'),
  L('player',say(s,'止まらねえ！ ずっと回せるぜ、これ！','回転がそろっています。……足も、それに合わせられます。','すごいよぉ。ぼく、このまま寝ちゃえるくらい、楽ちん。')),
  L('beaver','だろ？ 道具がいいと、体も覚えるんだ。')]],
 maze:['生け垣のかくれんぼ','training',['child'],(s,L,say)=>[
  L('child','かくれんぼしよ！ ちょび、生け垣の中にかくれるね！'),
  L(null,'入りくんだ生け垣の中で、なぜか道が光って見えた。右、左、まっすぐ――。'),
  L('player',say(s,'見つけたぜ！ 道が、全部見えた！','行き止まりの形には、きまりがあります。……見つけました。','ちょび、見つけたよぉ。……なんでか、道がわかったの。')),
  L('child','えー！ いちばん奥にかくれたのに！')]],
 early:['春いちばんの桜','shrine',['tanuki'],(s,L,say)=>[
  L('tanuki','見てごらん。今年いちばんに咲いた桜だよ。'),
  L('tanuki','早く咲く花はね、寒いうちから、ちゃんと準備してたんだ。きみの足も、そうだね。'),
  L('player',say(s,'オレ、今が咲きどきってことだな！ 待ってられねえぜ！','早いうちに伸びる……。なら、今の練習が大事です。','ぼくも、春いちばんに咲けるかなぁ。')),
  L(null,'花びらが一枚、主人公の頭にのった。体の奥が、むずむずと熱かった。')]],
 late:['いちばん最後の梅','shrine',['tanuki'],(s,L,say)=>[
  L('tanuki','この梅は、いつも町でいちばん最後に咲くんだ。でも、いちばん長く咲いてる。'),
  L('player',say(s,'最後でも、いちばん長く……。オレ、それもかっこいいと思うぜ！','遅く咲くほど、長く咲く。……時間を味方にできる、ということですね。','ゆっくりでも、いいんだねぇ。ぼく、ゆっくりは得意だよぉ。')),
  L('tanuki','きみの足も、まだつぼみだ。あせらなくていい。'),
  L(null,'その夜は、いつもより深く眠った。体の奥で、何かがゆっくり育っている気がした。')]],
 friendly:['3匹で走った日','training',['child','rival'],(s,L,say)=>[
  L('child','ちょびも、いっしょに練習する！',['player','child']),
  L('rival','ぼくも。……種、持ってきたよ。',['player','rival']),
  L(null,'3匹で走ると、ひとりのときより、ずっと遠くまで行けた。'),
  L('player',say(s,'みんなで走ると、力がわいてくるぜ！','一緒に走ると、ペースが乱れません。……ふしぎですね。','みんなで走ると、たのしいねぇ。おやつも、みんなで食べよ。'))]],
 sturdy:['雨の日の坂','training-rain',['trainer'],(s,L,say)=>[
  L(null,'冷たい雨の中、こよりと坂を何往復もした。'),
  L('trainer','……ねえ、もう帰ろう。風邪ひいちゃう。',undefined,{trainer:'worried'}),
  L('player',say(s,'へっちゃらだぜ！ オレ、ぜんぜん疲れてねえ！','ふしぎです。体が、まだ動きます。','あれぇ、ぼく、ぜんぜんへいきだよぉ。')),
  L('trainer','……体が強くなってるんだ。ちゃんとノートに書いとく。',undefined,{trainer:'happy'})]],
 'gold-idaten':['坂を吹きぬけた風','slope',['trainer','seedshop'],(s,L,say)=>[
  L(null,'夕暮れの坂。うしろから強い風が吹いた瞬間、もう走り出していた。',['player','trainer']),
  L(null,'風より先に、坂の上に着いた。町の動物たちが、ぽかんと口を開けていた。',['player','seedshop']),
  L('seedshop','……おい、今の見たか。あの坂をあんな速さで上ったやつは、あの日のネズミ以来だ。',['player','seedshop']),
  L('player',say(s,'オレ、風になってた……！ 今の、ずっと忘れねえぜ！','今の感覚は、言葉にできません。……でも、体が覚えました。','びゅーんって……。ぼく、風といっしょに走ったよぉ。'),['player','trainer']),
  L('trainer','……ノートに、金色の線を引いとく。',['player','trainer'],{trainer:'happy'})]],
 'gold-heart':['丸太はこびの一日','workshop',['beaver'],(s,L,say)=>[
  L('beaver','今日は丸太はこびだ！ 日が暮れるまでな！'),
  L(null,'一本、また一本。日が暮れても、足は止まらなかった。'),
  L('beaver','……おまえ、ほんとに最後まで運んだのか。わしでも途中で休むぞ。'),
  L('player',say(s,'まだいけるぜ！ 心臓が、ドンドン鳴ってる！','息が乱れていません。……体の芯が、強くなっています。','つかれたぁ。……でも、もう一本くらい、運べちゃうかも。'))]],
 'gold-glutton':['種屋の大食い大会','seedshop',['seedshop','rival'],(s,L,say)=>[
  L('seedshop','さあ、年に一度の大食い大会だ！ 時間内に、いちばん多く食ったやつの勝ち！',['player','seedshop']),
  L(null,'ぽてちも、町の大食いたちも、次々と手を止めていく。まだ食べているのは、一匹だけだった。',['player','rival']),
  L('rival','……きみ、ほお袋が三つくらいあるの？',['player','rival']),
  L('player',say(s,'まだまだ入るぜ！ 優勝はオレだ！','食べる速さと、飲みこむ間合い。……計算どおりです。','おいしかったぁ。……あれ、もうおわりなの？ ぼく、まだ食べられるよぉ。'),['player','rival']),
  L('seedshop','優勝だ！ ……文句なしの、大食い王だな。',['player','seedshop'])]],
 'gold-guide':['神社の古い迷路','shrine',['tanuki'],(s,L,say)=>[
  L('tanuki','神社の裏に、むかしの迷路があるんだ。……ぬけられたのは、十二支の何匹かだけさ。'),
  L(null,'苔むした石の道。目をとじると、出口までの道が、一本の光の線に見えた。'),
  L('player',say(s,'こっちだぜ！ 道が、勝手に教えてくれる！','分かれ道の石の向きが、すべて出口を指しています。','なんでかなぁ。こっちに行けば、出られる気がするの。')),
  L('tanuki','……ぬけた。一度も、まちがえずに。きみには、道しるべが見えるんだね。')]],
 'gold-idol':['手作りの応援旗','town',['child','seedshop'],(s,L,say)=>[
  L('child','見て見て！ 町のみんなで、旗を作ったの！',['player','child']),
  L(null,'色とりどりの布に、自分の名前。種屋さんも、手入れ役も、ぽてちも、一枚ずつ縫ったという。',['player','seedshop']),
  L('player',say(s,'オレのための旗……！ みんな、ありがとな！','こんなに、たくさんの手が……。必ず、応えます。','うれしいなぁ。……ぼく、みんなのこと、だいすきだよぉ。'),['player','child']),
  L('child','つぎの練習、ちょびたち、もっと来るからね！',['player','child'])]],
 'gold-bloom':['遅れて咲いたひまわり','seedshop',['seedshop'],(s,L,say)=>[
  L('seedshop','この鉢のひまわりな、植えてから三年、一度も咲かなかったんだ。'),
  L(null,'その鉢に、今朝、町でいちばん大きな花が開いていた。'),
  L('seedshop','大きい花ほど、時間がかかる。……おまえも、そういう足かもしれねえな。'),
  L('player',say(s,'オレも、でっかく咲いてみせるぜ！ 見てろよ！','時間をかけて、大きく。……その道を、選びます。','ゆっくり、おおきく。……ぼく、それがいいなぁ。'))]]
};
export const RARE_IDS=Object.keys(RARE_SCENES).map(id=>'rare-'+id);
