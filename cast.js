// Character relationships are narrative data, never race modifiers.
export const ZODIAC_CAST=[
 ['rat','ネズミ','挑戦を尊重する誠実な努力家','王座は譲った。でも、挑み続ける気持ちは譲らないよ。次はぼくが追いかける。'],
 ['ox','ウシ','自分の歩幅を守る、穏やかな王者','急がず、ここまで来たつもりだった。きみの一歩も、ちゃんと届いたんだね。'],
 ['tiger','トラ','強面だが、声をかけるのが不器用','く、悔しいよ。……でも、きみにはちゃんと、おめでとうって言いたかった。'],
 ['rabbit','ウサギ','かわいさより走りを見てほしい実力派','悔しいわよ、もちろん。でも、今日のあなたは強かった。それは認める。'],
 ['dragon','タツ','親切だが、量や力の尺度が少しずれる','小さな一歩が、ずいぶん大きなところまで届いたのう。見事じゃ。'],
 ['snake','ヘビ','ひとりで考える、丁寧で鋭い観察者','予想に収まらない走りでした。……もう少し、あなたの選択を見ていたいですね。'],
 ['horse','ウマ','爽やかで礼儀正しく、自分には厳しい','おめでとうございます。悔しさは持ち帰ります。次は、もっと納得できる走りを。'],
 ['sheep','ヒツジ','段取り好きで、予定外には慌てがち','お祝いの言葉、準備したのに……ああ、先に涙が。おめでとう、本当に。'],
 ['monkey','サル','観客の反応が大好きな目立ちたがり','今日はきみへの拍手が一番だね。……ちぇっ、いい顔で手を振るじゃないか！'],
 ['rooster','ニワトリ','誰も見ていなくても全力の熱血家','完敗を受け止める！ 明日の練習も全力だ！ きみも、胸を張って進め！'],
 ['dog','イヌ','約束を行動で守る、口下手な王者','……いい勝負だった。ありがとう。次も、約束だ。'],
 ['boar','イノシシ','大胆な勝負好き。出走前の習慣は丁寧','いやあ、悔しい！ その度胸、気に入ったぞ。次も正面から競おうな！']
].map(([id,name,trait,farewell])=>({id,name,trait,farewell}));
export const ZODIAC_BUDDIES=[['tiger','dog'],['sheep','rooster']];
export const TOWN_CAST=[{id:'trainer',name:'こより'},{id:'rival',name:'ぽてち'},{id:'child',name:'ちょび'},{id:'seedshop',name:'種屋さん'},{id:'tanuki',name:'神社の管理役'},{id:'beaver',name:'練習場の手入れ役'}];
export function formerChampion(s){
 if(s.ending!=='zodiac_member')return null;
 const fallen=ZODIAC_CAST.filter(c=>s.lastRace?.standings.slice(12).some(x=>x.species===c.name));
 // Stable zodiac order is the user-approved tie rule, including zero contacts.
 return fallen.reduce((best,c)=>!best||(s.npcRelations[c.id]||0)>(s.npcRelations[best.id]||0)?c:best,null);
}
