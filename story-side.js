// Side stories (#30, owner 2026-10-25 「そのほかの話も全体的に見直したい」): training lines, daily
// scenes, town visits and the post-race bench. Shared by story v2 and v3; scenes with the Cat are v3 only.
// Narrative only: no stats, rewards, RNG or race results change. Picks rotate on saved history
// (training log, event history, visit count), so a reload shows the same line.
// Canon kept: the twelve never join the town or local practice (PR #22). The Rat is only seen at
// the shrine, where story v3 already brings him.
const said=(s,a,b,c)=>s.personalityId==='energetic'?a:s.personalityId==='cool'?b:c;
const L=(speakerId,text,visibleIds,expressions)=>({speakerId,text,...(visibleIds?{visibleIds}:{}),...(expressions?{expressions}:{})});
const done=(s,id)=>s.events.history.some(h=>h.eventId===id);
const chosen=(s,id)=>s.events.history.find(h=>h.eventId===id)?.choiceId;
const v3=s=>s.storyVersion===3;
// Same calendar as gameDate(): turn 0 is early April, two turns a month.
export const monthOf=turn=>(3+Math.floor((turn%24)/2))%12+1;
export const seasonOf=turn=>{const m=monthOf(turn);return m>=3&&m<=5?'spring':m<=8&&m>=6?'summer':m>=9&&m<=11?'autumn':'winter';};

