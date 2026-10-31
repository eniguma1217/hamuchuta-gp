// Original production PNGs. No gameplay data, save access, or random sampling.
const images={};let pending;
// Existing portraits, seasons and props stay connected. Only the two venue
// paintings move to nature-course siblings; their original PNGs are retained.
export const FANCY_BACKGROUNDS=Object.freeze({
 race:'./assets/natural-v16/race-gardens-v16.png',
 banquet:'./assets/natural-v16/banquet-gardens-v16.png',
 daily:'./assets/fancy-v15/daily-places-v15.png',
 seasons:'./assets/fancy-v15/season-places-v15.png',
 shrine:'./assets/fancy-v15/shrine-places-v15.png',
 // The v15 hedge stays as the maze wall texture; races use the owner's lower hedge (2026-10-24).
 hedge:'./assets/fancy-v15/hedge-v15.png',
 raceHedge:'./assets/owner-v34/hedge-v34.png',
 gates:'./assets/fancy-v15/checkpoint-gardens-v15.png'
});
export const FANCY_SCENES=Object.freeze({
 town:['daily',0],'town-summer':['daily',0],training:['daily',1],bedroom:['daily',2],workshop:['daily',3],
 morning:['seasons',0],'training-morning':['seasons',0],'bedroom-morning':['daily',2],
 'training-dusk':['seasons',1],'training-rain':['seasons',2],'town-snow':['seasons',3],
 shrine:['shrine',0],'shrine-night':['shrine',1],'bench-dusk':['shrine',2],'town-dusk':['shrine',2],
 'training-night':['daily',1],note:['shrine',3],slope:['daily',0],
 'race-day':['race',0],'race-sunset':['race',1],world:['race',2]
});
export function loadFancyBackgrounds(){if(typeof Image==='undefined')return Promise.resolve(false);return pending||=Promise.all(Object.entries(FANCY_BACKGROUNDS).map(([key,file])=>new Promise(resolve=>{const i=new Image();i.onload=()=>{images[key]=i;resolve(true);};i.onerror=()=>resolve(false);i.src=new URL(file,import.meta.url).href;}))).then(r=>r.every(Boolean));}
export function fancyImage(key){return images[key]||null;}
// Exclude the one-source-pixel divider between painted atlas panels. Keeping
// that divider in a mirrored track made a dark vertical line travel over soil.
export function fancyPanel(key,index){const image=images[key];if(!image)return null;const w=image.naturalWidth||image.width||1672,h=image.naturalHeight||image.height||941,col=index%2,row=Math.floor(index/2),l=Math.round(col*w/2),t=Math.round(row*h/2),r=Math.round((col+1)*w/2),b=Math.round((row+1)*h/2);return {image,source:[l+1,t+1,r-l-2,b-t-2]};}
export function drawFancyPanel(c,key,index,x=0,y=0,w=384,h=216){const p=fancyPanel(key,index);if(!p)return false;c.save();c.imageSmoothingEnabled=false;c.drawImage(p.image,...p.source,x,y,w,h);c.restore();return true;}
export function drawFancyScene(c,scene,w=384,h=216){const slot=FANCY_SCENES[scene];if(!slot||!drawFancyPanel(c,...slot,0,0,w,h))return false;if(scene==='training-night'){c.save();c.globalAlpha=.22;c.fillStyle='#475987';c.fillRect(0,0,w,h);c.restore();}return true;}
export function drawFancyCover(c,key,index,x,y,w,h){const p=fancyPanel(key,index);if(!p)return false;const [sx,sy,sw,sh]=p.source,scale=Math.max(w/sw,h/sh),cw=w/scale,ch=h/scale;c.drawImage(p.image,sx+(sw-cw)/2,sy+(sh-ch)/2,cw,ch,x,y,w,h);return true;}
// Camera distance is the only clock: a pause/stall also pauses the scenery,
// while 2x playback advances it with the same saved positions as the runners.
// Keep trees, windmills and mountains in one intact painted layer. Cutting the
// artwork into horizontal bands would detach tree trunks from their crowns.
export function raceSceneryOffsets(cameraPixels=0){
 const position=Number.isFinite(cameraPixels)?cameraPixels:0;
 return {landscape:Math.floor(position*.45),ground:Math.floor(position)};
}
export function drawFancyRace(c,theme,cameraPixels=0){
 const index=Math.max(0,['day','sunset','stadium','shrine'].indexOf(theme.id)),p=fancyPanel('race',index);if(!p)return false;
 // Alternate full, unscaled panels in a continuous reflected strip. Adjacent
 // edges sample the same original pixels instead of exposing a wrap seam.
 const strip=(position,source,y,h)=>{const start=Math.floor(position/384);for(let tile=start;tile<=start+1;tile++){const x=tile*384-position;c.save();c.translate(x+(Math.abs(tile)%2?384:0),0);if(Math.abs(tile)%2)c.scale(-1,1);c.drawImage(p.image,...source,0,y,384,h);c.restore();}};
 const offsets=raceSceneryOffsets(cameraPixels);
 if(c.canvas?.dataset){c.canvas.dataset.sceneryCamera=String(Number.isFinite(cameraPixels)?cameraPixels:0);c.canvas.dataset.sceneryLandscape=String(offsets.landscape);c.canvas.dataset.sceneryGround=String(offsets.ground);}
 c.save();c.imageSmoothingEnabled=false;strip(offsets.landscape,p.source,0,216);
 // Only an existing uninterrupted strip of dirt scrolls at ground speed.
 // It is translated/repeated at its original scale; no stretched ground patch.
 const [sx,sy,sw,sh]=p.source,top=118,bottom=181;
 strip(offsets.ground,[sx,sy+Math.round(top*sh/216),sw,Math.round((bottom-top)*sh/216)],top,bottom-top);
 c.restore();return true;
}
