import {banquetShot} from './race-direction-v26.js';
// Fixed-step, bounded camera smoothing, derived solely from committed arrivals.
// Seeking/reload and playback speed sample the identical compiled trajectory.
const cache=new WeakMap(),STEP=.05;
export function banquetViewAt(result,stageIndex,time){
 let stages=cache.get(result);if(!stages){stages=new Map();cache.set(result,stages);}
 if(!stages.has(stageIndex)){
  const entrants=result.participants.map(p=>({id:p.id,seatIndex:0,entry:p.times.slice(0,stageIndex).reduce((a,b)=>a+b,0),split:p.times[stageIndex]})).sort((a,b)=>a.entry-b.entry||result.participants.find(p=>p.id===a.id).startOrder-result.participants.find(p=>p.id===b.id).startOrder||a.id.localeCompare(b.id));
  entrants.forEach((p,i)=>p.seatIndex=i);
  const hero=entrants.find(p=>p.id==='player'),end=Math.max(...entrants.map(p=>p.entry+p.split))+.8,frames=[];let view={center:48+(hero?.seatIndex||0)*34,zoom:1.05};
  for(let t=0;t<=end+STEP;t+=STEP){
   const rows=entrants.filter(p=>t>=p.entry&&t<=p.entry+p.split+.65).map(p=>({...p,entered:true,elapsed:t-p.entry,finished:t>=p.entry+p.split,exitElapsed:Math.max(0,t-p.entry-p.split)}));
   const target=banquetShot({rows});if(t<(hero?.entry||0)){frames.push(view);continue;}
   if(!rows.length){frames.push(view||{center:179,zoom:1.05});continue;}
   if(!view)view={center:target.center,zoom:target.zoom};
   else view={center:view.center+Math.max(-100*STEP,Math.min(100*STEP,(target.center-view.center)*.12)),zoom:view.zoom+Math.max(-.85*STEP,Math.min(.85*STEP,(target.zoom-view.zoom)*.12))};
   frames.push(view);
  }
  stages.set(stageIndex,frames);
 }
 const frames=stages.get(stageIndex),pos=Math.max(0,Math.min(frames.length-1,time/STEP)),i=Math.floor(pos),a=frames[i],b=frames[Math.min(i+1,frames.length-1)],u=pos-i;
 return {center:a.center+(b.center-a.center)*u,zoom:a.zoom+(b.zoom-a.zoom)*u};
}
