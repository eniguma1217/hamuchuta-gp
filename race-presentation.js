import {cameraBeat} from './race-direction-v26.js';
import {jumpHalfDistance,jumpArc,COURSE_PIXELS,STEADY_RACE_ZOOM} from './race-projection.js';
import {raceTheme} from './race-scenery.js';
import {inSpurt} from './race-stage-label.js';
const EPS=1e-11;
export function movementPieces(row,course){
 let time=0,distance=0;const out=[];
 for(let i=0;i<row.times.length;i++){
  const split=row.times[i],loss=row.analysis[i]?.loss||0,length=course.stages[i].length,moving=split-loss,speed=length/moving;
  if(loss){const first=.45*moving;out.push({from:time,to:time+first,distance,speed});out.push({from:time+first,to:time+first+loss,distance:distance+length*.45,speed:0});out.push({from:time+first+loss,to:time+split,distance:distance+length*.45,speed});}
  else out.push({from:time,to:time+split,distance,speed});
  time+=split;distance+=length;
 }
 return out;
}
export function positionAt(pieces,t){
 if(t<=0)return 0;
 const piece=pieces.find(p=>t<p.to);if(!piece)return 1;
 return Math.max(0,Math.min(1,piece.distance+(t-piece.from)*piece.speed));
}
export function pairCrossings(hero,other,course){
 const a=movementPieces(hero,course),b=movementPieces(other,course),max=Math.max(hero.total,other.total),points=[...new Set([0,max,...a.flatMap(p=>[p.from,p.to]),...b.flatMap(p=>[p.from,p.to])])].sort((a,b)=>a-b),out=[];
 let previous=0;
 const accept=(sign,time)=>{if(!sign)return;if(previous&&sign!==previous&&time>0&&time<max)out.push({time,otherId:other.id,direction:sign>0?'passed':'lost'});previous=sign;};
 for(let i=0;i<points.length-1;i++){
  const start=points[i],end=points[i+1];if(end<=start)continue;
  const gap=t=>positionAt(a,t)-positionAt(b,t),first=gap(start),last=gap(end),middle=gap((start+end)/2);
  if(first*last<0&&Math.abs(first)>EPS&&Math.abs(last)>EPS){const root=start+(end-start)*(-first)/(last-first);accept(Math.sign(first),start);accept(Math.sign(last),root);}
  else if(Math.abs(middle)>EPS)accept(Math.sign(middle),start);
 }
 return out;
}
export function compileOvertakes(result){
 const hero=result.participants.find(x=>x.id==='player');if(!hero)return [];
 return result.participants.filter(x=>x!==hero).flatMap(other=>pairCrossings(hero,other,result.course)).sort((a,b)=>a.time-b.time||a.otherId.localeCompare(b.otherId));
}
export function warpClock(duration,windows,factor=.3){
 const ordered=windows.map(([a,b])=>[Math.max(0,a),Math.min(duration,b)]).filter(([a,b])=>b>a).sort((a,b)=>a[0]-b[0]),merged=[];
 for(const range of ordered){const last=merged.at(-1);if(last&&range[0]<=last[1])last[1]=Math.max(last[1],range[1]);else merged.push([...range]);}
 const pieces=[];let time=0,screen=0;
 const push=(end,speed)=>{if(end>time){const virtual=(end-time)/speed;pieces.push({from:time,to:end,screenFrom:screen,screenTo:screen+virtual,speed});screen+=virtual;time=end;}};
 for(const [a,b]of merged){push(a,1);push(b,factor);}push(duration,1);
 return {pieces,virtualDuration:screen,timeAt(p){const target=Math.max(0,Math.min(1,p))*screen,part=pieces.find(x=>target<x.screenTo);return part?part.from+(target-part.screenFrom)*part.speed:duration;}};
}

export const piecesFor=movementPieces;

