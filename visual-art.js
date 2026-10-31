import {heroSheet} from './hero-colors.js';
import {loadFancyPortraits,drawFancyPortrait} from './fancy-portrait-art.js';
import {drawFancySpecies} from './fancy-species-art.js';
import {loadFancyBackgrounds,drawFancyScene,drawFancyRace} from './fancy-backgrounds.js';
import {loadUnifiedArt,drawUnifiedActor,conversationPose} from './unified-art.js';
import {drawCastExpression} from './cast-expressions.js';
import {drawHeroIdentity} from './hero-identity.js';
import {drawAnimatedRunner,drawArticulatedSprite} from './race-animation.js';
// Production artwork shared by home, conversations and race broadcasts.
// This module only reads presentation parameters; it never reads/writes saves or RNG.
const images={};let pending;
const files={heroPortrait:heroSheet('./assets/hero-portraits-cropfix-20261020.png'),heroRunning:heroSheet('./assets/hero-running-safe-48-20261020.png'),hero:'./assets/visual-polish-v4/hero-emotions-v4.png',npc:'./assets/visual-polish-v4/npc-emotions-v4.png',daily:'./assets/visual-polish-v4/daily-scenes-v4.png',props:'./assets/visual-polish-v4/training-props-v4.png',venue:'./assets/art-review-v2/race-venues-v2.png'};
export const HERO_BOXES=[
 [[68,129,329,385],[409,129,675,385],[766,129,1033,385]],
 [[61,484,350,716],[407,478,698,716],[769,481,1058,717]],
 [[62,792,327,1042],[409,792,675,1042],[766,793,1034,1042]],
 [[59,1104,329,1357],[408,1104,681,1357],[763,1104,1035,1356]]
];
export const NPC_BOXES=[
 [[77,93,333,320],[403,91,645,320],[753,69,946,320],[1036,69,1328,320]],
 [[77,361,340,583],[403,361,650,584],[754,347,962,586],[1034,347,1332,587]],
 [[77,628,336,838],[401,621,650,836],[748,620,960,837],[1034,610,1331,842]],
 [[74,872,339,1077],[404,864,654,1077],[763,857,958,1077],[1041,859,1339,1078]]
];
const npcSpecies=['ネズミ','トラ','ウサギ','タツ'],aliases={rat:'ネズミ',tiger:'トラ',rabbit:'ウサギ',dragon:'タツ'};
export const expressionFrame=expression=>({happy:1,joy:1,sad:2,determined:3})[expression]??0;
export function loadVisualArt(){if(typeof Image==='undefined')return Promise.resolve(false);if(pending)return pending;pending=Promise.all([loadUnifiedArt(),loadFancyBackgrounds(),loadFancyPortraits(),...Object.entries(files).map(([key,path])=>new Promise(resolve=>{const image=new Image();image.onload=()=>{images[key]=image;resolve(true);};image.onerror=()=>resolve(false);image.src=new URL(path,import.meta.url).href;}))]).then(a=>a.every(Boolean));return pending;}
export function croppedSprite(c,image,box,x,ground,height){const [l,t,r,b]=box,w=Math.round((r-l)*height/(b-t));c.save();c.imageSmoothingEnabled=false;c.drawImage(image,l,t,r-l,b-t,Math.round(x-w/2),Math.round(ground-height),w,Math.round(height));c.restore();return true;}
// Portrait atlas is new artwork (64x64 x three), not overlays on the old hero.
export const NEW_HERO_PORTRAIT_BOXES=Object.freeze([[0,0,64,64],[64,0,128,64],[128,0,192,64]]);
export const NEW_HERO_RUN_STATES=Object.freeze(['normal','accelerating','full-speed','tired','limit','last-spurt']);
export function drawHeroRun(c,variant,x,ground,height,state='normal',motion=null){
 const unified=drawUnifiedActor(c,{id:'player',variant},x,ground,height,motion?.jump?'jump':motion?.active?'run-'+((motion.phase%4+4)%4):'run-0',motion);if(unified)return true;
 if(!images.heroRunning)return false;
 const v=((variant%3)+3)%3,idx=Math.max(0,NEW_HERO_RUN_STATES.indexOf(state));
 if(motion?.active){
  // Normal front-facing portraits are never slid along the course. Keep the
  // four-phase gait for normal/tired running; articulate the side-view poses
  // for acceleration, full speed, limit and the final spurt.
  if(idx===0||idx===3||motion.jump){
   const drawn=drawAnimatedRunner(c,{species:'hamster',variant:v},x,ground,height,motion);
   if(drawn){
    c.save();c.fillStyle=v===1?'#fff1bc':'#664a60';
    if(v===1){c.fillRect(Math.round(x+height*.21),Math.round(ground-height*.77),3,1);c.fillRect(Math.round(x+height*.24),Math.round(ground-height*.80),1,3);}
    if(v===2){c.strokeStyle='#664a60';c.lineWidth=1;c.strokeRect(Math.round(x+height*.10),Math.round(ground-height*.58),4,3);}
    c.restore();return drawn;
   }
  }
  return drawArticulatedSprite(c,images.heroRunning,[idx*48,v*48,idx*48+48,v*48+48],x,ground,height,motion);
 }
 const box=[idx*48,v*48,idx*48+48,v*48+48];
 return croppedSprite(c,images.heroRunning,box,x,ground,height);
}
// Mood-specific pixel marks on the new character portraits, with no duplicate
// forehead stars/glasses. Decorative only: no game-state changes.
export function drawHeroMood(c,variant,x,ground,height,expression='normal'){
 const happy=['happy','joy','delighted'].includes(expression),sad=['sad','worried'].includes(expression),determined=['determined','serious'].includes(expression);
 if(!happy&&!sad&&!determined)return false;
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x-height/2),Math.round(ground-height));c.scale(height/64,height/64);
 const dot=(xx,yy,w,h,color)=>{c.fillStyle=color;c.fillRect(xx,yy,w,h);};
 if(happy){
  for(const xx of [4,54]){dot(xx+1,17,4,2,'#e79c9a');dot(xx,19,7,3,'#e79c9a');dot(xx+2,22,3,2,'#e79c9a');}
 }else if(sad){
  dot(7,34,3,6,'#8dcbd7');dot(8,39,2,3,'#fff0d2');dot(54,36,2,5,'#8dcbd7');
 }else if(determined){
  dot(8,13,8,2,'#795367');dot(49,13,8,2,'#795367');dot(53,8,2,3,'#ffd382');dot(50,11,8,2,'#ffd382');
 }
 c.restore();return true;
}
export function drawVisualHero(c,variant,x,ground,height,running=false,expression='normal'){
 const v=((variant%3)+3)%3;
 if(!running&&drawCastExpression(c,{id:'player',variant:v},x,ground,height,expression))return true;
 if(!running&&drawUnifiedActor(c,{id:'player',variant:v},x,ground,height,conversationPose(expression)))return true;
 if(running&&drawHeroRun(c,v,x,ground,height))return true;
 if(!running&&images.heroPortrait){
  croppedSprite(c,images.heroPortrait,NEW_HERO_PORTRAIT_BOXES[v],x,ground,height);
  drawHeroMood(c,v,x,ground,height,expression);
  return true;
 }
 if(!images.hero)return false;
 const frame=running?1:expression==='happy'||expression==='joy'?2:expression==='determined'?3:0;
 const drawn=croppedSprite(c,images.hero,HERO_BOXES[frame][v],x,ground,height);
 if(drawn)drawHeroIdentity(c,v,x,ground,height,{running,expression});
 return drawn;
}
export function drawVisualNPC(c,species,x,ground,height,expression='normal'){if(drawFancyPortrait(c,species,x,ground,height,expression))return true;if(drawFancySpecies(c,{species},x,ground,height))return true;const index=npcSpecies.indexOf(aliases[species]||species);return !!images.npc&&index>=0&&croppedSprite(c,images.npc,NPC_BOXES[expressionFrame(expression)][index],x,ground,height);}
// Integer source boundaries measured from the four equal generated panels.
export const DAILY_BOXES=[[0,0,836,470],[836,0,1672,470],[0,470,836,941],[836,470,1672,941]];
export function drawDailyBackground(c,action='idle'){
 if(drawFancyScene(c,action==='rest'?'bedroom':['speed','stamina','technique','scout'].includes(action)?'training':['appetite','intelligence'].includes(action)?'note':'town'))return true;
 if(!images.daily)return false;const index=action==='rest'?3:['appetite','intelligence'].includes(action)?2:['speed','stamina','technique','scout'].includes(action)?1:0,[l,t,r,b]=DAILY_BOXES[index];
 c.save();c.imageSmoothingEnabled=false;c.drawImage(images.daily,l,t,r-l,b-t,0,0,384,216);c.restore();return true;
}
export const PROP_BOXES={stamina:[92,91,615,659],appetite:[724,362,1180,659],intelligence:[88,820,598,1166],rest:[683,779,1212,1166]};
export function drawDailyProp(c,action,front=false){
 if(!images.props||!PROP_BOXES[action])return false;
 const box=PROP_BOXES[action],[l,t,r,b]=box,height=action==='stamina'?128:action==='rest'?52:65,ground=action==='stamina'?188:action==='rest'?202:204,x=['appetite','intelligence'].includes(action)?213:194;
 if(action==='stamina'){if(!front)croppedSprite(c,images.props,box,x,ground,height);return true;}
 if(action!=='rest'){
  // Draw the whole desk behind the animal, then just its lower foreground.
  // Repainting the full tabletop hid the pencil and the seed-holding paws.
  c.save();if(front){c.beginPath();c.rect(0,166,384,50);c.clip();}croppedSprite(c,images.props,box,x,ground,height);c.restore();return true;
 }
 if(!front)return croppedSprite(c,images.props,box,x,ground,height);
 // Quilt sits in front of the resting body; the pillow stays behind its face.
 const width=Math.round((r-l)*height/(b-t)),cut=910,dy=Math.round(ground-height+(cut-t)*height/(b-t));
 c.save();c.imageSmoothingEnabled=false;c.drawImage(images.props,l,cut,r-l,b-cut,Math.round(x-width/2),dy,width,Math.round(ground-dy));c.restore();return true;
}
// Keep complete buildings in one layer. Only the unobstructed running ground
// scrolls faster; slicing roofs into artificial parallax bands would tear them.
export const VENUE_BOXES=DAILY_BOXES;
export function venueLayers(themeId,cameraPixels=0){const index=Math.max(0,['day','sunset','stadium','shrine'].indexOf(themeId));return {index,back:((Math.floor(cameraPixels*.12)%384)+384)%384,ground:((Math.floor(cameraPixels)%384)+384)%384};}
export function drawVisualVenue(c,theme,cameraPixels=0,{fullHeight=false}={}){if(drawFancyRace(c,theme,cameraPixels))return true;if(!images.venue)return false;const p=venueLayers(theme.id,cameraPixels),[l,t,r,b]=VENUE_BOXES[p.index],sourceH=b-t;
 c.save();c.imageSmoothingEnabled=false;
 for(const [top,bottom,offset] of [[0,104,p.back],[104,fullHeight?216:182,p.ground]]){
  const sy=t+Math.round(top*sourceH/216),sb=t+Math.round(bottom*sourceH/216);
  for(const x of [-offset,384-offset])c.drawImage(images.venue,l,sy,r-l,sb-sy,x,top,384,bottom-top);
 }
 c.restore();return true;
}

export function drawStudyPencil(c,x,y,phase=0){if(!images.props)return false;c.save();c.imageSmoothingEnabled=false;c.translate(x+Math.sin(phase)*2,y);c.rotate(-.45);c.drawImage(images.props,478,846,43,112,-2,-11,4,11);c.restore();return true;}
