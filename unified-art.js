import {heroSheet} from './hero-colors.js';
// One character sheet per cast: every state shares its face, scale and palette.
// Presentation only. No RNG, save writes, gameplay multipliers or race timing.
import {POLISH_ACTOR_BOXES as UNIFIED_BOXES} from './polish-actor-boxes.js';
import {CAST_RUN_GUARD,castRunPose,castPoseBox,castPoseCanvas,castRunImage,loadCastRunSheets,prepareCastPoseFrames,drawJumpExpression,isCastDesign} from './cast-run-art.js';
import {loadCastExpressions,drawCastExpression} from './cast-expressions.js';
import {DOMESTIC_BOXES} from './domestic-art-boxes.js';
const actorBoxes={...UNIFIED_BOXES,mobs:DOMESTIC_BOXES};
const images={};let pending;
export function loadUnifiedArt(){if(typeof Image==='undefined')return Promise.resolve(false);return pending||=Promise.all([loadCastExpressions(),loadCastRunSheets(),...['heroes','friends','mobs'].map(key=>new Promise(resolve=>{const i=new Image();i.onload=()=>{images[key]=i;if(key!=='mobs')prepareCastPoseFrames(key,i);resolve(true);};i.onerror=()=>resolve(false);i.src=new URL(key==='mobs'?'./assets/domestic-v20/competitors-v20.png':heroSheet('./assets/polish-v25/'+key+'-v25.png'),import.meta.url).href;}))]).then(r=>r.every(Boolean));}
export const UNIFIED_POSES=Object.freeze(['idle','run-0','run-1','run-2','run-3','jump','eat-0','eat-1','study-0','study-1','rest','joy']);
export function unifiedCharacter(row={}){
 const id=row.id||'',coat=((row.variant||0)%3+3)%3;
 if(id==='player'||!id&&row.variant!==undefined)return {sheet:'heroes',index:coat,scale:1};
 if(['trainer','rival','domestic-0','child','friend'].includes(id))return {sheet:'friends',index:id==='trainer'?0:['rival','domestic-0'].includes(id)?1:2,scale:['child','friend'].includes(id)?.8:1};
 // Playable faces belong exclusively to the actual player. General entrants
 // have their own atlas, including every running and checkpoint pose.
 const hamster=['hamster','ハムスター','はむちゅたー'].includes(row.species)||/^domestic-\d+$/.test(id);
 if(hamster){
  let hash=2166136261;
  for(const ch of id)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  return {sheet:'mobs',index:hash%3,scale:1};
 }
 return null;
}
export function unifiedPlacement(design,pose,x,ground,height,opaqueContact=true){
 // The six principal hamsters use whole-silhouette boxes for every pose (cast-run-boxes.js);
 // scale still comes from the unchanged idle crop, so sizes match every other screen.
 const n=Math.max(0,UNIFIED_POSES.indexOf(pose)),row=design.index*2+Math.floor(n/6),box=castPoseBox(design,pose)||actorBoxes[design.sheet][row][n%6],idle=actorBoxes[design.sheet][design.index*2][0],scale=height*(design.scale||1)/(idle[3]-idle[1]),[l,t,r,b]=box;
 // Main-alpha measurements are tight: without gutters a paw, ear or tail
 // touches the crop boundary and visibly appears cut in motion. Each 210px
 // source cell has safe transparent space around its silhouette. Include a
 // measured safe guard band (2px for mobs, 4px for the cast), keeping the destination
 // aspect ratio and its foot baseline exactly unchanged.
 const guard=design.sheet==='mobs'?2:castPoseBox(design,pose)?CAST_RUN_GUARD:4,sw=r-l+guard*2,sh=b-t+guard*2,dw=sw*scale,dh=sh*scale;
 // The original destination baseline is retained for menus/dialogue.
 // Race/banquet opt into opaqueContact: move the transparent bottom gutter
 // below the track so the LAST opaque paw pixel meets its ground shadow.
 return {source:[l-guard,t-guard,sw,sh],destination:[Math.round(x-dw/2),Math.round(ground-dh+(opaqueContact?guard*scale:0)),dw,dh],feet:ground,sheet:design.sheet,pose};
}
export function drawUnifiedActor(c,row,x,ground,height,pose='idle',motion=null,{opaqueContact=true,expression=null}={}){
 if(expression&&drawCastExpression(c,row,x,ground,height,expression))return {unified:true,expression};
 const design=unifiedCharacter(row);if(!design||!images[design.sheet])return false;
 // Every hamster, including the six principal ones, runs with its own four painted
 // poses like the general entrants. No whole-sprite bob: the painted paws stay on
 // the track. A cast leap uses its most gathered run frame (see castRunPose).
 const jump=!!(motion?.active&&(motion.jump||motion.frame===5));
 if(motion?.active)pose=castRunPose(design,motion,jump);
 const p=unifiedPlacement(design,pose,x,ground,height,opaqueContact),run=castRunImage(design,pose),isolated=run?null:castPoseCanvas(design,pose);
 c.save();c.imageSmoothingEnabled=false;
 // The owner's run sheets keep their frames apart, so a run frame is cropped directly.
 if(run)c.drawImage(run,...p.source,...p.destination);else if(isolated)c.drawImage(isolated,0,0,p.source[2],p.source[3],...p.destination);else c.drawImage(images[design.sheet],...p.source,...p.destination);
 if(jump&&isCastDesign(design)&&motion.obstacleExpression)drawJumpExpression(c,design,p,height*(design.scale||1),motion.obstacleExpression);
 c.restore();return {placement:p,unified:true,pose};
}
export function conversationPose(expression='normal'){return ['happy','joy','delighted'].includes(expression)?'joy':expression==='sleepy'?'rest':'idle';}
