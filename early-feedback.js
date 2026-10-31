// Read-only feedback from committed training and race records. No rewards/RNG.
import {resultStageName} from './race-stage-label.js';
const keys=['speed','stamina','appetite','intelligence','technique'],names=['スピード','スタミナ','食欲','かしこさ','きようさ'];
const COACH={
 speed:['今の分、ちゃんと記録したよ。昨日の印から、また一歩。','一歩目、前より低くなってきた。ノートに書いとくね。','タイムの欄、また一つ埋まった。この調子。'],
 stamina:['後半まで足が回ってた。持久力の欄、更新。','回し車の回数、ちゃんと数えてたよ。昨日より多い。','今の分、ちゃんと記録したよ。昨日の印から、また一歩。'],
 appetite:['ほお袋の運び方、うまくなってる。記録したよ。','早食いの欄、更新。……殻の片づけは、あとで一緒にね。','今の分、ちゃんと記録したよ。昨日の印から、また一歩。'],
 intelligence:['コースの読み方、ノートに足しておいたよ。','今日覚えたこと、次の大会のページにも写しておく。','今の分、ちゃんと記録したよ。昨日の印から、また一歩。'],
 technique:['分かれ道の選び方、迷いが減ってきた。記録したよ。','迷路のタイム、また縮んだ。印をつけとくね。','今の分、ちゃんと記録したよ。昨日の印から、また一歩。'],
 failure:['今日は増えなかった。体力を整えて、もう一度やり方を考えよう。','増えなかった日も、ノートに残すよ。次は、ここから。','うまくいかなかったところ、二匹で見直そう。体力も見てね。'],
 rest:['休んだ分も、ノートに残そう。次の一歩を選びやすくするために。','よく寝た顔してる。今日の休みも、練習のうち。','体力、戻ったね。次は何を伸ばそうか。'],
 outing:['急がず歩く日も、2匹の練習のうちだね。','町の空気、いいね。やる気の欄に、花丸。','寄り道も、たまには作戦のうち。']
};
export function trainingNotebook(s){
 const a=s.lastAction;if(!a?.beforeStats||!a.afterStats||!keys.includes(a.key)&&!['rest','outing','scout'].includes(a.key))return null;
 const actual=a.afterStats.map((v,i)=>v-a.beforeStats[i]),changes=actual.flatMap((v,i)=>v?[`${names[i]} ${a.beforeStats[i]} → ${a.afterStats[i]}（＋${v}）`]:[]),history=s.log.filter(l=>l.trainingKey===a.key&&Array.isArray(l.beforeStats)&&Array.isArray(l.afterStats)).slice().reverse(),first=history[0],index=keys.indexOf(a.key);
 // Koyori's note rotates with how often this action was done, so it is not the same words every turn (#30, 2026-10-25).
 const turnOf=list=>list[(s.log.filter(l=>l.trainingKey===a.key).length+list.length-1)%list.length];
 const coach=a.outcome==='failure'?turnOf(COACH.failure):a.key==='rest'?turnOf(COACH.rest):a.key==='outing'?turnOf(COACH.outing):a.key==='scout'?'見てきたコースを、次の練習に結びつけよう。':changes.length?turnOf(COACH[a.key]||COACH.speed):'数字はまだ増えていない。小さな成長は蓄積中だよ。';
 const comparison=index>=0&&history.length>=2&&first.beforeStats[index]<a.afterStats[index]?`${names[index]}：この練習を始めた時 ${first.beforeStats[index]} → 今 ${a.afterStats[index]}。${history.length}回の記録。`:null;
 return {changes,coach,comparison,energyDelta:a.energyDelta,bondDelta:a.bondDelta,learned:(a.learned||[]).map(name=>name+'：対応する区間の判定能力＋3。')};
}
export function courseHint(key,course,scouted=false){
 const ability={speed:'走行区間の速さ',stamina:'長い走行区間の安定',appetite:'早食いゾーンの突破',intelligence:'勉強ゾーンの突破',technique:'迷路ゾーンの突破'}[key];if(!ability)return '';
 if(!scouted)return ability+'につながる。次の関門は下見で確認できる。';
 if(key==='speed'||key==='stamina')return '次の大会の走行区間に備える：'+ability+'。';
 return course?.stages?.some(z=>z.action===key)?'次の大会で使う能力：'+ability+'。':ability+'に備える練習。次の大会にこの特殊ゾーンはない。';
}
export function raceReflection(s,r){
 const hero=r?.participants?.find(p=>p.id==='player'),rival=r?.participants?.find(p=>p.id==='domestic-0');if(!hero||!rival||!r.course?.stages)return null;
 const rivalRank=r.standings.findIndex(x=>x.id===rival.id)+1,gap=hero.total-rival.total,rows=r.course.stages.map((stage,i)=>({stage,name:resultStageName(r.course,i),gap:hero.times[i]-rival.times[i],time:hero.times[i],opponentTime:rival.times[i],loss:hero.analysis[i].loss,ability:hero.analysis[i].ability}));
 const strongest=rows.reduce((a,b)=>b.gap<a.gap?b:a),weakest=rows.reduce((a,b)=>b.gap>a.gap?b:a),candidate=weakest.gap>0?weakest:strongest,validKeys=candidate.stage.keys||[0,1],target=[...new Set(validKeys)].reduce((a,b)=>hero.stats[b]<hero.stats[a]?b:a,validKeys[0]);
 const previous=s.races.filter(x=>x.kind==='ordinary'&&x.year<r.year&&x.standings.some(p=>p.id==='domestic-0')).at(-1),oldRank=previous?.standings.findIndex(x=>x.id==='domestic-0')+1,beat=r.rank<rivalRank;
 const change=previous?(beat&&previous.rank>=oldRank?'前の大会では後ろだった相手より、今回は先にゴールした。':!beat&&previous.rank<oldRank?'前の大会は先に着けたけれど、今回は相手が先だった。':beat?'前の大会に続き、今回もライバルより先にゴール。':'今回も相手が先。前の順位はノートに残っている。'):null;
 const first=s.log.filter(l=>Array.isArray(l.beforeStats)).at(-1),progress=first?.turn===1?hero.stats.map((v,i)=>({name:names[i],before:first.beforeStats[i],now:v,delta:v-first.beforeStats[i]})).sort((a,b)=>b.delta-a.delta)[0]:null;
 return {headline:`きみ${r.rank}位、ライバル${rivalRank}位。${Math.abs(gap).toFixed(2)}秒${gap<0?'先に':'あとに'}ゴールした。`,next:`${candidate.name}は相手${candidate.opponentTime.toFixed(2)}秒、きみ${candidate.time.toFixed(2)}秒。次は${names[target]}を確かめよう。`,beat,rivalRank,gap,rows,strongest,weakest,change,progress,goal:names[target],coach:`${candidate.name}は相手${rival.times[rows.indexOf(candidate)].toFixed(2)}秒、きみ${candidate.time.toFixed(2)}秒。${candidate.loss?'ハプニング＋'+candidate.loss.toFixed(2)+'秒も含む記録だよ。':''}次は${names[target]}の練習を確かめよう。`,finish:`きみ${r.rank}位、ライバル${rivalRank}位。${Math.abs(gap).toFixed(2)}秒${gap<0?'先に':'あとに'}ゴールした。`};
}