// ---- Training lines: by training, outcome and personality; never the same line twice in a row ----
const TRAIN={
 speed:{
  q:[['「今の、風になってた！ なってたよな！？」','「一歩目が、0.1秒速くなりました」','「走ったら、ほお袋の種がしゃかしゃか鳴ったぁ」'],
     ['「もう一本！ 足が勝手に前に出るんだ！」','「腕の振りを変えたら、足がついてきました」','「風がきもちいい〜。もう一本だけ、走ろっかな」'],
     ['「坂の旗まで、今なら届く気がする！」','「速さは、まっすぐの積み重ねですね」','「ゴールに種が置いてあったら、もっと速いのになぁ」']],
  n:['こよりのストップウォッチが、ぴっと鳴った。「うん、いい顔」',
     s=>done(s,'child-first')?'練習場のすみで、ちょびが同じ構えをまねしていた。':null,
     s=>v3(s)&&done(s,'cat-slope')?'坂の上で、だれかのしっぽが一度だけ揺れた気がした。':null],
  great:['「見たか！？ 今の一歩、自分でもびっくりしたぜ！」','「……今のは、記録の書き間違いではありません」','「速すぎて、ほお袋の種を置いてきちゃった」'],
  fail:['「い、今のは地面の調査！」 ほっぺに土がついていた。','「足がもつれました。原因は……焦り、です」','「ころんだら、種がころころ……追いかけちゃった」']
 },
 stamina:{
  q:[['「まだ回せる！ 回し車のほうが先にへばった！」','「呼吸と足を合わせると、長く回せます」','「ころころ回って……ちょっと目が回ったぁ」'],
     ['「100周！ ……数えてないけど、たぶん100周！」','「後半の落ちこみが、昨日より小さいです」','「回し車の音、子守歌みたい……はっ、起きてるよ」'],
     ['「息が上がっても、足は止めない！」','「持久力は、退屈に耐える力でもありますね」','「いっぱい回したから、ごはん大盛りでもいいよね？」']],
  n:['回し車のきしむ音が、朝より軽くなった。','こよりがノートに、小さな丸をひとつ増やした。',
     s=>done(s,'cat-shortcut')?'一晩じゅう回すネコのやり方を思い出して、首を振った。今日は、ここまで。':null],
  great:['「止まらない！ 回し車、もう一台持ってきて！」','「後半、ペースが落ちませんでした。初めてです」','「ぜんぜん疲れないよ。……あれ、ほんとに？」'],
  fail:['「回し車に……回された……」','「最初に飛ばしすぎました。記録しておきます」','「回し車の上で、ちょっとだけ寝ちゃった」']
 },
 appetite:{
  q:[['「ほお袋、満タン！ 記録更新！」','「かむ回数は減らさず、運ぶ量を増やす。理屈は合っています」','「練習って、おいしいねぇ」'],
     ['「むぐむぐ……むぐ！（勝った！）」','「ほお袋の左右、入れる順番が大事でした」','「ぜんぶ食べちゃった。……あ、練習だったっけ」'],
     ['「早食いなら、もうだれにも負けない……たぶん！」','「……むぐ。（正確に食べ終えた、の意）」','「この種、もう一回練習したいなぁ」']],
  n:['種の殻が、きれいな山になった。こよりは数えるのをあきらめた。','通りかかった種屋さんが「うちの種で遊ぶな」と笑った。',
     s=>done(s,'rival-first')?'ぽてちの前足を思い出して、もう一粒。まだ、あの速さには届かない。':null],
  great:['「新記録だ！ ほお袋、まだ入るぞ！」','「……自分の前足が、見えませんでした」','「気づいたら、お皿がからっぽだったの」'],
  fail:['「むせた！ ……げほっ、ちょっと、休憩！」','「ほお袋の容量を、見誤りました」','「おいしくて、ゆっくり味わっちゃった……」']
 },
 intelligence:{
  q:[['「コースの図、ぜんぶ覚えた！ ……半分くらい！」','「ゾーンの順番から、ペース配分が見えてきました」','「勉強すると、おなかがすくのはなんでだろう」'],
     ['「頭を使ったら、なんか足まで速くなった気がする！」','「こよりのノートの字、読めるようになりました」','「ノートのすみに、種の絵を描いちゃった」'],
     ['「作戦ノート、オレも一行書いた！」','「知っていれば、迷う時間が減る。それも速さです」','「むずかしいけど……ちょっとだけ分かった、かも」']],
  n:['こよりと二匹で、コースの図に赤い線を引いた。','本を開いたまま、少しだけうとうとした。……少しだけ。',
     s=>s.races?.length?'前の大会の記録を、こよりと読み返した。抜かれた場所に、印をつけた。':null],
  great:['「分かった！ ぜんぶ分かった！ ……今だけかも！」','「頭の中で、コースがぜんぶつながりました」','「ひらめいた……！ あ、種の新しい食べ方じゃないよ」'],
  fail:['「字が……字が、踊ってる……」','「同じ行を三回読みました。今日はここまでにします」','「ノートを枕にしちゃった……」']
 },
 technique:{
  q:[['「右、左、右！ 体が道を覚えてる！」','「分かれ道で迷う時間が、半分になりました」','「迷路の奥に種が落ちてたよ。……出口も見つけた」'],
     ['「行き止まりなんか、もう怖くない！」','「出口から逆にたどると、近道が見えます」','「くるくる曲がって、ちゃんと出られたぁ」'],
     ['「迷路の出口、オレのほうが先に見つけた！」','「同じ失敗は、二度しません」','「迷っても、ゆっくり行けば出口はあるねぇ」']],
  n:['練習場の迷路が、昨日より一本長くなっていた。ビーバーのしわざだ。','出口で、こよりが種をひとつ持って待っていた。'],
  great:['「一回も止まらずに出口！ 迷路が道をあけた！」','「最短の道順を、一度で見つけました」','「目をつぶっても出られそう……むにゃ」'],
  fail:['「行き止まり！ また行き止まり！ 迷路のいじわる！」','「右手の法則が、今日は通じませんでした」','「迷路の中で、おやつ休憩しちゃった」']
 }
};
const GREAT_N=['こよりがノートを落としそうになった。「い、今の、もう一回見せて！」','練習場の空気が、一瞬止まった。こよりの目が、まんまるになっていた。'];
const FAIL_N=['こよりは何も言わずに、ノートに「次は、ここから」と書いた。','こよりの声は、いつも通りだった。「失敗も、ちゃんと記録するね」'];
// Lines that open with 「 are the hero's voice on the home screen; everyone else's words come after narration.
const TIRED=[['「まだ、いける……たぶん……」','「……少し、ペースを落とすべきですね」','「おふとん……おふとんが、呼んでる……」'],'こよりがノートの端に書いた。「足、重そう。次は休もうか」','練習のあと、しばらく立ち上がれなかった。こよりが黙って水を置いた。','こよりが、そっと「休む日」の欄に丸をつけた。'];
// Lines when friends practice with the hero (#30 B2): Potechi by training; the others have lines for
// their favourite training and lines that fit any training.
const HELP={
 speed:['ぽてちと並んで走った。「きみの足音、たのしいね！」','ぽてちが「次はぼくが先！」と言って、スタートで転んだ。'],
 stamina:['ぽてちが隣の回し車で、なぜか逆向きに回っていた。','ぽてちと回し車を回した。二台の音が、だんだんそろっていった。'],
 appetite:['ぽてちと早食い勝負。ぽてちの前足は、やっぱり見えなかった。','ぽてち「種はね、においで選ぶんだよ」。……本当に速くなった。'],
 intelligence:['ぽてちがノートをのぞきこんで、「この線、種の形だね」と言った。','ぽてちと勉強した。ぽてちは途中から、種の絵を描いていた。'],
 technique:['ぽてちが行き止まりで、楽しそうに手を振っていた。','ぽてち「出口って、だいたい種のにおいがする方だよ」。……当たっていた。']
};
const FRIEND_LINES={
 child:{favorite:'speed',fav:['ちょびといっしょに走った。ちょびは三回転んで、三回起きた。','ちょびが、主人公とまったく同じ構えでスタートした。'],any:['ちょびが横で、同じことをしてついてきた。','ちょびが「せんぱい、すごい！」と手をたたいた。'],friend:['ちょびと息がぴったり合った。「せんぱいと、同じ速さだった！」']},
 seedshop:{favorite:'appetite',fav:['種屋さんが腕を組んで見ていた。「かむのは三回。あとは飲みこめ」','種屋さんの早食いの手本は、今でも目で追えなかった。'],any:['種屋さんが、店の種を一袋だけ置いていった。「練習用だ。売り物じゃねえ」','種屋さんが通りがかりに足を止めて、最後まで見ていた。'],friend:['種屋さんが、初めてほめた。「……今のは、売り物になるな」']},
 tanuki:{favorite:'intelligence',fav:['神社の管理役が、昔の大会の話をしてくれた。三つ目の話で、少し居眠りした。','神社の管理役が地図を指さした。「昔の子はね、ここで迷ったんだよ」'],any:['神社の管理役が、旗を振って応援してくれた。','神社の管理役が、お茶を持ってきてくれた。……熱すぎた。'],friend:['神社の管理役が、旗を両手で振った。肩が上がらないはずなのに、高く。']},
 beaver:{favorite:'technique',fav:['練習場の手入れ役が、迷路の壁を一枚ずらした。「今日はこっちだ」','練習場の手入れ役が、行き止まりに小さな印をつけてくれた。'],any:['練習場の手入れ役が、足もとの小石を全部どけてくれた。','練習場の手入れ役が、道具の音を聞きながらうなずいた。'],friend:['練習場の手入れ役が手を止めた。「おまえさんが使うと、道具がよろこぶ」']},
 cat:{favorite:'stamina',fav:['ネコが黙って、隣の回し車に乗った。……止まる気配がない。','ネコの回し車の音は、夜みたいに静かだった。'],any:['ネコが、少し離れたところから見ていた。……最後まで、帰らなかった。','ネコ「……悪くない。だが、遅い」'],friend:['ネコと、足音がそろった。ネコは何も言わなかったが、しっぽが一度揺れた。']}
};
const FRIEND=['ぽてちと息がぴったり合った。「いまの、ふたりの記録だね！」','ぽてちと並んだ一歩が、いつもより大きかった。','ぽてち「きみと練習すると、種の味までちがうんだ」'];
const portraitOf=n=>n?.portraitId||(n?.id==='domestic-0'?'rival':n?.id);
const helperLines=(n,key)=>{const id=portraitOf(n);if(id==='rival')return HELP[key];const f=FRIEND_LINES[id];return f?[...(f.favorite===key?f.fav:[]),...f.any]:[];};
const together=(a,b)=>[`${a.name}と${b.name}が、同じ練習に来てくれた。いつもより、にぎやかだった。`,`${a.name}も${b.name}も来て、練習場がいつもより狭く見えた。`];
export const TRAINING_KEYS=Object.keys(TRAIN);
// The pool a training result draws from (exported for tests).
export function trainingPool(s,outcome,key,helper,helpers=helper?[helper]:[]){
 const T=TRAIN[key];if(!T)return [];const pick=a=>said(s,a[0],a[1],a[2]);
 if(outcome==='failure')return [pick(T.fail),...FAIL_N];
 if(outcome==='friendship'){const best=helpers.find(n=>(s.npcRelations?.[n.id]||0)>=80)||helpers[0];const id=portraitOf(best);return id==='rival'||!FRIEND_LINES[id]?FRIEND:FRIEND_LINES[id].friend.concat(FRIEND_LINES[id].fav.slice(0,1));}
 if(helpers.length>=2)return [...together(helpers[0],helpers[1]),...helperLines(helpers[0],key)];
 if(helper)return helperLines(helper,key);
 if(outcome==='great')return [pick(T.great),...GREAT_N];
 if(s.energy<20)return TIRED.map(x=>Array.isArray(x)?pick(x):x);
 return [...T.q.map(pick),...T.n.map(n=>typeof n==='function'?n(s):n).filter(Boolean)];
}
// Called before this training is logged. Shared pools (tired, friendship) rotate on every training, the rest on
// this training's own count; a line shown last time for this training or in the last three actions is skipped.
export function trainingLine(s,outcome,key,helper,helpers){
 const pool=trainingPool(s,outcome,key,helper,helpers);if(!pool.length)return null;
 const log=s.log||[],mine=log.filter(e=>e.trainingKey===key),recent=[mine[0]?.text||'',...log.slice(0,3).map(e=>e.text||'')];
 const shared=outcome==='friendship'||(outcome!=='failure'&&!helper&&outcome!=='great'&&s.energy<20),start=shared?log.length:mine.length;
 for(let i=0;i<pool.length;i++){const line=pool[(start+i)%pool.length];if(!recent.some(t=>t.endsWith(line)))return line;}
 return pool[start%pool.length];
}

