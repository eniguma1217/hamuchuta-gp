import {gaitCadence,STRIDE_BODY_RATIO} from './race-projection.js';
import {SPURT_FROM} from './race-stage-label.js';
// State and gait share the committed replay clock. No extra fatigue or RNG.
// With `travel` (screen px moved), the legs follow the ground instead of the clock:
// one 4-frame stride per STRIDE_BODY_RATIO body lengths, so feet never slide.
// `strideHeight` is the runner's lane-independent size, so changing lanes (which
// rescales the sprite slightly) never speeds the legs up or slows them down.
export const RUN_STATES=Object.freeze(['normal','accelerating','full-speed','tired','limit','last-spurt']);
export function runningMotion(row,stage,time,variant=0,{dash=false,spurt=false,jump=false,spriteHeight=32,travel=null,strideHeight=spriteHeight}={}){
 if(stage.action!=='speed'||row.finished)return {active:false,state:'work',band:'work',squash:0,sweat:false,ear:0,cheek:0,phase:0,bob:0,lift:0,stretch:1,compression:1};
 const progress=Math.max(0,Math.min(1,Number.isFinite(row.distance)?row.distance:row.stageProgress||0));
 const state=spurt||progress>=SPURT_FROM?'last-spurt':progress<.15?'normal':progress<.32?'accelerating':progress<.55?'full-speed':progress<.75?'tired':'limit';
 const p=Math.max(0,Math.min(1,row.stageProgress)),band=p<.3?'fresh':p<.7?'breathing':p<.95?'strained':'spurt',loss=row.analysis?.[row.stageIndex]?.loss||0,split=row.times?.[row.stageIndex],moving=split-loss,pace=Number.isFinite(moving)&&moving>0&&stage.length?Math.max(.75,Math.min(1.35,stage.length/moving/.016)):1,cadence=gaitCadence(Number.isFinite(moving)&&moving>0&&stage.length?stage.length/moving:.006,spriteHeight,dash||spurt||band==='spurt'),strideLength=strideHeight*STRIDE_BODY_RATIO,stridePhase=(Number.isFinite(travel)?travel/strideLength*4:time*cadence)+(row.startOrder||0)*1.7+variant*.3,cycle=Math.floor(stridePhase),step=((cycle%4)+4)%4,before=row.times?.slice(0,row.stageIndex).reduce((a,b)=>a+b,0)||0,stop=(moving||0)*.45,elapsed=time-before,stalled=loss>0&&elapsed>=stop&&elapsed<stop+loss;
 const bob=jump||stalled?0:(1-Math.cos(stridePhase*Math.PI))*.45;
 return {active:!stalled,state,band,squash:0,sweat:p>=.3&&cycle%3!==0,ear:0,cheek:variant===0?step%2:0,effort:p>=.7,phase:cycle,stridePhase,strideLength,cadence,frame:jump?5:(dash||spurt||band==='spurt')&&step===3?4:step,bob,lift:bob,stretch:1,compression:1,frontContact:step<2,backContact:step>=2,jump:!!jump,dash:dash||spurt||band==='spurt'};
}
