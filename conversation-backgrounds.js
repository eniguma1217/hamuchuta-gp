// Owner-supplied conversation backgrounds (2026-10-23/24, docs/references/owner-supplied-2026102[34]).
// Display only: no saves, RNG or story changes. Loaded in the background; until an
// image has arrived the older location art is drawn instead.
export const CONVERSATION_IMAGES=Object.freeze(['training-sunny','training-ranch','town-street','seedshop-front','hamster-house','dusk-lookout','shrine-approach','race-countryside','race-temple','training-dusk','training-rain','town-snow','town-slope-dusk','seedshop-rain','shrine-festival-night']);
// scene -> [image, mood]. A mood is a TEMPORARY tint for a time of day that has no
// dedicated picture yet (owner: art is being made; request in
// docs/art-direction/CONVERSATION_VARIANTS_REQUEST_20261023.md).
export const CONVERSATION_BACKGROUNDS=Object.freeze({
 training:['training-sunny'],'training-dusk':['training-dusk'],'training-night':['training-sunny','night'],'training-rain':['training-rain'],
 'training-morning':['training-ranch'],morning:['training-ranch'],
 town:['town-street'],'town-summer':['town-street'],'town-snow':['town-snow'],slope:['town-slope-dusk'],
 'town-dusk':['dusk-lookout'],'bench-dusk':['dusk-lookout'],
 seedshop:['seedshop-front'],'seedshop-interior':['seedshop-front'],shop:['seedshop-front'],'seedshop-rain':['seedshop-rain'],
 bedroom:['hamster-house'],'bedroom-morning':['hamster-house'],
 shrine:['shrine-approach'],'shrine-night':['shrine-festival-night'],
 'race-day':['race-countryside'],'race-sunset':['race-countryside','dusk'],world:['race-temple'],
 // The four stories (#30, owner 2026-11-01). The 幕間 are drawn in sepia by the page (dialogue stage CSS).
 'past-slope':['town-slope-dusk'],'past-plaza':['shrine-approach'],'slope-night':['town-slope-dusk','night'],'slope-snow':['town-snow','night'],'shrine-dawn':['shrine-approach','dawn']
});
const images={};let pending;
export function loadConversationBackgrounds(){
 if(typeof Image==='undefined')return Promise.resolve(false);
 return pending||=Promise.all(CONVERSATION_IMAGES.map(key=>new Promise(resolve=>{const i=new Image();i.onload=()=>{images[key]=i;resolve(true);};i.onerror=()=>resolve(false);i.src=new URL('./assets/owner-v32/bg/'+key+'.png',import.meta.url).href;}))).then(r=>r.every(Boolean));
}
export function conversationBackground(scene){const slot=CONVERSATION_BACKGROUNDS[scene];return slot&&images[slot[0]]?{image:images[slot[0]],key:slot[0],mood:slot[1]||null}:null;}
const MOODS=Object.freeze({dusk:['#f4a46e',.55],night:['#3c4c8c',.72],dawn:['#9fb4e0',.5]});
// Draws the background for a conversation scene; returns false when none applies.
export function drawConversationBackground(c,scene,w,h){
 const bg=conversationBackground(scene);if(!bg)return false;
 c.save();c.imageSmoothingEnabled=false;c.drawImage(bg.image,0,0,w,h);
 if(bg.mood){const [color,alpha]=MOODS[bg.mood];c.globalCompositeOperation='multiply';c.globalAlpha=alpha;c.fillStyle=color;c.fillRect(0,0,w,h);}
 c.restore();return true;
}
