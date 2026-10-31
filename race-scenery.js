import {loadFancyBackgrounds,drawFancyRace,drawFancyPanel,fancyImage} from './fancy-backgrounds.js';
// Presentation only. Unknown/old competition identifiers safely use daylight.
export const THEMES={
 day:{id:'day',sky:'#bdebf2',horizon:'#fff3d9',mountain:'#a9d2ad',stand:'#86b78a',ground:'#f8e4bb',accent:'#ffe08d',label:'晴れの庭園'},
 sunset:{id:'sunset',sky:'#f6afba',horizon:'#ffe2af',mountain:'#bf9caa',stand:'#a88a96',ground:'#f8e4bd',accent:'#ffd58e',label:'夕焼けのひまわり街道'},
 // Keep the existing theme key for saved races and older callers. Its visual
 // meaning is now a lantern-lit woodland clearing, never an athletics track.
 stadium:{id:'stadium',sky:'#a69bca',horizon:'#e1d3e9',mountain:'#98b3a9',stand:'#9e8eaf',ground:'#f8e6bf',accent:'#ffe1a0',label:'灯りの森の選抜会場'},
 shrine:{id:'shrine',sky:'#837ab2',horizon:'#c7b6d4',mountain:'#89b1a1',stand:'#a589a8',ground:'#edf0d2',accent:'#ffdf9b',label:'星月夜の十二支神社'}
};
export function raceTheme(result){
 const id=result.competitionId;
 if(id==='zodiac'||!id&&result.kind==='zodiac')return THEMES.shrine;
 if(id==='representative'||id==='ordinary-3'||['selection-2','repechage-2'].includes(id))return THEMES.stadium;
 if(['ordinary-2','selection-1','repechage-1'].includes(id))return THEMES.sunset;
 return THEMES.day;
}
export function layerOffsets(cameraPixels){return [.15,.35,.70,1].map(f=>Math.round(cameraPixels*f));}
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const tile=(i,offset,width)=>((i-offset)%width+width)%width;
function sunflower(c,x,y,petal='#ffe08d'){
 // 8 chunky petals with a soft seed-colored centre, all pixel snapped.
 for(const [dx,dy] of [[-5,0],[5,0],[0,-5],[0,5],[-4,-4],[4,-4],[-4,4],[4,4]])
  rect(c,x+dx-2,y+dy-2,5,5,petal);
 rect(c,x-3,y-3,7,7,'#a77757');rect(c,x-1,y-1,3,3,'#d5a169');
 rect(c,x-1,y+8,2,5,'#74b48c');
}
function softCloud(c,x,y){
 rect(c,x,y+5,37,5,'#fff9e8');rect(c,x+5,y+1,14,9,'#fff9e8');
 rect(c,x+15,y-3,15,13,'#fff9e8');rect(c,x+29,y+4,12,5,'#fff9e8');
}

