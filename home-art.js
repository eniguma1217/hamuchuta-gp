import {heroSheet} from './hero-colors.js';
// Home-only artwork. Race renderers, clocks and gameplay are untouched.
import {loadUnifiedArt,drawUnifiedActor,unifiedCharacter,unifiedPlacement} from './unified-art.js';
import {HOME_POSES,HOME_POSE_REF} from './home-pose-boxes.js';
import {drawFancyScene,loadFancyBackgrounds} from './fancy-backgrounds.js';
import {STRIDE_BODY_RATIO} from './race-projection.js';
let room,pending;const poseSheets={};
const HOME_HEROES=['mochi','dash','hakase'];
export const HOME_ACTOR={x:190,ground:174,height:71};
export function loadHomeArt(){if(typeof Image==='undefined')return Promise.resolve(false);return pending||=Promise.all([loadUnifiedArt(),loadFancyBackgrounds(),new Promise(resolve=>{const im=new Image();im.onload=()=>{room=im;resolve(true);};im.onerror=()=>resolve(false);im.src=new URL('./assets/home-ui-v24/room-v24.png',import.meta.url).href;}),...HOME_HEROES.map(hero=>new Promise(resolve=>{const im=new Image();im.onload=()=>{poseSheets[hero]=im;resolve(true);};im.onerror=()=>resolve(false);im.src=new URL(heroSheet('./assets/owner-v51/home/'+hero+'.png'),import.meta.url).href;}))]).then(a=>a.every(Boolean));}
// The room routine (#30 H2, owner 2026-10-25: the old one looked もっさり — 13 px of
// running on the spot every 19 s). Short beats instead: a quick trot whose painted
// stride matches the distance covered (same ratio as the race), a snack, little hops,
// a lie-down in the straw and a happy moment. Spots stay clear of the foreground logs.
// The owner's straw-play and grooming sheets (#30 H1, 2026-10-25) add digging, nibbling
// a straw bundle, a roll on the back and くしくし (home-pose-boxes.js).
// pose counts 120 ms steps (app.js scenePose); everything here is display only.
export const HOME_SPOTS=Object.freeze({middle:190,food:255,nest:125}),HOME_TROT=95;
const HOME_BEATS=[['idle',1.2],['trot','food'],['eat',2.2],['hop',.5],['trot','nest'],['groom',2.6],['rest',3],['joy',.9],['trot','middle'],['dig',2],['nibble',1.8],['roll',2.2],['hop',.5],['idle',1],['joy',.9]];
// Frames of the owner's sheets per beat; before they load, the closest older pose stands in.
const SHEET_FALLBACK={'dig-0':'eat-0','dig-1':'eat-0',nibble:'eat-1',roll:'rest','groom-0':'joy','groom-1':'joy','groom-2':'joy'};
const beatPose=(kind,since)=>kind==='dig'?'dig-'+(Math.floor(since/.2)%2):kind==='groom'?(since>=1.8?'groom-2':'groom-'+(Math.floor(since/.3)%2)):kind;
const ease=u=>u<.5?2*u*u:1-2*(1-u)*(1-u);
export const HOME_ROUTINE=(()=>{let t=0,x=HOME_SPOTS.middle,face=1;const beats=[];
 for(const [kind,arg] of HOME_BEATS){if(kind==='trot'){const to=HOME_SPOTS[arg],dur=.25+Math.abs(to-x)/HOME_TROT;face=to<x?-1:1;beats.push({kind,start:t,dur,from:x,to,face});x=to;t+=dur;}else{beats.push({kind,start:t,dur:arg,from:x,to:x,face});t+=arg;}}
 return {beats,period:t};})();
export function homeMotionAt(pose=0){
 const {beats,period}=HOME_ROUTINE,t=((pose*.12)%period+period)%period,b=beats.find(x=>t<x.start+x.dur)||beats.at(-1),u=Math.min(1,Math.max(0,(t-b.start)/b.dur));
 const walk=b.kind==='trot',x=walk?b.from+(b.to-b.from)*ease(u):b.from,travelled=Math.abs(x-b.from),phase=walk?travelled/(HOME_ACTOR.height*STRIDE_BODY_RATIO)*4:0;
 const pose2=walk?'run':b.kind==='eat'?'eat-'+(Math.floor((t-b.start)/.28)%2):b.kind==='hop'?'jump':beatPose(b.kind,t-b.start);
 return {walk,x,flipped:b.face<0,phase,pose:pose2,lift:b.kind==='hop'?Math.sin(Math.PI*u)*9:0,beat:b.kind};
}
// One of the owner's home frames, standing on the straw at x and sized so the idle pose
// would match the partner's usual idle size. False when the frame or sheet is missing.
export function drawHomePose(c,variant,pose,x,ground,height){
 const hero=HOME_HEROES[variant],box=HOME_POSES[hero]?.[pose],sheet=poseSheets[hero];if(!box||!sheet)return false;
 const design=unifiedCharacter({id:'player',variant});if(!design)return false;
 const s=unifiedPlacement(design,'idle',x,ground,height,true).destination[3]/HOME_POSE_REF,w=box[2]*s,h=box[3]*s;
 c.save();c.imageSmoothingEnabled=false;c.drawImage(sheet,...box,Math.round(x-w/2),Math.round(ground-h),Math.round(w),Math.round(h));c.restore();return true;
}
// The camera (#30, owner 2026-10-30 「もっとプレイ中のメイン画面を大きくして」 → the Uma Musume-style home): the room
// covers the canvas, and when the canvas is narrower than 16:9 (a phone) the view follows the hamster across
// the room. A 16:9 canvas sees the whole room exactly as before. Display only.
// Nothing is drawn beyond the room (owner 2026-10-31 「描き足さずに少し引く」): on a phone the room fills the band
// between the stats and the commands, and the camera follows the hamster across it.
export function homeCamera(w,h,x){const scale=Math.max(w/384,h/216),vw=w/scale,vh=h/scale;
 return {scale,w:vw,h:vh,x:Math.max(0,Math.min(384-vw,x-vw/2)),y:Math.max(0,(216-vh)*.7)};}
export function drawHomeScene(cv,variant=0,pose=0){
 if(!cv)return;const c=cv.getContext('2d');if(!c)return;c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,cv.width,cv.height);
 const {ground,height}=HOME_ACTOR,m=homeMotionAt(pose),{x}=m,shrink=m.lift/3,cam=homeCamera(cv.width,cv.height,x);
 c.setTransform(cam.scale,0,0,cam.scale,-cam.x*cam.scale,-cam.y*cam.scale);
 if(room)c.drawImage(room,0,0,384,216);else drawFancyScene(c,'bedroom');
 // Stepped contact shadow stays on the straw; it narrows while the hamster hops.
 c.fillStyle='#95603f55';c.fillRect(x-22+shrink,ground-2,44-2*shrink,3);c.fillRect(x-16+shrink,ground+1,32-2*shrink,2);
 c.save();if(m.flipped){c.translate(2*x,0);c.scale(-1,1);}
 if(!drawHomePose(c,variant,m.pose,x,ground,height))drawUnifiedActor(c,{id:'player',variant},x,ground-m.lift,height,m.walk?'idle':SHEET_FALLBACK[m.pose]||m.pose,m.walk?{active:true,stridePhase:m.phase,phase:Math.floor(m.phase)%4,bob:0}:null,{opaqueContact:true});
 c.restore();
 if(cv.dataset){cv.dataset.homeArt='v24';cv.dataset.homeBeat=m.beat;cv.dataset.contactY=String(ground);cv.dataset.hero=String(variant);}
 c.restore();
}
