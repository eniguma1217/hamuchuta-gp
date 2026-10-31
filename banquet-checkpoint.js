import {banquetShot} from './race-direction-v26.js';
import {speciesPlacement} from './fancy-species-art.js';
import {banquetArtHeight} from './racer-art-scale.js';
// Live, shared banquet for the sunflower-seed checkpoint.
// Every painted guest corresponds to a real participant whose recorded split
// places them inside the gate (or within the short departure animation).
// Presentation only: never mutate the race result, clock, rank, RNG or saves.
import {drawCheckpointGarden} from './checkpoint-garden.js';
import {drawBanquetGarden} from './race-scenery.js';
import {drawUnifiedActor} from './unified-art.js';
import {zoneActionAt} from './zone-direction.js';

const px=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=v=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
export const BANQUET_SEATS_PER_ROW=10;
export function banquetSeat(index,total){
 const rows=Math.max(1,Math.ceil(total/BANQUET_SEATS_PER_ROW)),r=Math.floor(index/BANQUET_SEATS_PER_ROW);
 const inRow=Math.min(BANQUET_SEATS_PER_ROW,total-r*BANQUET_SEATS_PER_ROW);
 const x=23+(index%BANQUET_SEATS_PER_ROW+.5)*338/inRow;
 // Domestic races (up to 20) sit on BOTH SIDES of ONE banquet table.
 // The far row's paws are occluded by the tabletop; near guests sit in
 // front of it. No two disconnected horizontal stripes.
 if(total<=20)return {x:Math.round(x),y:rows===1||r===0?130:155,height:rows===1?32:30,row:r,rows};
 // Championship crowds keep stable seat IDs and use deeper tiers.
 const first=[0,109,81,66,55,47][Math.min(rows,5)]||47;
 const y=first+(139-first)*r/Math.max(1,rows-1);
 const height=rows===3?23:rows===4?19:16;
 return {x:Math.round(x),y:Math.round(y),height,row:r,rows};
}
function flower(c,x,y,color){
 px(c,x-2,y-4,5,3,color);px(c,x-5,y-1,4,3,color);px(c,x+2,y-1,4,3,color);
 px(c,x-2,y+2,5,3,color);px(c,x-1,y-1,3,3,'#e7a759');
}
function participant(c,row,variant,seat,focus,fallback){
 const a=zoneActionAt(focus,row,row.id==='player'?variant:row.variant??0);
 const entry=Math.min(.52,Math.max(.15,(row.split||2)*.12));
 const exit=Math.min(.50,Math.max(.14,(row.split||2)*.11));
 const entering=!row.finished&&(row.elapsed??999)<entry;
 const leaving=row.finished;
 const travel=entering?1-ease((row.elapsed||0)/entry):leaving?ease((row.exitElapsed||0)/exit):0;
 const shift=entering?-Math.round(travel*24):leaving?Math.round(travel*28):0;
 const yShift=entering||leaving?Math.round(travel*11):0;
 const x=seat.x+shift,y=seat.y-6+yShift;
 const hero=row.id==='player',v=hero?variant:row.variant??(row.index||0)%3;
 const eating=!entering&&!leaving;
 const bob=eating&&!row.stalled&&a.frame%2?1:0;
 // Player's actual approved unified eating frames; NPCs keep their own
 // species/identity rather than all turning into copies of the protagonist.
 const unified=['hamster','ハムスター','はむちゅたー'].includes(row.species)&&drawUnifiedActor(c,{...row,variant:v},x,y+bob,seat.height,
  eating?'eat-'+(a.frame%2):'idle',null,{opaqueContact:true});
 if(!unified)fallback(c,{...row,variant:v},x,y+bob,seat.height,false,a.frame,
  {action:eating?'eat':'idle',phase:a.phase});
 if(eating){
  // The individual plate's seeds disappear with that runner's real progress.
  const left=Math.min(6,Math.ceil((1-row.progress)*6));
  for(let k=0;k<left;k++)px(c,seat.x-7+k*2.5,seat.y-10-(k%2)*2,2,2,'#eab85d');
  if(!row.stalled&&a.frame%2===0){px(c,x+seat.height*.25,y-seat.height*.48,2,2,'#ffd382');}
 }
 if(hero){
  const arrowY=Math.max(17,y-seat.height-12);
  px(c,x-8,arrowY-8,16,8,'#403046');px(c,x-7,arrowY-7,14,6,'#ffd382');
  c.fillStyle='#403046';c.textAlign='center';c.font='bold 7px HamMaru,sans-serif';c.fillText('YOU',x,arrowY-1);
  px(c,x-2,arrowY+1,4,4,'#ffd382');
 }
}
export function banquetParticipants(focus){
 return [...focus.rows].sort((a,b)=>(a.seatIndex??a.startOrder??0)-(b.seatIndex??b.startOrder??0)||a.id.localeCompare(b.id));
}
// Bold pixel "？" / "！" with a dark outline and a white glint (owner chose this look, #30 2026-10-24).
const MARKS={q:['..XXXX..','.XX..XX.','.....XX.','....XX..','...XX...','...XX...','........','...XX...'],e:['XX','XX','XX','XX','XX','..','XX','XX']};
function pixelMark(c,kind,cx,bottom,s,fill){
 const m=MARKS[kind],w=m[0].length,h=m.length,ox=cx-w*s/2,oy=bottom-h*s,on=(i,j)=>m[j]?.[i]==='X';
 for(let j=-1;j<=h;j++)for(let i=-1;i<=w;i++){if(on(i,j))continue;let edge=false;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++)if(on(i+di,j+dj))edge=true;if(edge)px(c,ox+i*s,oy+j*s,s,s,'#3b2533');}
 for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(on(i,j))px(c,ox+i*s,oy+j*s,s,s,fill);
 px(c,ox+(kind==='e'?0:2)*s,oy,Math.max(1,s*.7),Math.max(1,s*.7),'#ffffff');
}
export const BANQUET_SEAT_PITCH=34;
export function longTableSeat(index){return {x:48+index*BANQUET_SEAT_PITCH,y:132,height:24};}
export function banquetCamera(focus){const hero=focus.rows.find(r=>r.id==='player'),slot=hero?.seatIndex??0;return clamp(longTableSeat(slot).x-179,0,Math.max(0,(focus.venueEntrants||1)*BANQUET_SEAT_PITCH+64-384));}
// `study` (owner, #30 2026-10-24): the study gate works like the seed banquet. Everyone who
// has arrived sits in a row on the ground with paper and a pen, thinks ("？" / "！"), and
// whoever finishes runs off. {background(c), paper(c,row,x,y,height,time)} come from
// checkpoint-art.js.
export function drawBanquetCheckpoint(c,focus,variant=0,fallback=()=>{},seedPainter=null,{study=null}={}){
 const guests=banquetParticipants(focus),shot=banquetShot(focus),all=shot.rows,total=Math.max(1,focus.venueEntrants||guests.length),view=focus.camera||shot,camera=view.center-192;
 // A genuine close-up: scenery, furniture and EVERY guest share one camera.
 // Do not enlarge only the player or shrink the other species to fit a seat.
 const hero=all.find(r=>r.id==='player'),anchor=192,zoom=view.zoom;
 // The study backdrop stays unzoomed so its blackboard stays in view when the camera closes in.
 if(study)study.background(c);
 c.save();c.translate(anchor*(1-zoom),115*(1-zoom));c.scale(zoom,zoom);
 if(!study&&!drawBanquetGarden(c,focus.theme))drawCheckpointGarden(c,'eating',false,true);
 // No table or plates in the race (owner, #30 2026-10-24): everyone sits on the
 // ground and eats the seed held in its paws.
 const handwork=[];
 for(const row of all){
  const seat=longTableSeat(row.seatIndex??row.startOrder??0),entry=Math.min(.65,Math.max(.28,row.split*.15)),entering=!row.finished&&row.elapsed<entry,leaving=row.finished;
  const travel=entering?1-ease(row.elapsed/entry):leaving?ease((row.exitElapsed||0)/.65):0;
  const x=seat.x-camera+(entering?-26:leaving?26:0)*travel,y=seat.y-7*(1-travel),v=row.id==='player'?variant:row.variant??(row.index||0)%3,eating=!entering&&!leaving,a=zoneActionAt(focus,row,v);
  if(x<-40||x>424)continue;
  const baseHeight=banquetArtHeight(row,total>20),measured=speciesPlacement(row,x,y,baseHeight),bodyHeight=measured?baseHeight*Math.min(1,54/measured.destination[2]):baseHeight;
  const walking=entering||leaving,motion=walking?{active:true,phase:Math.floor(focus.time*8+(row.startOrder||0)),bob:0,jump:false}:null,nibble=eating&&!study&&!row.stalled?(Math.floor(focus.time*9+(row.startOrder||0))%2)*.7:0;
  const posed=drawUnifiedActor(c,{...row,variant:v},x,y+nibble,baseHeight,eating?study?(a.phase==='thinking'?'study-1':'study-0'):'eat-'+(a.frame%2):'idle',motion,{opaqueContact:true});
  if(!posed)fallback(c,row,x,y+nibble,bodyHeight,walking,a.frame,{action:eating?study?'study':'eat':'idle',motion});
  if(eating)handwork.push({row,x,y:y+nibble,height:posed?baseHeight:bodyHeight,muzzleX:posed?baseHeight*.16:measured?Math.min(54,measured.destination[2])*.30:baseHeight*.16,a});
  if(row.id==='player'){
   px(c,x-9,y-seat.height-19,18,10,'#795367');px(c,x-8,y-seat.height-18,16,8,'#fff0b5');c.fillStyle='#634852';c.font='bold 7px HamMaru,sans-serif';c.textAlign='center';c.fillText('YOU',x,y-seat.height-11);px(c,x-1,y-seat.height-8,3,3,'#ffd382');
  }
 }
 for(const {row,x,y,height,muzzleX}of handwork){
  // One fully illustrated seed shrinks through five measured bite silhouettes;
  // it vanishes on that contestant's recorded completion, not a new timer.
  if(study){study.paper(c,row,x,y,height,focus.time);continue;}
  seedPainter?.(c,row,x+muzzleX,y-height*.47,height*1.25,focus.time);
  // One held seed only; never paint a second pile through the paws.
 }
 // Thinking marks above every studying head.
 // Marks sit to the right of the head, clear of the hero's YOU badge (x-9..x+9).
 if(study)for(const {row,x,y,height,a} of handwork){const s2=Math.max(1,Math.round(height*.07)),mx=x+10+4*s2,my=y-height-1;if(row.stalled){pixelMark(c,'q',mx,my,s2,'#9a7cc4');for(let k=0;k<3;k++)px(c,mx-6*s2+k*1.6*s2,my-s2,s2,s2,'#3b2533');}else if(a.phase==='thinking')pixelMark(c,'q',mx,my,s2,'#e8457a');else if(a.phase==='inspiration')pixelMark(c,'e',mx,my,s2,'#ff8a00');}
 c.restore();
 px(c,0,0,384,19,'#795367');c.font='bold 10px HamMaru,sans-serif';c.fillStyle='#fff0d2';c.textAlign='left';c.fillText(study?'ひらめきの勉強関門':'ひまわりの早食い関門',7,13);c.textAlign='right';c.fillStyle='#ffe3a4';c.fillText((study?'解答中 ':'食事中 ')+guests.filter(r=>!r.finished&&r.entered!==false&&r.elapsed>=Math.min(.65,Math.max(.28,r.split*.15))).length+'匹',376,13);
 // Over the study backdrop's flowers the footer needs a light card to stay legible.
 if(study){c.save();c.globalAlpha=.85;px(c,4,145,384-8,11,'#fff9ed');c.restore();}
 c.font='bold 8px HamMaru,sans-serif';c.textAlign='left';c.fillStyle='#795367';c.fillText(study?'到着 → うーん → ひらめき → コースへ':'到着 → かりかり → コースへ',8,153);
 if(total>10){c.textAlign='right';c.fillText('注目 '+all.length+'匹 / 全'+total+'匹',376,153);}
}
