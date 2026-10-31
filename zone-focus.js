import {banquetViewAt} from './banquet-director.js';
import {drawCheckpointStage,mazeRoute,mazeMarks,mazeProgressOf} from './checkpoint-art.js';
import {drawReviewSet,reviewDeskLayout,drawReviewTableFront} from './art-review.js';
import {drawContestant,checkpointEntrants} from './art.js';
import {raceTheme} from './race-scenery.js';
import {zoneActionAt} from './zone-direction.js';
const DETAILS={maze:{title:'迷路でデッドヒート！',ability:'きようさ',color:'#9fc5b1'},eating:{title:'ほっぺ満員、早食い勝負！',ability:'食欲',color:'#ffd382'},study:{title:'えんぴつ全開！ ギャグ試験',ability:'かしこさ',color:'#b3dce3'}};
export function zoneFocusAt(result,live){
 if(result.simulationVersion!==6)return null;
 const hero=result.participants.find(p=>p.id==='player');let stageIndex=live.stageIndex,completed=false,end=0,justCompleted=-1;
 for(let i=0;i<hero.times.length;i++){end+=hero.times[i];if(DETAILS[result.course.stages[i].id]&&live.time>=end&&live.time-end<.65)justCompleted=i;}
 if(justCompleted>=0){stageIndex=justCompleted;completed=true;}
 else if(!DETAILS[result.course.stages[stageIndex].id]||live.player.finished)return null;
 const z=result.course.stages[stageIndex];
 // Stable seat assignment follows each contestant's *recorded* arrival time.
 // New arrivals never cause seated characters to teleport to another chair.
 const entryOrder=[...result.participants].sort((a,b)=>{
  const ta=a.times.slice(0,stageIndex).reduce((x,y)=>x+y,0);
  const tb=b.times.slice(0,stageIndex).reduce((x,y)=>x+y,0);
  return ta-tb||(a.startOrder??0)-(b.startOrder??0)||a.id.localeCompare(b.id);
 });
 const seatIndices=new Map(entryOrder.map((row,i)=>[row.id,i]));
 const atGate=p=>{
  const entry=p.times.slice(0,stageIndex).reduce((x,y)=>x+y,0);
  const elapsed=live.time-entry;
  return elapsed>=0&&elapsed<=p.times[stageIndex]+.65;
 };
 // Eating and study gates both seat everyone who has arrived (owner, #30 2026-10-24).
 const hall=z.id==='eating'||z.id==='study';
 const ids=hall
  ?['player',...entryOrder.filter(p=>p.id!=='player'&&atGate(p)).map(p=>p.id)]
  :completed?['player']:checkpointEntrants(live,2).map(p=>p.id);
 // Maze: each runner's own route for this race (wrong turns by its きようさ and the race's luck, read from the
 // recorded split). Its side-branch decisions, in recorded progress, drive the "こっちかな？" moments.
 const mazeOf=(id,a,split)=>{if(z.id!=='maze')return null;const maze={ability:a.ability,lost:a.loss>0,luck:(Math.round(split*1000)^[...id].reduce((n,ch)=>(n*31+ch.charCodeAt(0))>>>0,7))>>>0};return {...maze,junctions:mazeMarks(mazeRoute(id,maze)).junctions.map(d=>mazeProgressOf(d,mazeRoute(id,maze),maze))};};
 const at=id=>{const p=result.participants.find(x=>x.id===id),before=p.times.slice(0,stageIndex).reduce((a,b)=>a+b,0),split=p.times[stageIndex],elapsed=Math.max(0,Math.min(split,live.time-before)),a=p.analysis[stageIndex],maze=mazeOf(id,a,split),moving=split-a.loss,stop=moving*.45,stalled=a.loss>0&&elapsed>=stop&&elapsed<stop+a.loss,progress=elapsed>=split?1:stalled?.45:(elapsed>stop+a.loss?elapsed-a.loss:elapsed)/moving;return {...p,rank:live.standings.find(x=>x.id===id).rank,progress:Math.max(0,Math.min(1,progress)),ability:a.ability,loss:a.loss,stalled,entered:live.time>=before,finished:elapsed>=split,split,elapsed,exitElapsed:Math.max(0,live.time-before-split),seatIndex:seatIndices.get(id),...(maze?{maze}:{})};};
 const rows=ids.map(at),overviewRows=z.id==='maze'?live.standings.filter(p=>p.stageIndex===stageIndex&&!p.finished).map(p=>at(p.id)).filter(p=>p.entered&&!p.finished):[];
 return {camera:hall?banquetViewAt(result,stageIndex,live.time):null,theme:raceTheme(result),id:z.id,stageIndex,...DETAILS[z.id],time:live.time,completed,rows,overviewRows,venueEntrants:result.participants.length};
}
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const text=(c,str,x,y,color='#403046',size=9)=>{c.font='bold '+size+'px monospace';c.fillStyle=color;c.fillText(str,Math.round(x),Math.round(y));};
const path=[[17,25],[65,25],[65,51],[124,51],[124,22],[178,22],[178,74],[238,74],[238,39],[287,39],[287,97],[351,97]];
function pathAt(p){const lengths=path.slice(1).map((v,i)=>Math.hypot(v[0]-path[i][0],v[1]-path[i][1])),total=lengths.reduce((a,b)=>a+b,0);let d=p*total;for(let i=0;i<lengths.length;i++){if(d<=lengths[i]||i===lengths.length-1){const t=Math.min(1,d/lengths[i]);return [path[i][0]+(path[i+1][0]-path[i][0])*t,path[i][1]+(path[i+1][1]-path[i][1])*t];}d-=lengths[i];}return path.at(-1);}
function maze(c,focus,variant,illustrated=false){
 if(illustrated){const hero=focus.rows[0],a=zoneActionAt(focus,hero,variant);rect(c,5,131,374,39,'#fff9ed');drawContestant(c,{...hero,variant},35,167,a.close?44:36,false,a.frame);text(c,hero.finished?'出口、とうちゃく！':a.phase==='junction'?'どっちへ行こう……？':'出口をめざして、集中！',68,146);text(c,Math.floor(hero.progress*100)+'% / '+hero.rank+'位',68,161,'#795367',8);return;}
 rect(c,7,7,370,115,'#73916b');rect(c,11,11,362,107,'#9dbb82');
 for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];rect(c,Math.min(a[0],b[0])-5,Math.min(a[1],b[1])-5,Math.abs(b[0]-a[0])+11,Math.abs(b[1]-a[1])+11,'#f6e4ba');}
 // Decorative branches have no saved right/wrong route semantics.
 rect(c,59,47,24,10,'#f6e4ba');rect(c,172,69,35,10,'#f6e4ba');rect(c,278,91,10,20,'#f6e4ba');
 text(c,'EXIT',323,114,'#403046',8);
 for(const row of [...focus.rows].reverse()){const [x,y]=pathAt(row.progress);drawContestant(c,{...row,variant:row.id==='player'?variant:row.variant??0},x,y+10,20,!row.stalled&&!row.finished,Math.floor(focus.time*7));if(row.id==='player')text(c,'YOU',x-9,y-13,'#795367',7);}
 const hero=focus.rows[0],a=zoneActionAt(focus,hero,variant);rect(c,7,128,370,39,'#fff9ed');drawContestant(c,{...hero,variant},37,165,a.close?44:36,false,a.frame);text(c,hero.finished?'出口、とうちゃく！':a.phase==='junction'?'こっちかな……？':a.phase==='exit-close'?'出口が見えた！':'壁と出口を見渡そう',68,146);text(c,Math.floor(hero.progress*100)+'%  / '+hero.rank+'位',68,160,'#795367',8);
}
function work(c,focus,variant,illustrated=false){
 // Fallback before the checkpoint art loads: two close-ups (the hero and its nearest seat),
 // even now that the eating and study gates seat everyone who has arrived.
 const hero=focus.rows.find(r=>r.id==='player'),cast=focus.rows.length<=2?focus.rows:[hero||focus.rows[0],...focus.rows.filter(r=>r!==(hero||focus.rows[0])).sort((a,b)=>Math.abs((a.seatIndex??0)-((hero||focus.rows[0]).seatIndex??0))-Math.abs((b.seatIndex??0)-((hero||focus.rows[0]).seatIndex??0)))].slice(0,2),slots=cast.length===1?[{x:16,w:352}]:[{x:8,w:180},{x:196,w:180}];
 cast.forEach((row,i)=>{const slot=slots[i],hero=row.id==='player',a=zoneActionAt(focus,row,hero?variant:row.variant??0),center=slot.x+slot.w/2,layout=illustrated?reviewDeskLayout(focus,i):{actorX:center-18,ground:130,plateX:center+30,plateY:105,height:a.close?67:59},runner={...row,variant:hero?variant:row.variant??0},size=layout.height+(a.close?3:0),{actorX,plateX,plateY}=layout;
  if(!illustrated)rect(c,slot.x,17,slot.w,148,hero?'#f6e4ba':'#e9f2d2');c.textAlign='left';text(c,hero?'あなた':row.rank+'位',slot.x+7,25,hero?'#795367':'#689c99',9);
  const painted=drawContestant(c,runner,actorX,layout.ground,size,false,a.frame,{action:row.finished?'idle':focus.id==='eating'?'eat':'study',phase:a.phase,puff:a.puff});
  if(illustrated)drawReviewTableFront(c,focus,slot,plateY);
  else{rect(c,center-6,109,slot.w*.40,7,'#b77652');rect(c,center-2,116,5,22,'#795367');rect(c,center+slot.w*.35,116,5,22,'#795367');}
  if(focus.id==='eating'){
   if(!illustrated){rect(c,plateX-21,plateY-1,43,6,'#795367');rect(c,plateX-19,plateY-3,39,4,'#fff9ed');}
   for(let k=0;k<a.seedsLeft;k++)rect(c,plateX-15+(k%6)*6,plateY-7-Math.floor(k/6)*4,4,3,'#eaa35c');
   if(!row.finished){const x=plateX-20+(a.frame<2?0:-8),y=plateY-7-(a.frame%2)*4;rect(c,x,y,6,4,'#f5c8b5');rect(c,x+1,y-2,4,3,'#eaa35c');}
   if(a.puff&&!row.finished){const d=painted?.placement.destination,yy=d?d[1]+d[3]*.49:109;rect(c,actorX-21-a.puff,yy,a.puff+3,4,'#f5c8b5');rect(c,actorX+19,yy,a.puff+3,4,'#f5c8b5');}
   text(c,row.finished?'完食！':a.phase==='pouch'?'ほっぺ、ぱんぱん！':'もぐ、もぐっ！',slot.x+8,147,'#795367',9);
  }else{
   if(!illustrated){rect(c,plateX-20,plateY-11,39,16,'#403046');rect(c,plateX-18,plateY-9,35,12,'#fff9ed');}
   for(let k=0;k<a.solved;k++)rect(c,plateX-14+(k%3)*9,plateY-5+Math.floor(k/3)*5,6,1,'#689c99');
   if(a.phase==='panic'){const d=painted?.placement.destination,eyeY=d?d[1]+d[3]*.42:96,x1=d?d[0]+d[2]*.55:actorX-13,x2=d?d[0]+d[2]*.79:actorX+1;rect(c,x1,eyeY,6,4,'#fff9ed');rect(c,x2,eyeY,6,4,'#fff9ed');rect(c,actorX+15,eyeY+8,2,5,'#b3dce3');}
   if(a.phase==='scribble'){for(let k=0;k<3;k++)rect(c,plateX-15+a.frame*2+k*3,plateY-13+k*2,2,9,'#d6bd93');if(painted){const d=painted.placement.destination;for(let k=0;k<3;k++)rect(c,d[0]+d[2]*.4+a.frame+k*2,d[1]+d[3]*.47+k*2,2,5,'#9dbb82');}else rect(c,plateX-10+a.frame*3,plateY-14,2,17,'#795367');}
   if(a.phase==='inspiration')text(c,'!',actorX+14,layout.ground-size-1,'#eaa35c',17);
   if(row.finished){rect(c,plateX-18,plateY-31,36,25,'#fff9ed');text(c,'提出！',plateX-16,plateY-16,'#689c99',9);}
   text(c,({thinking:'うーん……',panic:'あわわわ！',scribble:'カリカリカリッ！',inspiration:'ひらめいた！',submitted:'答案、提出！'})[a.phase],slot.x+8,147,'#795367',9);
  }
  rect(c,slot.x+8,153,slot.w-16,5,'#d8c4b3');rect(c,slot.x+8,153,(slot.w-16)*row.progress,5,hero?'#ab6b78':'#689c99');
 });
}
export function drawZoneFocus(canvas,focus,variant=0,{embedded=false}={}){
 if(!canvas||!focus)return;const c=canvas.getContext('2d');if(!c)return;c.save();c.imageSmoothingEnabled=false;
 // Use the dedicated production artwork by default, independent of ?art=v2.
 c.save();if(embedded){c.scale(canvas.width/384,canvas.height/216);c.translate(0,26);}else{c.clearRect(0,0,canvas.width,canvas.height);c.scale(canvas.width/384,canvas.height/174);c.translate(0,9);}const painted=drawCheckpointStage(c,focus,variant,drawContestant);c.restore();if(painted){c.restore();return;}
 if(embedded){c.scale(canvas.width/384,canvas.height/216);rect(c,0,26,384,156,'#403046');c.translate(20,26);c.scale(156/174,156/174);}else{c.clearRect(0,0,canvas.width,canvas.height);c.scale(canvas.width/384,canvas.height/174);}
 rect(c,0,0,384,174,focus.theme?.horizon||'#fff0d2');rect(c,0,0,384,8,focus.theme?.accent||focus.color);
 const illustrated=drawReviewSet(c,focus);if(focus.id==='maze')maze(c,focus,variant,illustrated);else work(c,focus,variant,illustrated);
 c.restore();
}
