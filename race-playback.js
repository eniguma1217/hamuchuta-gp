import {raceFrameAt as legacyFrame} from './legacy-race-playback.js';
import {compareFinish} from './race-system.js';
export function raceFrameAt(result,progress){
 if(result.simulationVersion!==6)return legacyFrame(result,progress);
 const p=Math.max(0,Math.min(1,progress)),duration=Math.max(...result.standings.map(x=>x.total)),time=duration*p,course=result.course;
 const standings=result.participants.map(row=>{
  let remaining=time,distance=0,stageIndex=0,stageProgress=0;
  for(let i=0;i<row.times.length;i++){
   stageIndex=i;const split=row.times[i],z=course.stages[i];
   if(remaining>=split-1e-8){distance+=z.length;remaining-=split;stageProgress=1;continue;}
   const loss=row.analysis[i].loss,moving=split-loss,stop=moving*.45;
   stageProgress=loss&&remaining>=stop?remaining<stop+loss?.45:(remaining-loss)/moving:remaining/moving;
   distance+=z.length*Math.max(0,Math.min(1,stageProgress));break;
  }
  return {...row,distance:Math.min(1,distance),stageIndex,stageProgress:Math.max(0,Math.min(1,stageProgress)),finished:time>=row.total-1e-8};
 }).sort((a,b)=>b.distance-a.distance||(a.finished&&b.finished?compareFinish(a,b):a.startOrder-b.startOrder));
 standings.forEach((x,i)=>x.rank=i+1);const player=standings.find(x=>x.id==='player'),leader=standings[0],ahead=standings[player.rank-2];
 const approximateGap=x=>x?Math.max(0,(x.distance-player.distance)*player.total):0;
 return {progress:p,time,duration,course,standings,entrants:result.entrants,rank:player.rank,player,stageIndex:player.stageIndex,stageProgress:player.stageProgress,leadGap:approximateGap(leader),aheadGap:approximateGap(ahead),final:result.kind==='zodiac',spotlightId:result.kind==='zodiac'?'rat':result.participants.filter(x=>x.id!=='player').sort((a,b)=>b.stats.reduce((x,y)=>x+y,0)-a.stats.reduce((x,y)=>x+y,0))[0]?.id};
}
