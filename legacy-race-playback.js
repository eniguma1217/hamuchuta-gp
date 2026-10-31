import {resultCourse} from './courses.js';

// Render only recorded split times. Animation never consumes the game's random stream.
const distanceAt=(times,time)=>{let distance=0;for(const split of times){if(time+1e-7>=split){distance++;time-=split;}else{return distance+Math.max(0,time)/split;}}return times.length;};
const timeAt=(times,distance)=>{let time=0;for(let i=0;i<times.length;i++)time+=times[i]*Math.min(1,Math.max(0,distance-i));return time;};
export function raceFrameAt(result,progress){
 const course=resultCourse(result),stages=course.stages.length,p=Math.max(0,Math.min(1,progress));
 const runners=result.standings.map(r=>({...r,times:result.checkpoints.map(cp=>cp.standings.find(x=>x.id===r.id).split)}));
 const duration=Math.max(...runners.map(r=>r.total)),time=duration*p;
 const standings=runners.map((r,index)=>{
  const distance=distanceAt(r.times,time),stageIndex=Math.min(stages-1,Math.floor(distance));
  return {...r,index,distance:distance/stages,stageIndex,stageProgress:distance>=stages?1:distance-stageIndex,finished:distance>=stages};
 }).sort((a,b)=>b.distance-a.distance||(a.finished&&b.finished?a.total-b.total:0)||a.id.localeCompare(b.id));
 standings.forEach((r,i)=>{r.rank=i+1;});
 const player=standings.find(r=>r.id==='player'),leader=standings[0],ahead=standings[player.rank-2];
 const gap=r=>r?Math.max(0,timeAt(player.times,r.distance*stages)-timeAt(r.times,r.distance*stages)):0;
 return {progress:p,time,duration,course,standings,entrants:result.entrants,rank:player.rank,player,stageIndex:player.stageIndex,stageProgress:player.stageProgress,leadGap:gap(leader),aheadGap:gap(ahead),final:result.kind==='zodiac'};
}
