import {studyBeat} from './race-direction-v26.js';
// Storyboard states depend on saved progress, never new gameplay decisions.
export function zoneActionAt(focus,row,variant=0){
 const p=row.progress,phase=focus.id==='eating'?(row.finished?'finished':p<.12?'ready':p<.4?'nibble':p<.75?'pouch':'last-bite'):focus.id==='study'?studyBeat(row):(row.finished?'exit':row.stalled?'junction':p<.15?'overview':p>.9?'exit-close':(row.maze?.junctions||[.25,.53,.78]).some(x=>Math.abs(p-x)<.03)?'junction':'exploring');
 return {phase,puff:Math.min(3,Math.floor(p*4)),seedsLeft:row.finished?0:Math.max(1,Math.ceil((1-p)*12)),solved:row.finished?6:Math.min(5,Math.floor(p*6)),frame:Math.floor(focus.time*(variant===1?11:variant===2?7:9)+row.startOrder)%4,close:['pouch','last-bite','panic','scribble','inspiration','junction','exit-close'].includes(phase)};
}
export function primaryCamera(live,view,focus){
 if(view.intro)return 'opening';
 if(focus)return focus.id+'-'+(focus.completed?'complete':zoneActionAt(focus,focus.rows[0]).phase);
 if(view.spurt)return 'finish';
 if(view.obstacle)return 'jump-'+view.obstacle.phase;
 return view.recent?'overtake':'tracking';
}
export function transitionAt(result,live){
 const row=result.participants?.find(x=>x.id==='player');if(!row||result.simulationVersion!==6)return null;
 const before=row.times.slice(0,live.stageIndex).reduce((a,b)=>a+b,0),elapsed=live.time-before;
 return live.stageIndex>0&&elapsed>=0&&elapsed<.65?{stage:live.course.stages[live.stageIndex],remaining:1-elapsed/.65}:null;
}
export function drawStageTransition(canvas,transition){
 if(!canvas||!transition)return;const c=canvas.getContext('2d');c.save();c.imageSmoothingEnabled=false;c.scale(canvas.width/384,canvas.height/216);c.fillStyle='#403046';c.fillRect(4,29,188,19);c.fillStyle='#fff0d2';c.font='bold 10px monospace';c.fillText(transition.stage.short+'へ！',12,42);c.restore();
}
