import {heroSheet} from './hero-colors.js';
// The six principal hamsters run with their own painted frames, exactly like the
// general entrants (no separate leg rig). Display only: no RNG, clocks, saves or race math.
import {CAST_RUN_SHEETS,CAST_RUN_BOXES,CAST_POSE_BOXES,CAST_JUMP_RUN,CAST_JUMP_FACE} from './cast-run-boxes.js';
export const CAST_RUN_GUARD=4;
const runSheets={heroes:[],friends:[]},poseFrames={};let runLoading;
export const isCastDesign=design=>design?.sheet==='heroes'||design?.sheet==='friends';
// Pose used while running: run-0..3 from the shared stride; a hurdle leap uses the
// most gathered side-view run frame (mobs keep their own painted 'jump').
export function castRunPose(design,motion,jump=!!(motion?.jump||motion?.frame===5)){
 // Training scenes pass a fractional phase (scenePose%4); a frame index is whole.
 if(!jump)return 'run-'+(((Math.floor(motion?.phase??motion?.frame??0)%4)+4)%4);
 return isCastDesign(design)?'run-'+CAST_JUMP_RUN[design.sheet][design.index]:'jump';
}
// The owner's run sheets (one per hamster). Until a sheet has loaded, its run
// poses fall back to the old painted sheet grid.
export function loadCastRunSheets(){
 if(typeof Image==='undefined')return Promise.resolve(false);
 return runLoading||=Promise.all(Object.entries(CAST_RUN_SHEETS).flatMap(([sheet,keys])=>keys.map((key,index)=>new Promise(resolve=>{const i=new Image();i.onload=()=>{runSheets[sheet][index]=i;resolve(true);};i.onerror=()=>resolve(false);i.src=new URL(heroSheet('./assets/owner-v38/run/'+key+'.png'),import.meta.url).href;})))).then(r=>r.every(Boolean));
}
// Loaded run sheet for a cast run pose, or null.
export function castRunImage(design,pose){
 return /^run-[0-3]$/.test(pose)&&isCastDesign(design)?runSheets[design.sheet]?.[design.index]||null:null;
}
export function castRunBox(design,pose){
 const m=/^run-([0-3])$/.exec(pose);
 return m&&castRunImage(design,pose)?CAST_RUN_BOXES[design.sheet]?.[design.index]?.[Number(m[1])]||null:null;
}
// Whole-silhouette box for ANY pose of the six principal hamsters (null for others).
export function castPoseBox(design,pose){
 return castRunBox(design,pose)||(isCastDesign(design)?CAST_POSE_BOXES[design.sheet]?.[design.index]?.[pose]||null:null);
}
// Copy each frame's own connected silhouette (alpha>16, 8-connected, seeded at the
// first strongly opaque pixel left of centre) into its own canvas, so pixels of a
// neighbouring frame that enter the rectangle never show.
export function isolateSilhouette(image,box,label,own=null,clip=false){return isolate(image,box,label,own,clip);}
// Which pixels of an RGBA crop (w x h) belong to the drawing: the connected silhouette
// (alpha>16, 8-connected) seeded at the first strongly opaque pixel left of centre, plus,
// when `own` [l,t,r,b] (crop coordinates) is given, every detached piece of at least 16px
// with most of its pixels inside `own` (an "!!" mark or a drop drawn apart from the body).
// Pieces of neighbouring drawings that reach into the crop lie mostly outside `own`.
export function silhouetteMask(a,w,h,own=null){
 const keep=new Uint8Array(w*h),cx=Math.round(w/2);let seed=-1;
 for(let y=Math.round(h/2);y<h&&seed<0;y++)for(let x=cx;x>0;x--)if(a[(y*w+x)*4+3]>128){seed=y*w+x;break;}
 if(seed<0)return null;
 const label=new Int32Array(w*h).fill(-1),grow=(start,id)=>{const out=[start];label[start]=id;for(let n=0;n<out.length;n++){const i=out[n],x=i%w,y=(i-x)/w;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h)continue;const k=Y*w+X;if(label[k]<0&&a[k*4+3]>16){label[k]=id;out.push(k);}}}return out;};
 for(const i of grow(seed,0))keep[i]=1;
 if(own){let id=1;for(let i=0;i<w*h;i++){if(label[i]>=0||a[i*4+3]<=16)continue;const piece=grow(i,id++);if(piece.length<16)continue;let inside=0;for(const k of piece){const x=k%w,y=(k-x)/w;if(x>=own[0]&&x<own[2]&&y>=own[1]&&y<own[3])inside++;}if(inside/piece.length>.6)for(const k of piece)keep[k]=1;}}
 return keep;
}
function isolate(image,[l,t,r,b],label,own=null,clip=false){
 const G=CAST_RUN_GUARD,w=r-l+G*2,h=b-t+G*2,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 // Label only for inspection tools (e.g. which frame was painted); not read by the game.
 if(canvas.dataset)canvas.dataset.castFrame=label;
 const g=canvas.getContext('2d',{willReadFrequently:true});if(!g)return null;g.drawImage(image,l-G,t-G,w,h,0,0,w,h);
 let data;try{data=g.getImageData(0,0,w,h);}catch{return null;}
 const a=data.data,keep=silhouetteMask(a,w,h,own&&[own[0]-l+G,own[1]-t+G,own[2]-l+G,own[3]-t+G]);if(!keep)return null;
 // `clip`: nothing outside the box itself (its guard band stays clear of touching neighbours).
 for(let i=0;i<w*h;i++){const x=i%w,y=(i-x)/w;if(!keep[i]||clip&&(x<G||y<G||x>=w-G||y>=h-G))a[i*4+3]=0;}
 g.putImageData(data,0,0);return canvas;
}
// Every non-run pose is cut from the old painted sheet, masked to its own silhouette.
export function prepareCastPoseFrames(sheet,image){
 if(typeof document==='undefined'||!CAST_POSE_BOXES[sheet])return false;
 poseFrames[sheet]=CAST_POSE_BOXES[sheet].map((row,index)=>Object.fromEntries(Object.entries(row).map(([pose,box])=>[pose,isolate(image,box,`${sheet}:${index}:${pose}`)])));
 return poseFrames[sheet].every(row=>Object.values(row).every(Boolean));
}
// Isolated canvas for a non-run cast pose, or null (then the caller crops the sheet directly).
export function castPoseCanvas(design,pose){
 return isCastDesign(design)?poseFrames[design.sheet]?.[design.index]?.[pose]||null:null;
}
// Worried / determined brows and a sweat drop on the leap frame's own face.
// placement: the unifiedPlacement result actually drawn (sheet source -> destination).
export function drawJumpExpression(c,design,placement,height,expression){
 const face=CAST_JUMP_FACE[design?.sheet]?.[design.index],worry=expression==='worried',strong=expression==='determined';
 if(!face||!(worry||strong))return false;
 const [sx,sy,sw]=placement.source,[dx,dy,dw]=placement.destination,k=dw/sw,map=([x,y])=>[dx+(x-sx)*k,dy+(y-sy)*k];
 c.save();c.strokeStyle='#543545';c.lineWidth=Math.max(.8,height*.035);c.lineCap='round';c.beginPath();
 face.eyes.forEach(([ex,ey],i)=>{
  // Inner ends (towards the other eye) rise when worried and drop when determined.
  const side=i?1:-1,tilt=face.half*.45*(worry?-side:side),[x1,y1]=map([ex-face.half,ey-face.lift+tilt]),[x2,y2]=map([ex+face.half,ey-face.lift-tilt]);
  c.moveTo(x1,y1);c.lineTo(x2,y2);
 });
 c.stroke();
 if(worry){const [x,y]=map(face.sweat);c.fillStyle='#b3dce3';c.fillRect(x,y,Math.max(1,height*.06),Math.max(2,height*.13));}
 c.restore();return true;
}