// ---- Daily scenes (the optional slot every 6 turns): each one at most once a run ----
// Slots fall on 7月 / 10月 / 1月 / 4月. Seasonal ones only show in their season.
const DAILY=[
 {id:'daily-footprints',title:'帰り道の足あと',ids:['trainer'],lines:s=>[L('trainer','ノートの足あと、またひとつ増えたよ。'),L('player',said(s,'今度の足あとは、もっと先につけるぜ！','見直す時間も、練習のうちですね。','足あとって、種の形にも見えるねぇ。……おなかすいた。'))]},
 {id:'daily-crumbs',title:'ほっぺの忘れもの',ids:['trainer'],lines:s=>[L('trainer','ほっぺに、今日の練習場がついてる。'),L('player',said(s,'これは、頑張った証拠だ！ ……取ってくれよ。','土も持ち帰っていましたか。……内緒でお願いします。','種じゃなかったぁ。大事にしまうところだったよぉ。')),L(null,'こよりは笑って、小さな土のかけらを払った。')]},
 {id:'daily-note',title:'ノートのすみ',ids:['trainer'],lines:s=>[L('player',said(s,'そのノート、オレの絵も描いてあるのか？','そのノート、わたしの絵も描いてあるんですか。','そのノート、ぼくの絵も描いてあるのぉ？')),L('trainer','フォームの記録だよ。……ちょっと丸く描きすぎたかな。'),L('player',said(s,'もうちょっと、かっこよく描いてくれよ！','実物との誤差は……あまり、ないですね。','そのほっぺ、いいねぇ。種も描き足そう。'))]},
 {id:'daily-slope',title:'神社の坂道',ids:['trainer'],scene:'slope',lines:s=>[L(null,'帰り道、神社の坂で足を止めた。十二支の飾りが、夕風に揺れていた。'),L('player',said(s,'あそこからだと、練習場もちっちゃく見えるな！','あそこからだと、練習場も小さく見えますね。','あそこからだと、練習場もちっちゃく見えるねぇ。')),L('trainer','でも、そこにいた2匹は、昨日より少し進んでるよ。')]},
 {id:'daily-cheeks',title:'ほお袋の在庫しらべ',ids:['trainer'],scene:'training-morning',lines:s=>[
  L(null,'練習の前。こよりが「ほお袋、いったん出して」と手を出した。'),
  L(null,'種が三つ。小石がひとつ。ボタンがひとつ。最後に、小さくたたんだ紙が一枚。'),
  L('trainer','これ……僕のノートの切れはし？'),
  L('player',said(s,'作戦は、いつでも持ち歩くんだぜ！','必要な情報は、取り出しやすい場所に入れています。','なくさないように、しまっといたのぉ。')),
  L('trainer','……ほっぺの中は、取り出しやすい場所じゃないよ。')]},
 {id:'daily-sand',title:'砂あびの日',ids:['trainer'],scene:'town-summer',weight:2,when:s=>seasonOf(s.turn)==='summer',lines:s=>[
  L(null,'暑い午後。練習場のすみに、こよりが細かい砂を用意してくれた。'),
  L('player',said(s,'砂あびだ！ ごろごろ全開だぜ！','毛並みの手入れも、体調管理のうちです。','ふかふか〜。ここで寝てもいいかなぁ？')),
  L(null,'砂の上でころころ転がって、起き上がると、半分くらい砂の色になっていた。'),
  L('trainer','……どっちが前か、分からなくなってる。')]},
 {id:'daily-sunflower-plant',title:'一粒、まく？',ids:['trainer','seedshop'],scene:'seedshop',when:s=>s.turn<=20,lines:s=>[
  L('seedshop','ほらよ、とびきりの一粒だ。食うなよ。まくんだぞ。'),
  L('player',said(s,'食べないのかよ！？ ……い、いいけどさ！','今の一粒と、来年の何百粒。計算上は、まくべきです。','……さよなら、ぼくのおやつぅ。')),
  L('trainer','来年の夏、咲いたら見に来よう。'),
  L(null,'練習場のすみの小さな土の山に、こよりが割りばしの札を立てた。「はむちゅたーの」。')]},
 {id:'daily-sunflower-bloom',title:'あの日の、ひまわり',ids:['trainer'],scene:'town-summer',requires:['daily-sunflower-plant'],weight:3,when:s=>s.turn>=25&&seasonOf(s.turn)==='summer',lines:s=>[
  L(null,'夏の練習場。すみっこに、主人公の背の何倍もあるひまわりが咲いていた。'),
  L('trainer','あの日まいた一粒だよ。……ほら、札がまだある。'),
  L('player',said(s,'でっか！ オレより先に、てっぺんまで行きやがった！','一粒が、ここまで。……積み重ねの見本ですね。','この一粒から、種がいっぱい……食べ放題だぁ！')),
  L('trainer','食べるのは、秋になってからね。'),
  L(null,'ひまわりは、練習場のほうを向いて咲いていた。')]},
 {id:'daily-radio',title:'ラジオの名前',ids:['trainer','seedshop'],scene:'seedshop-interior',weight:2,when:s=>!!s.races?.length&&s.races.at(-1).kind!=='zodiac',lines:s=>{const r=s.races.at(-1);return [
  L(null,'種屋のラジオが、国内大会の結果を読み上げている。'),
  L(null,`「――${r.title}。${r.rank}位は、ひまわりタウンの${s.individualName}選手」`),
  L(null,'名前が呼ばれた瞬間、店の奥でだれかが小さく「よし」と言った。'),
  L('player',said(s,'……今の「よし」、だれだ？','……今の「よし」は、どなたですか。','……今の「よし」、だれぇ？')),
  L('seedshop','知らねえ。ラジオの調子が悪いんだろ。'),
  L(null,'種屋さんは、音を少しだけ大きくした。')];}},
 {id:'daily-new-year',title:'年賀状',ids:['trainer'],scene:'town-snow',weight:3,when:s=>seasonOf(s.turn)==='winter',lines:s=>[
  L(null,'新しい年。郵便受けに、小さな年賀状が何枚も届いていた。'),
  ...(done(s,'rival-first')?[L(null,'ぽてちからは、種の絵が一枚。字は書いていなかった。')]:[]),
  ...(done(s,'child-first')?[L(null,'ちょびからは、二匹ぶんの足あとのはんこ。小さいほうが、少し前を歩いている。')]:[]),
  ...(v3(s)&&s.events.storyProgress['cat-met']?[
   L(null,'最後の一枚は真っ白で、すみに肉球の跡がひとつだけあった。'),
   L('trainer','……これ、だれからだろうね。'),
   L('player',said(s,'13番目のあいつだ！ 絶対そうだ！','この大きさの肉球は、町に一匹しかいません。','……返事、書こうかぁ。坂の上に置いとくねぇ。'))
  ]:[
   L(null,'最後の一枚は、こよりからだった。「今年も、隣で」。'),
   L('player',said(s,'……同じ家に住んでるのに、なんで郵便なんだよ？','……同じ家に住んでいるのに、なぜ郵便なんですか。','……同じおうちなのに、なんで郵便なのぉ？')),
   L('trainer','こういうのは、形が大事なの。')
  ])]},
 {id:'daily-rain-plan',title:'雨の日の作戦会議',ids:['trainer'],scene:'training-rain',lines:s=>[
  L(null,'雨で練習場が使えない日。こよりが机にコースの図を広げ、種を駒にして並べた。'),
  L('trainer','この種がきみ。こっちが相手。ここで、こう抜いて……あれ、きみの駒は？'),
  L('player',said(s,'……作戦は、腹に入れといたぜ。','……失礼しました。考えごとをすると、つい。','ごめんねぇ、おいしそうだったから……。')),
  L('trainer','作戦ごと食べないで。')]},
 {id:'daily-chobi-copy',title:'ちょびのまね',ids:['child','trainer'],scene:'training',requires:['child-first'],when:s=>s.turn<=44,lines:s=>[
  L(null,'練習場に来ると、ちょびが主人公と同じ構えで待っていた。'),
  L('child','見て！ ちょび、ほっぺに種を三つ入れたまま走れるようになったよ！'),
  L('player',said(s,'それは、まねしなくていいやつだ！','……その部分は、参考にしなくていいです。','すごいねぇ！ ……ぼくは四つ入るけどね。')),
  L('child','えっ、ずるい！'),
  L('trainer','張り合うところ、そこじゃないよ。')]},
 {id:'daily-potechi-arrow',title:'種の矢印',ids:['trainer','rival'],scene:'training-morning',requires:['rival-first'],when:s=>s.turn<=50,lines:s=>[
  L(null,'練習場の入り口から、ひまわりの種の矢印が点々と続いていた。'),
  L(null,'たどっていくと、最後の一粒の横に紙が一枚。「あした　しょうぶ。ぽてち」'),
  L('player',said(s,'受けて立つぜ！ ……矢印の種、拾いながら来ちゃったけどな。','待ち合わせの時間が、書いてありません。','矢印、ぜんぶ食べながら来ちゃったぁ……。')),
  L('trainer','その矢印、たぶんぽてちの帰り道のぶんも兼ねてたと思う。'),
  L(null,'翌日。ぽてちは、帰り道で迷子になっていた。')]},
 {id:'daily-beaver-box',title:'おいらの新作',ids:['trainer','beaver'],scene:'workshop',lines:s=>[
  L(null,'練習場に、見慣れない木の箱が置いてあった。'),
  L('beaver','おいらの新作だ！ 入ると、勝手に足が速くなる……はずだった箱だ。'),
  L('player',said(s,'入るぜ！','仕組みを、説明してもらえますか。','中、あったかいのぉ？')),
  L('beaver','……入ると、ちょうどよく狭くてな。みんな、寝ちまうんだ。'),
  L(null,done(s,'rival-first')?'箱の中では、ぽてちがすでに寝息を立てていた。':'箱の中では、こよりがいつのまにか寝息を立てていた。')]},
 {id:'daily-flag-wish',title:'旗の願いごと',ids:['trainer','tanuki'],scene:'shrine',lines:s=>[
  L('tanuki','祭りの旗に、願いごとを書くといいよ。ひとり一行ねえ。'),
  L(null,'こよりは小さく「けがなく」と書いた。'),
  L('player',said(s,'「十二支」！ ……字がでかすぎて、旗からはみ出た！','「十二支。確率を、上げる」。','「十二支と、種の食べ放題」。')),
  L('tanuki','うんうん。願いごとは、ちょっと欲ばりなくらいがちょうどいい。')]},
 {id:'daily-height',title:'柱のしるし',ids:['trainer'],scene:'bedroom',when:s=>s.turn>=49,lines:s=>[
  L(null,'部屋の柱に、毎年の背の高さの印がついている。'),
  L('trainer','1年目、2年目、3年目……。うん、ぜんぜん伸びてない。'),
  L('player',said(s,'伸びてるって！ 毛がな！','成長期は過ぎています。妥当です。','ほっぺは、伸びたよぉ。横に。')),
  L('trainer','でも、ノートは三冊になったよ。'),
  L(null,'柱の印は変わらない。その横に積んだノートだけが、主人公の背を越えていた。')]},
 {id:'daily-first-slope',title:'最初の坂、もう一度',ids:['trainer'],scene:'slope',weight:3,when:s=>s.turn>=53,lines:s=>[
  L(null,'夕暮れ。3年前に足が止まった、あの坂の旗の前。'),
  L('trainer','覚えてる？ 最初の日、ここまで来られなかった。'),
  L('player',said(s,'今なら、目をつぶっても届くぜ！','今の足なら、7秒です。','ここで種を食べる予定だったねぇ。……今日、食べよっか。')),
  L(null,'二匹は旗の下に座って、種を一粒ずつ食べた。3年前の予定が、やっと終わった。')]},
 // Story v3 only: the Cat and the Rat between the main scenes.
 {id:'daily-cat-rerun',title:'前の日から',ids:['trainer','seedshop'],scene:'seedshop',weight:2,v3:true,requires:['cat-first'],when:s=>s.turn<=36,lines:s=>[
  L(null,'種屋の壁に、去年の世界十二支決定戦の写真が貼ってあった。夕暮れの坂を上る、十三の背中。'),
  L('seedshop','いちばん後ろのが、あのネコだ。何百年も、毎回この坂を最後まで上ってる。'),
  L('player',said(s,'次は、12の中で並んで走る！ ネコとも、オレとも！','何百年、一度も休まずに……。簡単なことでは、ありません。','ネコさん、毎回ちゃんと出てるんだね。……すごいなぁ。')),
  L('seedshop','あいつ、毎年いちばん早く会場に来るんだとよ。前の日からな。')]},
 {id:'daily-cat-roof',title:'屋根の上の家賃',ids:['seedshop','cat'],scene:'seedshop',weight:2,v3:true,requires:['cat-first'],lines:s=>[
  L(null,'種屋の屋根の上で、ネコが昼寝をしていた。',['player','seedshop','cat'],{cat:'sleepy'}),
  L('seedshop','おい、そこ。家賃払え。',['seedshop','cat']),
  L('cat','……払ってる。夜の見回り。',['seedshop','cat']),
  L('seedshop','頼んでねえ。',['seedshop','cat']),
  L('player',said(s,'見回り、本当にしてるのかよ！？','……町の夜は、静かですからね。','見回りのあと、おなかすくよねぇ。'),['player','cat']),
  L(null,'次の日から、店先に小さな皿がひとつ増えた。だれのための皿かは、だれも言わなかった。',['player','seedshop'])]},
 {id:'daily-cat-potechi',title:'ネコと、ぽてち',ids:['rival','cat'],scene:'training-dusk',weight:2,v3:true,requires:['cat-first','rival-first'],when:s=>s.turn<=56,lines:s=>[
  L(null,'練習場のベンチで、ぽてちとネコが並んで座っていた。会話は、なかった。',['rival','cat']),
  L('rival','……種、食べる？',['rival','cat']),
  L('cat','いらない。',['rival','cat']),
  L('rival','じゃあ、半分。',['rival','cat']),
  L('cat','……半分なら。',['rival','cat']),
  L('player',said(s,'えっ、そういう仕組みかよ！？','……交渉の基本ですね。','ぽてち、すごいねぇ……。'),['player','rival','cat']),
  L(null,'ネコは半分を食べて、しばらく黙って、もう半分も食べた。',['rival','cat'])]},
 {id:'daily-cat-snow',title:'坂の上の足あと',ids:['trainer'],scene:'town-snow',weight:2,v3:true,requires:['cat-slope'],when:s=>seasonOf(s.turn)==='winter',lines:s=>[
  L(null,'雪の朝。神社の坂に、大きな足あとが何十本も重なっていた。'),
  L('trainer','……一晩で、何往復したんだろう。'),
  L('player',said(s,'数えてくるぜ！ ……途中で分からなくなった！','足あとの深さが、最後まで同じです。一度も、乱れていません。','……足、つめたくなかったのかなぁ。')),
  L(null,'いちばん上の段に、足あとがひとつだけ、こちらを向いて止まっていた。')]},
 {id:'daily-rat-dawn',title:'朝いちばんの石段',ids:['rat'],scene:'shrine',weight:2,v3:true,requires:['rat-confession'],lines:s=>[
  L(null,'朝いちばんの神社。石段を、小さな影が何度も往復していた。',['player','rat']),
  L(null,'王者のネズミだった。あの日、坂を駆け抜けた走りより、ずっと地味な練習だった。',['player','rat']),
  L('rat','……見られちゃったか。速く見える走りは、だいたい、こういう朝からできてるんだ。',['player','rat']),
  L('player',said(s,'王者でも、朝練するんだな！','夜ではなく、朝なんですね。','ネズミさんも、朝ごはんの前に走るのぉ？'),['player','rat']),
  L('rat','夜は、坂の上にネコがいるからね。……ぼくが行ったら、走れなくなるだろう？',['player','rat'],{rat:'sad'}),
  L(null,'ネズミは最後に、坂の上を一度だけ見上げた。',['player','rat'])]}
];
export const DAILY_IDS=DAILY.map(d=>d.id);
export const DAILY_TITLES=Object.fromEntries(DAILY.map(d=>[d.id,d.title]));
// Daily scenes that may show now (story-today wraps them as optional events).
export function dailyScenes(s){
 return DAILY.filter(d=>(!d.v3||v3(s))&&(d.requires||[]).every(id=>done(s,id))&&(!d.when||d.when(s))&&!done(s,d.id));
}

