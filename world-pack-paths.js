// World-field steering. With the steady camera (#30 D3/D5) there is no lens:
// proximity is measured in on-screen pixels at the fixed race zoom.
// Lateral presentation paths only. Forward progress is read from recorded splits.
// Fixed-step integration makes reload, seeking, 1x and 2x use the same positions.
import {movementPieces,positionAt} from './race-presentation.js';
import {COURSE_PIXELS} from './race-projection.js';
import {STEADY_RACE_ZOOM} from './race-projection.js';
import {startOffset} from './start-grid.js';
export const PACK_STEP=.10,PACK_MAX_SPEED=9,PACK_MAX_ACCEL=18;
export const PACK_BACK=124,PACK_FRONT=176,PACK_SHEAR=.48;
const cache=new WeakMap(),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function hash(id){let h=2166136261;for(const c of id)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;}
function compile(live,key){
 const rows=[...live.standings].sort((a,b)=>a.id.localeCompare(b.id));
 const signature=key+'|'+rows.map(r=>r.id+':'+r.startOrder+':'+r.times.join(',')+':'+r.analysis.map(a=>a.loss||0).join(',')).join('|');
 let entries=cache.get(live.course);if(!entries){entries=new Map();cache.set(live.course,entries);}if(entries.has(signature))return entries.get(signature);
 const n=rows.length,steps=Math.ceil(live.duration/PACK_STEP)+1,paths=new Float32Array(steps*n),pieces=rows.map(r=>movementPieces(r,live.course)),ys=rows.map(r=>PACK_BACK+((r.startOrder??r.index??hash(r.id))%5)*13),vel=new Float64Array(n),targets=[...ys],holds=new Float64Array(n),xs=new Float64Array(n),speeds=new Float64Array(n);
 const clearance=(i,y,ahead=0)=>{let cost=0;for(let j=0;j<n;j++)if(i!==j){const dx=xs[j]-xs[i],dy=Math.min(Math.abs(y-ys[j]),Math.abs(y-targets[j]));if(dx>-32&&dx<64&&dy<15)cost+=(1-dy/15)*(dx>0?1.5:1)*Math.exp(-Math.abs(dx-ahead)/28);}return cost;};
 for(let step=0;step<steps;step++){
  const time=step*PACK_STEP;for(let i=0;i<n;i++){xs[i]=(positionAt(pieces[i],time)+startOffset(rows[i],n,time,live.duration))*COURSE_PIXELS*STEADY_RACE_ZOOM;speeds[i]=((positionAt(pieces[i],time+.2)+startOffset(rows[i],n,time+.2,live.duration))*COURSE_PIXELS*STEADY_RACE_ZOOM-xs[i])/.2;}
  // Leaders choose first, but every entrant, including the player, has the same rule.
  const order=rows.map((_,i)=>i).sort((a,b)=>xs[b]-xs[a]||rows[a].id.localeCompare(rows[b].id));
  for(const i of order){
   const travelling=Math.abs(targets[i]-ys[i])>1.2;
   if(time>2.6&&!travelling&&time>=holds[i]&&speeds[i]>0){
    const blocked=rows.some((_,j)=>i!==j&&xs[j]>xs[i]+1&&xs[j]<xs[i]+43&&Math.abs(ys[j]-ys[i])<12&&speeds[i]>speeds[j]+.4*STEADY_RACE_ZOOM);
    if(blocked){const current=clearance(i,ys[i],24),options=[-13,13].map(side=>({side,y:clamp(ys[i]+side,PACK_BACK,PACK_FRONT)})).filter(o=>Math.abs(o.y-ys[i])>10).map(o=>({...o,cost:clearance(i,o.y,24)})).sort((a,b)=>a.cost-b.cost||((hash(rows[i].id)&1)?a.side-b.side:b.side-a.side));
     const choice=options[0];if(choice&&choice.cost+.32<current){targets[i]=choice.y;holds[i]=time+3.2;}
    }
   }
  }
  const next=new Float64Array(n);
  for(let i=0;i<n;i++){
   let pressure=0;for(let j=0;j<n;j++)if(i!==j){const dx=Math.abs(xs[j]-xs[i]),dy=ys[i]-ys[j];if(dx<29&&Math.abs(dy)<12){const side=Math.abs(dy)>.05?Math.sign(dy):(i<j?-1:1);pressure+=side*(12-Math.abs(dy))*(1-dx/29)*.65;}}
   // Damped steering; a completed move is held instead of snapping back to a lane.
   const desired=clamp((targets[i]-ys[i])*1.6+pressure,-PACK_MAX_SPEED,PACK_MAX_SPEED),delta=clamp(desired-vel[i],-PACK_MAX_ACCEL*PACK_STEP,PACK_MAX_ACCEL*PACK_STEP);vel[i]+=delta;
   next[i]=clamp(ys[i]+vel[i]*PACK_STEP,PACK_BACK,PACK_FRONT);if(next[i]===PACK_BACK||next[i]===PACK_FRONT)vel[i]=0;
  }
  for(let i=0;i<n;i++){ys[i]=next[i];paths[step*n+i]=ys[i];}
 }
 const result={ids:rows.map(r=>r.id),n,steps,paths};if(entries.size>3)entries.delete(entries.keys().next().value);entries.set(signature,result);return result;
}
export function packGrounds(live,key='race'){
 const data=compile(live,key),at=clamp(live.time/PACK_STEP,0,data.steps-1),from=Math.floor(at),to=Math.min(data.steps-1,from+1),u=at-from;
 return new Map(data.ids.map((id,i)=>[id,data.paths[from*data.n+i]*(1-u)+data.paths[to*data.n+i]*u]));
}
export function projectDepthX(forwardX,ground,cameraGround=142,zoom=1){return forwardX+(ground-cameraGround)*PACK_SHEAR*zoom;}
