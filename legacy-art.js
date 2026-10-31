import {SPRITE_FRAMES} from './nes-frames.js';

// A single 256 x 128 logical screen and one palette for scenery and characters.
// The larger visible canvas is only an integer-scaled presentation surface.
export const SCENE_SIZE={width:256,height:128};
export const NES_PALETTE=['#201810','#503000','#8c4c20','#b87830','#f8b800','#fca044','#fcf0b0','#fcfcfc','#bcbcbc','#7c7c7c','#404040','#f87858','#f8b8b8','#d82800','#0078f8','#3cbcfc','#a4e4fc','#005800','#008800','#58b800','#a8e070','#004848','#008888','#80d0b0'];
export const SCENE_TITLES={idle:'ひまわりタウン',speed:'かけっこ練習場',stamina:'回し車のおへや',appetite:'もぐもぐ練習場',intelligence:'おべんきょうの部屋',technique:'迷路チャレンジ',rest:'おやすみの部屋',joy:'きみと過ごした3年間'};
export const SCENE_LAYOUTS={
 idle:{tile:0,x:128,ground:113,height:28},
 speed:{tile:1,x:126,ground:108,height:28},
 stamina:{tile:2,x:130,ground:92,height:26,wheel:{x:130,y:54,radius:41}},
 appetite:{tile:3,x:128,ground:114,height:28},
 intelligence:{tile:4,x:128,ground:115,height:28},
 technique:{tile:5,x:128,ground:114,height:28},
 rest:{tile:6,x:128,ground:115,height:28},
 joy:{tile:7,x:128,ground:113,height:28}
};
const names=['mochi','dash','hakase'];
const files={world:'nes-world.png',mochi:'nes-mochi-sprites.png',dash:'nes-dash-sprites.png',hakase:'nes-hakase-sprites.png'};
const images={},backgrounds=new Map(),sprites=new Map(),colorCache=new Map();
const rgb=NES_PALETTE.map(s=>[parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)]);
const ready=()=>!!images.world&&names.every(n=>images[n]);
let loading;
function nearest(r,g,b){const key=r*65536+g*256+b;if(colorCache.has(key))return colorCache.get(key);let best=rgb[0],score=Infinity;for(const col of rgb){const v=(r-col[0])**2*.3+(g-col[1])**2*.59+(b-col[2])**2*.11;if(v<score){best=col;score=v;}}colorCache.set(key,best);return best;}
function texture(image,source,width,height){
 if(typeof document==='undefined')return null;
 const cv=document.createElement('canvas');cv.width=width;cv.height=height;const c=cv.getContext('2d');if(!c?.getImageData||!c?.putImageData)return null;
 c.imageSmoothingEnabled=false;c.clearRect(0,0,width,height);c.drawImage(image,...source,0,0,width,height);
 try{const pixels=c.getImageData(0,0,width,height),d=pixels.data;for(let i=0;i<d.length;i+=4){if(d[i+3]<128){d[i+3]=0;continue;}const col=nearest(d[i],d[i+1],d[i+2]);d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=255;}c.putImageData(pixels,0,0);}catch{/* Original same-origin pixels remain drawable if readback is unavailable. */}
 return cv;
}
function tileRect(index){const w=images.world.naturalWidth||images.world.width,h=images.world.naturalHeight||images.world.height;const cellW=w/2,cellH=h/4;const height=Math.floor(cellH-4),width=height*2;return [Math.floor(index%2*cellW+(cellW-width)/2),Math.floor(Math.floor(index/2)*cellH+2),width,height];}
function paintBackground(c,index){const box=tileRect(index);if(!backgrounds.has(index))backgrounds.set(index,texture(images.world,box,256,128));const cached=backgrounds.get(index);if(cached)c.drawImage(cached,0,0);else c.drawImage(images.world,...box,0,0,256,128);}
function getSprite(variant,frame,height){const box=SPRITE_FRAMES[variant][frame],scale=height/SPRITE_FRAMES[variant][0][3],width=Math.round(box[2]*scale),h=Math.round(box[3]*scale);const key=`${variant}:${frame}:${height}`;if(!sprites.has(key))sprites.set(key,texture(images[names[variant]],box,width,h));return {image:sprites.get(key),box,width,height:h};}
function paintSprite(c,variant,frame,x,ground,height=28){const item=getSprite(variant,frame,height);const left=Math.round(x-item.width/2),top=ground-item.height;if(item.image)c.drawImage(item.image,left,top);else c.drawImage(images[names[variant]],...item.box,left,top,item.width,item.height);return {x:left,y:top,width:item.width,height:item.height};}
export async function loadArt(){
 if(typeof Image==='undefined')return false;if(loading)return loading;
 loading=Promise.all(Object.entries(files).map(([key,path])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve(true);};im.onerror=()=>resolve(false);im.src=new URL('./assets/'+path,import.meta.url).href;}))).then(results=>{if(results.every(Boolean)){for(let i=0;i<8;i++)if(typeof document!=='undefined')backgrounds.set(i,texture(images.world,tileRect(i),256,128));}return results.every(Boolean);});return loading;
}
function screen(canvas,draw){if(!canvas)return;const c=canvas.getContext('2d');if(!c)return;c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,canvas.width||512,canvas.height||256);c.scale((canvas.width||512)/256,(canvas.height||256)/128);draw(c);c.restore();}
function rectangle(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
function fallback(c,variant=0){rectangle(c,0,0,256,80,'#3cbcfc');rectangle(c,0,72,256,24,'#58b800');rectangle(c,0,96,256,32,'#fca044');for(let x=0;x<256;x+=16){rectangle(c,x,85,2,12,'#503000');rectangle(c,x,89,16,2,'#8c4c20');}rectangle(c,115,89,26,22,'#503000');rectangle(c,117,87,22,23,['#f8b800','#bcbcbc','#fcfcfc'][variant]);rectangle(c,121,95,3,3,'#201810');rectangle(c,132,95,3,3,'#201810');rectangle(c,125,102,6,2,'#201810');}
function frameFor(action,pose){const alternate=pose%2;return ['speed','stamina','technique'].includes(action)?2+alternate:action==='appetite'?4+alternate:action==='intelligence'?6+alternate:action==='rest'?8+alternate:action==='joy'?10+alternate:alternate;}
function contactShadow(c,x,y,width=24){c.save();c.globalAlpha=.24;rectangle(c,x-width/2,y-1,width,2,'#503000');rectangle(c,x-width/2+3,y+1,width-6,1,'#503000');c.restore();}
export function drawScene(canvas,variant=0,turn=0,pose=0,info={}){
 const action=info.action in SCENE_LAYOUTS?info.action:'idle',layout=SCENE_LAYOUTS[action];
 screen(canvas,c=>{
  if(!ready()){fallback(c,variant);return;}
  paintBackground(c,layout.tile);
  if(layout.wheel){const w=layout.wheel;c.save();c.beginPath();c.arc(w.x,w.y,w.radius,0,Math.PI*2);c.clip();paintSprite(c,variant,frameFor(action,pose),layout.x,layout.ground,layout.height);c.restore();}
  else{contactShadow(c,layout.x,layout.ground,action==='intelligence'?34:action==='rest'?34:24);paintSprite(c,variant,frameFor(action,pose),layout.x,layout.ground,layout.height);}
 });
}
export function drawPortrait(cv,variant=0,expression='normal'){if(!cv)return;const c=cv.getContext('2d');if(!c)return;c.clearRect(0,0,66,60);c.imageSmoothingEnabled=false;if(!ready()){rectangle(c,17,8,32,42,['#f8b800','#bcbcbc','#fcfcfc'][variant]);return;}const s=getSprite(variant,expression==='happy'?10:0,28),left=Math.round((66-s.width*2)/2),top=57-s.height*2;if(s.image)c.drawImage(s.image,left,top,s.width*2,s.height*2);else c.drawImage(images[names[variant]],...s.box,left,top,s.width*2,s.height*2);}
const iconMaps={
 shoe:['................','................','....OOO.........','....OYO.........','....OYYO........','....OYYYO.......','...OOYYYYOO.....','..OYYYYYYYYO....','..OCCCCCCCCO....','..OOOOOOOOOO....','................','................','................','................','................','................'],
 wheel:['.....OOOOOO.....','...OOYYYYYYOO...','..OYYOCCCCOYYO..','.OYYOCCCCCCOYYO.','.OYOCCCCCCCCOYO.','OYYOCCCCCCCCOYYO','OYOCCCCCCCCCCOYO','OYOCCCCCCCCCCOYO','OYOCCCCCCCCCCOYO','OYYOCCCCCCCCOYYO','.OYOCCCCCCCCOYO.','.OYYOCCCCCCOYYO.','..OYYOCCCCOYYO..','...OOYYYYYYOO...','....OYYYYYYO....','...OOOOOOOOOO...'],
 seed:['................','.......OO.......','......OCCO......','.....OCGCCO.....','....OCGGGCCO....','...OCGGCGGCCO...','..OCGGCCGGGCCO..','..OCGGCCGGGCCO..','..OCGGCCGGGCCO..','...OCGGCGGCCO...','....OCGGGCCO....','.....OCGCCO.....','......OOOO......','................','................','................'],
 book:['................','..OOOOOOOOOOOO..','..OBBBBOCBBBCO..','..OBCBBOCBCBCO..','..OBBBBOCBBBCO..','..OBCBBOCBCBCO..','..OBBBBOCBBBCO..','..OBCBBOCBCBCO..','..OBBBBOCBBBCO..','..OBBBBOCBBBCO..','..OOOOOOOOOOOO..','...OOOOOOOOOO...','................','................','................','................'],
 maze:['OOOOOOOOOOOOOOOO','OCCCCCCOCCCCCCCO','OOOOCCCOCOOOCCCO','OCCCCCCOCCCOCCCO','OCCOOOOOCCCOCCCO','OCCOCCCCCCCOCCCO','OCCOCOOOOOOOCCCO','OCCOCCCCCCCCCCCO','OCCOOOOOOOOOCCCO','OCCCCCCCCCCOCCCO','OOOOOOOOCCCOCCCO','OCCCCCCCCCCOCCCO','OCCOOOOOOOOOCCCO','OCCCCCCCCCCCCCCO','OCCOOOOOOOOOOCCO','OOOOOOOOOOOOOOOO'],
 bed:['................','................','..OO............','..OY..OOO.......','..OYOCCCCO......','..OOOOOOOOOOOO..','..OBBBBBBBBBBBO.','..OBBBBBBBBBBBO.','..OBBBBBBBBBBBO.','..OOOOOOOOOOOOO.','..OO.........OO.','..OO.........OO.','................','................','................','................']
};
export function iconData(name){if(typeof document==='undefined')return '';const cv=document.createElement('canvas');cv.width=16;cv.height=16;const c=cv.getContext('2d');if(!c)return '';const cols={O:'#503000',Y:'#f8b800',C:'#fcf0b0',B:'#0078f8',G:'#404040'};(iconMaps[name]||iconMaps.seed).forEach((row,y)=>[...row].forEach((v,x)=>{if(cols[v])rectangle(c,x,y,1,1,cols[v]);}));return cv.toDataURL();}
function rivalSprite(c,x,y,index){const body=index%2?'#bcbcbc':'#f87858';rectangle(c,x-8,y-12,16,10,'#503000');rectangle(c,x-7,y-15,4,5,body);rectangle(c,x+4,y-15,4,5,body);rectangle(c,x-7,y-11,14,9,body);rectangle(c,x-4,y-9,2,2,'#201810');rectangle(c,x+3,y-9,2,2,'#201810');rectangle(c,x-6,y-2,4,2,'#503000');rectangle(c,x+3,y-2,4,2,'#503000');}
const glyphs={
 '0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['111','001','111','100','111'],'3':['111','001','111','001','111'],'4':['101','101','111','001','001'],'5':['111','100','111','001','111'],'6':['111','100','111','101','111'],'7':['111','001','010','010','010'],'8':['111','101','111','101','111'],'9':['111','101','111','001','111'],
 Y:['101','101','010','010','010'],O:['111','101','101','101','111'],U:['101','101','101','101','111'],L:['100','100','100','100','111'],I:['111','010','010','010','111'],V:['101','101','101','101','010'],E:['111','100','110','100','111'],F:['111','100','110','100','100'],N:['101','111','111','111','101'],S:['111','100','111','001','111'],H:['101','101','111','101','101']
};
function pixelText(c,text,x,y,color='#fcfcfc'){for(const letter of String(text)){const rows=glyphs[letter];if(rows)rows.forEach((row,dy)=>[...row].forEach((v,dx)=>{if(v==='1')rectangle(c,x+dx,y+dy,1,1,color);}));x+=4;}}
function runner(c,r,variant,x,ground,height,pose){
 contactShadow(c,x,ground,height);
 if(r.species==='ハムスター')paintSprite(c,r.id==='player'?variant:r.index%3,pose,x,ground,height);
 else{rivalSprite(c,x,ground,r.index);if(['ウサギ','シカ','キリン'].includes(r.species)){rectangle(c,x-6,ground-22,3,9,'#bcbcbc');rectangle(c,x+3,ground-22,3,9,'#bcbcbc');}if(['ニワトリ','ペンギン','タカ','ワシ','フクロウ'].includes(r.species))rectangle(c,x+7,ground-10,4,3,'#f8b800');}
}
export function drawRace(cv,live,variant=0){screen(cv,c=>{
 if(!ready()||!live?.standings){fallback(c,variant);return;}
 paintBackground(c,1);
 const pulse=Math.floor(live.time*4),player=live.player,action=live.course.stages[live.stageIndex].action;
 // Whole-field race map, including every one of the 50 finalists.
 rectangle(c,0,0,256,31,'#201810');rectangle(c,8,9,240,1,'#8c4c20');
 for(let i=1;i<live.course.stages.length;i++)rectangle(c,8+240*i/live.course.stages.length,6,1,22,'#8c4c20');
 for(const r of live.standings.filter(r=>r.id!=='player'))rectangle(c,Math.round(8+238*r.distance),13+r.index%5*3,2,2,r.rank<=3?'#fca044':'#bcbcbc');
 const mapX=Math.round(8+238*player.distance);rectangle(c,mapX-1,12,4,16,'#f8b800');rectangle(c,mapX,14,2,12,'#fcfcfc');pixelText(c,'LIVE',9,2,'#f87858');pixelText(c,live.entrants,233,2);
 // Grandstand, flags and lane markings share the existing Famicom palette.
 rectangle(c,0,31,256,22,'#8c4c20');for(let x=3;x<256;x+=7)for(let y=34;y<48;y+=7){const color=['#fcf0b0','#f87858','#3cbcfc','#a8e070'][(Math.floor(x/7)+Math.floor(y/7))%4];rectangle(c,x,y+(pulse+Math.floor(x/7))%2,3,3,color);rectangle(c,x-1,y+3,5,2,color);}
 rectangle(c,0,49,256,4,'#fcf0b0');rectangle(c,0,53,256,75,'#b87830');
 for(let y=64;y<128;y+=10){rectangle(c,0,y,256,1,'#fca044');for(let x=-(Math.floor(player.distance*1100)%20);x<256;x+=20)rectangle(c,x,y,8,1,'#fcf0b0');}
 const start=Math.max(0,Math.min(player.rank-4,live.entrants-7)),pack=live.standings.slice(start,start+7);
 const eating=action==='appetite',study=action==='intelligence';
 if(eating||study){
  // Eating/study take place at stations. Their meters show recorded task progress.
  const slots=[...pack].sort((a,b)=>a.index-b.index);
  slots.forEach((r,i)=>{const x=35+(i%3)*91,ground=74+Math.floor(i/3)*25,pose=r.finished?10+pulse%2:eating?4+pulse%2:6+pulse%2;
   rectangle(c,x-19,ground-22,38,3,'#503000');rectangle(c,x-18,ground-21,Math.round(36*r.stageProgress),1,r.id==='player'?'#f8b800':'#a8e070');
   runner(c,r,variant,x,ground,r.id==='player'?19:15,pose);pixelText(c,r.rank,x+20,ground-10,r.id==='player'?'#fcf0b0':'#fcfcfc');
   if(r.id==='player'){rectangle(c,x-12,ground+1,24,2,'#f8b800');pixelText(c,'YOU',x-6,ground-29,'#f8b800');}
  });
 }else{
  const playerX=80+player.distance*85,finishX=Math.round(playerX+(1-player.distance)*850);
  if(finishX<256){for(let y=54;y<128;y+=4)for(let x=finishX;x<finishX+8;x+=4)rectangle(c,x,y,4,4,(x+y)%8<4?'#fcfcfc':'#201810');pixelText(c,'FINISH',Math.min(228,finishX-10),48,'#201810');}
  pack.forEach((r,i)=>{const ground=61+i*10,x=Math.round(Math.max(15,Math.min(240,playerX+(r.distance-player.distance)*850))),hero=r.id==='player',pose=(r.finished?10:2)+Math.floor(live.time*7+r.index)%2;
   if(action==='technique'){rectangle(c,0,ground-6,256,1,'#8c4c20');for(let bx=12;bx<256;bx+=37)rectangle(c,bx,ground-10,3,4,'#503000');}
   for(let j=0;!r.finished&&j<3;j++)rectangle(c,x-17-j*5,ground-5+j*2,3+j,1,hero?'#fcf0b0':'#fca044');
   runner(c,r,variant,x,ground,hero?19:14,pose);pixelText(c,r.rank,x+12,ground-9,hero?'#fcf0b0':'#fcfcfc');
   if(hero){rectangle(c,x-12,ground+1,24,2,'#f8b800');rectangle(c,x-1,ground-24,3,3,'#f8b800');rectangle(c,x,ground-20,1,2,'#f8b800');pixelText(c,'YOU',x-5,ground-31,'#f8b800');}
  });
 }
 });}