const cached=new WeakMap();
// BROADCAST_TICKS is the reference two-minute broadcast (80 ms ticks at 1x).
export const BROADCAST_TICKS=1500,INTRO_TICKS=54,TICK_SECONDS=.08;
// Running stages play so the ground passes at the pace the 4-frame run is drawn
// for (owner, #30 2026-10-24): at the steady zoom the reference broadcast moved
// the ground ~0.3 body per stride. Never slower than the reference; technique,
// eating and maze stages keep their reference length. Display only.
export const RUN_SCREEN_SPEED=86;
export function broadcastClock(result,duration){
 const reference=(BROADCAST_TICKS-INTRO_TICKS)*TICK_SECONDS/duration,hero=result.participants?.find(x=>x.id==='player'),stages=result.course?.stages||[],pieces=[];
 let time=0,screen=0,speed=1/reference;
 const push=(end,seconds)=>{if(end>time&&seconds>0){speed=(end-time)/seconds;pieces.push({from:time,to:end,screenFrom:screen,screenTo:screen+seconds,speed});screen+=seconds;time=end;}};
 for(const [i,split] of (hero?.times||[]).entries()){
  if(time>=duration)break;const end=Math.min(duration,time+split),seconds=(end-time)*reference,stage=stages[i];
  push(end,stage?.action==='speed'&&split>0?Math.min(seconds,stage.length*COURSE_PIXELS*STEADY_RACE_ZOOM/RUN_SCREEN_SPEED*(end-time)/split):seconds);
 }
 push(duration,(duration-time)/speed);
 return {pieces,virtualDuration:screen,timeAt(p){const target=Math.max(0,Math.min(1,p))*screen,part=pieces.find(x=>target<x.screenTo);return part?part.from+(target-part.screenFrom)*part.speed:duration;}};
}
export function presentationData(result){
 if(cached.has(result))return cached.get(result);
 // No finish slow motion (owner decision, #30 D6): a running stage plays at one
 // pace to the line, even for a close finish. warpClock remains for any future use.
 const duration=Math.max(...result.standings.map(x=>x.total)),windows=[];
 const clock=broadcastClock(result,duration),value={duration,events:result.simulationVersion===6?compileOvertakes(result):[],clock,ticks:INTRO_TICKS+Math.ceil(clock.virtualDuration/TICK_SECONDS),windows};cached.set(result,value);return value;
}
// Race seconds that pass during the short hold after the last runner finishes, at the
// closing playback pace, so finishers keep running out of the frame instead of freezing.
export const FINISH_HOLD_TICKS=36;
export function afterFinishTime(result,ticks){const last=presentationData(result).clock.pieces.at(-1);return Math.max(0,ticks)*TICK_SECONDS*(last?.speed||1);}
export function broadcastTimeAt(result,tick){
 const data=presentationData(result),intro=tick<INTRO_TICKS,progress=Math.max(0,Math.min(1,(tick-INTRO_TICKS)/(data.ticks-INTRO_TICKS)));
 return {time:intro?0:data.clock.timeAt(progress),intro,opening:Math.max(0,Math.min(1,tick/INTRO_TICKS)),introPhase:tick<12?'stadium':tick<24?'ready':'countdown',countdown:tick<24?'':tick<54?String(3-Math.floor((tick-24)/10)):tick<61?'GO!':'',progress};
}
export function racePresentationAt(result,live,{intro=false,opening=1,introPhase='countdown'}={}){
 const data=presentationData(result),player=live.player,last=live.course.stages.length-1,stage=live.course.stages[live.stageIndex],spurt=!intro&&inSpurt(live.course,player);
 const neighbors=live.standings.filter(x=>x.id!=='player'&&!x.finished&&Math.abs(x.distance-player.distance)<.025).sort((a,b)=>Math.abs(a.distance-player.distance)-Math.abs(b.distance-player.distance)||a.rank-b.rank),close=!intro&&!player.finished&&neighbors.length>0;
 const recent=intro?null:data.events.filter(x=>x.time<=live.time&&live.time-x.time<=.9).at(-1)||null;
 const winning=player.finished&&result.standings[0]?.id==='player';
 const crowd=intro?'anticipation':player.finished?winning?'victory':'applause':live.time<data.duration*.018?'start':recent?recent.direction==='passed'?'overtake':'gasp':spurt?close?'finish-close':'finish':stage.action==='intelligence'?'quiet':close?'close':'watch';
 const slow=data.windows.some(([from,to])=>live.time>=from&&live.time<=to),obstacle=intro?null:obstacleShot(live,{spurt,recent,close});
 // Keep the approved lateral paths and side-on perspective. Camera distance
 // follows the actual hero; only the shared viewing scale changes.
 const camera=cameraBeat(live,{intro,opening});
 // Art-direction quality gate: until direction-specific running/jump sprites
 // are production-ready, do not cut to a different camera or focal racer.
 // One grounded, side-on tracking shot beats multiple distorted angles.
 // Keep the course projection and character size constant through hurdles.
 return {raceKey:result.id||result.competitionId||'race',obstacle,theme:raceTheme(result),intro,opening,introPhase,spurt,close,nearbyIds:neighbors.slice(0,2).map(x=>x.id),recent,crowd,winning,slow,packSpread:false,...camera,focusId:'player',effect:recent?(stage.action==='speed'?'running':'progress'):null};
}
export function hurdlePositions(course){return course.stages.flatMap((s,i)=>s.action==='speed'&&(i<course.stages.length-1||course.stages.length===1)?[s.start+s.length*.38,s.start+s.length*.72]:[]);}

// Five short camera beats, derived solely from recorded world progress.
export function obstacleShot(live,{spurt=false,recent=null,close=false}={}){
 const row=live.player,stage=live.course.stages[row.stageIndex];
 if(row.finished||stage.action!=='speed'||spurt||recent)return null;
 const half=jumpHalfDistance(),distance=hurdlePositions(live.course).find(d=>row.distance-d>=-half*2.5&&row.distance-d<=half*2);if(distance===undefined)return null;
 const delta=row.distance-distance,u=delta/half,phase=u<-1?'approach':u<-.4?'takeoff':u<.4?'airborne':u<1?'landing':'return',bump=Math.abs(u)<=1?.12*Math.sin((u+1)/2*Math.PI):0;
 return {phase,worldPosition:distance,zoom:Math.min(close?1.08:1.12,1+bump),lift:Math.abs(u)<1?jumpArc((u+1)/2):0};
}
