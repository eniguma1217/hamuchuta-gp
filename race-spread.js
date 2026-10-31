// Early-race spacing (#30, owner 2026-10-25: the field read as one heap from about 3 s to 17 s).
// Early on the recorded gaps are only a few pixels, so the whole field drew inside one body width.
// As the start grid dissolves, every runner is nudged away from its near neighbours: each pair
// adds a smooth push of up to SPREAD_GAP_PX/2 (tanh of the recorded gap), so a tight pack opens
// to about SPREAD_GAP_PX between neighbours while wide gaps barely change. The push is monotonic
// in the recorded gap, so rank order on screen is the recorded one, and an overtake swaps two
// runners smoothly. Everything is shifted so the hero stays exactly at its recorded place (camera,
// hurdles and checkpoints stay true for the hero). The spacing fades out before every checkpoint
// and the finish. Display only: recorded distance, rank, clock and RNG stay intact.
import {COURSE_PIXELS,STEADY_RACE_ZOOM} from './race-projection.js';
import {startGridFade} from './start-grid.js';
// A runner is never shifted more than about SPREAD_CAP_PX (soft limit), which keeps every fade slow
// enough that drawn positions still only move forward, even for a 50-runner field.
export const SPREAD_GAP_PX=20,SPREAD_TOTAL_PX=240,SPREAD_SOFT_PX=5,SPREAD_CAP_PX=110,SPREAD_FADE=.08,SPREAD_MARGIN=.01,SPREAD_RETURN=.05;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
// 0..1 at a recorded distance: none inside a checkpoint or past the finish, fading out just
// before them and back in after a checkpoint.
export function courseWeight(course,p){
 let w=1;for(const s of course?.stages||[]){if(s.action==='speed')continue;const start=s.start,end=s.start+s.length;
  if(p<start)w=Math.min(w,clamp((start-SPREAD_MARGIN-p)/SPREAD_FADE));else if(p<end)w=0;else w=Math.min(w,clamp((p-end)/SPREAD_RETURN));}
 return Math.min(w,clamp((1-SPREAD_MARGIN-p)/SPREAD_FADE));
}
// 0..1: how much spacing applies around the hero right now.
export function spreadWeight(live){return live.player.finished?0:startGridFade(live.time,live.duration)*courseWeight(live.course,live.player.distance);}
// Course-distance offset per runner id. The hero gets none; a runner inside a checkpoint gets none
// either and eases back into the spacing after it, so nobody is pulled backwards there.
export function spreadOffsets(live){
 const out=new Map(),w=spreadWeight(live);if(!w)return out;
 // Pushes act on the recorded distance: while the start grid dissolves the drawn lines slide
 // through each other far faster than real overtakes, and pushes following them would drag the
 // field backwards. Sums run in id order, so the array order of the standings does not matter.
 const rows=live.standings.filter(r=>!r.finished).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0),n=rows.length,unit=COURSE_PIXELS*STEADY_RACE_ZOOM;if(n<2)return out;
 const half=Math.min(SPREAD_GAP_PX,SPREAD_TOTAL_PX/(n-1))/2/unit,soft=SPREAD_SOFT_PX/unit,cap=SPREAD_CAP_PX/unit,d=rows.map(r=>r.distance);
 const push=d.map((a,i)=>d.reduce((sum,b,j)=>i===j?sum:sum+half*Math.tanh((a-b)/soft),0)),h=rows.findIndex(r=>r.id==='player');if(h<0)return out;
 rows.forEach((r,i)=>{const own=courseWeight(live.course,d[i]);if(i!==h&&own)out.set(r.id,cap*Math.tanh((push[i]-push[h])/cap)*w*own);});
 return out;
}
