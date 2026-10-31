import {fieldProjector} from './field-projection.js';
import {SPURT_FROM} from './race-stage-label.js';
// Approved camera/action direction. Reads committed replay only; no RNG or save writes.
import {jumpHalfDistance,jumpArc,COURSE_PIXELS,STEADY_RACE_ZOOM,STEADY_ACTOR_SCALE} from './race-projection.js';
import {displayDistance,startLineSpacing,START_LANES} from './start-grid.js';
export {STEADY_RACE_ZOOM,STEADY_ACTOR_SCALE};
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth=x=>{const t=clamp(x);return t*t*(3-2*t);};
const hash=s=>{let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n;};
export function wideCameraZoom(live){
 const gaps=live.standings.filter(r=>r.id!=='player').map(r=>Math.abs(r.distance-live.player.distance)).sort((a,b)=>a-b),radius=gaps[Math.min(6,gaps.length-1)]||.01;
 // Keep six to ten nearby real runners where the spread allows it, without
 // clamping distant runners to the edge or changing their forward positions.
 return clamp(112/(COURSE_PIXELS*Math.max(.024,radius)),.12,.52);
}
// Steady broadcast camera (owner decision, #30 D3/D5): one zoom and one actor
// size for the whole race, locked to the player's DRAWN position (start grid
// included). No push-ins on overtakes or the spurt, no pull-back or lateral glide
// at hedges; the drawn position only ever moves forward, so nothing scrolls back.
export function cameraBeat(live,{intro=false,opening=1}={}){
 const hero=displayDistance(live.player,live);
 // Before the gun only: open on the middle of the start grid (every runner in
 // shot), then settle on the player by the end of the 'ready' beat.
 if(intro){const lines=Math.ceil((live.entrants??live.standings.length)/START_LANES),middle=live.player.distance-(lines-1)/2*startLineSpacing(live.entrants??live.standings.length)/(COURSE_PIXELS*STEADY_RACE_ZOOM),u=smooth(opening/.44);
  return {zoom:STEADY_RACE_ZOOM,straighten:0,actorScale:STEADY_ACTOR_SCALE,cameraDistance:middle+(hero-middle)*u};}
 return {zoom:STEADY_RACE_ZOOM,straighten:0,actorScale:STEADY_ACTOR_SCALE,cameraDistance:hero};
}
// Former dynamic camera (pull-back at hedges, push-in on overtakes), kept for reference only.
export function dynamicCameraBeat(live,hurdles,{intro=false,spurt=false,recent=null,close=false}={}){
 if(intro)return {zoom:.52,straighten:0,actorScale:1,cameraDistance:live.player.distance};
 const nearest=[...hurdles].sort((a,b)=>Math.abs(live.player.distance-a)-Math.abs(live.player.distance-b))[0],d=nearest===undefined?Infinity:Math.abs(live.player.distance-nearest),spacing=Math.min(Infinity,...hurdles.filter(h=>h!==nearest).map(h=>Math.abs(h-nearest))),outer=Math.min(.053,spacing*.46),inner=Math.min(.018,outer*.55),approach=1-smooth((d-inner)/Math.max(.001,outer-inner));
 const event=recent?smooth(Math.min((live.time-recent.time)/.25,(.9-(live.time-recent.time))/.35)):0;
 const finish=spurt?smooth((live.player.distance-SPURT_FROM)/.05):live.player.finished?1:0;
 const beat=Math.max(event,finish),wide=wideCameraZoom(live),ordinary=wide+(.62-wide)*beat;
 // Constant side-on scale through flight. Keep the herd's existing spacing.
 // A bounded lateral camera glide absorbs the nonlinear lens's acceleration
 // as the hedge passes; all runners and props still use the identical map.
 const zoom=ordinary*(1-approach)+.52*approach;
 let cameraDistance=live.player.distance;
 if(approach&&nearest!==undefined){
  const base=fieldProjector(live,cameraDistance,zoom),target=179+(nearest-live.player.distance)*COURSE_PIXELS*zoom,offset=clamp(base(nearest)-target,-90,90)*approach;
  // Monotone inversion keeps the hero within 90px of its usual anchor. No
  // runner positions, ranks, lateral steering or formal clocks are edited.
  const targetCamera=179+offset;let lo=cameraDistance-.1,hi=cameraDistance+.1;
  for(let i=0;i<32;i++){const mid=(lo+hi)/2;if(base(mid)<targetCamera)lo=mid;else hi=mid;}
  cameraDistance=(lo+hi)/2;
 }
 return {zoom,straighten:0,actorScale:.84+.16*beat,cameraDistance};
}
// clearance: hedge height (px) above this runner's ground where it crosses. With it,
// the arc peaks just above the hedge (a small margin) instead of a fixed share of
// the runner's height, so every runner clears it without an exaggerated leap.
export function obstaclePerformance(row,course,height=32,hurdles=[],{clearance=null}={}){
 if(row.finished||course.stages[row.stageIndex]?.action!=='speed')return {lift:0,phase:0,tucked:false,fall:0,angle:0,expression:null};
 const half=jumpHalfDistance(),h=hurdles.find(d=>row.distance-d>=-half&&row.distance-d<=half*2.4);
 if(h===undefined)return {lift:0,phase:0,tucked:false,fall:0,angle:0,expression:null};
 const phase=(row.distance-h+half)/(2*half),skill=row.stats?.[4]??row.analysis?.[row.stageIndex]?.ability??65;
 const weak=skill<48,strong=skill>=72,stumble=weak&&hash((row.id||'runner')+':'+h.toFixed(8))%3!==0;
 const fall=stumble?smooth((phase-.66)/.18)*(1-smooth((phase-1.08)/.5)):0;
 const peak=clearance===null?null:(clearance+Math.max(2,height*.08))*(strong?1.06:1);
 const lift=peak===null?jumpArc(phase,height)*(strong?1.09:weak?.76:1):phase>0&&phase<1?peak*Math.pow(Math.sin(phase*Math.PI),.65):0;
 return {lift,phase,tucked:phase>.07&&phase<.93,airborne:phase>0&&phase<1,hurdle:h,skill,strong,weak,stumble,fall,angle:fall*.62,expression:strong?'determined':weak?'worried':'normal'};
}
// Exact phase order requested: think -> insight -> write -> submit.
export function studyBeat(row){
 if(row.finished)return 'submitted';
 if(row.stalled)return 'thinking';
 const p=clamp(row.progress);
 return p<.22?'thinking':p<.34?'inspiration':'scribble';
}
export function banquetShot(focus){
 const rows=focus.rows.filter(r=>r.entered!==false&&!r.finished),hero=rows.find(r=>r.id==='player'),depart=focus.rows.find(r=>r.id==='player'&&r.entered!==false&&r.finished&&r.exitElapsed<.65),anchor=hero||depart||rows[0];
 const ordered=rows.filter(r=>r!==anchor).sort((a,b)=>Math.abs((a.seatIndex||0)-(anchor?.seatIndex||0))-Math.abs((b.seatIndex||0)-(anchor?.seatIndex||0))||a.id.localeCompare(b.id));
 const shown=(anchor?[anchor,...ordered]:ordered).slice(0,6).sort((a,b)=>(a.seatIndex||0)-(b.seatIndex||0));
 const slots=shown.map(r=>r.seatIndex||0),middle=slots.length?(Math.min(...slots)+Math.max(...slots))/2:anchor?.seatIndex||0;
 // A complete painted table segment and active guests share this camera.
 const span=slots.length?(Math.max(...slots)-Math.min(...slots))*34:0;
 const zoom=clamp(292/(span+82),1.05,2.35);
 return {rows:shown,activeCount:rows.length,center:48+middle*34,zoom};
}
