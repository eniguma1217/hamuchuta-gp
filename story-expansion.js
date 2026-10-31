// Curated scenes from the owner's 50-event story drafts.
// Narrative only: no training effects, race RNG, qualification or reward changes.
// Existing mandatory milestones in story-today.js retain priority on the same turn.
export const L=(speakerId,text,visibleIds,expressions)=>({speakerId,text,...(visibleIds?{visibleIds}:{}),...(expressions?{expressions}:{})});
const seen=(s,id)=>s.events.history.some(h=>h.eventId===id);
const chosen=(s,id)=>s.events.history.find(h=>h.eventId===id)?.choiceId;
const actionNames={speed:'かけっこ',stamina:'回し車',appetite:'早食い',intelligence:'勉強',technique:'迷路',rest:'休息',outing:'お出かけ',scout:'下見'};
const heroLine=(s,dash,hakase,mochi)=>s.personalityId==='energetic'?dash:s.personalityId==='cool'?hakase:mochi;
export const storyBeats=[
 {turn:1,id:'exp-notebook-first',title:'ノートの1ページ目',scene:'training-morning',ids:['trainer'],max:3,lines:s=>[
  L(null,`${s.lastAction?.key==='rest'?'朝の部屋':'朝の練習場'}。昨日の坂の印があるノートを、こよりが開いた。`),
  L('trainer',`今日の${actionNames[s.lastAction?.key]||'一歩'}も、ここに。${s.lastAction?.outcome==='failure'?'うまくいかなかったことも、次のために残そう。':'昨日の印の、つづきだよ。'}`),
  L('player',heroLine(s,'忘れ物はない！ たぶんな！','ノートの書式は完成していますね。あとは結果です。','あっ、あさごはんはもう食べたよぉ。')),
  L(null,'こよりはタイム欄を空白のままにして、ページのすみに小さく何か書いた。'),
  L('player',heroLine(s,'そこ、なに書いたんだ？','そこには、何を書いたんですか。','そこ、なに書いたのぉ？')),
  L('trainer',s.lastAction?.outcome==='failure'?'……くやしそうだった、って。気持ちも残しておこうと思って。':['rest','outing','scout'].includes(s.lastAction?.key)?'……自分で次の一歩を選んだ、って。ちゃんと残したいから。':'……たのしそうだった、って。数字だけじゃ、忘れちゃうから。'),
  L(null,'小さな記録のとなりに、今日の気持ちが書き足された。')
 ]},
 {turn:10,id:'exp-fireworks-promise',title:'花火と、答えなかった質問',scene:'shrine-night',ids:['trainer'],max:11,choices:[{id:'together',label:'答えは、2匹で探そう'},{id:'share',label:'今日は、おやつを半分こしよう'}],lines:s=>[
  L(null,'夏祭りの夜。神社の石段に座ると、花火の明かりが二匹のほっぺを照らした。'),
  L('player',heroLine(s,'こより、オレ、十二支になれると思うか？','今のわたしたちで十二支に届く可能性は、どのくらいですか。','ねえ、こより。ぼく、十二支になれるかなぁ。')),
  L('trainer','……花火、きれいだね。'),
  L(null,'返事の代わりに、空に大きな花が開く。こよりはノートをぎゅっと抱えた。'),
  L('player',heroLine(s,'……聞こえてるってば。','……まだ、答えは出ていないんですね。','……半分こしよう。お祭りのおやつ、ねぇ。')),
  L('trainer','うん。……ありがとう。')
 ]},
 {turn:36,id:'exp-rival-hard-question',title:'なんで、つらそうに走るの？',scene:'training-dusk',ids:['rival'],max:37,requires:['rival-first','rat-imitation','ordinary-response-2'],lines:s=>[
  L(null,'2年目の練習場。その片隅で、ぽてちがいつもの調子で首をかしげた。'),
  L('rival','ねえ。走るの、好きじゃないの？ 最近、つらそうな顔してる。'),
  L('player',heroLine(s,'好きに決まってるだろ！ 好きだから、勝ちたいんだ！','好きかどうかと、勝ちたいかどうかは、別の話です。','……好きだよぉ。好きだから、ちょっと、くやしいんだ。')),
  L('rival','そうなんだ。ぼく、走るのはいつも楽しいから……ごめんね。'),
  L(null,'悪気のない言葉が、いつもより重く響いた。ぽてちは笑わず、主人公の背中を見送った。')
 ]},
 {turn:40,id:'exp-rival-make-up',title:'仲直りって、どうやるの？',scene:'town-dusk',ids:['rival','seedshop','tanuki','beaver','child'],max:41,requires:['exp-rival-hard-question'],choices:[{id:'take-seed',label:'種を受け取る'},{id:'hold-paw',label:'手をにぎる'},{id:'stop-drum',label:'太鼓を止める'}],lines:s=>[
  L(null,'夕方の町。ぽてちは種の袋と小さな太鼓、なぜか工具まで抱えてふらふらしていた。'),
  L('rival','種屋さんは「種を渡せ」、タヌキさんは「祭りだ！」、ビーバーさんは「締め直せ」って……。'),
  L('player',heroLine(s,'全部いっぺんにやるなって！ ……もう怒ってないぜ。','仲直りの方法は、そんなに複雑ではないと思います。','……その種、半分こするぅ？')),
  L('rival','ぼく、きみの「好き」を、ちゃんと知らなかった。ごめん。'),
  L('player',heroLine(s,'オレも、言い方が悪かった。ぽてちと走るの、好きだぜ。','わたしも、言い方が悪かったです。ぽてちと走るのは、好きです。','ぼくも、言い方が悪かったぁ。ぽてちと走るの、好きだよぉ。')),
  L(null,'ぽてちは安心した拍子に太鼓を鳴らしてしまう。帰り道まで、二匹の笑い声が続いた。')
 ]},
 {turn:58,id:'exp-fireworks-answer',title:'花火と、先に言った答え',scene:'shrine-night',ids:['trainer'],max:59,requires:['exp-fireworks-promise','main-year2'],lines:s=>[
  L(null,'3年目の夏祭り。あの夜と同じ石段で、こよりが先に口を開いた。'),
  L('trainer',chosen(s,'exp-fireworks-promise')==='share'?'あの夜、半分こしたおやつ、覚えてる。言葉にできなくても、隣にいてくれたね。':'あの夜、2匹で答えを探そうって言ってくれたね。僕も、ずっと考えていた。'),
  L('trainer','十二支になれるかどうかは……まだ、わかんない。'),
  L('trainer','でも、なりにいこう。……僕も、いっしょに。'),
  L('player',heroLine(s,'よっしゃ！ その言葉、待ってたぜ！','その返事を、三年間でいちばん聞きたかったです。','えへへ。じゃあ、帰ったらまた一緒に練習しようねぇ。')),
  L(null,'花火が開いた。同じ石段なのに、二匹の座る距離だけが少し近かった。')
 ]},
 {turn:68,id:'exp-child-snow-senior',title:'雪の日の、ちいさな先輩',scene:'town-snow',ids:['child','trainer'],max:69,requires:['child-first'],lines:s=>[
  L(null,'3年目の冬。坂の上に積もった雪に、小さな足あとが続いている。'),
  L('child',seen(s,'exp-child-wheel')?'あのとき、回し車もこわかったのにね。今日はこっちを案内するよ。':'前は後ろをついていくだけだったけど、今日はこっちを案内するよ。'),
  L('player',heroLine(s,'おっ、もう立派な先輩じゃん！','足の運び方が変わりましたね。自分で考えて歩いています。','いつのまに、そんなに大きくなったのぉ。')),
  L('child',chosen(s,'exp-child-wheel')==='wait'?'あのとき待ってくれたから、自分でも、いっぱい試せたんだ。':chosen(s,'exp-child-wheel')==='beside'?'あのとき隣にいてくれたから。今度は、ちょびが隣を歩くよ。':'いっしょに練習したあと、自分でもいっぱい試したから。'),
  L('trainer','三年って、長いね。……でも、まだ一緒に歩きたいな。'),
  L(null,'白い道には、並んだ三匹分の足あとが、どこまでも続いていた。')
 ]}
];
export const sideStoryBeats=[
 {min:6,max:18,id:'exp-sleepy-trainer',title:'寝ぼけたこよりは、こわい',scene:'bedroom-morning',ids:['trainer'],lines:s=>[
  L(null,'朝の部屋。寝ぐせを一本立てたこよりが、半分寝たまま練習ノートを開いた。'),
  L('trainer','次はあと二本。いまのきみならできる。迷ったら、一歩目からやり直そう。'),
  L('player',heroLine(s,'えっ、今日のこより、すげえ頼もしいぜ！','的確です。……起きていますか？','ふふ、こより、まだおねむだねぇ。')),
  L(null,'はっと目を開けたこよりの耳が、真っ赤になった。'),
  L('trainer','……えっ！？ い、いまのは忘れて！')
 ]},
 {min:14,max:23,id:'exp-beaver-puddle',title:'練習場の、なぞの水たまり',scene:'training-rain',ids:['trainer','beaver'],lines:s=>[
  L(null,'雨が続く練習場。毎朝、同じところに水たまりができている。'),
  L('player',heroLine(s,'だれだ、コースに水をためたの！','流れの方向からすると、あの木の陰ですね。','あれぇ。お水、増えてるねぇ。')),
  L(null,'木陰ではビーバーが黙々と枝を積んでいた。'),
  L('beaver','……新しい道具がうまくいかなくてな。考えると、ついダムを作っちまう。'),
  L('trainer','悩みが、目に見える形になってる……。'),
  L('beaver','見物は終わり！ 片づけるぞ！')
 ]},
 {min:16,max:35,id:'exp-child-wheel',title:'回し車が、こわい',scene:'training-morning',ids:['child','trainer'],requires:['child-first'],choices:[{id:'wait',label:'自分で踏み出すまで、待つ'},{id:'beside',label:'隣に座って、一緒に試す'}],lines:s=>[
  L('child','前に回し車から落ちちゃって……もう、乗れないかも。'),
  L('player',heroLine(s,'じゃあ今日は走らない！ まず一緒に座ろうぜ。','回さなくても、ここにいていいんです。少しずつ試しましょう。','だいじょうぶ。一緒に座って、種を一粒食べよぉ。')),
  L(null,'ちょびはしばらく回し車を見つめ、前足を一つだけ乗せた。'),
  L('child','……あ、これなら、できるかも。'),
  L('trainer','ちょび、自分で一歩決められたね。')
 ]},
 {min:15,max:36,id:'exp-seed-tasting',title:'種の利き比べ',scene:'seedshop',ids:['rival','seedshop'],requires:['rival-first'],lines:s=>[
  L('seedshop','よし、今日は目かくしで種の味を当ててみな。'),
  L(null,'ぽてちは一粒かじるたび、花が咲いたように笑う。全部、当たりだった。'),
  L('player',heroLine(s,'ぜ、全部おんなじにうまいぞ！？','見た目の情報なしで、どう見分けているんでしょう……。','この種、香ばしいねぇ。ぽてち、味の違いが分かるんだぁ。')),
  L('rival','うん。走るのは楽しいけど、種の味はもっと真剣に考えるよ。'),
  L('seedshop','……おめえら、うちの種を無料で食べに来たんじゃねえだろうな。')
 ]},
 {min:18,max:23,id:'exp-winter-coat',title:'冬毛の季節',scene:'town-snow',ids:['trainer','child'],requires:['child-first'],lines:s=>[
  L(null,'冬の朝。町の小道に、短い足あとがぽつぽつ続いていた。'),
  L('player',heroLine(s,'うわっ、静電気で毛が逆立ったぜ！','冬毛です。わたし、少し白っぽくなったでしょうか。','ほっぺも、もっと丸くなったねぇ。')),
  L('child','わあ、ふわふわ！ 一瞬、だれだか分からなかった！'),
  L('trainer',s.personalityId==='cool'?'あごをトントンするそのくせ。きみだって、すぐ分かるよ。':'毛がふくらんでも、いつものきみだね。'),
  L(null,'冬の姿が少し変わっても、友だちにはちゃんと見つけてもらえた。')
 ]},
 {min:30,max:35,id:'exp-summer-melt',title:'ハムとけの夏',scene:'town-summer',ids:['trainer','seedshop','beaver'],lines:s=>[
  L(null,'真夏のひまわりタウン。みんな冷たい床にぺたんと寝そべっている。'),
  L('seedshop','いらっしゃい。……種はそこの棚。今日は起き上がれねえ。'),
  L('player',heroLine(s,'暑くても走る！ ……いや、ちょっと、待ってくれ。','いちばん涼しい場所を計算しました。……もう、こよりがいます。','ぼく、もう溶けちゃったぁ。')),
  L('beaver','冷たい石のベンチを作ったぞ！ ……使う前に、おいらが寝る。'),
  L('trainer','今日は水を飲んで、涼しいところで休もうね。')
 ]},
 {min:30,max:59,id:'exp-seedshop-scale',title:'種屋のはかり',scene:'seedshop',ids:['seedshop','trainer'],lines:s=>[
  L(null,'種屋のはかりが、きらきら光っている。つい、ちょこんと乗ってみた。'),
  L('seedshop','……おい。おめえは売り物じゃねえぞ。'),
  L('player',heroLine(s,'何グラムだ！？ 強さも量れるのか！？','体重を記録したいだけです。……少し、増えていますね。','ぼく、いくらぁ？')),
  L('seedshop','値段は付けられねえな。……ほお袋の中身のぶんは、払ってもらうが。'),
  L(null,'ほお袋の種を出すと、はかりの針が、半分まで戻った。'),
  L('trainer','……体重の半分、種だったんだ。')
 ]},
 {min:48,max:69,id:'exp-shop-keeper',title:'店番、たのまれる',scene:'seedshop-interior',ids:['seedshop','rival'],requires:['rival-first'],lines:s=>[
  L('seedshop','ちょっと店番を頼む。……棚の種には手を出すなよ。'),
  L('player',heroLine(s,'了解！ 全部、目立つところに並べるぜ！','単位重量あたりの値段順に整理します。','おいしそうな順に並べてみるねぇ。')),
  L(null,'戻った種屋は並び替えられた棚を見て、長いこと黙っていた。'),
  L('rival','ねえ、小石でも買える？ お金、忘れた。'),
  L('seedshop','……しょうがねえな。おめえら、二匹とも。')
 ]}
];
export function bigSuccessBeat(s){
 if(s.lastAction?.outcome!=='great'||s.turn>=70)return null;
 return {id:'exp-great-success',title:'だれかに言いたい！',scene:'town-dusk',ids:['trainer','seedshop','tanuki','beaver'],lines:[
  L(null,'今日の大成功がうれしくて、主人公はひまわりタウンへ駆け出した。'),
  L('player',heroLine(s,'なあ！ 今日の練習、すごかったんだぜ！','……今日の結果は、ぜひ聞いてほしいです。','えへへ。今日はね、すっごくうまくいったのぉ。')),
  L('seedshop','……そうか。おっと、種をこぼしちまった。'),
  L('tanuki','これはお祝いの旗がいるねえ！'),
  L('beaver','練習場の手入れが役に立ったか。……もちろん、頑張ったのはおまえさんだ。'),
  L('trainer','……いっしょにいたよ？ 最初から見てたのに。'),
  L(null,'うれしい日にいちばん近くにいた相手と、顔を見合わせて笑った。')
 ]};
}