// ---- Town visits: each friend has a short run of visits, then rotating small talk ----
// Visitable: the seed shop, the shrine keeper, the workshop, Potechi (after meeting) and, in v3, the Cat.
export function visitScene(s,id,count){
 const n=count;
 if(id==='seedshop'){
  if(n===1)return {lines:[L('seedshop','おう、今日はどんな種がいい？ よく食べるやつほど、好みがはっきりしてるもんだ。'),L('player',said(s,'うーん、そうだな……。','そうですね……。','そうだなぁ……。'))]};
  if(n===2)return {lines:[L('seedshop',s.social.seedPreference==='small'?'小粒のほう、ちゃんと覚えてるぜ。急いで丸のみすんなよ。':'歯ごたえのあるやつだな。よくかんで、食べてけ。'),L('trainer','好みまで覚えてくれてるんですね。'),L('seedshop','毎日顔見てりゃ、そりゃな。今日も2匹で来たんだろ？')]};
  if(n===3)return {lines:[L('seedshop','ほら、いつもの種。2匹ぶん、包んどいた。'),L('player',said(s,'まだ、何も言ってねえよ。','まだ、何も言っていませんが。','まだ、何も言ってないよぉ。')),L('seedshop','顔に書いてあらあ。無理すんな。でも、行くなら胸張っていきな。')]};
  if(n===4)return {scene:'seedshop-interior',lines:[
   L(null,'店の奥のたなに、色あせた新聞の切りぬきが何枚も貼ってあった。'),
   L('player',said(s,'これ……オレの大会の記事か！？','これは……わたしの大会の記事ですか。','これ……ぼくの大会の記事ぃ？')),
   L('seedshop','ちげえよ。種の値段の記事だ。……裏に、たまたま載ってただけだ。'),
   L('trainer','……全部、そっちの面を表にして貼ってあるね。')]};
  if(n===5)return {scene:'seedshop-interior',lines:[
   L('seedshop','若いころはな、おれも大会に出た。早食いだけは、だれにも負けなかった。'),
   L('player',said(s,'すげえ！ 走るほうは！？','走りのほうの記録は、ありますか。','走るほうはぁ？')),
   L('seedshop','……種屋になった理由を聞くんじゃねえ。'),
   L(null,'種屋さんは笑って、いつもより一粒多く包んだ。')]};
  const talk=[
   [L('seedshop',seasonOf(s.turn)==='summer'?'暑い日は水も持ってけ。種だけじゃ走れねえぞ。':seasonOf(s.turn)==='winter'?'寒い日は、殻の厚いやつがいい。ほお袋があったまる。……気がする。':'今日の種は、いい日に当たった。持ってけ。'),L('player',said(s,'ありがとな！ 明日も来るぜ！','ありがとうございます。記録しておきます。','わあい。半分は、こよりのぶんねぇ。'))],
   [L('seedshop','大会の日はな、店を閉めて見に行ってる。……売れねえからな、どうせ。'),L('trainer','……いつも、いちばん前の席ですよね。'),L('seedshop','うるせえ。')],
   ...(v3(s)&&s.events.storyProgress['cat-met']?[[L('seedshop','あのネコ、今朝も皿をきれいに空けてった。礼のつもりか、皿の横に小石が一個だ。'),L('player',said(s,'……宝物の小石、かもな。','……宝物の小石、かもしれません。','……宝物の小石、かもねぇ。')),L('seedshop','どうだかな。……捨てずに、とってあるけどよ。')]]:[]),
   [L('seedshop','今日も2匹か。……いや、いい。いつも通りが、いちばんだ。'),L('player',said(s,'おう。いつも通りだ。','はい。いつも通りです。','うん。いつも通りだよぉ。'))]
  ];return {scene:'seedshop',lines:talk[(n-6)%talk.length]};
 }
 if(id==='tanuki'){
  if(n===1)return {lines:[L('tanuki',s.turn<24?'今年の祭りも、町じゅうに旗を掛けよう。少し、持ってくれる？':s.turn<48?'応援の旗が増えてねえ。次はどこへ掛けようか。':'もうすぐまた祭りだよ。去年の旗も、大事に取ってあるんだ。'),L('player',said(s,'この高さなら、オレにも届くな！','この高さなら、わたしにも届きますね。','この高さなら、ぼくにも届くねぇ。')),L('tanuki','うんうん。小さな手も、集まると頼もしいなあ。')]};
  if(n===2)return {scene:'town',lines:[
   L('tanuki','あっ、旗が飛んだ！ 待って待って〜！'),
   L(null,'風に飛んだ旗を追いかけて、主人公は町を一周した。'),
   L('player',said(s,'つかまえた！ ……今の、いい練習になったぜ！','風下に回れば、落ちる場所は分かります。','はぁ、はぁ……旗って、速いねぇ。')),
   L('tanuki','助かったよお。きみ、旗より速かったねえ。')]};
  if(n===3)return {lines:[
   L('tanuki','この箱にはね、町から大会へ出た子たちの旗が入ってるんだ。'),
   L('player',said(s,'こんなにかよ！？','こんなに、ですか。','こんなにぃ？')),
   L('tanuki','勝った子のも、負けた子のも、みんなの旗だよ。……きみのぶんの場所も、もう空けてある。')]};
  if(n===4)return {lines:[
   L('tanuki','この足はね、昔からおそくてねえ。走るより、旗を振るほうが向いてたんだ。'),
   L('player',said(s,'旗振り、大事だぜ！ 見えると、ほんとに速くなる！','応援の効果は、実際にあると思います。','走ってるとき、旗が見えるとうれしいよぉ。')),
   L('tanuki','そう言ってもらえると、腕が上がるねえ。……あいたた、肩が上がらない。')]};
  if(n===5)return {lines:v3(s)&&s.events.storyProgress['cat-met']?[
   L('tanuki','昔の十二支の祭りにはね、13本目の旗を立てる町もあったんだって。'),
   L('player',said(s,'13本目？ だれの旗だ？','13本目？ どなたの旗ですか。','13本目？ だれの旗ぁ？')),
   L('tanuki','さあねえ。……でも、旗っていうのは、待ってる者のためにあるんだよ。')]:[
   L('tanuki','世界大会の日は、町じゅうで旗を振るよ。画面の向こうまで届かなくても、振る。'),
   L('player',said(s,'届くぜ。ぜったい、ちゃんと。','届きます。たぶん、ちゃんと。','届くよぉ。たぶん、ちゃんと。')),
   L('tanuki','……うん。じゃあ、もっと大きいのを作らないとねえ。')]};
  const talk=[
   [L('tanuki',seasonOf(s.turn)==='winter'?'雪の日は、旗が重くてねえ。しっぽで雪を払ってるんだ。':seasonOf(s.turn)==='summer'?'夏の旗は、すぐ色があせるんだ。また塗り直しだねえ。':'今日は、旗がよく揺れる日だねえ。'),L('player',said(s,'手伝うぜ。今日は、一本だけな。','手伝います。今日は、一本だけ。','手伝うよぉ。今日は、一本だけね。'))],
   [L('tanuki','きみの旗、だんだん大きくしてるの、気づいてた？'),L('player',said(s,'気づいてたぜ！ もっと大きくしてくれ！','……一年で、2割ほどですね。','ぼくのほっぺと、同じくらいの伸び方だねぇ。'))],
   [L('tanuki','祭りの太鼓、だれかが勝手に鳴らすんだよねえ。'),L('player',said(s,'……ぽてちだと思うぜ。','……ぽてちだと思います。','……ぽてちだと思うなぁ。'))]
  ];return {lines:talk[(n-6)%talk.length]};
 }
 if(id==='beaver'){
  if(n===1)return {lines:[L('beaver','回し車、がたがた言ってるな。それじゃ足も落ち着かねえだろ。'),L('player',said(s,'おう。なんとかなるか？','はい。なんとかなりますか。','うん。なんとかなるかなぁ？')),L('beaver','おいらに任せな。まず、どこで揺れるか教えてくれ。')]};
  if(n===2)return {lines:[L('beaver','試作の支え、できたぞ！ ……あれ、静かすぎて、おいらが眠くなる。'),L('trainer','足元はずっと安定しました。もう少し、使いやすくできますか？'),L('beaver','その感想が欲しかった！ 次は、おまえさんの練習に合わせてみる。')]};
  if(n===3)return {lines:[L('beaver','おいらの改良だ！ 次の3ターン、選んだ練習の成長量が10%上がるぞ。'),L('player',said(s,'じゃあ、これを試してみたいぜ！','では、これを試してみたいです。','じゃあ、これを試してみたいなぁ。'))]};
  if(n===4)return {lines:[
   L('beaver','スタート台を作ってみた！ どうだ、この高さ！'),
   L(null,'台は、主人公の背の三倍あった。'),
   L('trainer','……階段をつけたら、どうでしょう。'),
   L('beaver','スタートで階段を登るやつがいるか！ ……作り直しだ。')]};
  if(n===5)return {lines:[
   L('beaver','おいらはな、泳ぐのは得意だが、走るのはからきしだ。'),
   L('player',said(s,'えっ、こんなにすごい道具を作るのにかよ！？','だから、走る者の道具を？','……だから、ぼくたちの道具、作ってくれるのぉ？')),
   L('beaver','道具ってのは、使うやつがいて、はじめて完成するんだ。おまえさんが走るたびに、完成するのさ。')]};
  const talk=[
   [L('beaver','今日も道具は良好。手入れは地味だが、走りの土台だ。'),L('player',said(s,'また、使い心地を言いに来るぜ！','また、使い心地をお伝えしに来ます。','また、使い心地を伝えに来るねぇ。'))],
   [L('beaver',seasonOf(s.turn)==='winter'?'雪で道がすべる。砂をまいといたぞ。':seasonOf(s.turn)==='summer'?'回し車に油をさしといた。……音、聞こえねえだろ。それが一番の仕事だ。':'迷路を一本、伸ばしといた。……文句は受けつけねえ。'),L('player',said(s,'ありがとな！ 使ってみるぜ！','気づかないところで、助かっています。','ありがとう。……迷路は、ほどほどでおねがいねぇ。'))],
   [L('beaver','考えごとしたら、またダムができちまった。'),L('trainer','……あとで、一緒に片づけましょうか。')]
  ];return {lines:talk[(n-6)%talk.length]};
 }
 if(id==='rival'){
  if(n===1)return {scene:'town',lines:[
   L(null,'ぽてちの家は、どの部屋も種の袋でいっぱいだった。'),
   L('rival','いらっしゃい！ 今日はね、とっておきの種を見せてあげる。'),
   L(null,'出てきたのは、ふつうのひまわりの種だった。'),
   L('rival','これね、きみと初めて会った日に、床で拾ったやつ。'),
   L('player',said(s,'それ、ただの落とし物だろ！','……あの日、こよりが落とした袋の種ですね。','食べないで、とってあるのぉ？')),
   L('rival','うん。食べたら、なくなっちゃうから。')]};
  if(n===2)return {scene:'training',lines:[
   L('rival','ねえ、「本気」って、どうやるの？ きみみたいな顔、してみたいんだ。'),
   L('player',said(s,'こうだ！ 歯をくいしばって、前だけ見るんだ！','目標を決めて、そこだけを見る。たぶん、そういうことです。','おなかが空いてるときの顔、かなぁ。')),
   L(null,'ぽてちはまねをして、三秒で笑ってしまった。'),
   L('rival','むずかしいね。……でも、きみの本気の顔は、好きだよ。')]};
  if(n===3)return {scene:'town-dusk',lines:[
   L('rival','練習場って、どっちだっけ。毎日行ってるのに、毎日わかんないんだ。'),
   L(null,'主人公は、ぽてちを練習場の入り口まで送った。'),
   L(null,'帰りにふり返ると、ぽてちは、来た道をそのまま帰っていくところだった。'),
   L('player',said(s,'……練習、しないのかよ！？','……練習は、しないんですか！？','……練習、しないのぉ！？'))]};
  if(n===4)return {scene:'town',lines:[
   L('rival','きみが世界に行ったら、ぼく、応援に行くね。種、いっぱい持って。'),
   L('player',said(s,'その前に、国内でオレと勝負だろ！','……ぽてちも、代表をねらえる位置にいますよ。','ぽてちも、一緒に行こうよぉ。')),
   L('rival','……あ、そっか。ぼくも、行けるのか。'),
   L(null,'ぽてちは、たった今それを思いついたような顔をした。')]};
  if(n===5)return {scene:'training-dusk',lines:v3(s)&&s.events.storyProgress['cat-met']?[
   L('rival','このあいだね、ネコさんに走り方を聞いたんだ。'),
   L('player',said(s,'えっ。なんて言ってた！？','えっ。何と言っていましたか。','えっ。なんて言ってたのぉ？')),
   L('rival','「最初の一歩を、低く」だって。……あと、「種をよこせ」って。'),
   L('player',said(s,'……それ、たぶん後半が本題だぜ。','……それは、たぶん後半が本題です。','……それ、たぶん後半が本題だよぉ。'))]:[
   L('rival','このあいだね、ちょびに走り方を教えたんだ。'),
   L('player',said(s,'ぽてちが？ なんて教えたんだ？','ぽてちが？ 何と教えたんですか。','ぽてちが？ なんて教えたのぉ？')),
   L('rival','「ゴールに種があると思って走る」。'),
   L('player',said(s,'……ちょっと、分かるぜ。','……少し、分かります。','……ちょっと、分かるなぁ。'))]};
  const talk=[
   [L('rival','きょうの種、ちょっと甘いね。……あ、ほっぺのやつ、きのうのだった。'),L('player',said(s,'……きのうの種を、今日食べてるぞ。','……昨日の種を、今日食べていますね。','……きのうの種を、今日食べてるねぇ。'))],
   [L('rival','つぎの大会も、となりで走れるといいね。'),L('player',said(s,'となりじゃなくて、前で待ってるぜ！','となりでも、前でも。本気で行きます。','うん。となりで、たのしく走ろうねぇ。'))],
   [L('rival','走ったあとの種って、なんでこんなにおいしいんだろうね。'),L('player',said(s,'……がんばったから、だな！','……努力の結果、でしょうか。','……がんばったから、かなぁ。')),L('rival','そっか。じゃあ、ぼく、がんばるの好きかも。')]
  ];return {scene:'town-dusk',lines:talk[(n-6)%talk.length]};
 }
 if(id==='cat'){
  const met=k=>done(s,k);
  if(n===1)return {scene:'seedshop',lines:[
   L(null,'種屋の屋根の上。ネコは片目だけ開けた。',['player','cat'],{cat:'sleepy'}),
   L('cat','……何の用だ。',['player','cat']),
   L('player',said(s,'用はない！ 会いに来ただけだ！','特に用件はありません。……顔を見に来ました。','おやつ、半分こしに来たよぉ。'),['player','cat']),
   L('cat','……ひまなやつだ。',['player','cat']),
   L(null,'そう言いながら、ネコは屋根から降りてきて、少し離れたところに座った。',['player','cat'])]};
  if(n===2)return {scene:'seedshop',lines:[
   L('cat','おまえのとこの、ノートのやつ。毎朝、おまえより早く練習場に来てるぞ。',['player','cat']),
   L('player',said(s,'……知らなかったぜ。','……知りませんでした。','……知らなかったよぉ。'),['player','cat'],{player:'surprised'}),
   L('cat','ああいうのは、大事にしろ。……おれには、いなかった。',['player','cat']),
   L(null,'ネコはそれ以上、何も言わなかった。',['player','cat'])]};
  if(n===3)return {scene:'slope',lines:[
   L('cat','おまえ、数を数えられるか。坂の上まで、おれが何秒か数えろ。',['player','cat']),
   L(null,'ネコが走った。主人公は数えた。坂の上で、しっぽが一度揺れた。',['player','cat']),
   L('player',said(s,'……7！ ……たぶん7だ！','7秒です。','えっと……いっぱい！'),['player','cat']),
   L('cat','昨日も7。百年前も7だ。……速くも、遅くもならない。',['player','cat']),
   L(null,'それが自慢なのか、くやしいのか、主人公には分からなかった。',['player','cat'])]};
  if(n===4)return {scene:'slope',lines:met('rat-confession')?[
   L('cat','……最近、あいつがこっちを見てる。何か言いたそうな顔でな。',['player','cat']),
   L('player',chosen(s,'rat-confession')==='tell'?said(s,'言いたいことがあるんだよ！ 聞いてやってくれ！','聞いてあげてください。たぶん、大事な話です。','……聞いてあげて、ほしいなぁ。'):said(s,'……さあな。オレからは、言えない。','……わたしからは、何も。','……なんだろうねぇ。'),['player','cat']),
   L('cat','……ふん。何百年も待たせて、今さら顔だけか。',['player','cat'])]:[
   L('cat','あの日、坂を走ったネズミ、見たか。……昔から、ああいう顔だけはうまい。',['player','cat']),
   L('player',said(s,'ネズミさんのこと、知ってるのか！？','……昔から、ですか。','……ネズミさんと、ともだちなのぉ？'),['player','cat']),
   L('cat','……ともだち、だったこともある。それだけだ。',['player','cat'])]};
  if(n===5)return {scene:'slope',lines:[
   L('cat','13番目ってのはな、12の席が全部見える場所だ。',['player','cat']),
   L('cat','……いちばん近くて、いちばん遠い。',['player','cat']),
   L('player',said(s,'じゃあ、一緒に12に入ろうぜ！','……二匹とも、12に入る方法はあります。','……ぼくも、そこから見てみたいなぁ。……ちがう、座ってみたい。'),['player','cat']),
   L('cat','……おまえ、ほんとうに、めんどうなやつだな。',['player','cat'])]};
  const talk=[
   [L('cat','……また来たのか。',['player','cat']),L('player',said(s,'おう。また来たぜ。','はい。また来ました。','うん。また来たよぉ。'),['player','cat']),L('cat','……しっぽは、さわるなよ。',['player','cat'])],
   [L('cat','種は、いらない。……そこに置いてけ。',['player','cat']),L(null,'帰りぎわにふり返ると、種はもうなかった。',['player'])],
   [L('cat','夜は冷える。おまえは、もう帰れ。……ノートのやつが、待ってるぞ。',['player','cat']),L('player',said(s,'……おう。また来る！','……はい。また明日。','うん。おやすみぃ、ネコさん。'),['player','cat'])]
  ];return {scene:'slope',lines:talk[(n-6)%talk.length]};
 }
 return null;
}