export function drawRaceScenery(c,theme,cameraPixels=0){
 const [far,mid,near]=layerOffsets(cameraPixels);
 rect(c,0,24,384,72,theme.sky);rect(c,0,58,384,38,theme.horizon);
 for(let i=0;i<6;i++){const x=tile(i*91,far,470)-65;rect(c,x,55,85,13,theme.mountain);rect(c,x+15,45,53,18,theme.mountain);rect(c,x+29,37,27,20,theme.mountain);}
 if(theme.id==='day'){for(let i=0;i<4;i++){const x=tile(i*117,far,460)-45;softCloud(c,x,30+i%2*7);}}
 if(theme.id==='sunset')rect(c,300-far%420,32,23,23,'#ffd382');
 if(['stadium','shrine'].includes(theme.id)){
  for(let i=0;i<20;i++)rect(c,tile(i*67+19,far,384),29+i*13%25,1+i%2,1+i%2,'#fff0d2');
  rect(c,315-far%440,31,14,14,'#fff0d2');rect(c,312-far%440,29,11,11,theme.sky);
 }
 for(let i=0;i<5;i++){const x=tile(i*113,mid,480)-60;rect(c,x,63,82,10,theme.stand);rect(c,x+8,58,66,5,theme.stand);}
 if(theme.id==='shrine'){
  const x=tile(190,mid,560)-60;rect(c,x,51,83,21,'#795367');rect(c,x-9,46,101,6,'#ab6b78');rect(c,x+4,42,74,5,'#795367');rect(c,x+19,54,9,18,'#ffd382');rect(c,x+53,54,9,18,'#ffd382');
 }
 if(theme.id==='stadium')for(let i=0;i<5;i++){const x=tile(i*113,near,510)-30;rect(c,x,52,2,40,'#bc9278');rect(c,x-4,55,10,9,'#ffdf9b');rect(c,x-3,57,8,5,'#fff0d2');}
 // A flower-lined garden fence or soft festival flags anchors every course
 // to the same welcoming world as the approved seed-shop art.
 for(let i=0;i<13;i++){
  const x=tile(i*36+12,mid,468)-36;
  rect(c,x,76,3,17,'#bc9278');
  rect(c,x-1,76,27,3,'#f7e6bc');
  if(i%2===0&&theme.id!=='stadium')sunflower(c,x+15,82,theme.id==='shrine'?'#f7c0b7':'#ffe08d');
  else if(i%2===1){
   rect(c,x+9,77,11,5,i%4===1?'#f7b8bf':'#c4dcb2');
   rect(c,x+12,79,5,2,'#fff2df');
  }
 }
 rect(c,0,92,384,3,'#fff0d2');rect(c,0,95,384,87,theme.ground);
 for(let i=0;i<10;i++){const x=tile(i*53,near,430)-20;rect(c,x,90,2,5,theme.stand);rect(c,x,91,37,1,theme.stand);}
}
export function drawShrineFixtures(c,theme,cameraDistance,range,center,project=null){
 if(theme.id!=='shrine'||fancyImage('race'))return; // The production painting already contains the illustrated shrine and gate.
 for(const distance of [0,.5,1]){const x=project?project(distance):center+(distance-cameraDistance)*range;if(x<-70||x>454)continue;
  // Boundary posts and lintel are world-fixed; the running corridor stays clear.
  rect(c,x-47,85,5,95,'#ab6b78');rect(c,x+47,85,5,95,'#ab6b78');rect(c,x-57,82,119,6,'#795367');rect(c,x-52,88,109,4,'#ab6b78');
  rect(c,x-66,156,12,4,'#795367');rect(c,x-63,160,6,17,'#b8b2c0');rect(c,x-66,148,12,8,'#ffd382');
 }
}


 // The already-installed pastel world atlas is reused for the playable race
 // course. Each tile is 384x216; none contains baked-in racers. This keeps
 // the race as cheerful as the user's approved seed-shop/world direction.
 let gardenAtlas=null,gardenPending;
 export function loadRaceGarden(){
  if(typeof Image==='undefined')return Promise.resolve(false);
  return gardenPending||=new Promise(resolve=>{
   const image=new Image();image.onload=()=>{gardenAtlas=image;resolve(true);};
   image.onerror=()=>resolve(false);
   image.src=new URL('./assets/fancy-world-handoff-v2-20261020.svg',import.meta.url).href;
  });
 }
 export function drawRaceGarden(c,theme,cameraPixels=0){
  if(drawFancyRace(c,theme,cameraPixels))return true;
  if(!gardenAtlas)return false;
  // Legacy theme keys also use the countryside/festival clearing fallback.
  // No lane markings, athletics track or grandstands are part of the course.
  const column=theme.id==='stadium'?0:theme.id==='shrine'?2:1;
  c.save();c.imageSmoothingEnabled=false;
  // The original atlas has only ~45px of painted dirt at the bottom,
  // but the 50-runner depth projection spans y=90..179. That placed feet
  // in the flowerbed/fence. Recompose a WIDE dirt course from the SAME
  // painted tile (not a flat CSS-colored rectangle or mismatched stock art).
  // The fence/sunflowers remain intact in the top scenic band.
  c.drawImage(gardenAtlas,column*384,3*216,384,96,0,0,384,96);
  c.drawImage(gardenAtlas,column*384,3*216+139,384,73,0,94,384,88);
  // Natural green verge and wood fence line cover the crop transition.
  rect(c,0,91,384,3,'#6f9f63');
  rect(c,0,94,384,2,'#bbd47b');
  for(let x=0;x<384;x+=29){
   rect(c,x+((x/29)%3)*2,94,13,2,'#8cba68');
   if(x%3===0)rect(c,x+4,93,3,2,'#fff0d2');
  }
  // Small parallax dust and flower highlights stay behind the competitors.
  const offset=((Math.floor(cameraPixels*.16)%63)+63)%63;
  for(let x=-63+offset;x<420;x+=63){
   rect(c,x,102,6,2,'#f6e7c6');
   rect(c,x+17,169,4,2,'#f0c88f');
  }
  c.restore();return true;
 }

// The banquet shares the exact painted outdoor world with the race.
// No procedural flat-blue sky/rectangular green hills next to rich race art.
export function drawBanquetGarden(c,theme={id:'day'}){
 const index=Math.max(0,['day','sunset','stadium','shrine'].indexOf(theme?.id));
 if(drawFancyPanel(c,'banquet',index,0,0,384,216))return true;
 if(drawFancyPanel(c,'gates',2,0,0,384,216))return true;
 if(!gardenAtlas)return false;
 c.save();c.imageSmoothingEnabled=false;
 // Race sunset's sunny sunflower garden; crop to the checkpoint's 384x156
 // viewport while retaining the fence, flags, flowers and grounded dirt.
 c.drawImage(gardenAtlas,384,3*216+9,384,156,0,0,384,156);
 c.restore();return true;
}
