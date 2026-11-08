import {raceReflection} from './early-feedback.js';
import {queueEvent,hasPendingDialogue,validEventDefinition} from './events.js';
import {ZODIAC_CAST,TOWN_CAST,formerChampion} from './cast.js';
import {storyBeats,sideStoryBeats,bigSuccessBeat} from './story-expansion.js';
import * as V3 from './story-v3.js';
import {trainingLine,dailyScenes,visitScene,benchExtras,v3SideStoryBeats} from './story-side.js';
import {withStoryEffects} from './story-effects.js';
import {RARE_CHANCE,RARE_MAX,RARE_SCENES,rareRoll,rareTalentPick} from './story-rare.js';
import * as Book from './story-book.js';
const keys=['speed','stamina','appetite','intelligence','technique'];
const names=['走る','持久力','早食い','勉強','迷路'];
export const isToday=s=>s.storyVersion===2||s.storyVersion===3;
const isV3=s=>s.storyVersion===3;
export const freshSocial=()=>({offerTurn:null,visits:[],boost:null,seedPreference:null});
export function validSocial(s){if(!s)return false;const d=s.social;return s.storyVersion===undefined||((s.storyVersion===2||s.storyVersion===3)&&d&&Array.isArray(d.visits)&&d.visits.length<=72&&d.visits.every(v=>v&&typeof v==='object')&&new Set(d.visits.map(v=>v.turn)).size===d.visits.length&&d.visits.every(v=>Number.isInteger(v.turn)&&v.turn>=1&&v.turn<=s.turn&&['seedshop','tanuki','beaver','rival','cat','rat','tiger','rabbit','dragon'].includes(v.id))&&(d.offerTurn===null||d.offerTurn===s.turn)&&(d.seedPreference===null||['crunchy','small'].includes(d.seedPreference))&&(d.boost===null||(keys.includes(d.boost.key)&&Number.isInteger(d.boost.remaining)&&d.boost.remaining>=1&&d.boost.remaining<=3&&d.boost.percent===.1)));}
const hero=s=>({id:'player',name:s.individualName||'はむちゅたー',variant:['mochi','dash','hakase'].indexOf(s.characterId)});
const person=id=>id==='tv-rat'?{id,name:'テレビのネズミ'}:Book.FIRST_CAST[id]?{id,name:Book.FIRST_CAST[id].name}:[...TOWN_CAST,...ZODIAC_CAST,V3.CAT].find(c=>c.id===id)||{id,name:id};
const L=(speakerId,text,visibleIds,expressions)=>({speakerId,text,...(visibleIds?{visibleIds}:{}),...(expressions?{expressions}:{})});
const reaction=(s,a,b,c)=>s.personalityId==='energetic'?a:s.personalityId==='cool'?b:c;
// Every story definition gets its effects (story-effects.js) here.
function D(s,id,title,lines,ids,extra){return withStoryEffects(s,makeDefinition(s,id,title,Book.isBook(s)?bookWording(id,lines):lines,ids,extra));}
// A run with the four stories (story-book.js) reads a few older lines in their family-and-slope wording.
const bookWording=(id,lines)=>lines.map(l=>{const w=Book.BOOK_WORDING.find(([at,from])=>at===id&&from===l.text);return w?{...l,text:w[2]}:l;});
function makeDefinition(s,id,title,lines,ids=['trainer'],extra={}){return {id,title,mandatory:true,characters:[hero(s),...ids.map(id=>({...person(id),variant:null}))],lines:lines.map(l=>({...l,expressions:l.expressions||({'exp-notebook-first':{trainer:'happy'},'exp-fireworks-promise':{trainer:'worried'},'exp-fireworks-answer':{trainer:'happy',player:'happy'},'exp-rival-hard-question':{player:'determined',rival:'worried'},'exp-rival-make-up':{rival:'happy',player:'happy'},'exp-great-success':{player:'happy',trainer:'happy'},'exp-unsold-seeds':{player:'sad',trainer:'worried'},'exp-child-snow-senior':{child:'happy',trainer:'happy'},'trainer-private':{trainer:'worried'},'trainer-worry':{trainer:'worried',player:'determined'},'rat-imitation':{player:'determined',trainer:'worried'},'coach-return':{trainer:'happy'},'trainer-doubt-2':{trainer:'worried'},'main-year2':{trainer:'happy'},'trainer-confession':{trainer:'worried'},'main-ending':s.ending==='zodiac_member'?{trainer:'happy',child:'happy',player:'happy'}:{trainer:'worried',player:'sad'}}[id]||{}),visibleIds:l.visibleIds||(id==='main-final'?['player',...(l.speakerId?[l.speakerId]:[])]:[...new Set(['player',...ids.slice(0,2),...(l.speakerId?[l.speakerId]:[])])])})),...extra};}
const done=(s,id)=>s.events.history.some(h=>h.eventId===id);
// Training friends (#30 B2, owner 2026-10-25): who can come to practice and their favourite training.
// The twelve never join local practice (PR #22); the Cat is not one of them.
const FRIENDS=[['domestic-0','rival','appetite',s=>done(s,'rival-first')&&s.rivals?.some(n=>n.id==='domestic-0')],['child','child','speed',s=>done(s,'child-first')],
 ['seedshop','seedshop','appetite',()=>true],['tanuki','tanuki','intelligence',()=>true],['beaver','beaver','technique',()=>true],['cat','cat','stamina',s=>isV3(s)&&done(s,'cat-slope')]];
export function localTrainingBuddies(s){return FRIENDS.filter(f=>f[3](s)).map(([id,portraitId,favorite])=>({id,name:person(portraitId).name,favorite,portraitId}));}
export function knownContacts(s){return [...TOWN_CAST.filter(c=>['seedshop','tanuki','beaver'].includes(c.id)),...(done(s,'rival-first')&&s.rivals?.some(n=>n.id==='domestic-0')?[{id:'domestic-0',name:person('rival').name}]:[]),...(done(s,'child-first')?[{id:'child',name:person('child').name}]:[]),...ZODIAC_CAST.filter(c=>s.events.storyProgress['world-met']||c.id==='rat'&&s.events.storyProgress['rat-met']),...(isV3(s)&&s.events.storyProgress['cat-met']?[V3.CAT]:[])];}