// ---- After-race bench: a closing line that changes every time, and a visitor ----
export function benchExtras(s,r,beat){
 const y=r.year,win=r.rank===1,lost=!win&&!beat;
 const closing=y===1?(win?'この丸、最初の坂の印より大きく描いとくね。……ちょっと大きすぎた。':'この順位も、ノートに書いとく。年末の予選まで、まだ伸ばせるよ。')
  :y===2?(win?'去年の今ごろの記録と並べると……ほら、もう別の子みたい。':'去年の今ごろと比べたら、ちゃんと縮まってる。数字は、うそつかないよ。')
  :(win?'あと少しで、代表決定戦。……泣くのは、ぜんぶ終わってからにする。':'ここからは、一戦ずつが最後の練習だね。帰って、作戦。');
 const visitor=
  y===1&&v3(s)&&s.events.storyProgress['cat-met']?[
   L(null,'ベンチのうしろの塀の上を、ネコが通りすぎた。',['player','trainer','cat']),
   L('cat',win?'……一番か。小さい池の、な。':r.rank<13?'……何位だった。……ふうん。13位よりは、上だな。':r.rank===13?'……13位か。……ふん。似合わないぞ、おまえには。':'……13位より下か。まだ、その程度だ。',['player','cat']),
   L(null,'それだけ言って、ネコは塀の向こうへ消えた。',['player','trainer'])]
  :y===2&&s.events.storyProgress['rat-met']?[
   L('seedshop','おう、いたいた。会場の出口でな、ネズミに呼び止められた。',['player','trainer','seedshop'],undefined),
   L('seedshop',lost?'「最後まで、前を向いてた」だとさ。……伝言は、それだけだ。':'「一歩目が、去年より低くなった」だとさ。……伝言は、それだけだ。',['player','trainer','seedshop']),
   L('player',said(s,'ネズミさんが、見てた……！','……見ていてくれたんですね。','……うれしいなぁ。'),['player','trainer'])]
  :y===3&&v3(s)&&done(s,'cat-past')?[
   L(null,'帰り道の坂の上に、ネコが座っていた。',['player','trainer','cat']),
   L('cat','世界で待ってる。……遅れるなよ。おれは、遅れない。',['player','cat']),
   L(null,'「遅れない」のところだけ、少し声が低かった。',['player','trainer'])]
  :[];
 return {closing:L('trainer',closing),visitor,ids:[...(visitor.some(l=>l.speakerId==='cat'||l.visibleIds?.includes('cat'))?['cat']:[]),...(visitor.some(l=>l.speakerId==='seedshop')?['seedshop']:[])]};
}

