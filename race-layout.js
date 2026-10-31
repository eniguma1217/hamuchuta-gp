import {obstaclePerformance} from './race-direction-v26.js';
import {fieldProjector} from './field-projection.js';
import {speciesPlacement} from './fancy-species-art.js';
import {racerArtHeight} from './racer-art-scale.js';
// Presentation-only paths. Recorded forward distance, rank, clock and RNG stay intact.
import {COURSE_PIXELS,jumpHalfDistance,jumpArc,projectRaceX} from './race-projection.js';
import {hurdlePositions} from './race-presentation.js';
import {packGrounds} from './race-pack.js';
import {runnerDepth} from './runner-depth.js';
import {displayDistance} from './start-grid.js';
import {spreadOffsets} from './race-spread.js';
import {hedgeLeapX,hedgeClearance} from './hedge-course.js';
import {runningMotion} from './running-motion.js';
import {unifiedCharacter,unifiedPlacement} from './unified-art.js';
import {castRunPose} from './cast-run-art.js';
const smooth=x=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
const hash=id=>{let h=2166136261;for(const c of id)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;};
export function hurdleJump(row,course,height=32,options){return obstaclePerformance(row,course,height,hurdlePositions(course),options);}
export function actorBounds(row,x,ground,height,motion,jump){
 const design=unifiedCharacter(row),pose=motion.active?castRunPose(design,motion,!!jump.tucked):'idle';
 if(design){
  // Same pose and baseline as drawUnifiedActor (no whole-sprite bob for any hamster).
  const p=unifiedPlacement(design,pose,x,ground-jump.lift,height,true),[left,top,width,h]=p.destination,gutter=4*h/p.source[3];return {left:left+gutter,top:top+gutter,right:left+width-gutter,bottom:top+h-gutter,width:width-2*gutter,height:h-2*gutter};}
 const animal=speciesPlacement(row,x,ground-jump.lift,height,motion);if(animal){const [left,top,width,h]=animal.destination;return {left,top,right:left+width,bottom:top+h,width,height:h};}
 const width=height*1.7,h=height*1.08;return {left:x-width/2,right:x+width/2,top:ground-jump.lift-h-(motion.active?motion.bob||0:0),bottom:ground-jump.lift,width,height:h};
}
// After the line (#30, owner 2026-10-25): nobody stops on the finish line. A finisher
// runs straight through at its closing pace and leaves the frame to the right, while
// the camera stays on the line. Display only: the recorded distance stays at 1.
export function runThrough(row,course,time){
 if(!row.finished)return 0;
 const last=course.stages.length-1,stage=course.stages[last],split=row.times?.[last],pace=stage?.action==='speed'&&split>0?stage.length/split:1/Math.max(1,row.total||1);
 return Math.max(0,time-(row.total||0))*pace;
}
export function raceLayout(live,p={},variant=0,cameraDistance=p.cameraDistance??live.player.distance){
 // One steady camera from the gun to the finish (#30 D3/D4/D5): runners start on
 // the five-abreast grid (start-grid.js) and their drawn positions only move forward.
 const zoom=p.zoom||1,center=179,grounds=packGrounds(live,p.raceKey||'race'),project=fieldProjector(live,cameraDistance,zoom,center),range=COURSE_PIXELS*zoom;
 const spread=p.intro?new Map():spreadOffsets(live);
 return live.standings.map(row=>{
  const hero=row.id==='player',depth=grounds.get(row.id)||160,baseHeight=racerArtHeight(row,live.final)*(p.actorScale||1),depthScale=.96+(depth-124)*.0015,height=baseHeight*depthScale;
  const ground=depth,drawn=displayDistance(row,live)+(spread.get(row.id)||0)+runThrough(row,live.course,live.time+(p.finishAfter||0));
  const worldX=projectRaceX(drawn,cameraDistance,center,zoom),x=project(drawn),coat=hero?variant:row.variant??(row.index||0)%3,actor={...row,variant:coat};
  // Leap where THIS runner's lane meets the slanted hedge, highest a quarter body
  // before the hedge's drawn middle and just above it.
  const jump=p.intro?{lift:0,phase:0,tucked:false}:hurdleJump({...row,distance:drawn-hedgeLeapX(0,depth,height)/range},live.course,height,{clearance:hedgeClearance(depth)}),running=!p.intro&&(row.finished||live.course.stages[row.stageIndex]?.action==='speed');
  const motion=runningMotion(row.finished?{...row,finished:false}:row,row.finished?{action:'speed'}:live.course.stages[row.stageIndex],live.time,coat,{dash:p.spurt,spurt:hero&&p.spurt,jump:jump.tucked,spriteHeight:height,travel:drawn*range,strideHeight:baseHeight}),bounds=actorBounds(actor,x,ground,height,motion,jump);
  if(jump.fall){bounds.top-=height*.15;bounds.bottom+=height*.08;}
  const edge=Math.min(bounds.left-1,383-bounds.right),opacity=Math.max(0,Math.min(1,edge/14));
  return {row,actor,x,physicalX:worldX,ground,baseGround:depth,height,jump,motion,running,coat,offset:0,packShift:depth-(124+((row.startOrder??row.index??0)%5)*13),bounds,frameVisible:edge>=0&&bounds.top>=30&&bounds.bottom<=181,opacity};
 });
}
export function bodyIntersects(a,b){return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;}