function queue(s,d){return queueEvent(s,[d],'today-'+d.id);}
export function mainDefinition(s,stage){
 if(stage==='ending')return endingDefinition(s);
 if(isV3(s)){const m=V3.v3Main(s,stage);return D(s,m.id,m.title,m.lines,m.ids,m.extra||{});}
 if(stage==='prologue'){const S=(scene,speaker,text,visibleIds=['player','trainer'],expressions={})=>({...L(speaker,text,visibleIds,expressions),scene});return D(s,'main-prologue','三歩ぶん、昨日より前へ',[
 S('slope',null,'夕暮れのひまわりタウン。神社へ続く坂で、小さな足が止まった。'),
 S('slope','trainer',`${s.individualName}、今日はここまで。足、ふらふらだよ。`,undefined,{trainer:'worried'}),
 S('slope','player',reaction(s,'あとちょっとで旗だったのに！ ……明日は届く！','旗までは、まだありますね。……もう一度だけ。','あの旗のところで種を食べたかったなぁ。……あと、ちょっと。')),
 S('slope','trainer','でも、昨日より三歩、先まで来たよ。'),
 S('slope','player','……覚えてるの？ そんな小さいこと。'),
 S('slope','trainer','うん。書いてたから。'),
 S('shop','seedshop','おう、いつもの2匹。種は半分ずつか？',['player','trainer','seedshop']),
 S('shop','player','今日は、こっちを多めに。ずっと見ててくれたから。'),
 S('shop','trainer','ありがとう。……あ、テレビ。'),
 S('shop',null,'種の袋を開く手が止まった。店先の小さな画面から、歓声が聞こえる。'),
 S('tv','tv-rat','積み重ねた一歩を、今日の走りに。最後まで、ぼくの全力で。',['player','trainer','tv-rat']),
 S('tv',null,'何百年も王座を譲らない十二支。その先頭で、小さな足が、大きな動物たちと風を切った。'),
 S('tv','player',reaction(s,'ぼくも、あのネズミさんと走る。いつか、同じコースで！','同じコースで、あの走りを見たい。……できれば、勝ちたい。','レースで種も食べられるんだって。……でも、一番見たいのは、あの背中。'),undefined,{player:'determined'}),
 S('note','trainer','まず国内の50匹から、3年かけて代表を選ぶんだよ。その1匹だけが世界へ。'),
 S('note','player','……無理だと、思う？'),
 S('note','trainer','諦めた顔を見るほうが、僕は怖いかな。'),
 S('note',null,'開いた練習帳には、坂の小さな印。昨日の印の、三歩先に。'),
 S('note','trainer','今日は、ここまで来た。その証拠なら、あるよ。'),
 S('note','player','じゃあ、ぼくのトレーナーになって。ぼくのこと、一番よく見てるでしょ。'),
 S('note','trainer','僕も初めてだよ。無茶するときは、止めるからね。',undefined,{trainer:'worried'}),
 S('note','player',reaction(s,'止めたあとは、また走る方法を一緒に考えよう！','止めるだけじゃなくて、次の一歩も。一緒に考えてほしいです。','うん。休んだら、また走る。そのときも、一緒にいてね。')),
 S('note','trainer','……そこまで言うなら。心配だから、僕がサポートするよ。明日も、ノートを持ってくる。'),
 S('morning',null,'翌朝。古びた回し車と、小さな机。練習帳をひらく2匹。'),
 S('morning','trainer','今日は、何を伸ばそう？ やってみたいこと、選んで。',undefined,{trainer:'happy'}),
 S('morning','player',reaction(s,'まずは、一歩！ 昨日のぼくを追い抜くぞ！','今日の一歩を、記録しましょう。2匹で。','いっぱい動いたら、ごはんもおいしいね。……よーし。'),undefined,{player:'happy'}),
 S('morning',null,'3年間の小さな記録が、ここから始まる。')
 ],['trainer','seedshop','tv-rat']);}
 if(stage==='year1')return D(s,'main-year1','となりにいたのは',[
 L(null,'予選の走路。さっきまで、観客席のネズミが小さな一匹を見つめていた。',['rat']),
 L('rat','転んでも、また前へ……。あの頃のぼくも、あんな目をしていたかな。',['rat']),
 L(null,s.lastRace?.kind==='repechage'?'復活戦を終え、次の年へ進めた夕方。主人公は、空いたコースを見ていた。':'25匹に残った夕方。主人公は、空いたコースを見ていた。',['player','trainer']),
 L('player','ネズミさん、来てたんだね。テレビより、ずっと近かった。'),
 L('trainer','うん。……ごめん、ちょっとお腹が。すぐ戻るから！',['player','trainer']),
 L('player','でも、見てるだけじゃ、いやだな。いつかは……あのネズミさんに勝ちたい。',['player']),
 L(null,'話に夢中で、隣の足音が変わったことに気づかなかった。',['player','rat']),
 L('rat','うん。ぼくも、きみと走ってみたいな。',['player','rat']),
 L('player','でしょ？ だから、明日は――……ね、ネズミさん！？',['player','rat'],{player:'surprised'}),
 L('rat',`${s.individualName}、だね。さっきの走りが気になって。途中から、聞かせてもらったよ。`),
 L('player','あ、えっと、勝つっていうのは、その……勝ちたいです。いつか。'),
 L('rat','聞けてうれしいよ。ぼくも走り続ける。同じスタートで会おう。'),
 L('trainer','戻ったよ。……えっ！？ ご、ご挨拶……！',['player','trainer','rat']),
 L(null,'用意していた言葉は、2匹ともひとつも出なかった。憧れだけが、少し近くなった。')
 ],['trainer','rat'],{progress:{'rat-met':1,'rat-recognition':1}});
 if(stage==='year2')return D(s,'main-year2','はじめて、信じられた日',[
 L(null,s.lastRace.kind==='repechage'?'復活戦を越え、最後の12匹に残った。':'最後の12匹に残った。掲示板の名前を、2匹で何度も見た。'),
 L('trainer','僕たちの練習が、あの強い相手にも届いたんだ。……本当に、十二支まで行けるかもしれない。'),
 L('player',reaction(s,'「かも」じゃなくて、行くんだよ。一緒に！','その記録を、もう一度伸ばしましょう。2匹のやり方で。','うん。ごはんも練習も、明日からまた一緒ね。')),
 L(null,'心配して隣を歩いていた幼なじみが、初めて、同じ先を見て笑った。')
 ],['trainer'],{progress:{'trainer-believes':1}});
 if(stage==='final')return D(s,'main-final','同じスタートライン',[
 L(null,'世界大会の控え場所。こよりが、三年分の練習ノートを積み上げた。'),
 L('trainer','最初の坂の印、まだここにあるよ。小さな一歩も、なくなってない。'),
 ...s.races.filter(r=>r.kind!=='zodiac').slice(-4).map(r=>L(null,`ノートには「${r.title}・${r.rank}位」。実際に走った一戦ずつが残っている。`)),
 L('trainer',s.events.storyProgress['notebook-page-seen']?'最後のページ、覚えてる？ 「もし、だめだったら」って。今は「もう一度、一緒に作戦を立てる」って書き足したよ。':'最後のページは、まだ空けてあるよ。どんな結果でも、その次の作戦は一緒に考えよう。'),
 L('player',reaction(s,'じゃあ「勝った！」って書いとく！ 取りに行くしかないもんな！','勝敗はまだ空欄でいい。明日、一緒に書こう。','ぼくは「一番いい種、半分こ」って書くよ。どっちになっても。')),
 L('trainer','……うん。明日も、ちゃんと見てるから。足だけじゃなくて、きみの顔を。'),
 L(null,'国内代表は、ただ1匹。町で見送られた小さな一匹が、約50種類の動物の列へ入った。'),
 ...(s.lastRace.standings.some(x=>x.id==='domestic-0')?[L('rival','くやしいな。きみに勝ちたかったんだ、ぼく。……世界では、ぼくのぶんも本気で走って。'),L('player','うん。帰ったら、また勝負しよう。')]:[]),
 L('rat','あの日、「いつか勝ちたい」って話してくれたね。今日は、ぼくもそのつもりで来た。'),
 L('player',reaction(s,'憧れはそのまま。でも今日は、勝ちに来たよ！','はい。今日は、同じ勝利を目指す相手として。','うん。種にもレースにも、ぜんぶ本気でいくよ。')),
 L('rat','手加減はしない。会えて、うれしいよ。'),
 L(null,'世界の控え場所。町では会ったことのない王者たちも、それぞれの準備をしていた。'),
 L('rabbit','その小さな足で、どこまで届くか見せてね。',['player','rabbit']),
 L('dragon','空は広いけど、今日はみんな同じ地面を走るんだねえ。',['player','dragon']),
 L('ox','慌てなくていい。スタートの時刻は、みんな同じだからね。',['player','ox']),
 L('snake','私は少し、ひとりでコースを見てきます。……よい勝負を。',['player','snake']),
 L('horse','よろしくお願いします。自分で納得できる一歩を、最後まで。',['player','horse']),
 L('sheep','持ち物、順番、準備よし。……あっ、声が近い！',['sheep','rooster']),
 L('rooster','準備よし！ いつも通り、全力でいこう！',['sheep','rooster']),
 L('monkey','おーい、観客席！ ……今はまだ見てないか。レースでは見ててね！',['player','monkey']),
 L('tiger','イヌ、あの、その……今日も、よろしく。',['tiger','dog']),
 L('dog','……うん。',['tiger','dog']),
 L(null,'イヌのしっぽが一度揺れた。トラの肩が、少し下がった。',['tiger','dog']),
 L(null,'イノシシも、力いっぱいにスタートの足踏みをしている。大きな足音のそばで、小さな足も準備を整えた。',['player']),
 L(null,'同じ空。同じ走路。小さな足も、大きな足も、ひとつの合図を待つ。',['player','rat'])
 ],['trainer','rival',...ZODIAC_CAST.map(c=>c.id)],{progress:{'world-met':1,'rat-recognition':3}});
 throw new Error('Unknown main stage: '+stage);
}
const timeline=[
 [4,'child-first','小さな後ろ姿',s=>[L('child','また練習？ ちょびも！ ねえ、その走り方、教えて。'),L('player','よーし、ついておいで。……転んだら、一緒に起きればいいから。'),L('trainer','先輩ぶってるけど、自分も転ぶんだよね。')],['child','trainer']],
 [8,'trainer-private','ノートを閉じる前に',s=>[L(null,'主人公が眠ったあと。幼なじみは練習帳を閉じられずにいた。',['trainer']),L('trainer','十二支なんて、夢のまた夢だ。……そんなこと、言えないよ。あんな顔で走るんだもん。',['trainer']),L('trainer','怪我だけはさせない。それが僕にできる、最初の仕事だ。',['trainer'])],['trainer']],
 [12,'rival-first','種、食べ放題じゃないの？',s=>[
 L(null,'1年目、はじめての通常大会。受付前で、ぽてちが「早食い競技あり！」のポスターをじっと見ている。',['player','trainer','rival']),
 L('rival','ねえ、種はどこで食べられるの？ 食べ放題だと思って来たんだけど。'),
 L('player',reaction(s,'競技だから、本気で食べるんだよ！','競技です。食べ放題という意味ではありません。','……ぼくも食べ放題だと思ったぁ。')),
 L('rival',s.personalityId==='energetic'?'「ほんき」って、どこで売ってるの？': '「きょうぎ」……それって、おいしいの？'),
 L('trainer',s.plans['ordinary-1'].zones.includes('eating')?'今日は早食いゾーンもあるよ。でも、その前後には走るんだ。':'今日は早食いゾーンがないんだ。種を食べるのはレースのあとだよ。'),
 L(null,'こよりが抱えていた種の袋を取り落とした。その瞬間、ぽてちの前足が見えなくなった。'),
 L(null,'床の種が、あっという間にぽてちのほお袋へ消えている。'),
 L('player',reaction(s,'い、今のナシ！ 見えなかった！','……計測できなかった、と記録しておこう。','……ぼくより、はやい。')),
 L('rival',`${s.individualName}だね。おぼえた。ゴールしたら、一緒に種を食べよう。`),
 L(null,'ぽてちは何もない場所で、こてんとつまずいた。あんなに速い前足なのに、本人はまったく気づいていない。')
 ],['trainer','rival']],
 [18,'festival-1','まだ小さな応援',s=>[L('tanuki','神社のお祭りだよ！ 旗、こっちにも掛けよう。十二支の飾りは毎年、大人気だねえ。'),L('child','こっちには、きみの旗を作った！ ちょっと小さいけど。'),L('player','いいじゃん。ぼくの大きさにぴったり。')],['tanuki','child']],
 [22,'trainer-worry','休むのも、前へ進むこと',s=>[L('player','あと一周。予選まで、もっと練習したい。'),L('trainer',s.energy<40?'今日は足が上がってない。休もう。転んで出られなくなったら……。':'予選が近いから、無理してないか気になるんだ。少しだけ、話して帰ろう。'),L('player','出るだけじゃ、だめなんだよ。'),L(null,'言いすぎたと、2匹とも思った。先に口を開いたのは、トレーナーだった。'),L('trainer','夢を止めたいわけじゃない。ただ、どこまで背中を押していいのか……まだ分からない。'),L('player','……うん。今日は帰る。でも明日、また見てて。')],['trainer']],
 [28,'rat-imitation','だめだったときのページ',s=>[
 L(null,'2年目の春。こよりが忘れた練習ノートをひろうと、最後のページが開いた。'),
 L(null,'「もし、だめだったら」。その下には、負けて帰った日の声のかけ方が、何通りも書かれていた。'),
 L('player',reaction(s,'最初から、負けると思ってたのかよ！','……理由を、教えて。どうしてこのページを先に書いたの？','……これ、いつ書いたの？')),
 L('trainer','最初のころ。もし負けて、走るのまで嫌いになっちゃったら、何て言えばいいか分からなくて。'),
 L('trainer','傷ついてほしくなかった。でも……そんなページを先に書いて、ごめん。'),
 L(null,'こよりはノートを抱えて部屋に戻った。主人公は、あのページを思い出して、しばらく動けなかった。'),
 L('player',reaction(s,'……言いすぎた。「今のナシ」は、できないよな。','答えは記録できた。でも、どうしたらいいかはまだ分からない。','……こよりも、ずっとこわかったんだね。'))
 ],['trainer']],
 [32,'coach-rival','見ている一匹',s=>[L(null,'主人公がいない練習場で、2匹が道具を片づけていた。',['trainer','rival']),L('rival','さっき、よく気づいたね。足がちょっとずれたの。',['trainer','rival']),L('trainer','ああいう日は、急ぐほど右足が先に出るんだ。昨日よりは、よくなってる。',['trainer','rival']),L('rival','そんな小さなことまで、毎日見てるんだ。',['trainer','rival']),L('trainer','見てるだけじゃ、足りないんだけどね。うまく伝えられなくて。',['trainer','rival'])],['trainer','rival']],
 [38,'coach-return','ひとりでは見えないこと',s=>[
 L('rival','きみのトレーナー、いいなあ。昨日よりよくなったところも、ちゃんと知ってるんだね。'),
 L('player',reaction(s,'オレ、こよりのこと、怖がらせちゃったかもしれない。','数字しか見ていなかったのは……ぼくかもしれない。','……こより、ずっと一人で心配してたんだ。')),
 L(null,s.events.storyProgress['notebook-page-seen']?'主人公は、ノートの最後のページを思い出して、こよりのところへ戻った。':'聞き流していたこよりの声を思い出し、主人公は練習帳を片づける幼なじみのところへ戻った。',['player','trainer']),
 L('player',reaction(s,'ごめん！ ……負けたときより、一緒に走ることを考えよう！','このページに、ぼくたちが次にできることを書こう。','いちばんいい種、半分こしよう。……こわいことも、半分こ。')),
 L('trainer',s.events.storyProgress['notebook-page-seen']?'あのページは消さない。怖かったのは本当だから。でも、次からは勝つための作戦も書こう。':'怖い気持ちはなくならない。でも、次の作戦は2匹で考えよう。'),
 L('player','……うん。ぼくの走り、もう一度、一緒に考えて。'),
 L('trainer','うん。まずはいつもの歩幅から。そこから二匹で速くしていこう。')
 ],['trainer','rival']],
 [42,'festival-2','増えた旗',s=>[L('tanuki','今年の旗は、こっちの通りにも！ 応援の札、去年より増えたねえ。'),L('child','ちょびも練習してるんだ。きみがいない日も、ひとりで。'),L('player','……そっか。じゃあ、また今度、一緒に走ろう。'),L('trainer','見てくれてる子がいるんだね。僕たちの一歩も。')],['tanuki','child','trainer']],
 [46,'trainer-doubt-2','押す手、止める手',s=>[L('trainer','休もうって言うたび、夢まで止めてないかなって考えるんだ。'),L('player','ぼくが無茶するときは止めて。そのあと、どうやったら進めるか、一緒に考えてよ。'),L('trainer','うん。止めるだけじゃなくて、その先も。')],['trainer']],
 [52,'rival-changes','呼ばれる名前',s=>[...(s.events.history.find(h=>h.eventId==='exp-rival-make-up')?.choiceId==='stop-drum'?[L('rival','今日は太鼓、持ってきてないよ。伝えたいことは、自分の声で言うから。')]:s.events.history.find(h=>h.eventId==='exp-rival-make-up')?.choiceId==='hold-paw'?[L('rival','あのとき、手をにぎってくれたね。今度は、背中を追いかけたい。')]:s.events.history.find(h=>h.eventId==='exp-rival-make-up')?.choiceId==='take-seed'?[L('rival','あの種、半分こしたね。でも次の勝負は、半分こできないね。')]:[]),L('rival','この前、ぼくにも応援が聞こえたんだ。なんか、もう一歩って思えた。'),L('player',reaction(s,'種のことじゃなくてか？','種のことでは、なくてですか？','種のことじゃなくてぇ？')),L('rival','種も大事。でも今は……きみに、ちゃんと勝ちたいな。')],['rival']],
 [66,'festival-3','坂の向こうへ',s=>[L('tanuki','お祭りの支度は任せて。世界への見送り……まだ早いか。まずは次の一戦だね！'),L(null,'広場のすみで、小さな子がひとり、短い足を何度も動かしていた。'),L('child','ここまで走って、ちょっと休んで、また走るんだ。きみみたいに。'),L('seedshop','おう、差し入れは2匹ぶんだ。いつもの種、持ってきな。')],['tanuki','child','seedshop']],
 [70,'trainer-confession','ずっと隣にいた',s=>[L('trainer','代表決定戦の前に、言っておきたい。最初、十二支なんて無理だって思ってた。'),L('trainer','傷ついてほしくなくて。でも、それだけを理由にして、夢まで信じてなかった。'),L('player','……知ってたよ。'),L('trainer','えっ。'),L('player',reaction(s,'でも、毎日来てくれたじゃん。ぼくより心配して、ぼくよりノート書いてさ。','信じきれなくても、隣にはいてくれました。その行動を、ずっと見ていました。','いつもごはんも、休む場所も、次の練習も考えてくれた。ぼく、ちゃんと知ってるよ。')),
 L('player','だから、ここまで来られた。最後も一緒に、作戦立てよう。'),L('trainer','……うん。今は、本気で信じてる。2匹のやり方で、行こう。')],['trainer']]
];
// Story v3 (#30 G1): its own scenes plus the v2 scene it keeps (Potechi's change of heart).
const timelineV3=[...V3.v3Timeline,...timeline.filter(t=>t[1]==='rival-changes')].sort((a,b)=>a[0]-b[0]);
// A run with the four stories (#30, owner 2026-11-01): their chapters replace the story v3 scenes with the same ids, and
// each waits for its friend (Book.bookReady). The other main scenes and the hero's own scenes keep their turns.
const timelineBook=timelineV3.filter(t=>!Book.BOOK_IDS.includes(t[1]));
const bookEntry=c=>[c.turn,c.id,c.title,s=>Book.bookLines(c.lines,s),c.ids,{...c.extra,...(c.choices?{choices:c.choices}:{})}];
export function bookDefinition(s,id,{replay=false,choiceId=null}={}){
 const c=Book.bookChapter(id);if(!c)return null;
 return D(s,c.id,c.title,replay?Book.bookReplayLines(s,c,choiceId):Book.bookLines(c.lines,s),c.ids,{...c.extra,...(c.choices&&!replay?{choices:c.choices}:{})});
}
export function pumpStory(s){
 if(!isToday(s)||hasPendingDialogue(s)||!['training','race-ready'].includes(s.phase))return false;
 // Story v3 also has the hero's own three scenes (#30, owner 2026-10-30).
 const list=Book.isBook(s)?[...timelineBook,...V3.heroTimeline(s),...Book.BOOK.filter(c=>Book.bookReady(s,c)).map(bookEntry)]:isV3(s)?[...timelineV3,...V3.heroTimeline(s)]:timeline;
 const t=(isV3(s)?list.sort((a,b)=>a[0]-b[0]):list).find(([turn,id])=>s.turn>=turn&&!done(s,id));
 if(t){const [,id,title,lines,ids,extra]=t;return queue(s,D(s,id,title,lines(s),ids,extra||{}));}
 const added=storyBeats.find(e=>s.turn>=e.turn&&!(isV3(s)&&e.id==='exp-notebook-first')&&!(Book.isBook(s)&&Book.BOOK_IDS.includes(e.id))&&s.turn<=(e.max??e.turn+2)&&!done(s,e.id)&&(e.requires||[]).every(id=>done(s,id))
  &&(e.id!=='exp-rival-hard-question'||(s.races.some(r=>r.competitionId==='ordinary-2')&&done(s,'ordinary-response-2')))
  &&(e.id!=='exp-rival-make-up'||done(s,'exp-rival-hard-question')));
 if(added)return queue(s,D(s,added.id,added.title,added.lines(s),added.ids,{scene:added.id==='exp-notebook-first'&&s.lastAction?.key==='rest'?'bedroom-morning':added.scene,...(added.choices?{choices:added.choices}:{}),...(added.requires?{requires:added.requires}:{})}));
 // P1/No.7: only a real unsuccessful first-year training can trigger this rainy seed-shop scene.
 if(s.turn>=13&&s.turn<=23&&s.lastAction?.outcome==='failure'&&!done(s,'exp-unsold-seeds')){
  const lines=[
   L(null,'雨が降る夕方の種屋。練習がうまくいかなかった主人公は、いつもより口数が少ない。'),
   L('trainer','……何か食べる？'),
   L('player',reaction(s,'食べるけどさ。……今日は全然走れなかった。','まず、今日の失敗を整理したいです。','……おなか、すいてないや。')),
   L(null,'こよりはびっくりして、主人公の顔をもう一度見た。'),
   L('seedshop','おう。売れ残りだ。持ってけ。'),
   L(null,'差し出されたのは、どう見ても一番きれいなしま模様の種だった。'),
   L('player',reaction(s,'売れ残りでも、うまそうだな！','……仕入れ日は、今日ですね。','これ、いちばんいい種だぁ。')),
   L('seedshop','うるせえ。食え。掃除はいいから、今日は帰れ。'),
   L('trainer','ありがとうございます。……また明日も、ここを通ります。'),
   L('seedshop','明日も通るんだろ、この道。なら、それでいい。')
  ];
  return queue(s,D(s,'exp-unsold-seeds','売れ残りの種',lines,['trainer','seedshop'],{scene:'seedshop-rain'}));
 }
 const great=bigSuccessBeat(s);
 if(great&&!done(s,great.id))return queue(s,D(s,great.id,great.title,great.lines,great.ids,{scene:great.scene}));
 return false;
}
export function afterDialogue(s,p,choice){
 if(!isToday(s))return;
 if(p.id==='rat-imitation'&&p.lines.some(l=>l.text.includes('もし、だめだったら')))s.events.storyProgress['notebook-page-seen']=1;
 const chapter=Book.isBook(s)&&choice&&Book.bookChapter(p.id);
 if(chapter?.answer?.cases[choice.id])return queue(s,D(s,p.id+'-answer',chapter.answer.title,Book.bookLines([...chapter.answer.cases[choice.id],...(chapter.answer.after||[])],s),chapter.ids,{scene:chapter.answer.scene,followUp:true}));
 if(p.id==='visit-seedshop-1')s.social.seedPreference=choice?.id||'crunchy';
 if(p.id==='visit-beaver-3'&&choice)s.social.boost={key:choice.id,remaining:3,percent:.1};
 // No.28: player-selected response is a genuine separate line, not a decorative button.
 // Since #30 (owner 2026-10-26) a choice carries its own effect (story-effects.js), shown once the whole talk,
 // reply included, is over (followUp).
 const reply=choice&&REPLIES[p.id]?.[choice.id];
 if(reply)return queue(s,D(s,p.id+'-answer',p.title,reply(s),REPLY_IDS[p.id],{followUp:true,...(p.scene?{scene:p.scene}:{})}));
 if(p.id==='exp-rival-make-up'&&choice){
  const response={
   'take-seed':[reaction(s,'……ありがとな。ぽてち、半分こしようぜ。','……ありがとうございます。ぽてち、半分こしましょう。','……ありがと。ぽてち、半分こしようねぇ。'),'うん！ 半分ずつなら、いっしょに食べられるね。'],
   'hold-paw':[reaction(s,'……ぽてち。話してくれて、うれしかったぜ。','……ぽてち。話してくれて、うれしかったです。','……ぽてち。話してくれて、うれしかったよぉ。'),'うん。こんどは、一緒に走ろう。'],
   'stop-drum':[reaction(s,'まず太鼓を止めろって！ ……へへっ、もう怒ってないから。','まず、太鼓を止めてください。……ふふ、もう怒っていませんから。','まず太鼓を止めてぇ！ ……ふふ、もう怒ってないからねぇ。'),'ごめん！ でも、笑ってくれたから、よかった。']
  }[choice.id];
  if(response)return queue(s,D(s,'exp-rival-make-up-answer','仲直りの、最後のひとこと',[
   L('player',response[0]),L('rival',response[1]),
   L(null,'町に帰る足どりは、二匹ともいつもより少し軽かった。')
  ],['rival'],{scene:'town-dusk',followUp:true}));
 }
 if(isV3(s)&&choice){const a=V3.v3Answer(s,p.id,choice.id);if(a)return queue(s,D(s,a.id,a.title,a.lines,a.ids,{...(a.extra||{}),followUp:true}));}
 pumpStory(s);
 randomTalk(s);
}
// Replies after a choice that used to end the talk at the choice (#30, owner 2026-10-26: the result comes
// after the talk, not right at the choice).
const REPLY_IDS={'exp-fireworks-promise':['trainer'],'exp-child-wheel':['child','trainer'],'visit-seedshop-1':['trainer','seedshop'],'visit-beaver-3':['trainer','beaver']};
const REPLIES={
 'exp-fireworks-promise':{
  together:s=>[L('player',reaction(s,'答えは、2匹で探そうぜ。オレ、こよりと一緒なら見つけられる！','答えは、2匹で探しましょう。ノートの空いた行に、少しずつ。','答え、2匹で探そう。……おやつを食べながらでも、いいよねぇ。')),L('trainer','……うん。じゃあ、探す。一緒に。'),L(null,'こよりはノートを開いて、いちばん新しいページに小さく書いた。「答え：これから」。')],
  share:s=>[L('player',reaction(s,'今日は、おやつ半分こだ！ むずかしい話は、また明日！','今日は、おやつを半分こしましょう。考えるのは、それからで。','今日は、おやつを半分こしよう。半分でも、ちゃんとおいしいよぉ。')),L('trainer','……ふふ。いちばん大きいのを、くれるんだね。'),L(null,'花火の音にまぎれて、種をかじる音がふたつ重なった。')]},
 'exp-child-wheel':{
  wait:()=>[L(null,'主人公は回し車の横で、だまって種をかじった。ちょびは、もう片方の前足も乗せた。'),L('child','……回った！ ちょび、自分で回したよ！'),L('trainer','うん。今の一歩は、ちょびのものだね。')],
  beside:()=>[L(null,'主人公も回し車に飛び乗った。二匹ぶんの重さで、車がぐらりと揺れる。'),L('child','わ、わ、わっ……！ でも、となりなら、こわくない！'),L(null,'何周か回ったあと、二匹とも目を回して、草の上に転がった。')]},
 'visit-seedshop-1':{
  crunchy:s=>[L('player',reaction(s,'かりかりのやつ！ かむほど元気が出るんだぜ！','歯ごたえのある種で、あごを鍛えます。','かりかりのがいいなぁ。音もおいしいから。')),L('seedshop','おう、いい音させて食いな。次から、それを取っとく。')],
  small:s=>[L('player',reaction(s,'小さいやつ！ 走りながらでも食べられるぜ！','小さくて食べやすい種を。練習の合間に、すぐ食べられます。','小さいのがいいなぁ。ほお袋に、いっぱい入るからぁ。')),L('seedshop','欲ばりだな。……まあ、いい。小粒は、こっちの棚だ。')]},
 'visit-beaver-3':Object.fromEntries(keys.map(k=>[k,()=>[L('beaver','よし、そいつを持ってけ。3回使ったら、感想を聞かせろよ！'),L(null,'受け取った道具は、思ったより軽かった。手入れ役の工具箱のにおいがした。')]]))
};
// Random talks (#30, owner 2026-10-26 「会話イベントは毎回街に行かなくてもランダムで起きるように」, pick
// 「空きターンの3回に1回」): on a turn with no other talk, 35% for an everyday scene, a side story or the next
// story of a town friend. The roll comes from the event seed and the turn, so a reload rolls the same.
export const RANDOM_TALK_CHANCE=.35;
// Talks after practice lean to the friends who were there (owner 2026-11-08 「練習後のイベントは一緒に練習したキャラとか
// 好感度が高いからがでやすくして」, picks 「ふつう」「起きやすくする」): a friend who practised with the hero ×4, a friend at
// friendship 60 or more ×2, and a turn practised with a friend has a talk half the time.
export const TALK_WITH_FRIEND=4,TALK_CLOSE_FRIEND=2,TALK_CLOSE_AT=60,RANDOM_TALK_WITH_FRIEND_CHANCE=.5;
const talkFriends=d=>{const v=d.id.match(/^visit-([a-z]+)-\d+$/);return (v?[v[1]]:(d.characters||[]).map(c=>c.id).filter(id=>!['player','trainer'].includes(id))).map(id=>id==='rival'?'domestic-0':id);};
export function talkWeight(s,d){const there=s.lastAction?.with||[],ids=talkFriends(d);return (d.weight||1)*(ids.some(id=>there.includes(id))?TALK_WITH_FRIEND:ids.some(id=>(s.npcRelations?.[id]||0)>=TALK_CLOSE_AT)?TALK_CLOSE_FRIEND:1);}
export const randomTalkChance=s=>s.lastAction?.with?.length?RANDOM_TALK_WITH_FRIEND_CHANCE:RANDOM_TALK_CHANCE;
export function randomTalkRoll(s){let z=(s.events.seed^Math.imul(s.turn+1,0x9e3779b1))>>>0;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;return ((z^(z>>>16))>>>0)/4294967296;}
export function randomTalk(s){
 if(!isToday(s)||hasPendingDialogue(s)||s.phase!=='training'||s.turn<1||s.events.history.some(h=>h.turn===s.turn)||s.events.checkpoints.includes('turn-event-'+s.turn)||randomTalkRoll(s)>=randomTalkChance(s))return false;
 if(!queueEvent(s,randomDefinitions(s).map(d=>({...d,weight:talkWeight(s,d)})),'turn-event-'+s.turn))return false;
 const v=s.events.pending.id.match(/^visit-([a-z]+)-\d+$/);if(v)s.social.visits.push({turn:s.turn,id:v[1]});
 return true;
}
// Rare events (#30, owner 2026-10-30): on a turn with no other talk, now and then a scene that gives a talent
// (story-rare.js). Only for runs whose first talent came at random; at most three.
export function rareTalentEvent(s){
 if(!isToday(s)||s.talentRule!=='random'||!Array.isArray(s.extraTalents)||s.extraTalents.length>=RARE_MAX||hasPendingDialogue(s)||s.phase!=='training'||s.turn<2||s.events.history.some(h=>h.turn===s.turn)||s.events.checkpoints.includes('turn-event-'+s.turn)||rareRoll(s,1)>=RARE_CHANCE)return false;
 const id=rareTalentPick(s);if(!id)return false;const [title,scene,ids,lines]=RARE_SCENES[id];
 return queueEvent(s,[D(s,'rare-'+id,title,lines(s,L,reaction),ids,{scene,effects:{talent:id}})],'turn-event-'+s.turn);
}
export function afterTraining(s){
 if(!isToday(s))return;
 if(s.social.boost&&--s.social.boost.remaining===0)s.social.boost=null;
 s.social.offerTurn=s.phase==='training'&&s.turn%3===0&&!s.social.visits.some(v=>v.turn===s.turn)?s.turn:null;
 return pumpStory(s);
}
export function afterOrdinary(s){
 if(!isToday(s))return;
 const r=s.lastRace,rv=r.standings.findIndex(x=>x.id==='domestic-0')+1,beat=rv>0&&r.rank<rv;
 const seedRace=r.year===2&&s.plans['ordinary-2']?.zones.includes('eating');
 const bench=r.year===1?
   (r.rank===1?'こよりはベンチに座るより先に泣きだした。「一位だよ！ すごいよ！」':'こよりはおやつを山ほどベンチに並べた。「……食べながら話そっか」'):
   r.year===2?
   (r.rank===1?'「勝ったね」。こよりは練習ノートを開き、今日うまくいった一歩に丸をつけた。':'「今日の分、ちゃんと記録してあるよ」。こよりは落ち着いた声で言った。'):
   (r.rank===1?'二匹はベンチで静かにハイタッチをした。少し遅れて、同時に叫んでしまった。':'「どこで差が出たか、一緒に探そう」。こよりは泣かずに、今日の記録を開いた。');
 const reflection=raceReflection(s,r),afterBench=benchExtras(s,r,beat);
 const lines=[
  L(null,`${r.title}、${r.rank}位。大会帰り、二匹はいつものベンチに腰かけた。`),
  L(null,bench),
  L('player',beat?reaction(s,'今日は、ぽてちより先に着いたぜ！ ……なんだか、信じられねえ。','今日は、ぽてちより先に着きました。……なんだか、信じられません。','今日は、ぽてちより先に着いたんだぁ。……なんだか、信じられないねぇ。'):reaction(s,'くやしい！ 次はもっと速くなってやる！','差がありました。……でも、今日の記録を次に生かせます。','……ぽてちも速かったねぇ。ぼくも、まだ走りたいなぁ。')),
  ...(seedRace&&rv?[L('rival',beat?'ねえ、種の味がしないんだ。ここ、もやもやする。……これってなに？':'この種、食べる？ ……あれ、きみ、いらないの？'),
   L('player',beat?reaction(s,'それ「くやしい」っていうんだぜ。オレも知ってる。','悔しさだと思います。……わたしにも分かります。','……それ、くやしいっていう気持ちかもねぇ。'):reaction(s,'勝ったやつからもらえるかよ！ ……今のナシ！','もう一度、今日の記録を見たいです。','今は、この悔しさを忘れたくないんだぁ。')),
   L('rival',beat?'……そっか。次は勝ちたい。種より、きみに。':'そっか。ぼくも、勝つのを大事にする。次も、本気で走るね。')]:[]),
  ...(rv?[L('rival',beat?'今日のきみ、速かったね。ぼくも負けたくない。':r.year===1?'種だけじゃない楽しさが、少し分かったよ。':'また一緒に走ろう。次はぼくが先に着くかも。')]:[]),
  ...(reflection?[L('trainer',reflection.headline),L('trainer',reflection.next)]:[]),
  ...afterBench.visitor,
  afterBench.closing
 ];
 queue(s,D(s,'ordinary-response-'+r.year,'反省会のベンチ',lines,['trainer','rival',...afterBench.ids],{scene:'bench-dusk'}));
}
const townFriends=s=>['seedshop','tanuki','beaver',...(done(s,'rival-first')?['rival']:[]),...(isV3(s)&&s.events.storyProgress['cat-met']?['cat']:[]),...(Book.isBook(s)&&done(s,'rat-confession')?['rat']:[])];
// 町へ takes a turn (#30, owner 2026-10-31 「街へのコマンドは行くと1ターン進むようにして」), so any friend can be met on any
// training turn; the old 「3ターンに1回」 offer is gone.
export function townOffer(s){return isToday(s)&&s.phase==='training'&&!hasPendingDialogue(s)?townFriends(s).map(person):[];}
// One town visit as a dialogue definition (also used by the album to re-read a visit).
export function visitDefinition(s,id,count){
 const scene=visitScene(s,id,count);if(!scene)return null;let choices;
 // Effects come from story-effects.js (friendship with each, Potechi's under his rival id; owner 2026-10-25).
 if(id==='seedshop'&&count===1)choices=[{id:'crunchy',label:'かりかり、歯ごたえのある種'},{id:'small',label:'小さくて食べやすい種'}];
 if(id==='beaver'&&count===3)choices=keys.map((key,i)=>({id:key,label:names[i]+'の道具を試す（3ターン＋10%）'}));
 return D(s,`visit-${id}-${count}`,person(id).name+'とひと息',scene.lines,['trainer',id],{...(scene.scene?{scene:scene.scene}:{}),...(choices?{choices}:{}),progress:{['contact-'+id]:Math.min(100,count)}});
}
// What going to town brings this turn: a friend's next talk, or one of the side stories read in town.
export function townTalk(s,{visit,side}={}){
 if(visit){if(!townOffer(s).some(x=>x.id===visit))return null;const count=s.social.visits.filter(v=>v.id===visit).length+1,def=visitDefinition(s,visit,count);return def?{def,visit,name:person(visit).name}:null;}
 if(side){const def=sideOffers(s).find(d=>d.id===side);return def?{def:{...def,mandatory:true},side,name:def.title}:null;}
 return null;
}
// Called by game.goToTown after the turn has moved on: the talk is this turn's talk. goToTown checks canQueueTownTalk
// first, so the turn never moves on without its talk.
const townCheckpoint=talk=>(talk.visit?'today-':'side-open-')+talk.def.id;
export function canQueueTownTalk(s,talk){return !!talk&&!hasPendingDialogue(s)&&validEventDefinition(talk.def)&&!s.events.checkpoints.includes(townCheckpoint(talk));}
export function queueTownTalk(s,talk){
 if(talk.visit){const ok=queue(s,talk.def);if(ok){s.social.visits.push({turn:s.turn,id:talk.visit});s.social.offerTurn=null;}return ok;}
 return queueEvent(s,[talk.def],townCheckpoint(talk));
}
// Reads a visit without spending the turn (the album and the story tests use this; the game goes through goToTown).
export function visitTown(s,id){
 if(!townOffer(s).some(x=>x.id===id)||s.social.visits.some(v=>v.turn===s.turn))return false;
 const count=s.social.visits.filter(v=>v.id===id).length+1,def=visitDefinition(s,id,count);if(!def)return false;
 s.social.visits.push({turn:s.turn,id});s.social.offerTurn=null;return queue(s,def);
}
export function randomDefinitions(s){
 // #30 (owner 2026-10-25): about 20 daily scenes tied to season and story, each at most once a run.
 const daily=dailyScenes(s).map(d=>D(s,d.id,d.title,d.lines(s),d.ids,{mandatory:false,...(d.scene?{scene:d.scene}:{}),...(d.weight?{weight:d.weight}:{}),...(d.requires?{requires:d.requires}:{})}));
 // ... and the next of each town friend's five stories (owner 2026-10-26), without going to town.
 const town=townFriends(s).map(id=>[id,s.social.visits.filter(v=>v.id===id).length+1]).filter(([,n])=>n<=5).map(([id,n])=>visitDefinition(s,id,n)).filter(Boolean).map(d=>({...d,mandatory:false}));
 return [...daily,...sideDefinitions(s),...town];
}
export function trainingReaction(s,outcome,helper,key,helpers){
 const line=trainingLine(s,outcome,key,helper,helpers);if(line)return line;
 if(outcome==='failure')return reaction(s,'「い、今のは地面の調査！」でも、幼なじみには悔しい顔が見えていた。','「失敗も記録します」ノートを開く手が、少しだけ止まった。','「種は離さなかったよ」強がるほっぺに、土がちょこん。');
 if(helper)return `${helper.name}と並んで、今日の一歩を確かめた。`;
 return reaction(s,'「見てろよ。昨日のオレには、もう負けない！」','「ひとつずつ。自分たちの歩幅で進みます」','「かりかり、こつこつ。ごはんも夢も、大事だからねぇ」');
}
export function endingDefinition(s){
 const name=s.individualName,success=s.ending==='zodiac_member';let lines,ids=['trainer','child','seedshop','rat'];
 if(success){const former=formerChampion(s);if(former&&!ids.includes(former.id))ids.push(former.id);ids.push('announcer','crowd');lines=[
 L(null,`掲示板の12の枠に、${name}の名前があった。丸い体も短い足も、いつものまま。けれど、見つめる目が少し変わっていた。`),L('announcer','新たに十二支となった、12匹を紹介します！'),
 ...s.lastRace.standings.slice(0,12).filter(x=>x.id!=='player').map((x,i)=>({...L('announcer',x.species+'！'),callSpecies:x.species,callIndex:i+1})),
 L('child','あの子、ちょびと同じ、はむちゅたーだったよね。'),L('crowd','うん。転んでも、また走っていた子だよ。'),L('child','ちょびも……あんなハムスターになりたい。'),
 {...L('announcer',`そして、最後の一匹は――ハムスター！ ${name}！`),callSpecies:'hamster',callIndex:12},
 L('rat',`${name}。きみと本気で競えて、うれしかった。今度はぼくも、きみの背中を追いかけるよ。`),
 ...(isV3(s)?V3.v3EndingLines(s):[]),
 ...(former?[L(null,`${former.name}が、静かに主人公の前へ来た。今日、十二支の枠から外れた王者だった。`),L(former.id,former.farewell)]:[]),
 L('trainer','ずっと隣で見ていたのに……今日は、ちょっと眩しいな。'),
 ...(isV3(s)?V3.heroSays(s,{dash:[L('player','隣、空けといてくれよ。これからも、2匹で走るんだからな！'),L(null,'ネズミの背中は、もう前にはなかった。となりで、同じ風に吹かれていた。')],hakase:[L('player','隣を、空けておいてください。証明の続きは、2匹で書くんですから。'),L(null,'ノートの一ページ目。空欄だった最後の一行に、小さく書き足された。「証明、終わり。次は、ちょびの番」。')],mochi:[L('player','隣、空けといてねぇ。あの長いテーブル、こよりの席もあるんだから。'),L(null,'祝いの長いテーブルに、十二の席。そのとなりに、こよりのぶんの小さな椅子が置かれていた。')]}):[L('player','隣、空けといて。これからも、2匹で考えるんだから。')]),
 L(null,'返事をしようとしたら、ほっぺから種がひとつ、ころん。「むぐっ」……仲間がそっと笑った。'),
 L(null,'少し後のひまわりタウン。小さな子が、国内代表募集の紙の前で足を止めた。'),L('child','今度はちょびも、あのスタートラインへ。'),L(null,`${name}という名前も、走った3年間も、そのまま。誰かに憧れた一匹が、誰かの憧れになった。`),L(null,'あこがれは、つづいていく。')];}
 else if(s.ending==='domestic_loss')lines=[L(null,`${s.turn===24?'1':'2'}年目の国内選抜。復活戦でも、次の枠には届かなかった。`),L('player',reaction(s,'……強がれねえや。今日は、ほんとに悔しい。','ここで終わりだと、分かっていても……悔しいです。','今日は種も、ちょっとしょっぱいねぇ。')),
 L('trainer','うん。今は、悔しがっていい。帰り道は一緒に歩こう。'),L('seedshop','おう、おかえり。腹へったろ。いつもの、あるぞ。'),...(isV3(s)?V3.v3EndingLines(s):[]),L(null,'挑戦は、ここでひと区切り。過ごした時間と足あとは、育成記録に残った。')];
 else if(s.ending==='representative_loss')lines=[L(null,Book.isBook(s)&&s.lastRace?.standings?.[0]?.id==='domestic-0'?'3年目、最後の12匹。国内代表に決まったのは、ぽてちだった。':'3年目、最後の12匹。国内代表になったのは、別の一匹だった。'),L('player',reaction(s,'勝ちたかった……！ 世界へ、2匹で行きたかった。','勝ちたかったです。世界へ、2匹で行きたかった。','勝ちたかったよぉ。世界へ、2匹で行きたかった。')),L('trainer','僕も。……帰ろうか。少しゆっくりでいいから。'),L(null,'帰り道では、作戦の話はしなかった。坂の先に、いつもの神社が見えた。'),L('seedshop','おかえり、2匹とも。今日は、ゆっくり食ってけ。'),L('child','走ってるところ、見てたよ。……また、一緒に練習しようね。'),...(isV3(s)?V3.v3EndingLines(s):[]),L(null,'悔しさは、まだ消えない。それでも、帰ってこられる場所があった。')];
 else lines=[L(null,`世界十二支決定戦、${s.lastRace.rank}位。今日は、12の枠に届かなかった。`),L('rat','あの日の「いつか」は、今日になったね。同じレースを走ってくれて、ありがとう。'),L('player',reaction(s,'……勝ちたかった。憧れの背中を見てるだけじゃ、もう足りなかったんだ。','……勝ちたかったです。憧れと並ぶだけでは、もう足りませんでした。','……勝ちたかったなぁ。憧れと走るだけじゃ、もう足りなかったよぉ。')),L('rat','うん。ぼくも、きみに勝ちたかった。本気の相手に会えたから。'),...(isV3(s)?V3.v3EndingLines(s):[]),L('trainer','帰ったら、今日の記録を見よう。落ち着いてからでいい。一緒に。'),L(null,'憧れの背中と、同じ風の中を競った。悔しさも、3年間の確かな結末だった。')];
 if(lines.some(l=>l.speakerId==='cat'||l.visibleIds?.includes('cat')))ids.push(V3.CAT.id);
 const def=D(s,'main-ending',success?'きみが、誰かの憧れになる日':'小さな足あと',lines,ids,{progress:{'ending-read':1,'rat-recognition':success?4:3}});
 def.scene=success?'world':s.ending==='domestic_loss'?'town-dusk':s.ending==='representative_loss'?'slope':'world';
 def.lines=def.lines.map(l=>({...l,...(l.speakerId==='seedshop'?{scene:'seedshop'}:{})}));
 def.characters=def.characters.map(c=>c.id==='announcer'?{...c,name:'司会'}:c.id==='crowd'?{...c,name:'見守ってきた仲間'}:c);return def;
}

export function sideDefinitions(s){if(!isToday(s))return [];return [...sideStoryBeats,...v3SideStoryBeats.filter(e=>!e.v3||isV3(s))].filter(e=>s.turn>=e.min&&s.turn<=e.max&&(e.requires||[]).every(id=>done(s,id))&&!done(s,e.id)).map(e=>D(s,e.id,e.title,e.lines(s),e.ids,{mandatory:false,once:true,scene:e.scene,...(e.requires?{requires:e.requires}:{}),...(e.choices?{choices:e.choices}:{})}));}
export function sideOffers(s){return s.phase==='training'&&!hasPendingDialogue(s)?sideDefinitions(s):[];}
export function readSideStory(s,id){const d=sideOffers(s).find(d=>d.id===id);return d?queueEvent(s,[{...d,mandatory:true}],'side-open-'+id):false;}
