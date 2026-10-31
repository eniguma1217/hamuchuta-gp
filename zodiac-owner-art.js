// The owner's twelve zodiac animals and the rival cat (2026-10-23) for races, checkpoints,
// conversations and awards (#30 I3/I4). Display only: no saves, RNG or race math.
import {OWNER_ZODIAC} from './zodiac-owner-boxes.js';
import {SPECIES_ALIASES} from './fancy-species-art.js';
const images={},GUARD=4;let pending;
export function loadOwnerZodiac(){if(typeof Image==='undefined')return Promise.resolve(false);return pending||=Promise.all(Object.values(OWNER_ZODIAC).map(d=>new Promise(resolve=>{const i=new Image();i.onload=()=>{images[d.key]=i;resolve(true);};i.onerror=()=>resolve(false);i.src=new URL('./assets/owner-v45/zodiac/'+d.key+'.png',import.meta.url).href;}))).then(r=>r.every(Boolean));}
export function ownerZodiac(nameOrId){const d=OWNER_ZODIAC[SPECIES_ALIASES[nameOrId]||nameOrId];return d&&images[d.key]?d:null;}
// Race pose: the eight painted run frames advance two per stride of the shared gait
// (so the legs keep the ground speed of PR #37); a hurdle leap uses the jump pose.
export function ownerRacePose(motion){
 if(!motion?.active)return 'idle';
 if(motion.jump||motion.frame===5)return 'jump';
 const phase=Number.isFinite(motion.stridePhase)?motion.stridePhase:motion.phase??0;
 return 'run'+(((Math.floor(phase*2)%8)+8)%8);
}
// Conversation and award poses by expression (owner: full-body poses, not the face close-ups).
// The sheets paint the front/side/back views ("全身・ポーズ") larger than the other poses,
// so conversations use the poses drawn at one scale: standing, sitting, joy, feeling down
// and sleeping (surprise and determination keep the standing pose).
export function ownerTalkPose(expression='normal'){
 return ['happy','joy','delighted'].includes(expression)?'joy':['sad','disappointed','worried','nervous'].includes(expression)?'sad':expression==='sleepy'?'sleep':['thinking','calm'].includes(expression)?'sit':'idle';
}
// Lowest painted pixel on `ground`. One scale per animal (raceRef: its run frames are drawn as
// tall as the old ones), so every pose of an animal shares one size. In conversations and
// awards the standing pose fills `height`; poses never scale up on their own.
export function ownerZodiacPlacement(d,pose,x,ground,height,{talk=false,bob=0}={}){
 const [l,t,r,b]=d.frames[pose]||d.frames.idle,idle=d.frames.idle,scale=height/(talk?idle[3]-idle[1]:d.raceRef),sw=r-l+GUARD*2,sh=b-t+GUARD*2,w=sw*scale,h=sh*scale;
 return {owner:true,key:d.key,pose,source:[l-GUARD,t-GUARD,sw,sh],destination:[Math.round(x-w/2),Math.round(ground-(b-t+GUARD)*scale-bob),w,h],feet:ground};
}
export function drawOwnerZodiacPlacement(c,p){const image=images[p.key];if(!image)return false;c.save();c.imageSmoothingEnabled=false;c.drawImage(image,...p.source,...p.destination);c.restore();return true;}
export function drawOwnerZodiacTalk(c,id,x,ground,height,expression='normal'){const d=ownerZodiac(id);if(!d)return false;return drawOwnerZodiacPlacement(c,ownerZodiacPlacement(d,ownerTalkPose(expression),x,ground,height,{talk:true}));}
