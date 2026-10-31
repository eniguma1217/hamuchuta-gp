import {loadSleepArt,drawSleepingHamster} from './sleep-art.js';
import {fieldProjector} from './field-projection.js';
import {drawRaceTracker} from './race-tracker.js';
import {loadFancySpecies,drawFancySpecies} from './fancy-species-art.js';
import {raceLayout} from './race-layout.js';
import {loadHurdleArt,drawHurdle} from './hurdle-art.js';
import {hedgeSlices,drawHedgeSlice,loadHedgeArt} from './hedge-course.js';
import {drawUnifiedActor,unifiedCharacter} from './unified-art.js';
import {COURSE_PIXELS,projectRaceX} from './race-projection.js';
import {loadStoryArt,drawStoryActor} from './story-art.js';
import {drawHamsterCharacter,loadHamsterCharacters} from './hamster-character-art.js';
import {drawWorldAnimal} from './world-animal-art.js';
import {loadCheckpointArt,drawCheckpointStage,drawCheckpointZodiac,drawPracticeActor,studyPaper,drawPracticeMaze} from './checkpoint-art.js';
import {loadVisualArt,drawVisualHero,drawHeroRun,drawVisualNPC,drawDailyBackground,drawVisualVenue,drawDailyProp} from './visual-art.js';
import {drawReviewActor,drawReviewVenue,loadReviewArt} from './art-review.js';
import {runnerDepth,depthOrder,openingPlacement} from './runner-depth.js';
import {iconData as oldIcon} from './legacy-art.js';
import {loadRaceAnimation,drawAnimatedRunner} from './race-animation.js';
import {runningMotion} from './running-motion.js';
import {drawHeroIdentity} from './hero-identity.js';
import {hurdlePositions} from './race-presentation.js';
import {liveStageLabel} from './race-stage-label.js';
import {THEMES,raceTheme,layerOffsets,drawRaceScenery,drawShrineFixtures,loadRaceGarden,drawRaceGarden} from './race-scenery.js';
export const SCENE_SIZE={width:384,height:216};
export const GBA_PALETTE=['#403046','#795367','#ab6b78','#e79c9a','#f5c8b5','#fff0d2','#ffd382','#eaa35c','#b77652','#9fc5b1','#689c99','#b3dce3','#e9f2d2','#9dbb82','#73916b','#f6e4ba'];
export const NES_PALETTE=GBA_PALETTE;
export const SCENE_TITLES={idle:'ひまわりタウン',speed:'風のかけっこ道',stamina:'ころころ回し車',appetite:'もぐもぐ食堂',intelligence:'おひさまの図書室',technique:'くねくね庭園',rest:'おふとんの時間',outing:'みんなの帰り道',scout:'大会コースの下見',joy:'小さな足の、大きな物語'};
export const SCENE_LAYOUTS=Object.fromEntries(Object.keys(SCENE_TITLES).map(key=>[key,{x:194,ground:176,height:48}]));
SCENE_LAYOUTS.stamina={x:194,ground:164,height:28,wheel:{x:194,y:112,radius:58}};
SCENE_LAYOUTS.appetite={x:194,ground:190,height:60};
SCENE_LAYOUTS.intelligence={x:194,ground:190,height:60};
const frameBoxes=[[[76,138,340,379],[70,608,412,301]],[[585,138,352,379],[574,608,413,301]],[[1080,138,356,379],[1080,608,416,301]]];
let atlas=null,npcAtlas=null,loading;
export function loadArt(){if(loading)return loading;if(typeof Image==='undefined')return Promise.resolve(false);const read=(path,accept)=>new Promise(resolve=>{const i=new Image();i.onload=()=>{accept(i);resolve(true);};i.onerror=()=>resolve(false);i.src=new URL(path,import.meta.url).href;});loading=Promise.all([read('./assets/hamchuta-atlas-v1.png',i=>atlas=i),read('./assets/zodiac-npc-atlas-v1.png',i=>npcAtlas=i),loadSleepArt(),loadReviewArt(),loadCheckpointArt(),loadVisualArt(),loadStoryArt(),loadRaceAnimation(),loadHamsterCharacters(),loadFancySpecies(),loadHurdleArt(),loadHedgeArt(),loadRaceGarden()]).then(a=>a.every(Boolean));return loading;}
const npcBoxes={rat:[[68,128,322,287],[59,537,356,247]],tiger:[[536,145,273,277],[537,546,294,241]],rabbit:[[990,102,226,321],[961,527,274,264]],dragon:[[1389,118,317,306],[1358,535,367,269]]};
const npcID=species=>({ネズミ:'rat',トラ:'tiger',ウサギ:'rabbit',タツ:'dragon'}[species]||species);
export function drawContestant(c,row,x,ground,height=34,running=false,pose=0,action={}){
 const paintedSpecies=drawFancySpecies(c,row,x,ground,height,running?action.motion:null);if(paintedSpecies)return paintedSpecies;
 // A single approved character-art family for ALL hamster racers, not
 // one big protagonist mixed with tiny low-resolution NPCs.
 if(unifiedCharacter(row)&&drawUnifiedActor(c,row,x,ground,height,running?'run-'+(Math.floor(pose)%4):action.expression==='happy'?'joy':'idle',running?action.motion:null,{opaqueContact:!!action.opaqueContact,expression:action.expression}))return {animated:running};
 if(row.id==='player'&&running&&action.motion?.active&&drawHeroRun(c,row.variant??0,x,ground,height,action.motion.state,action.motion))return {animated:true};
 if(row?.id&&drawHamsterCharacter(c,row.id,x,ground,height,action.expression||'normal',running,pose,action.motion))return;
 if(running){const animated=drawAnimatedRunner(c,row,x,ground,height,action.motion);if(animated)return animated;}
 const reviewed=drawReviewActor(c,row,x,ground,height,running,pose,action);if(reviewed)return reviewed;
 if(row.species==='hamster'||row.species==='ハムスター')return sprite(c,row.variant??(Number.isInteger(row.index)?row.index%3:0),x,ground,height,running,pose);
 if(!running&&drawStoryActor(c,row.species||row.id,x,ground,height,action.expression))return;
 if(!running&&drawVisualNPC(c,row.species||row.id,x,ground,height,action.expression))return;
 if(drawCheckpointZodiac(c,row,x,ground,height))return;
 if(drawWorldAnimal(c,row.species||row.id,x,ground,height,pose))return;
 const boxes=npcBoxes[npcID(row.species||row.id)];
 if(npcAtlas&&boxes){const box=boxes[running?1:0],width=Math.round(height*box[2]/box[3]);c.drawImage(npcAtlas,...box,Math.round(x-width/2),Math.round(ground-height),width,height);}
 else animal(c,row,x,ground,height,pose);
}
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function circle(c,x,y,r,color){for(let dy=-r;dy<=r;dy++){const half=Math.floor(Math.sqrt(r*r-dy*dy));rect(c,x-half,y+dy,half*2+1,1,color);}}
function line(c,x1,y1,x2,y2,color,width=2){const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));for(let i=0;i<=n;i++)rect(c,x1+(x2-x1)*i/n,y1+(y2-y1)*i/n,width,width,color);}
function shadow(c,x,y,w=30){c.save();c.globalAlpha*=.22;oval(c,x,y+1,w/2,2,'#846552');c.restore();}
export function sprite(c,variant,x,ground,height=42,running=false,pose=0){
 if(drawReviewActor(c,{species:'hamster',variant},x,ground,height,running,pose))return;
 if(drawVisualHero(c,variant,x,ground,height,running))return;
 const box=frameBoxes[variant%3][running?1:0],width=Math.round(height*box[2]/box[3]);
 if(atlas)c.drawImage(atlas,...box,Math.round(x-width/2),Math.round(ground-height),width,height);
 else animal(c,{species:'hamster',variant},x,ground,height,pose);
 if(running&&pose%2){rect(c,x-7,ground-2,7,2,'#e79c9a');rect(c,x+10,ground-2,4,2,'#403046');}
}
function tree(c,x,y){rect(c,x-3,y-10,6,23,'#997455');rect(c,x-19,y-32,38,17,'#73916b');rect(c,x-13,y-45,27,17,'#9dbb82');rect(c,x-23,y-23,46,13,'#9dbb82');rect(c,x-12,y-40,10,3,'#bcd39a');}
function world(c,action='idle',offset=0){
 rect(c,0,0,384,216,'#b3dce3');rect(c,0,28,384,23,'#cce4df');
 for(let x=-40;x<420;x+=120){const xx=(x-offset*.15+420)%480-40;rect(c,xx,19,40,7,'#e9f2d2');rect(c,xx+8,12,21,14,'#e9f2d2');}
 rect(c,0,74,384,62,'#a8c4a1');for(let x=-20;x<430;x+=68){rect(c,x,69,55,35,'#bcd39a');rect(c,x+8,59,36,25,'#bcd39a');}
 for(let x=-35;x<425;x+=105)tree(c,(x-offset*.4+480)%480-25,128);
 rect(c,0,135,384,81,'#d6bd93');rect(c,0,135,384,5,'#795367');rect(c,0,141,384,4,'#f6e4ba');
 for(let x=0;x<384;x+=20){rect(c,x,134,10,2,'#f6e4ba');rect(c,x+4,190+(x%3)*3,3,2,'#bda079');}
 if(['idle','joy','outing','scout'].includes(action)){
  rect(c,35,89,78,45,'#f6e4ba');rect(c,31,85,86,7,'#795367');rect(c,39,75,70,11,'#ab6b78');rect(c,48,66,52,11,'#ab6b78');rect(c,48,102,16,18,'#689c99');rect(c,82,103,20,31,'#b77652');rect(c,94,118,3,3,'#ffd382');
  for(let x=272;x<355;x+=21){rect(c,x,112,4,24,'#795367');rect(c,x-5,120,14,3,'#f6e4ba');circle(c,x+2,106,6,'#ffd382');circle(c,x+2,106,2,'#795367');}
 }
 if(['rest','intelligence','appetite'].includes(action)){
  rect(c,0,0,384,143,'#f6e4ba');for(let x=0;x<384;x+=48)rect(c,x,0,2,140,'#e4c69f');rect(c,27,27,67,62,'#795367');rect(c,31,31,59,54,'#b3dce3');rect(c,58,31,4,54,'#f6e4ba');rect(c,31,55,59,4,'#f6e4ba');
  if(action==='intelligence'){for(let y=30;y<120;y+=25){rect(c,274,y,85,4,'#795367');for(let x=280;x<354;x+=10)rect(c,x,y-17,7,17,['#689c99','#ab6b78','#eaa35c'][x%3]);}}
 }
}
function sceneProps(c,action,pose){
 // Eating and study sit on the floor: no desk drawn over the hamster (owner, #30 C1 2026-10-25).
 if(['appetite','intelligence'].includes(action))return;
 if(drawDailyProp(c,action,false))return;
 if(action==='stamina'){
  const {x,y,radius:r}=SCENE_LAYOUTS.stamina.wheel;circle(c,x,y,r,'#403046');circle(c,x,y,r-3,'#b77652');circle(c,x,y,r-7,'#f6e4ba');
  for(let i=0;i<8;i++){const a=(i+pose/5)*Math.PI/4;line(c,x,y,x+Math.cos(a)*(r-7),y+Math.sin(a)*(r-7),'#d6bd93',2);}circle(c,x,y,4,'#795367');rect(c,x-3,y+r,6,8,'#795367');rect(c,x-24,y+r+8,48,4,'#795367');
 }
 if(action==='technique'){for(let x=38;x<350;x+=50){rect(c,x,156,32,5,'#9dbb82');rect(c,x,160,7,23,'#73916b');}rect(c,172,177,47,4,'#f6e4ba');}
 if(action==='rest'){rect(c,145,169,105,12,'#795367');rect(c,140,151,110,21,'#ab6b78');rect(c,143,148,27,13,'#fff0d2');}
}
export function drawScene(cv,variant=0,turn=0,pose=0,info={}){
 if(!cv)return;const c=cv.getContext('2d');if(!c)return;c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,cv.width,cv.height);c.scale(cv.width/384,cv.height/216);
 const action=info.action in SCENE_TITLES?info.action:'idle',layout=SCENE_LAYOUTS[action];if(!drawDailyBackground(c,action))world(c,action);if(action==='rest'&&drawSleepingHamster(c,variant,pose)){c.restore();return;}if(action==='technique'&&drawPracticeMaze(c,variant,pose,info.practice)){c.restore();return;}sceneProps(c,action,pose);shadow(c,layout.x,layout.ground,action==='stamina'?22:37);
 if(!(['speed','stamina','technique','outing'].includes(action)&&drawUnifiedActor(c,{id:'player',species:'hamster',variant},layout.x,layout.ground,layout.height,'run-0',{active:true,phase:pose%4,stridePhase:pose,bob:0}))&&!drawPracticeActor(c,action,variant,layout.x,layout.ground,layout.height,pose)&&!(action==='rest'&&drawVisualHero(c,variant,layout.x,layout.ground,layout.height,false,'happy')))sprite(c,variant,layout.x,layout.ground,layout.height,['speed','stamina','technique','outing'].includes(action),pose);
 if(!['appetite','intelligence'].includes(action)&&!drawDailyProp(c,action,true)){
  if(action==='appetite'){rect(c,213,167,22,8,'#795367');rect(c,215,164,18,7,'#ffd382');}
  if(action==='intelligence'){rect(c,216,159,24,17,'#795367');rect(c,218,161,20,12,'#fff0d2');rect(c,227,161,2,12,'#b77652');}
  if(action==='rest'){rect(c,166,159,70,15,'#ab6b78');rect(c,166,159,70,3,'#e79c9a');}
 }
 // Study on the floor with paper and a pen at the paws, as at the race gate (#30 C1/D8).
 if(action==='intelligence')studyPaper(c,{id:'player',variant},layout.x,layout.ground,layout.height,pose/8);
 if(action==='joy'){for(let i=0;i<9;i++)rect(c,100+i*22,38+(i%3)*13,3,6,['#eaa35c','#ab6b78','#689c99'][i%3]);}
 c.restore();
}
export function drawPortrait(cv,variant=0,expression='normal'){if(!cv)return;const c=cv.getContext('2d');if(!c)return;c.clearRect(0,0,cv.width,cv.height);c.save();c.imageSmoothingEnabled=false;c.scale(cv.width/66,cv.height/60);if(!drawVisualHero(c,variant,33,57,48,false,expression))sprite(c,variant,33,57,48);c.restore();}
function oval(c,x,y,rx,ry,color){for(let dy=-Math.round(ry);dy<=Math.round(ry);dy++){const w=Math.floor(rx*Math.sqrt(Math.max(0,1-dy*dy/(ry*ry))));rect(c,x-w,y+dy,w*2+1,1,color);}}
export const ZODIAC_CHARACTER_TYPES=Object.freeze({ネズミ:'mouse',ウシ:'cow',トラ:'tiger',ウサギ:'rabbit',タツ:'dragon',ヘビ:'snake',ウマ:'horse',ヒツジ:'sheep',サル:'monkey',ニワトリ:'rooster',イヌ:'dog',イノシシ:'boar'});
export const raceSpeciesType=species=>ZODIAC_CHARACTER_TYPES[species]||({rat:'mouse',tiger:'tiger',rabbit:'rabbit',dragon:'dragon'})[species]||'other';
function animal(c,row,x,ground,height=25,pose=0){
 const species=row.species||row.id||'';
 const kind=raceSpeciesType(species);
 const bird=['ペンギン','フクロウ','タカ','ワシ','ニワトリ','フラミンゴ','ダチョウ','クジャク'].includes(species);
 const w=Math.max(15,height*.83),left=Math.round(x-w/2),top=Math.round(ground-height);
 const fill={mouse:'#b8b2c0',cow:'#fff0d2',tiger:'#eaa35c',rabbit:'#fff0d2',dragon:'#9dbb82',snake:'#73916b',horse:'#b77652',sheep:'#fff0d2',monkey:'#b77652',rooster:'#fff0d2',dog:'#d6bd93',boar:'#b77652'}[kind]||['#f5c8b5','#d6bd93','#9fc5b1','#b8b2c0'][Math.abs(row.index||0)%4];
 // The snake is a separate silhouette: no borrowed rodent ears or legs.
 if(kind==='snake'){
  oval(c,x-2,ground-height*.30,w*.64,height*.22,'#403046');
  oval(c,x-2,ground-height*.30,w*.59,height*.17,fill);
  circle(c,Math.round(x+w*.26),Math.round(ground-height*.48),Math.max(6,Math.round(height*.20)),'#403046');
  circle(c,Math.round(x+w*.26),Math.round(ground-height*.48),Math.max(5,Math.round(height*.20)-1),fill);
  rect(c,x+w*.29,ground-height*.53,2,2,'#403046');rect(c,x+w*.5,ground-height*.37,6,1,'#ab6b78');
  rect(c,x-7,ground-5,5,2,'#fff0d2');return;
 }
 oval(c,x,ground-height*.44,w*.53,height*.45,'#403046');
 oval(c,x,ground-height*.44,w*.53-1,height*.45-1,fill);
 oval(c,x,ground-height*.22,w*.35,height*.20,'#fff0d2');
 if(kind==='rabbit'){
  rect(c,left+3,top-8,5,15,'#403046');rect(c,left+w-8,top-8,5,15,'#403046');
  rect(c,left+4,top-6,3,11,'#e79c9a');rect(c,left+w-7,top-6,3,11,'#e79c9a');
 }else if(kind==='cow'){
  rect(c,left+1,top-5,6,6,'#fff0d2');rect(c,left+w-7,top-5,6,6,'#fff0d2');
  rect(c,left+1,top-9,3,5,'#ffd382');rect(c,left+w-4,top-9,3,5,'#ffd382');
  rect(c,left+3,top+8,5,5,'#403046');rect(c,left+w-8,top+13,4,4,'#403046');
  rect(c,x-5,ground-height*.19,10,5,'#e79c9a');
 }else if(kind==='horse'){
  rect(c,x-5,top-7,3,11,'#403046');rect(c,x+3,top-7,3,11,'#403046');
  rect(c,x-8,top-2,4,12,'#795367');rect(c,x-4,top-3,8,4,'#795367');
  rect(c,x-3,ground-height*.22,10,8,'#b77652');
 }else if(kind==='sheep'){
  for(const [dx,dy] of [[-8,6],[0,2],[8,6],[-10,13],[10,13]])circle(c,Math.round(x+dx),top+dy,5,'#fff0d2');
  oval(c,x,top+height*.58,w*.30,height*.25,'#795367');
 }else if(kind==='rooster'){
  rect(c,x-2,top-9,5,6,'#d82800');rect(c,x-6,top-6,4,6,'#d82800');rect(c,x+3,top-7,4,5,'#d82800');
  rect(c,x+4,top+15,6,3,'#eaa35c');rect(c,left-3,ground-9,6,7,'#ab6b78');
 }else if(kind==='dragon'){
  rect(c,left+2,top-5,4,9,'#ffd382');rect(c,left+w-6,top-5,4,9,'#ffd382');
  for(let i=0;i<3;i++)rect(c,left+4+i*7,top-6-i%2*2,4,6,'#689c99');
  rect(c,x+w*.4,ground-height*.3,7,3,'#689c99');
 }else if(kind==='tiger'){
  for(let j=0;j<3;j++){rect(c,left+4+j*7,top+4,2,7,'#795367');rect(c,left+4+j*7,ground-12,2,4,'#795367');}
 }else if(kind==='dog'){
  rect(c,left-3,top+2,6,13,'#795367');rect(c,left+w-3,top+2,6,13,'#795367');
  rect(c,left+4,top+14,5,5,'#b77652');
 }else if(kind==='boar'){
  rect(c,x-6,ground-height*.26,12,7,'#e79c9a');rect(c,x-3,ground-height*.21,2,2,'#403046');rect(c,x+2,ground-height*.21,2,2,'#403046');
  rect(c,left+1,top+1,4,9,'#795367');rect(c,left+w-6,top+1,4,9,'#795367');
  rect(c,x-10,ground-height*.28,4,6,'#fff0d2');rect(c,x+7,ground-height*.28,4,6,'#fff0d2');
 }else if(kind==='monkey'){
  circle(c,Math.round(left+2),top+8,5,'#b77652');circle(c,Math.round(left+w-2),top+8,5,'#b77652');
  oval(c,x,top+height*.60,w*.35,height*.25,'#ffd382');
  rect(c,left-5,ground-13,6,2,'#795367');
 }else if(kind==='mouse'){
  circle(c,Math.round(left+4),top+5,5,'#403046');circle(c,Math.round(left+w-4),top+5,5,'#403046');
  circle(c,Math.round(left+4),top+5,4,'#e79c9a');circle(c,Math.round(left+w-4),top+5,4,'#e79c9a');
  line(c,left-6,ground-7,left-1,ground-6,'#795367',1);line(c,left+w+1,ground-7,left+w+6,ground-6,'#795367',1);
  rect(c,left-8,ground-5,8,2,'#e79c9a');
 }else if(!bird){
  circle(c,Math.round(left+5),top+4,4,'#403046');circle(c,Math.round(left+w-5),top+4,4,'#403046');
  circle(c,Math.round(left+5),top+4,3,'#e79c9a');circle(c,Math.round(left+w-5),top+4,3,'#e79c9a');
 }
 rect(c,left+5,top+11,3,4,'#403046');rect(c,left+w-8,top+11,3,4,'#403046');
 rect(c,left+5,top+11,1,1,'#fff0d2');rect(c,left+w-8,top+11,1,1,'#fff0d2');
 rect(c,x-1,top+17,3,2,'#795367');
 if(bird&&kind!=='rooster')rect(c,x+3,top+16,5,3,'#eaa35c');
 rect(c,left+3+(pose%2),ground-2,6,2,'#ab6b78');rect(c,left+w-9-(pose%2),ground-2,6,2,'#ab6b78');
}
export function drawNPCPortrait(cv,id,expression='normal'){if(!cv)return;const c=cv.getContext('2d');if(!c)return;c.clearRect(0,0,cv.width,cv.height);c.save();c.imageSmoothingEnabled=false;c.scale(cv.width/66,cv.height/60);if(!drawStoryActor(c,id,33,57,48,expression)&&!drawVisualNPC(c,id,33,57,48,expression))drawContestant(c,{species:id},33,57,48);c.restore();}
// Friend badge: draw the portrait off-screen, find the figure's own pixels and centre them in the circle,
// so every friend sits in the middle whatever the portrait's framing (#30 B2, owner 2026-10-26).
export function drawFriendBadge(cv,id){const c=cv?.getContext?.('2d'),off=document.createElement('canvas');if(!c||!off.getContext)return;off.width=66;off.height=60;drawNPCPortrait(off,id);const o=off.getContext('2d');if(!o?.getImageData)return;
 const px=o.getImageData(0,0,66,60)?.data;if(!px)return;let x0=66,y0=60,x1=-1,y1=-1;for(let y=0;y<60;y++)for(let x=0;x<66;x++)if(px[(y*66+x)*4+3]>24){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 c.clearRect(0,0,cv.width,cv.height);if(x1<0)return;const w=x1-x0+1,h=y1-y0+1,k=cv.width*.78/Math.max(w,h);c.imageSmoothingEnabled=false;c.drawImage(off,x0,y0,w,h,(cv.width-w*k)/2,(cv.height-h*k)/2,w*k,h*k);}
export const iconData=oldIcon;

function raceMarker(c,x,y,type,label){
 const player=type==='player',tone=player?'#ffd382':'#e79c9a',half=player?9:12,top=player?14:18;
 rect(c,x-half,y-top,half*2,player?9:11,'#795367');rect(c,x-half+1,y-top+1,half*2-2,player?7:9,tone);
 c.fillStyle='#634852';c.font='bold '+(player?6:7)+'px HamMaru,sans-serif';c.textAlign='center';c.fillText(label,x,y-top+(player?7:8));c.beginPath();c.moveTo(x-3,y-top+10);c.lineTo(x+3,y-top+10);c.lineTo(x,y-top+14);c.closePath();c.fillStyle=tone;c.fill();
}
function audience(c,live,p,cameraPixels=0,illustrated=false){
 // Illustrated venues paint their own scenery. Rows of floating squares with
 // excited "flags" read as music notes there, not spectators (#30 D2).
 if(illustrated)return;
 rect(c,0,66,384,26,p.theme?.stand||'#795367');const offset=layerOffsets(cameraPixels)[1];
 const time=p.intro?p.opening*4:live.time,mode=p.crowd||'watch',excited=['start','overtake','finish-close','finish','victory'].includes(mode);
 for(let id=0;id<56;id++){
  const x=((5+(id%28)*14-offset)%392+392)%392-4,y=69+Math.floor(id/28)*11,phase=Math.floor(time*5+id*1.7)%3;
  const rise=mode==='victory'?phase*2:excited?phase:mode==='gasp'?0:0,tone=['#f5c8b5','#ffd382','#9fc5b1','#b8b2c0'][id%4];
  rect(c,x,y+5-rise,6,5,tone);rect(c,x-1,y+10-rise,8,3,'#403046');
  if(id%4===0){rect(c,x,y+1-rise,2,5,tone);rect(c,x+4,y+1-rise,2,5,tone);}else{rect(c,x-1,y+4-rise,2,3,tone);rect(c,x+5,y+4-rise,2,3,tone);}
  if(excited&&id%3===phase){rect(c,x+8,y+2-rise,1,10,'#fff0d2');rect(c,x+9,y+2-rise,4,4,p.winning?'#ffd382':'#e79c9a');}
  if(mode==='applause'){rect(c,x-2+(phase%2),y+8,2,2,'#fff0d2');rect(c,x+6-(phase%2),y+8,2,2,'#fff0d2');}
  if(mode==='gasp')rect(c,x+2,y+7,2,2,'#fff0d2');
 }
}
export function drawRace(cv,live,variant=0,options={}){
 if(!cv||!live)return;const c=cv.getContext('2d');if(!c)return;
 c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,cv.width,cv.height);c.scale(cv.width/384,cv.height/216);
 const player=live.player,p=options.presentation||{},pulse=Math.floor((p.intro?p.opening*4:live.time)*10),focus=options.focusId&&live.standings.find(x=>x.id===options.focusId)||player;const cameraDistance=Number.isFinite(options.cameraDistance)?options.cameraDistance:Number.isFinite(p.cameraDistance)?p.cameraDistance:focus.distance;
 const center=179,zoom=p.zoom||1,range=COURSE_PIXELS*zoom,project=fieldProjector(live,cameraDistance,zoom,center,p.straighten||0),theme=p.theme||(live.final?THEMES.shrine:THEMES.day);
 // The ground strip scrolls with the SAME projection as runners and hedges (#30,
 // owner 2026-10-24): at the steady zoom it used to pass ~2.8x faster than the hedges.
 const sceneryTravel=cameraDistance*range;
 const illustrated=drawRaceGarden(c,theme,sceneryTravel)||drawVisualVenue(c,theme,sceneryTravel)||drawReviewVenue(c,theme,sceneryTravel);if(!illustrated)drawRaceScenery(c,theme,sceneryTravel);audience(c,live,{...p,theme},sceneryTravel,illustrated);
 // Ground markings, hurdles, gates and finish use exactly the runner projection.
 if(!illustrated)for(let i=0;i<20;i++){const x=((center+i*73-Math.round(cameraDistance*range))%420+420)%420-20;rect(c,x,103+(i*43)%69,5+(i%3)*3,2,i%4?'#d6bd93':'#eacfa6');}
 drawShrineFixtures(c,theme,cameraDistance,range,center,d=>project(d));
 const candidates=live.standings.filter(row=>Math.abs(project(row.distance)-179)<255);
 // Render only genuine nearby runners, not invented copies. The physical
 // side-on projection preserves obstacle alignment and actual forward order.
 const visible=candidates.slice().sort((a,b)=>Math.abs(a.distance-cameraDistance)-Math.abs(b.distance-cameraDistance)).slice(0,30);
 for(const special of [player,live.standings.find(x=>x.id===live.spotlightId),...live.standings.slice(0,3)])if(special&&!visible.some(x=>x.id===special.id)&&Math.abs(special.distance-cameraDistance)<.16)visible.push(special);
 const hurdles=hurdlePositions(live.course),opening=p.intro||live.time<live.duration*.018;
 const hedgeParts=[];
 if(!opening)for(const distance of hurdles){
  const x=project(distance);
  if(x>-32&&x<416)hedgeParts.push(...hedgeSlices(x,zoom));
 }
 const finishX=project(1);if(finishX>-15&&finishX<385)for(let y=124;y<181;y+=6)for(let x=0;x<12;x+=6)rect(c,finishX+x,y,6,6,((y/6+x/6)|0)%2?'#fff0d2':'#403046');
 const field=opening?live.standings:visible,shown=new Set(field.map(r=>r.id)),layout=raceLayout(live,p,variant,cameraDistance);
 // Interleave the single cross-track hedge with the herd by ground depth:
 // far foliage is behind the runners, near foliage in front, and jump arcs
 // rise over the obstacle. No three floating hurdles at unrelated angles.
 // A runner in the air over a hedge is painted above it (#30 D5), never inside it.
 const paintOrder=[...layout.filter(i=>shown.has(i.row.id)).map(item=>({kind:'runner',ground:item.jump?.airborne?1000+item.ground:item.ground,item})),...hedgeParts];
 paintOrder.sort((a,b)=>a.ground-b.ground||(a.kind==='hedge'?-1:b.kind==='hedge'?1:a.item.row.id.localeCompare(b.item.row.id)));
 for(const part of paintOrder){
  if(part.kind==='hedge'){drawHedgeSlice(c,part,theme);continue;}
  const item=part.item;
  const {row,x,ground,height,coat,motion,running}=item,hero=row.id==='player',rival=row.id===live.spotlightId,jump=item.jump.lift;
  if(!item.frameVisible)continue;
  c.save();c.globalAlpha=item.opacity;
  shadow(c,x,Math.min(179,Math.max(100,ground)),opening?12:hero?28:22);
  const performance=item.jump,acting=performance.fall>.03;
  c.save();
  if(acting){c.translate(x+height*.55,ground-jump);c.rotate(performance.angle);c.translate(-x-height*.55,-(ground-jump));}
  drawContestant(c,item.actor,x,ground-jump,height,running&&motion.active,pulse+(row.index||0),{motion:{...motion,obstacleExpression:performance.expression,stumble:performance.fall},expression:null,opaqueContact:true});c.restore();
  if(acting){for(let k=0;k<3;k++){const a=live.time*5+k*Math.PI*2/3,sx=x+Math.cos(a)*height*.42,sy=ground-height-5+Math.sin(a)*3;rect(c,sx-2,sy,5,1,'#fff0b5');rect(c,sx,sy-2,1,5,'#ffd382');}if(hero||rival){c.fillStyle='#795367';c.font='bold 8px HamMaru,sans-serif';c.textAlign='center';c.fillText('ぽてっ！',x,ground-height-12);}}
  if(running&&(hero||rival||height>=25)&&!jump){if(motion.sweat)rect(c,x+height*.38,ground-height*.75,2,3,'#b3dce3');}
  if(running&&motion.state==='last-spurt'){rect(c,x-height*.75,ground-6,6,2,'#fff0d2');rect(c,x-height*.9,ground-12,4,2,'#ffd382');}
  if(running&&(p.spurt||p.recent?.direction==='passed'&&hero)){rect(c,x-20,ground-2,4,2,'#fff0d2');rect(c,x-29,ground-4,5,2,'#eacfa6');}
  if(p.recent?.otherId===row.id){c.fillStyle='#795367';c.font='bold 9px HamMaru,sans-serif';c.textAlign='center';c.fillText(p.recent.direction==='passed'?'!':'↗',x+height*.6,ground-height);}
  if(hero&&p.spurt){rect(c,x+height*.4,ground-height*.8,2,4,'#b3dce3');rect(c,x-4,ground-height*.45,7,2,'#795367');}
  if(rival&&Math.abs(x-layout.find(i=>i.row.id==='player').x)>36)raceMarker(c,x,item.bounds.top-3,'rival','RIVAL');
  c.restore();
 }

 const heroItem=layout.find(i=>i.row.id==='player'),heroGround=heroItem.ground,heroHeight=heroItem.height,hx=heroItem.x,markerY=heroItem.bounds.top-3;
 raceMarker(c,hx,markerY,'player','YOU');
 if(p.obstacle?.phase==='landing'){rect(c,center-22,heroGround-2,5,2,'#eacfa6');rect(c,center-30,heroGround-3,3,2,'#fff0d2');}
 // Captions sit in the sky band (y 32..52), clear of the runners on the start grid (#30 C1).
 // options.view: the part of the 384-wide frame on screen (phones cut the sides to show the race 1.5× larger, #30
 // owner 2026-10-31); captions, the HUD and the tracker are laid out inside it. Default: the whole frame, as before.
 const view=options.view||{x0:0,x1:384},vx=view.x0,vw=view.x1-view.x0,wide=vw>=300;
 if(p.intro){rect(c,vx+4,32,124,20,'#403046');c.fillStyle='#fff0d2';c.font='bold 9px HamMaru,sans-serif';c.textAlign='left';c.fillText(p.introPhase==='stadium'?live.entrants+'匹、一斉スタート！':'スタートの合図を待つ',vx+10,45);}
 // Camera always discloses when a broadcast cut leaves the hero.
 if(focus.id!=='player'){rect(c,vx+4,32,159,20,'#403046');c.textAlign='left';c.fillStyle='#ffd382';c.font='bold 10px HamMaru,sans-serif';c.fillText('先頭争いを中継中',vx+11,46);}
 // Fixed broadcast HUD and whole-field tracker are painted last, outside the course.
 rect(c,0,0,384,25,'#403046');c.textAlign='left';c.font='bold 10px HamMaru,sans-serif';c.fillStyle='#fff0d2';c.fillText(p.intro?'スタート / '+live.entrants+'匹':live.rank+'位 / '+live.entrants+'匹',vx+8,16);c.textAlign='right';c.fillText(liveStageLabel(live.course,live.stageIndex,{spurt:p.spurt,finished:live.player.finished}).short||'RACE',view.x1-9,16);
 const heroX=vx+(wide?88:70);drawContestant(c,{...player,variant},heroX,21,17,false,pulse);
 if(p.recent){c.fillStyle='#ffd382';c.textAlign='center';c.fillText(p.recent.direction==='passed'?'▲':'▼',heroX+(wide?29:20),16);}
 if(!p.intro&&p.close){const opponent=live.standings.find(r=>r.id===p.nearbyIds?.[0]);if(opponent){const ox=vx+(wide?180:122);drawContestant(c,opponent,ox,21,17,false,pulse);c.font='bold 7px HamMaru,sans-serif';c.fillStyle='#fff0d2';c.textAlign='left';c.fillText(String(opponent.species==='hamster'?opponent.name:opponent.species).slice(0,wide?13:6),ox+14,16);}}
 drawRaceTracker(c,live,view);
 c.restore();
}
// Only real competitors currently inside the player's checkpoint can appear.
// Distance is measured from the deterministic precomputed race replay. A solo
// leader has exactly one entry; never fill empty slots with invented opponents.
export function checkpointEntrants(live,limit=8){
 if(!live?.player||live.player.finished)return [];
 const stage=live.course?.stages?.[live.player.stageIndex];
 if(!stage||stage.action==='speed')return [];
 const window=Math.min(.030,Math.max(.008,stage.length*.28));
 const nearby=live.standings.filter(row=>row.id!=='player'&&!row.finished&&row.stageIndex===live.player.stageIndex&&Math.abs(row.distance-live.player.distance)<=window);
 nearby.sort((a,b)=>Math.abs(a.distance-live.player.distance)-Math.abs(b.distance-live.player.distance)||a.rank-b.rank);
 return [live.player,...nearby.slice(0,Math.max(0,limit-1))];
}
export function drawZoneContest(cv,live,variant=0){
 if(!cv||!live)return;
 const c=cv.getContext('2d');if(!c)return;
 c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,cv.width,cv.height);c.scale(cv.width/384,cv.height/168);
 const stage=live.course?.stages?.[live.stageIndex],type=stage?.action;
 if(!['appetite','intelligence','technique'].includes(type)){c.restore();return;}
 const cast=checkpointEntrants(live),pulse=Math.floor(live.time*9);
 const paper=type==='appetite'?'#f6e4ba':type==='intelligence'?'#e9f2d2':'#d6bd93';
 const accent={appetite:'#eaa35c',intelligence:'#9fc5b1',technique:'#ab6b78'}[type];
 // The very same pixels and palette as the main live race: no pasted
 // storybook background and no baked-in hamsters from generated artwork.
 rect(c,0,0,384,168,'#403046');rect(c,3,3,378,162,paper);
 rect(c,3,3,378,25,'#795367');
 for(let x=8;x<380;x+=19){rect(c,x,27,9,3,'#ab6b78');rect(c,x+5,29,2,2,'#ffd382');}
 const labels={appetite:'SUNFLOWER EATING',intelligence:'STUDY CHALLENGE',technique:'MAZE CHALLENGE'};
 c.font='bold 10px HamMaru,sans-serif';c.textAlign='left';c.fillStyle='#fff0d2';c.fillText(labels[type],10,19);
 c.font='bold 9px HamMaru,sans-serif';c.textAlign='right';c.fillStyle='#ffd382';c.fillText(cast.length===1?'SOLO':cast.length+' RACERS',372,19);
 if(!cast.length){c.restore();return;}
 // A single protagonist takes centre stage, without imaginary rivals.
 const twoRows=cast.length>4,cols=twoRows?4:cast.length;
 const slotWidth=twoRows?91:Math.floor(364/cols),startX=Math.floor((384-cols*slotWidth)/2);
 cast.forEach((row,i)=>{
  const col=i%cols,rowNo=Math.floor(i/cols),center=startX+col*slotWidth+slotWidth/2;
  const ground=twoRows?(rowNo===0?88:147):120;
  const hero=row.id==='player',rival=row.id===live.spotlightId;
  const h=cast.length===1?49:twoRows?24:32;
  const boxW=cast.length===1?166:Math.min(slotWidth-4,86);
  const x0=Math.round(center-boxW/2),top=twoRows?(rowNo===0?34:96):34;
  rect(c,x0,top,boxW,twoRows?56:124,hero?'#ffd382':'#fff9ed');
  rect(c,x0,top,boxW,2,hero?'#ab6b78':'#795367');
  const pr=Math.max(0,Math.min(1,row.stageIndex>live.stageIndex?1:row.stageProgress));
  // Each competitor uses the exact same species/individual sprite as the
  // main racing screen, not a separately generated hamster placeholder.
  shadow(c,center,ground,Math.round(h*.8));
  if(row.species==='hamster'||row.species==='ハムスター'){
    if(!hero&&!drawHamsterCharacter(c,row.id,center,ground,h,'normal',false,pulse+row.index))sprite(c,row.variant??row.index%3,center,ground,h,false,pulse+row.index);
    else if(hero)sprite(c,variant,center,ground,h,false,pulse+row.index);
   }
  else drawContestant(c,row,center,ground,h,false,pulse+row.index);
  if(type==='appetite'){
   const seeds=Math.max(0,Math.ceil((1-pr)*4));
   for(let k=0;k<seeds;k++){rect(c,center+Math.min(h*.48,17)+(k%2)*4,ground-7-Math.floor(k/2)*4,3,5,'#795367');rect(c,center+Math.min(h*.48,17)+(k%2)*4+1,ground-6-Math.floor(k/2)*4,1,3,'#ffd382');}
   rect(c,center+9,ground-2,19,3,'#b77652');
  }else if(type==='intelligence'){
   rect(c,center+11,ground-12,16,11,'#fff0d2');rect(c,center+14,ground-9,10,1,'#795367');
   rect(c,center+14,ground-6,Math.max(1,Math.round(pr*10)),1,'#689c99');
   if(pr>.85)rect(c,center+20,ground-17,3,3,'#ffd382');
  }else{
   // The small route and marker move with this actual runner's saved
   // checkpoint progress, without generating a different outcome.
   rect(c,center+8,ground-18,23,3,'#73916b');
   rect(c,center+8,ground-18,3,14,'#73916b');
   rect(c,center+28,ground-18,3,14,'#73916b');
   rect(c,center+8+Math.round(pr*16),ground-10,4,4,'#e79c9a');
  }
  c.font='bold 7px HamMaru,sans-serif';c.textAlign='center';c.fillStyle='#403046';
  const tag=row.species==='hamster'||row.species==='ハムスター'?row.name:row.species||row.name;
  c.fillText(String(tag||'').slice(0,9),center,ground+6);
  const barWidth=Math.min(58,boxW-12),barX=Math.round(center-barWidth/2),barY=ground+11;
  rect(c,barX,barY,barWidth,4,'#dec5b0');
  if(pr>0)rect(c,barX,barY,barWidth*pr,4,hero?'#ab6b78':'#689c99');
  if(hero)raceMarker(c,center,ground-h,'player','YOU');
  else if(rival)raceMarker(c,center,ground-h,'rival','RIVAL');
 });
 c.restore();
}


export function drawAwardPortrait(canvas,row,variant=0,emotion='neutral'){
 if(!canvas||!row)return;const c=canvas.getContext('2d');c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,canvas.width,canvas.height);c.scale(canvas.width/96,canvas.height/84);const hamster=['hamster','ハムスター'].includes(row.species);if(!(row.id==='player'?drawVisualHero(c,variant,48,70,52,false,emotion):hamster?drawHamsterCharacter(c,row.id,48,70,52,emotion):drawVisualNPC(c,row.species||row.id,48,70,52,emotion)))drawContestant(c,{...row,variant:row.id==='player'?variant:row.variant},48,70,52,false,0);c.restore();
}
export function drawAwardsStage(canvas,result){
 if(!canvas)return;const c=canvas.getContext('2d');c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,canvas.width,canvas.height);c.scale(canvas.width/384,canvas.height/108);const theme=raceTheme(result);if(!drawVisualVenue(c,theme,0))drawRaceScenery(c,theme,0);drawShrineFixtures(c,theme,0,100,192);c.restore();
}
