import {drawConversationBackground,loadConversationBackgrounds} from './conversation-backgrounds.js';
import {loadFancyBackgrounds,drawFancyScene} from './fancy-backgrounds.js';
// Dedicated location paintings plus the visible, saved dialogue cast. Display only.
import {drawIntroScene,loadIntroArt} from './intro-art.js';
import {drawAnimatedRunner} from './race-animation.js';
import {drawStoryActor} from './story-art.js';import {FIRST_CAST} from './story-book.js';import {drawVisualHero,drawVisualNPC,drawVisualVenue} from './visual-art.js';import {THEMES} from './race-scenery.js';
let image,festival,fancySeedshop,fancyWorld,pending;
// 5 columns x 4 rows of character-free 384x216 illustrated locations.
// These are presentation assets; no story or race data is changed.
export const FANCY_WORLD_SCENES=[
 'town','town-dusk','town-summer','town-snow',
 'training','training-morning','training-dusk','training-rain','training-night',
 'bedroom','bedroom-morning','bench-dusk','shrine','shrine-night','workshop',
 'race-day','race-sunset','world','slope','note'
];
export const FANCY_WORLD_SCENE_INDEX={...Object.fromEntries(FANCY_WORLD_SCENES.map((scene,i)=>[scene,i])),morning:5};
export function loadStorySceneArt(){if(typeof Image==='undefined')return Promise.resolve(false);loadConversationBackgrounds();const read=(path,accept)=>new Promise(resolve=>{const i=new Image();i.onload=()=>{accept(i);resolve(true);};i.onerror=()=>resolve(false);i.src=new URL(path,import.meta.url).href;});return pending||=Promise.all([loadIntroArt(),loadFancyBackgrounds(),read('./assets/story-v7/story-locations-v7.png',i=>image=i),read('./assets/shrine-festival-new-20261020.png',i=>festival=i),read('./assets/polish-v25/seedshop-v25.png',i=>fancySeedshop=i),read('./assets/fancy-world-handoff-v2-20261020.svg',i=>fancyWorld=i)]).then(a=>a.every(Boolean));}
export const STORY_PANELS={bedroom:0,'bedroom-morning':0,'bench-dusk':1,'town-dusk':1,'training-dusk':1,'training-rain':2,'town-snow':3,shrine:4,'shrine-night':4,workshop:5};
// Places of the four stories fall back to the place they were drawn from while the owner's pictures load.
const SCENE_LOOKS={'past-slope':'slope','past-plaza':'shrine','slope-night':'slope','slope-snow':'town-snow','shrine-dawn':'shrine'};
export function locationPlan(scene){scene=SCENE_LOOKS[scene]||scene;if(Object.hasOwn(STORY_PANELS,scene))return {kind:'story',panel:STORY_PANELS[scene]};if(['world','race-day','race-sunset'].includes(scene))return {kind:'venue',theme:scene==='world'?'stadium':scene==='race-day'?'day':'sunset'};return {kind:'intro',scene:({seedshop:'shop','seedshop-interior':'shop','seedshop-rain':'shop',town:'slope','town-summer':'morning',training:'morning','training-morning':'morning','training-night':'slope'})[scene]||scene};}
// Two actors carry a conversation. Keep their left/right positions stable
// across dialogue pages and choose the player as listener when possible.
export function focusedStoryActors(characters=[],speakerId=null){
 const visible=characters.filter(a=>!['tv-rat','announcer','crowd'].includes(a.id));
 const speaker=visible.find(a=>a.id===speakerId)||visible.find(a=>a.speaking)||
  visible.find(a=>a.id==='player')||visible[0];
 if(!speaker)return [];
 const listener=visible.find(a=>a.id==='player'&&a.id!==speaker.id)||
  visible.find(a=>a.id==='rival'&&a.id!==speaker.id)||
  visible.find(a=>a.id!==speaker.id);
 return [speaker,listener].filter(Boolean).sort((a,b)=>visible.indexOf(a)-visible.indexOf(b));
}
export function drawStoryScene(canvas,place,characters=[],variant=0,clock=0,speakerId=null){if(!canvas)return false;const c=canvas.getContext('2d');if(!c)return false;const plan=locationPlan(place),cw=canvas.width,ch=canvas.height;c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,cw,ch);
 // New dedicated GBA-style, character-free shop art takes priority over the
 // rejected dark photorealistic intro shop background. The actors are drawn
 // separately below so no hamsters are baked into the room.
 // Owner-supplied backgrounds (2026-10-23) come first; older art remains the fallback.
 if(drawConversationBackground(c,place,cw,ch)){}
 else if(['seedshop','seedshop-interior','seedshop-rain','shop','tv'].includes(place)&&fancySeedshop){c.drawImage(fancySeedshop,0,0,cw,ch);}
 else if(drawFancyScene(c,SCENE_LOOKS[place]||place,cw,ch)){}
 else if(Object.hasOwn(FANCY_WORLD_SCENE_INDEX,SCENE_LOOKS[place]||place)&&fancyWorld){
  const i=FANCY_WORLD_SCENE_INDEX[SCENE_LOOKS[place]||place];
  c.drawImage(fancyWorld,(i%5)*384,Math.floor(i/5)*216,384,216,0,0,cw,ch);
 }
 else if(plan.kind==='intro'){if(!drawIntroScene(canvas,plan.scene,variant,'normal',{actors:false})){c.restore();return false;}}
 else{c.scale(cw/384,ch/216);if(plan.kind==='story'){if(!image){c.restore();return false;}const w=image.naturalWidth||image.width||2048,h=image.naturalHeight||image.height||768,col=plan.panel%3,row=Math.floor(plan.panel/3),sx=Math.round(col*w/3),right=Math.round((col+1)*w/3),sy=Math.round(row*h/2),bottom=Math.round((row+1)*h/2);c.drawImage(image,sx,sy,right-sx,bottom-sy,0,0,384,216);}else drawVisualVenue(c,THEMES[plan.theme],0,{fullHeight:true});c.restore();c.save();}
 c.setTransform(cw/384,0,0,ch/216,0,0);
 if(place==='tv'&&fancySeedshop){
  // A little television belongs to the seed shop, not an unrelated dark room.
  c.fillStyle='#bb8d6c';c.fillRect(252,42,104,62);
  c.fillStyle='#f9d7a4';c.fillRect(256,45,96,53);
  c.fillStyle='#805d71';c.fillRect(263,51,80,41);
  c.fillStyle='#b3e4dc';c.fillRect(267,55,72,33);
  c.save();c.beginPath();c.rect(267,55,72,33);c.clip();
  drawAnimatedRunner(c,{species:'ネズミ'},304,85,22,{active:true,phase:0,frame:0,bob:0});
  c.restore();
  c.fillStyle='#fff5d9';c.fillRect(347,62,3,3);c.fillRect(347,72,3,3);
 }
 if(place==='shrine-night'&&festival&&!fancyWorld)c.drawImage(festival,0,0,festival.naturalWidth||festival.width||160,festival.naturalHeight||festival.height||90,0,0,384,216);
 const actors=plan.kind==='intro'&&plan.scene==='note'&&!fancyWorld?[]:focusedStoryActors(characters,speakerId);
 actors.forEach((a,i)=>{
  // About three quarters of the old size so the shops, benches and rooms behind stay
  // visible (owner chose B), standing a little closer together (owner chose A, #30 C1 2026-10-25).
  const pair=actors.length===2,x=pair?(i===0?110:274):192;
  const base=206,height=pair?64:70;
  const breath=0; // Keep opaque paws on the ground during dialogue.
  const expression=a.expression||'normal';
  c.save();
  // The new idle art is explicitly 3/4 right-facing. Mirror the partner
  // toward the speaker without changing its perspective or body proportions.
  if(pair&&i===1){c.translate(2*x,0);c.scale(-1,1);}
  c.globalAlpha=.18;c.fillStyle='#795367';
  c.fillRect(Math.round(x-height*.27),base,Math.round(height*.54),3);
  c.globalAlpha=1;
  if(a.id==='player')drawVisualHero(c,variant,x,base-breath,height,false,expression);
  // The first Cat and the first Rat (幕間) look like today's Cat and Rat.
  else{const look=FIRST_CAST[a.id]?.looks||a.id;if(!drawStoryActor(c,look,x,base-breath,height,expression))drawVisualNPC(c,look,x,base-breath,height,expression);}
  c.restore();
 });
 if(place==='seedshop-rain'){c.strokeStyle='#bbd9e9';c.lineWidth=1;for(let i=0;i<7;i++){const x=8+i*5,y=20+(i*23+Math.floor(clock*25))%130;c.beginPath();c.moveTo(x,y);c.lineTo(x-3,y+9);c.stroke();}}
 c.restore();return true;
}
