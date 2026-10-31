// Every random choice is recorded before playback; viewing never consumes RNG.
export const STYLES={skitter:{name:'ちょこまか走法',description:'カーブときようさを活かして細かく加速。'},conserve:{name:'温存走法',description:'スタミナを活かし、長距離の終盤で伸びる。'},burst:{name:'全力疾走',description:'スピードを活かして先行。短距離向き。'}};
export const COURSE_TYPES={
 short:{name:'ひまわりスプリント',description:'短距離。スピードを活かそう。',baseTime:76,keys:[0,0,0,1]},
 middle:{name:'どんぐり街道',description:'中距離。走力と持久力のバランス。',baseTime:100,keys:[0,0,1,1]},
 long:{name:'夕やけロングラン',description:'長距離。スタミナが後半を支える。',baseTime:132,keys:[1,1,1,0]},
 curves:{name:'くねくね庭園',description:'カーブが多い。きようさも大切。',baseTime:104,keys:[0,1,4,4]},
 special:{name:'なんでも競技場',description:'複合コース。特殊ゾーンも含めた総合力。',baseTime:96,keys:[0,1,4]}
};
export const ZONES={maze:{name:'迷路ゾーン',short:'迷路',keys:[4],action:'technique'},eating:{name:'早食いゾーン',short:'早食い',keys:[2],action:'appetite'},study:{name:'勉強ゾーン',short:'勉強',keys:[3],action:'intelligence'}};
export function rng(seed){return {seed:seed>>>0,next(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;},int(a,b){return a+Math.floor(this.next()*(b-a+1));}};}
export function shuffle(rows,r){const a=[...rows];for(let i=a.length-1;i>0;i--){const j=r.int(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function makeRacePlan(seed){
 const r=rng(seed),typeId=Object.keys(COURSE_TYPES)[r.int(0,4)],type=COURSE_TYPES[typeId],count=r.int(0,3),zones=shuffle(Object.keys(ZONES),r).slice(0,count),stages=[],length=(1-count*.08)/(count+1);let position=0;
 for(let i=0;i<=count;i++){
  stages.push({id:'run-'+i,name:i===count?'ラストスパート':'走行区間',short:i===count?'ラスト':'走る',keys:[...type.keys],action:'speed',length,start:position});position+=length;
  if(i<count){const id=zones[i];stages.push({id,...ZONES[id],keys:[...ZONES[id].keys],length:.08,start:position});position+=.08;}
 }
 return {id:'v6-'+typeId,version:6,typeId,name:type.name,description:type.description,baseTime:type.baseTime,stages,zones,planSeed:seed>>>0};
}
// How much each ability counts (#30, owner 2026-10-31 「スピードの能力の重要さが強すぎる　も少し他の能力の重要度をあげて
// ほしい」, pick 「スピードとスタミナを少し下げる」): on the running sections a fifth of the ability is 食欲 (the energy to
// keep running) and かしこさ (pacing), half each. Measured over 3,000 courses × the three styles, +10 in one ability saves:
// before スピード29% スタミナ32% 食欲9% かしこさ8% きようさ21%; now 24% / 26% / 16% / 16% / 19%. The average time is the same.
export const PACE_SHARE=.2;
export const moodLevel=n=>Math.max(0,Math.min(4,Math.round(n/25)));
export const MOOD_NAMES=['絶不調','不調','ふつう','好調','絶好調'];
export function styleFactor(style,course,stats,stage){
 const end=stage/(course.stages.length-1||1),type=course.typeId;
 if(style==='burst')return 1-(type==='short'?.035:0)-stats[0]*.0003+(type==='long'?.055*end:.014*end);
 if(style==='conserve')return 1+(type==='short'?.025:0)-(type==='long'?.025:0)-stats[1]*.00025*end;
 return 1-(type==='curves'?.025:0)-stats[4]*.00025+(type==='long'?.012:0);
}
export const compareFinish=(a,b)=>a.total-b.total||a.startOrder-b.startOrder;
export function simulateRace({seed,course,runners,player,style='skitter'}){
 const r=rng(seed),order=shuffle(runners.map(x=>x.id),r),incidents=[];
 const participants=runners.map((row,index)=>{
  const p=row.id==='player',stats=[...row.stats],times=[],analysis=[],selected=p?style:row.style||Object.keys(STYLES)[index%3];
  const condition=p?1-(moodLevel(player.mood)-2)*.02:1;
  // Traffic is real race strategy: starting amid the pack costs time, while a
  // nimble / stamina-conscious runner can find gaps without a prescribed lane.
  // This is computed once, before playback, and thus is independent of camera/skip.
  const startingPosition=order.indexOf(row.id),crowding=Math.min(1,startingPosition/Math.max(1,runners.length-1));
  const agility=stats[4]/100,stamina=stats[1]/100;
  const positionSkill=selected==='skitter'?agility:selected==='conserve'?stamina:stats[0]/100;
  // The sole fatigue adjustment: no separate fatigue meter or second time penalty.
  const fatigue=p?Math.max(0,35-player.energy)*.09:0;let elapsed=0;
  for(let i=0;i<course.stages.length;i++){
   const z=course.stages[i],keyAbility=z.keys.reduce((n,k)=>n+stats[k],0)/z.keys.length,mixed=z.action==='speed'?(1-PACE_SHARE)*keyAbility+PACE_SHARE*(stats[2]+stats[3])/2:keyAbility,ability=Math.max(0,mixed-fatigue+(p&&player.skills.includes(z.keys[0])?3:0)),factor=z.action==='speed'?styleFactor(selected,course,stats,i):1;
   const basic=z.action==='speed'?course.baseTime*z.length*(1.25-ability*.006)*factor*condition:(20-ability*.12)*condition;
   const variation=.98+r.next()*.04;let loss=0;
   if(z.action!=='speed'&&r.next()<Math.max(.012,.14-ability*.0012))loss=3+r.next()*2;
   // The pack is densest early on; fast overtakes in traffic have a risk.
   const trafficBase=z.action==='speed'?crowding*(1-i/Math.max(1,course.stages.length))*.030:0;
   const traffic=basic*trafficBase*(1-positionSkill*.85);
   const time=basic*variation+loss+traffic;times.push(time);analysis.push({stage:i,ability,basic,variation,styleFactor:factor,loss,traffic,time});
   if(loss)incidents.push({runnerId:row.id,name:row.name,zoneId:z.id,stage:i,time:elapsed+(time-loss)*.45,loss});elapsed+=time;
  }
  return {...row,index,startOrder:order.indexOf(row.id),style:selected,times,analysis,total:elapsed};
 });
 const standings=participants.map(({id,name,species,total,startOrder})=>({id,name,species,total,startOrder})).sort(compareFinish);
 const checkpoints=course.stages.map((_,stage)=>{const rows=participants.map(p=>({id:p.id,name:p.name,species:p.species,startOrder:p.startOrder,total:p.times.slice(0,stage+1).reduce((a,b)=>a+b,0),split:p.times[stage]})).sort(compareFinish);return {stage,rank:rows.findIndex(x=>x.id==='player')+1,standings:rows};});
 return {participants,standings,checkpoints,splits:participants.find(p=>p.id==='player')?.times||[],incidents:incidents.sort((a,b)=>a.time-b.time||a.runnerId.localeCompare(b.runnerId)),seedAfter:r.seed};
}
export function photoFinishPairs(result){
 const a=result.standings,p=a.findIndex(x=>x.id==='player'),pairs=[[0,1],[p-1,p],[p,p+1]],seen=new Set();if(result.kind==='zodiac')pairs.push([11,12]);if(result.cutoff&&result.cutoff<a.length)pairs.push([result.cutoff-1,result.cutoff]);
 return pairs.filter(([i,j])=>i>=0&&j<a.length&&a[j].total-a[i].total<=1&&!seen.has(i+':'+j)&&seen.add(i+':'+j)).map(([i,j])=>({first:a[i],second:a[j],gap:a[j].total-a[i].total}));
}
export function incidentCommentary(result,from,to,focusIds=[]){
 const due=(result.incidents||[]).filter(e=>e.time>from&&e.time<=to),e=due.find(e=>e.runnerId==='player'||focusIds.includes(e.runnerId));
 if(e)return `${e.name}、${{maze:'出口のほうが迷子になったようです！',eating:'ほっぺが満員！ いったん整列です！',study:'考える……鉛筆の持ち方を！'}[e.zoneId]} ＋${e.loss.toFixed(1)}秒！`;
 if(!due.length)return null;const zone=due[0].zoneId,count=due.filter(x=>x.zoneId===zone).length;return `${ZONES[zone].short}で${count}匹がわちゃわちゃ！ みんな落ち着いてー！`;
}
