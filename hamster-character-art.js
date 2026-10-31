import {drawUnifiedActor,conversationPose} from './unified-art.js';
import {drawArticulatedSprite} from './race-animation.js';
// Original hand-pixelled hamster silhouettes for Potechi, Chobi and domestic entrants.
// DRAW ONLY. Every feature depends on an existing stable entrant ID; no extra RNG,
// balance, save-field or competition-state reads/writes are permitted.
// Approved character concept crops, pixel-quantized and transparent.
let rivalArt=null,loadingRivalArt;
export function loadHamsterCharacters(){
 if(typeof Image==='undefined')return Promise.resolve(false);
 return loadingRivalArt||=new Promise(resolve=>{
  const i=new Image();i.onload=()=>{rivalArt=i;resolve(true);};
  i.onerror=()=>resolve(false);
  i.src=new URL('./assets/potechi-chobi-cropfix-20261020.png',import.meta.url).href;
 });
}
export const HAMSTER_PALETTES=[
 {name:'あんず色',coat:'#df9760',mid:'#ffd5a1',belly:'#fff2dc',ear:'#df8c9e',accent:'#985a54',stripe:'#ad623f',eyes:'#342a3a'},
 {name:'こむぎ色',coat:'#d3bd89',mid:'#f6dfaa',belly:'#fff4df',ear:'#d788a0',accent:'#8c637d',stripe:'#9f825c',eyes:'#403046'},
 {name:'くり色',coat:'#ad836c',mid:'#e9bea3',belly:'#fef0d5',ear:'#ca8298',accent:'#75505b',stripe:'#704b45',eyes:'#352b39'},
 {name:'しろごま色',coat:'#e4dfd4',mid:'#fff2e2',belly:'#fffcf4',ear:'#d490a4',accent:'#8b7891',stripe:'#ada6a1',eyes:'#3a3349'},
 {name:'さくら色',coat:'#e8b5a8',mid:'#f8d6c4',belly:'#fff1df',ear:'#bf7893',accent:'#aa667a',stripe:'#c48f88',eyes:'#403046'},
 {name:'くるみ色',coat:'#bf9972',mid:'#e4bd96',belly:'#fff0d7',ear:'#c17b91',accent:'#657a78',stripe:'#846449',eyes:'#352c39'},
 {name:'こはく色',coat:'#daa56b',mid:'#eec89a',belly:'#fff6df',ear:'#d4889c',accent:'#9a704d',stripe:'#a9754d',eyes:'#403046'},
 {name:'あおみ色',coat:'#a6b4b7',mid:'#d1dadd',belly:'#fff5e7',ear:'#ca8ca5',accent:'#6d8994',stripe:'#758d91',eyes:'#403046'}
];
export const POTECHI_DESIGN={
 id:'rival',name:'ぽてち',concept:'自然な金色の毛柄と丸い輪郭、小さなつやのある目、自然な頬袋。前髪や過剰な頬の膨らみは使わない。',palette:'#df9760',motif:'しましまの種'
};
export const CHOBI_DESIGN={
 id:'child',name:'ちょび',concept:'小柄で灰クリーム色、左耳の黄色い星留め、緑の小さなスカーフ。頬と耳の間を短くして幼さを表現。',palette:'#d1c1b1',motif:'小さな星'
};
const ink='#403046',light='#fff8ec';
const pixel=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
function blob(c,x,y,rx,ry,color){
 // Pixels are aligned on an intentional 2px grid. No antialiasing.
 for(let py=-ry;py<=ry;py+=2){
  const width=Math.floor(rx*Math.sqrt(Math.max(0,1-(py/ry)**2))/2)*2;
  pixel(c,x-width,y+py,width*2+2,2,color);
 }
}
// Face geometry is keyed by the entrant's stable ID/variant, not just coat,
// mood or accessories. A neutral portrait must already look individual.
export function facialTraitsFor(variant){
 const n=Math.max(0,Math.floor(Number(variant)||0));
 if(n===0)return {eyeX:18,eyeGap:24,eyeY:29,eyeW:4,eyeH:5,earShift:-1,cheekSize:5,muzzleY:37,mouth:'smile'};
 if(n===1)return {eyeX:20,eyeGap:21,eyeY:30,eyeW:3,eyeH:4,earShift:2,cheekSize:4,muzzleY:38,mouth:'tiny'};
 const style=n-2;
 return {eyeX:16+(style*5)%7,eyeGap:20+(style*11)%8,eyeY:27+(style*3)%6,
  eyeW:3+(style*5)%3,eyeH:3+(style*7)%3,earShift:(style*13)%5-2,
  cheekSize:3+(style*17)%4,muzzleY:36+(style*19)%4,
  mouth:['smile','tiny','w','open','side'][(style*23+Math.floor(style/5))%5]};
}
function cheeks(c,color,expression,variant){
 const t=facialTraitsFor(variant),size=t.cheekSize;
 const y=expression==='worried'||expression==='sad'?37:35;
 pixel(c,10,y,size,3,color);pixel(c,54-size,y,size,3,color);
}
function face(c,expression,coat,variant){
 const t=facialTraitsFor(variant),joyful=['happy','joy','delighted'].includes(expression);
 const bold=['determined','serious'].includes(expression),worried=['worried','sad','surprised'].includes(expression);
 const left=t.eyeX,right=Math.min(50,left+t.eyeGap),ey=t.eyeY;
 for(const x of [left,right]){
  if(joyful){pixel(c,x,ey+2,t.eyeW,2,ink);pixel(c,x+1,ey+4,Math.max(1,t.eyeW-2),1,ink);}
  else{pixel(c,x,ey,t.eyeW,t.eyeH,ink);pixel(c,x+1,ey+1,1,1,light);}
  if(bold)pixel(c,x-1,ey-4,t.eyeW+2,2,ink);
  else if(worried)pixel(c,x-1,ey-4,3,2,ink);
 }
 const noseY=t.muzzleY;pixel(c,30,noseY,4,3,'#df90a0');pixel(c,31,noseY+3,2,2,ink);
 if(joyful||t.mouth==='open'){pixel(c,28,noseY+6,8,3,ink);pixel(c,30,noseY+7,4,2,'#e79c9a');}
 else if(worried){pixel(c,29,noseY+7,6,2,ink);}
 else if(t.mouth==='tiny'){pixel(c,29,noseY+6,2,2,ink);pixel(c,34,noseY+6,2,2,ink);}
 else if(t.mouth==='side'){pixel(c,30,noseY+6,6,2,ink);}
 else{pixel(c,27,noseY+6,4,2,ink);pixel(c,34,noseY+6,4,2,ink);}
 // Fine whiskers: small enough not to resemble a human mouth or giant cheeks.
 pixel(c,4,40,7,1,ink);pixel(c,6,44,5,1,ink);
 pixel(c,53,40,7,1,ink);pixel(c,53,44,5,1,ink);
}
function hamster(c,p,variant,expression,running,pose){
 const move=running?(Math.floor(pose)%2===0?2:0):0;
 // Feet and tail are visible below the round body, so it reads as four-footed.
 pixel(c,2,43,11,8,ink);pixel(c,4,44,8,5,p.mid);
 pixel(c,12+move,53,11,5,ink);pixel(c,14+move,53,7,3,p.ear);
 pixel(c,40-move,53,11,5,ink);pixel(c,42-move,53,7,3,p.ear);
 if(running){pixel(c,7,51,10,4,p.ear);pixel(c,45,50,11,4,p.ear);}
 // Broad pear-shaped hamster; tummy rounds toward the bottom.
 blob(c,31,35,24,20,ink);blob(c,31,35,22,18,p.coat);
 blob(c,31,42,17,13,p.belly);
 blob(c,12,32,6,7,p.mid);blob(c,49,32,6,7,p.mid);
 // Clearly drawn asymmetric hamster ears.
 const ears=facialTraitsFor(variant).earShift;
 blob(c,17+ears,13,10,11,ink);blob(c,46-ears,12,10,11,ink);
 blob(c,17+ears,13,8,9,p.coat);blob(c,46-ears,12,8,9,p.coat);
 blob(c,17+ears,14,5,6,p.ear);blob(c,46-ears,13,5,6,p.ear);
 if(variant===0){ // Potechi: warm golden fur, natural forehead stripe, one cheek patch.
  pixel(c,27,17,11,5,p.stripe);pixel(c,30,21,5,3,p.mid);
  pixel(c,10,25,5,3,p.stripe);pixel(c,46,23,5,3,p.stripe);
  pixel(c,11,36,4,3,p.accent);
 }else if(variant===1){ // tiny Chobi: star on ear + green neckerchief.
  pixel(c,13,8,7,2,'#ffd382');pixel(c,16,5,2,9,'#ffd382');
  pixel(c,11,11,11,2,'#f5e49d');
  pixel(c,19,44,25,4,'#6f9b88');
  pixel(c,38,48,6,6,'#6f9b88');
  pixel(c,41,50,4,4,'#497878');
 }else{
  // Each domestic entrant has a stable coat/stripe/ear/scarf combination.
  if(variant%2===0){pixel(c,22,17,6,8,p.stripe);pixel(c,35,17,7,9,p.stripe);}
  else{pixel(c,18,20,7,5,p.stripe);pixel(c,39,20,6,5,p.stripe);}
  if(variant%3===0){pixel(c,17,45,27,5,p.accent);pixel(c,38,49,5,6,p.accent);}
  if(variant%3===1){pixel(c,28,8,7,4,p.accent);}
  if(variant%3===2){pixel(c,9,28,7,3,p.mid);}
  // Distinctive head/ear markings per individual, rather than treating all 49
  // entrants as only recolors of three playable hero sprites.
  if(variant%4===0){pixel(c,12,17,6,4,p.accent);pixel(c,49,16,5,3,p.accent);}
  if(variant%4===1){pixel(c,25,13,12,4,p.stripe);pixel(c,27,10,8,3,p.mid);}
  if(variant%4===2){pixel(c,20,19,4,6,p.accent);pixel(c,37,19,5,6,p.accent);}
  if(variant%4===3){pixel(c,27,11,9,5,p.mid);pixel(c,30,7,4,6,p.stripe);}
  if(variant%5===0){pixel(c,26,46,11,4,p.accent);} // little bib
  if(variant%5===1){pixel(c,51,24,5,3,p.stripe);} // right-ear tip
  if(variant%5===2){pixel(c,10,42,6,4,p.stripe);} // left cheek patch
  if(variant%5===3){pixel(c,45,45,5,3,p.accent);} // small cape end
  if(variant%5===4){pixel(c,14,13,4,4,p.mid);} // lighter inner ear
 }
 cheeks(c,p.ear,expression,variant);face(c,expression,p.belly,variant);
 // Visible paws and a tiny highlight on the upper coat.
 pixel(c,14,44+move,9,5,ink);pixel(c,16,44+move,5,3,p.mid);
 pixel(c,40,44-move,9,5,ink);pixel(c,41,44-move,5,3,p.mid);
 pixel(c,18,19,5,2,light);
}
export function hamsterCharacterFor(id){
 if(id==='rival'||id==='domestic-0')return {kind:'rival',palette:HAMSTER_PALETTES[0],variant:0};
 if(id==='child'||id==='friend')return {kind:'child',palette:{...HAMSTER_PALETTES[3],coat:'#d1c1b1',mid:'#eadbcd',stripe:'#aca39c',accent:'#6f9b88'},variant:1};
 const match=/^domestic-(\d+)$/.exec(String(id||''));
 if(!match)return null;
 const index=Number(match[1]);const variant=index+2;
 return {kind:'mob',palette:HAMSTER_PALETTES[index%HAMSTER_PALETTES.length],variant};
}
export function drawHamsterCharacter(c,id,x,ground,height=42,expression='normal',running=false,pose=0,motion=null){
 const unified=drawUnifiedActor(c,{id},x,ground,height,running?'run-'+(Math.floor(pose)%4):conversationPose(expression),motion);if(unified)return true;
 const design=hamsterCharacterFor(id);if(!design||!c||!(height>0))return false;
 if(rivalArt&&(design.kind==='rival'||design.kind==='child')){
  const w=Math.round(height),h=Math.round(height);
  c.save();c.imageSmoothingEnabled=false;
  const mood=['happy','joy','delighted'].includes(expression)?2:
   ['determined','serious'].includes(expression)?3:
   ['sad','worried','surprised'].includes(expression)?4:0;
  // All five cells now use complete silhouettes with safe transparent margins.
  const frame=running?1:mood;
  if(running&&motion?.active&&drawArticulatedSprite(c,rivalArt,[64,design.variant*64,128,design.variant*64+64],x,ground,height,motion))return {animated:true,articulated:true};
  c.drawImage(rivalArt,frame*64,design.variant*64,64,64,Math.round(x-w/2),Math.round(ground-h),w,h);
  c.restore();return true;
 }
 const logical=64,size=Math.round(height),width=Math.round(height);
 c.save();c.imageSmoothingEnabled=false;
 c.translate(Math.round(x-width/2),Math.round(ground-size));
 c.scale(width/logical,size/logical);
 hamster(c,design.palette,design.variant,expression,running,pose);
 c.restore();
 return true;
}