// ---- Optional side stories with the Cat and the Rat (story v3 only), offered like the others ----
export const v3SideStoryBeats=[
 {min:21,max:27,id:'exp-cat-night',title:'坂の、最初の一歩',scene:'slope',ids:['trainer','cat'],requires:['cat-slope'],v3:true,lines:s=>[
  L(null,'日の暮れた坂。こっそり来てみると、ネコは本当にいた。',['player','cat']),
  L('cat','……また来たのか。',['player','cat']),
  L('player',said(s,'今日は勝負じゃねえ！ 見に来たんだ！','勝負ではなく、見学に来ました。','おやつ、持ってきたよぉ。'),['player','cat']),
  L(null,'ネコは返事をせず、坂を一本だけ駆け上がった。走り出す前、体が地面すれすれまで低く沈んだ。',['player','cat']),
  L('cat','……見るなら、最初の一歩を見ろ。あとは全部、おまけだ。',['player','cat']),
  L(null,'帰り道、主人公は何度も低くかがんでみた。',['player','trainer']),
  L('trainer','……おなか、痛いの？',['player','trainer'],{trainer:'worried'})
 ]},
 {min:14,max:40,id:'exp-cat-eating',title:'ネコ、早食いに挑む',scene:'training',ids:['rival','cat'],requires:['cat-first','rival-first'],v3:true,lines:s=>[
  L(null,'練習場の早食いコーナーで、ネコとぽてちが向かい合っていた。',['rival','cat']),
  L('rival','よーい、どん、で食べるんだよ。',['rival','cat']),
  L('cat','知ってる。……世界大会にも、早食いゾーンはある。',['rival','cat']),
  L(null,'合図。ぽてちの前足が消えた。ネコはまだ、一粒目をていねいにかんでいた。',['rival','cat']),
  L('player',said(s,'ネコ、遅っ！','……ネコさんは、早食いが苦手なんですね。','ネコさん、よくかんで、えらいねぇ。'),['player','cat']),
  L('cat','……うるさい。味わってただけだ。',['player','cat']),
  L(null,'その夜から、坂の上でネコがひとり、種をほおばる練習をしていた。こよりが見た、と言っていた。',['player'])
 ]},
 {min:43,max:66,id:'exp-rat-apology',title:'謝る練習',scene:'shrine',ids:['rat','tanuki'],requires:['rat-confession'],v3:true,lines:s=>[
  L(null,'神社の裏で、ネズミが、わらで作ったネコの人形に向かって立っていた。',['player','rat']),
  L('rat','……ネコ。あの日のことだけど。……いや、ちがうな。',['rat'],{rat:'sad'}),
  L('rat','ネコ、元気？ ……ちがう。何百年ぶりに「元気？」は、おかしい。',['rat']),
  L('tanuki','人形、もうちょっと耳をとがらせようか？',['rat','tanuki']),
  L('player',said(s,'ネズミさん、オレがネコ役やろうか！','謝る言葉は、短いほうが伝わると思います。','……がんばって、ネズミさん。'),['player','rat']),
  L('rat','……ありがとう。でも、本番は、自分ひとりで言わなきゃね。',['player','rat']),
  L(null,'ネズミは人形に、小さく頭を下げた。人形のしっぽが、風で一度揺れた。',['player','rat'])
 ]}
];
