import {drawFancyPanel,drawFancyCover,fancyImage,fancyPanel,loadFancyBackgrounds} from './fancy-backgrounds.js';
import {drawFancySpecies,loadFancySpecies} from './fancy-species-art.js';
import {drawUnifiedActor,loadUnifiedArt,unifiedCharacter} from './unified-art.js';
import {drawCheckpointGarden} from './checkpoint-garden.js';
import {drawBanquetCheckpoint} from './banquet-checkpoint.js';
// Dedicated checkpoint art. Rendering only: no storage, RNG or race writes.
import {MOTION_BOXES} from './race-motion-boxes.js';
import {drawAnimatedRunner} from './race-animation.js';
import {zoneActionAt} from './zone-direction.js';
import {ZODIAC_REVIEW_BOXES} from './art-review.js';
import {drawVisualNPC,croppedSprite} from './visual-art.js';
export const CHECKPOINT_SIZE={width:384,height:156};
export const ACTION_BOXES={
 eating:[[[74,140,303,357],[423,140,655,357],[778,140,1006,357]],[[69,474,307,692],[423,473,661,692],[778,473,1016,692]],[[58,806,323,1029],[418,806,678,1029],[773,806,1028,1030]],[[58,1136,305,1355],[419,1136,665,1355],[777,1136,1018,1355]]],
 study:[[[43,108,286,341],[363,108,605,341],[677,108,922,341]],[[42,406,289,641],[361,406,607,641],[676,406,926,641]],[[39,722,295,941],[358,722,610,941],[677,721,933,941]],[[38,995,281,1220],[357,995,597,1220],[676,995,916,1220]],[[40,1300,294,1536],[359,1300,615,1536],[681,1300,938,1536]]],
 maze:[[[75,105,363,375],[478,105,764,375],[880,105,1170,375]],[[90,481,390,767],[492,479,795,767],[889,480,1192,767]],[[76,871,360,1157],[480,871,764,1157],[881,871,1167,1157]]]
};
export const PRODUCTION_EATING_BOXES=[[[52, 113, 337, 386], [400, 114, 686, 387], [751, 113, 1037, 387]], [[52, 455, 349, 718], [403, 455, 697, 718], [748, 454, 1044, 718]], [[50, 782, 352, 1045], [402, 782, 701, 1046], [751, 783, 1049, 1046]], [[47, 1096, 340, 1369], [399, 1097, 693, 1371], [744, 1097, 1037, 1371]]];
export const EATING_INCIDENT_BOXES=[[[80, 145, 435, 472], [589, 144, 949, 472], [1081, 144, 1442, 472]], [[69, 587, 510, 925], [586, 587, 1022, 925], [1072, 585, 1508, 925]]];
const files={studyBoard:'./assets/owner-v38/study-blackboard.png',mazeFloor:'./assets/owner-v38/maze/floor.png',mazeHedge:'./assets/owner-v38/maze/hedge.png',mazeGateIn:'./assets/owner-v38/maze/gate-in.png',mazeGateOut:'./assets/owner-v38/maze/gate-out.png',emptyPaws:'./assets/race-motion-v6/eating-empty-paws-v6.png',seedBites:'./assets/race-motion-v6/seed-bites-v6.png',incidents:'./assets/story-v5/eating-incidents-v5.png',eatingV5:'./assets/story-v5/eating-actions-v5.png',outdoor:'./assets/story-v5/outdoor-study-v5.png',eating:'./assets/checkpoints-v3/eating-actions-v3.png',study:'./assets/checkpoints-v3/study-actions-v3.png',maze:'./assets/checkpoints-v3/maze-reactions-v3.png',tiles:'./assets/visual-polish-v4/maze-tiles-v4.png',sets:'./assets/art-review-v2/checkpoint-sets-v2.png',night:'./assets/checkpoints-v3/checkpoint-sets-night-v3.png',sunset:'./assets/visual-polish-v4/checkpoint-sets-sunset-v4.png',stadium:'./assets/visual-polish-v4/checkpoint-sets-stadium-v4.png',zodiac:'./assets/art-review-v2/zodiac-runners-v2.png'};
const images={};let loading;
export function loadCheckpointArt(){if(typeof Image==='undefined')return Promise.resolve(false);return loading||=Promise.all([loadUnifiedArt(),loadFancySpecies(),loadFancyBackgrounds(),...Object.entries(files).map(([key,path])=>new Promise(resolve=>{const i=new Image();i.onload=()=>{images[key]=i;resolve(true);};i.onerror=()=>resolve(false);i.src=new URL(path,import.meta.url).href;}))]).then(r=>r.every(Boolean));}
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const text=(c,s,x,y,color='#403046',size=9)=>{c.fillStyle=color;c.font='bold '+size+'px HamMaru,sans-serif';c.textAlign='left';c.fillText(s,Math.round(x),Math.round(y));};
export function actionFrame(focus,row,variant=0){const a=zoneActionAt(focus,row,variant);return focus.id==='eating'?(row.finished?3:row.progress<.15?0:row.progress<.45?(a.frame<2?0:1):2):focus.id==='study'?({thinking:0,panic:1,scribble:2,inspiration:3,submitted:4})[a.phase]:(row.finished?2:a.phase==='junction'?1:0);}
export function actorPlacement(box,x,ground,height){const [l,t,r,b]=box,p=5,sh=b-t+2*p,dh=Math.round(sh*height/(b-t)),dw=Math.round((r-l+2*p)*dh/sh);return {source:[l-p,t-p,r-l+2*p,sh],destination:[Math.round(x-dw/2),Math.round(ground-(b-t+p)*dh/sh),dw,dh]};}
function actor(c,focus,row,variant,x,ground,height){const pose=focus.id==='eating'?(row.finished?'idle':row.progress<.45?'eat-0':'eat-1'):focus.id==='study'?(row.finished?'joy':zoneActionAt(focus,row,variant).phase==='thinking'?'study-1':'study-0'):row.finished?'joy':'idle',unified=drawUnifiedActor(c,{...row,variant},x,ground,height,pose);if(unified)return {...unified.placement,unified:true};const index=actionFrame(focus,row,variant),incident=focus.id==='eating'&&row.stalled&&row.startOrder%2===0&&images.incidents,empty=focus.id==='eating'&&images.emptyPaws,boxes=incident?EATING_INCIDENT_BOXES:empty?MOTION_BOXES.eating:focus.id==='eating'&&images.eatingV5?PRODUCTION_EATING_BOXES:ACTION_BOXES[focus.id],box=boxes[incident?1:index][variant%3],p=actorPlacement(box,x+(incident?Math.sin(focus.time*8)*2:0),ground,height);c.drawImage(incident?images.incidents:empty?images.emptyPaws:focus.id==='eating'&&images.eatingV5?images.eatingV5:images[focus.id],...p.source,...p.destination);return p;}
export function seedVisualAt(row){if(row.finished)return null;const frame=Math.min(4,Math.floor(Math.max(0,Math.min(.999999,row.progress))*5)),box=MOTION_BOXES.seed[0][frame];return {frame,box,remainingHeight:(box[3]-box[1])/516};}
export function heldSeed(c,row,x,y,height,time){const v=seedVisualAt(row);if(!v||!images.seedBites)return;const [l,t,r,b]=v.box,scale=height*.34/516,chew=row.stalled?0:Math.floor(time*9)%2;c.drawImage(images.seedBites,l,t,r-l,b-t,Math.round(x-(r-l)*scale/2),Math.round(y+chew),(r-l)*scale,(b-t)*scale);}
export function drawPracticeActor(c,action,variant,x,ground,height,pose=0){const kind=action==='appetite'?'eat-'+(Math.floor(pose)%2):action==='intelligence'?'study-'+(Math.floor(pose)%2):action==='rest'?'rest':'idle';if(['appetite','intelligence','rest'].includes(action)&&drawUnifiedActor(c,{id:'player',variant},x,ground,height,kind)){if(action==='appetite')heldSeed(c,{progress:(pose%10)/10,finished:false},x+height*.15,ground-height*.43,height,pose/8);return true;}const id=action==='appetite'?'eating':action==='intelligence'?'study':null;if(!id||!images[id])return false;const frame=id==='eating'?[0,1,1,2][Math.floor(pose)%4]:[0,1,2,2,3][Math.floor(pose)%5];return croppedSprite(c,images[id],ACTION_BOXES[id][frame][variant%3],x,ground,height);}
const zodiac=['ネズミ','ウシ','トラ','ウサギ','タツ','ヘビ','ウマ','ヒツジ','サル','ニワトリ','イヌ','イノシシ'];
function portrait(c,row,x,y,height){if(drawFancySpecies(c,row,x,y,height))return true;const index=zodiac.indexOf(row.species);if(index>=0){const p=actorPlacement(ZODIAC_REVIEW_BOXES[index],x,y,height);c.drawImage(images.zodiac,...p.source,...p.destination);return true;}return false;}
export function drawCheckpointZodiac(c,row,x,ground,height){return !!images.zodiac&&portrait(c,row,x,ground,height);}
const setBoxes={eating:[0,0,1086,469],study:[0,469,1086,941]};
// The generated set has real measured panel boundaries; never split it in exact thirds.
export function deskView(focus){if(focus.id==='study'&&images.outdoor){const solo=focus.rows.length===1,col=focus.theme?.id==='sunset'||focus.theme?.id==='shrine'?1:0,row=['stadium','shrine'].includes(focus.theme?.id)?1:0,sw=solo?492:984,sh=row?399:400,scale=Math.max(384/sw,156/sh),ch=156/scale,cy=solo?Math.max((sh-ch)/2,295-122/scale):(sh-ch)/2;return {source:[col*984,row*400+cy,sw,ch],scale,cy,solo,outdoor:true};}const solo=focus.rows.length===1,[l,t,r,b]=setBoxes[focus.id],sw=solo?(r-l)/2:r-l,sh=b-t,scale=Math.max(384/sw,156/sh),ch=156/scale,cy=(sh-ch)/2;return {source:[l,t+cy,sw,ch],scale,cy,solo,night:['shrine','stadium'].includes(focus.theme?.id)};}
export const checkpointSetKey=themeId=>({sunset:'sunset',stadium:'stadium',shrine:'night'})[themeId]||'sets';
function set(c,view,id){if(id==='study'&&drawFancyPanel(c,'gates',0,0,-40,384,216))return;c.drawImage((view.outdoor?images.outdoor:images[view.setKey])||images.sets,...view.source,0,0,384,156);drawCheckpointGarden(c,id,view.solo);}
function meter(c,row,x,y,width,hero){rect(c,x,y,width,5,'#d8c4b3');rect(c,x,y,width*row.progress,5,hero?'#ab6b78':'#689c99');}
const isHamster=row=>['hamster','ハムスター','はむちゅたー'].includes(row.species);
// No desks in the race (owner, #30 2026-10-24): the owner's blackboard-only
// background, same framing as the old garden panel 0 (which had two desks
// painted in). If it has not loaded, the empty lakeside garden (panel 2).
const STUDY_PANEL=2;
function studyBackdrop(c){if(images.studyBoard){c.save();c.imageSmoothingEnabled=false;c.drawImage(images.studyBoard,0,-40,384,216);c.restore();}else drawFancyPanel(c,'gates',STUDY_PANEL,0,-40,384,216);}
// Paper and a pen at the paws (owner: everyone holds them, #30 2026-10-24). Ordinary
// entrants' painted study poses already hold both; the six principal hamsters and the
// other animals get this overlay until their own paper-and-pen study art arrives.
export function studyPaper(c,row,x,ground,height,time){
 const design=unifiedCharacter({...row,variant:row.variant??0});if(design?.sheet==='mobs')return;
 const w=Math.max(6,Math.round(height*.34)),h=Math.max(4,Math.round(height*.2)),l=Math.round(x+height*.1),t=Math.round(ground-h-1);
 rect(c,l,t,w,h,'#795367');rect(c,l+1,t+1,w-2,h-2,'#fffaf0');for(let k=0;k<Math.min(3,Math.floor((h-2)/2));k++)rect(c,l+2,t+2+k*2,Math.max(2,w-5-(k%2)*2),1,'#b9a3b0');
 // pen: a short slanted stroke held at the paper's right side; it bobs while writing
 const wobble=row.finished||row.stalled?0:Math.round(Math.sin(time*9+(row.startOrder||0))),len=Math.max(4,Math.round(height*.26)),px0=l+w-2,py0=t+1+wobble;
 for(let k=0;k<len;k++)rect(c,px0+Math.round(k*.45),py0-k,2,1,k<2?'#3b2533':k<len-2?'#5a9a63':'#e8c27a');
}
// Explanatory display maze, not a new saved route or pathfinding/penalty engine.
// Mazes are perfect labyrinths (one way through, several dead ends; owner: "there is nowhere
// to get lost", #30 2026-10-25). Each runner's illustrative route walks the solution and
// wanders into some dead ends and back (mazeTurns). Display only: progress is the recorded one.
export const MAZE_GRID=['#################','#...#.......#...#','#.#.#.#.###.#.###','#.#...#.#.#.#...#','#######.#.#.###.#','....#...#...#....','###.#.###.###.#.#','#.....#.......#.#','#################'];
const STEPS=[[1,0],[0,1],[-1,0],[0,-1]];
const isOpen=(grid,x,y)=>y>=0&&y<grid.length&&x>=0&&x<grid[0].length&&grid[y][x]==='.';
export function mazeEnds(grid){const W=grid[0].length;return {entry:[0,grid.findIndex(r=>r[0]==='.')],exit:[W-1,grid.findIndex(r=>r[W-1]==='.')]};}
export function mazeSolution(grid){
 const {entry,exit}=mazeEnds(grid),key=p=>p[0]+','+p[1],prev=new Map([[key(entry),null]]),queue=[entry];
 while(queue.length){const c=queue.shift();if(key(c)===key(exit))break;for(const [dx,dy] of STEPS){const n=[c[0]+dx,c[1]+dy];if(isOpen(grid,...n)&&!prev.has(key(n))){prev.set(key(n),c);queue.push(n);}}}
 const path=[];for(let c=exit;c;c=prev.get(key(c)))path.push(c);return path.reverse();
}
// Side branches off the solution, each walked to its far dead end.
export function mazeDetours(grid,path=mazeSolution(grid)){
 const on=new Set(path.map(p=>p.join())),out=[];
 path.forEach((p,at)=>{for(const [dx,dy] of STEPS){let prev=p,cur=[p[0]+dx,p[1]+dy];if(!isOpen(grid,...cur)||on.has(cur.join()))continue;const walk=[cur];
  for(;;){const next=STEPS.map(([ex,ey])=>[cur[0]+ex,cur[1]+ey]).find(n=>isOpen(grid,...n)&&n.join()!==prev.join()&&!on.has(n.join()));if(!next)break;prev=cur;cur=next;walk.push(cur);}
  out.push({at,walk});}});
 return out;
}
// Once three quarters of the way is behind them the goal is close and in view, so
// nobody wanders off there: detours and hesitation only happen before that point.
export const MAZE_SURE_SHARE=.75;
export const mazeSureFrom=path=>Math.floor((path.length-1)*MAZE_SURE_SHARE)+1;
export function mazeWander(grid,picks){
 const path=mazeSolution(grid),detours=mazeDetours(grid,path).filter(d=>d.at<mazeSureFrom(path)),chosen=new Set(picks.map(i=>((i%detours.length)+detours.length)%detours.length)),route=[];
 path.forEach((p,i)=>{route.push(p);detours.forEach((d,k)=>{if(d.at===i&&chosen.has(k))route.push(...d.walk,...d.walk.slice(0,-1).reverse(),p);});});
 return route;
}
export const MAZE_ROUTE=mazeSolution(MAZE_GRID);
// Whether a runner turns wrong at a side branch depends on its maze ability (きようさ) and that race's luck
// (owner 2026-10-26 「能力値によって分かれ道の迷子はランダムに」). Per side branch 44% at 0, 16% at 50, 4% at 80
// and 1% from 100; over the race maze's four branches a race goes wrong about 90% / 50% / 15% / 4% of the time.
// A recorded 迷子 (the +3〜5秒 incident) always shows a real wrong turn. Display only: the time stays the
// recorded one, which already favours a high きようさ.
export const wrongTurnChance=ability=>Math.max(.01,.44*Math.pow(1-Math.max(0,Math.min(100,ability))/100,1.5));
export function mazeTurns(grid,{ability=50,luck=0,lost=false}={}){
 const path=mazeSolution(grid),detours=mazeDetours(grid,path).filter(d=>d.at<mazeSureFrom(path));let h=luck>>>0;
 const roll=()=>{h=(h+0x9e3779b9)>>>0;let z=Math.imul(h^(h>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;return ((z^(z>>>16))>>>0)/4294967296;};
 const picks=detours.map((_,k)=>k).filter(()=>roll()<wrongTurnChance(ability));
 if(lost&&!picks.length)picks.push(Math.floor(roll()*detours.length));
 return picks;
}
const idLuck=id=>{let n=0;for(const ch of String(id))n=(n*31+ch.charCodeAt(0))>>>0;return n;};
// Along a route (0..1 of its length): the side-branch decisions, and the far end of its deepest dead end
// (where a recorded 迷子 stops and wonders).
const marksCache=new WeakMap();
export function mazeMarks(route,grid=MAZE_GRID){
 if(grid===MAZE_GRID&&marksCache.has(route))return marksCache.get(route);
 const lens=[0];for(let i=1;i<route.length;i++)lens.push(lens[i-1]+Math.abs(route[i][0]-route[i-1][0])+Math.abs(route[i][1]-route[i-1][1]));const total=lens.at(-1)||1;
 const path=mazeSolution(grid),on=new Set(path.map(p=>p.join())),sure=new Set(path.slice(mazeSureFrom(path)).map(p=>p.join())),deg=(x,y)=>STEPS.filter(([dx,dy])=>isOpen(grid,x+dx,y+dy)).length;
 const junctions=[];let stall=null,depth=0;
 route.forEach((p,i)=>{if(deg(...p)>=3&&on.has(p.join())&&!sure.has(p.join())&&i<route.length-1)junctions.push(lens[i]/total);
  if(i>0&&i<route.length-1&&route[i-1].join()===route[i+1].join()){let d=0;for(let j=i;j>0&&!on.has(route[j].join());j--)d++;if(d>depth){depth=d;stall=lens[i]/total;}}});
 const marks={junctions,stall};if(grid===MAZE_GRID)marksCache.set(route,marks);return marks;
}
const routeCache=new Map();
// maze: {ability, luck, lost} of this runner in this race; without it, the luck is the runner's id.
export function mazeRoute(id='player',maze=null){
 const opts={ability:maze?.ability??50,luck:maze?.luck??idLuck(id),lost:!!maze?.lost},key=id+'|'+opts.ability.toFixed(2)+'|'+opts.luck+'|'+opts.lost;
 if(routeCache.has(key))return routeCache.get(key);if(routeCache.size>600)routeCache.clear();
 const route=mazeWander(MAZE_GRID,mazeTurns(MAZE_GRID,opts));routeCache.set(key,route);return route;
}
export const MAZE_CELL=15,MAZE_X=9+Math.floor((260-MAZE_GRID[0].length*MAZE_CELL)/2),MAZE_Y=8+Math.floor((140-MAZE_GRID.length*MAZE_CELL)/2);
// A recorded 迷子 stands still at 45% of the zone (race-playback); on its route that moment is the far end of
// its deepest dead end, so the walk before and after is stretched to meet it there.
const STALL=.45;
export function mazeDistanceOf(progress,route,maze=null){const p=Math.max(0,Math.min(1,progress)),stall=maze?.lost?mazeMarks(route).stall:null;return stall===null?p:p<=STALL?p/STALL*stall:stall+(p-STALL)/(1-STALL)*(1-stall);}
export function mazeProgressOf(distance,route,maze=null){const stall=maze?.lost?mazeMarks(route).stall:null;return stall===null?distance:distance<=stall?distance/stall*STALL:STALL+(distance-stall)/(1-stall)*(1-STALL);}
export function mazePoint(progress,id='player',maze=null){const route=mazeRoute(id,maze);let distance=mazeDistanceOf(progress,route,maze)*route.slice(1).reduce((sum,p,i)=>sum+Math.abs(p[0]-route[i][0])+Math.abs(p[1]-route[i][1]),0);for(let i=1;i<route.length;i++){const from=route[i-1],to=route[i],len=Math.abs(to[0]-from[0])+Math.abs(to[1]-from[1]);if(!len)continue;if(distance<=len)return [from[0]+(to[0]-from[0])*distance/len,from[1]+(to[1]-from[1])*distance/len];distance-=len;}return route.at(-1);}
export function drawConfusion(c,x,y,time=0){c.save();c.translate(Math.round(x),Math.round(y));c.fillStyle='#fff9ed';c.strokeStyle='#b79bb7';c.lineWidth=1;c.beginPath();c.ellipse(0,0,11,8,0,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle='#795367';c.lineWidth=1.2;c.beginPath();for(let i=0;i<=32;i++){const a=i*.36+time*1.5,r=.7+i*.20,xx=Math.cos(a)*r,yy=Math.sin(a)*r*.65;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();c.restore();}
export function mazeCameraAt(progress,phase,maze=null){const zoom=['junction','exit-close'].includes(phase)?1.35:1,[gx,gy]=mazePoint(progress,'player',maze),x=MAZE_X+(gx+.5)*MAZE_CELL,y=MAZE_Y+(gy+.5)*MAZE_CELL,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));return {zoom,x:clamp(x,9+130/zoom,269-130/zoom),y:clamp(y,8+70/zoom,148-70/zoom)};}
function tile(c,index,x,y,size){const hedge=fancyImage('hedge'),garden=fancyPanel('gates',2);if(hedge&&garden){if(index>=4)c.drawImage(hedge,490,700,76,76,Math.round(x),Math.round(y),size,size);else{const [l,t]=garden.source;c.drawImage(garden.image,l+400,t+330,76,76,Math.round(x),Math.round(y),size,size);}return;}const image=images.tiles,w=image.naturalWidth||image.width||1774,h=image.naturalHeight||image.height||887,col=index%4,row=Math.floor(index/4),sx=Math.round(col*w/4),sy=Math.round(row*h/2),right=Math.round((col+1)*w/4),bottom=Math.round((row+1)*h/2);c.drawImage(image,sx,sy,right-sx,bottom-sy,Math.round(x),Math.round(y),size,size);}
// The owner's top-down maze (#30 2026-10-24): one seamless path texture and one
// seamless hedge texture (66px, about three cells each) laid on MAZE_GRID, with
// rims and a soft shadow so the hedges read as raised; sunset and night are tints.
const wallOf=grid=>(x,y)=>x>=0&&y>=0&&y<grid.length&&x<grid[0].length&&grid[y][x]==='#';
function mazeArt(c,x0,y0,cell,theme,grid=MAZE_GRID){
 const mazeWall=wallOf(grid),cols=grid[0].length,rows=grid.length,floor=c.createPattern(images.mazeFloor,'repeat'),hedge=c.createPattern(images.mazeHedge,'repeat'),W=cols*cell,H=rows*cell,walls=[];
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(mazeWall(x,y))walls.push([x,y]);
 c.save();c.translate(x0,y0);c.imageSmoothingEnabled=false;
 c.fillStyle=floor;c.fillRect(0,0,W,H);
 c.fillStyle='rgba(70,45,20,.28)';for(const [x,y] of walls){if(y<rows-1&&!mazeWall(x,y+1))c.fillRect(x*cell,(y+1)*cell,cell,4);if(x<cols-1&&!mazeWall(x+1,y))c.fillRect((x+1)*cell,y*cell,2,cell);}
 c.fillStyle=hedge;for(const [x,y] of walls)c.fillRect(x*cell,y*cell,cell,cell);
 for(const [x,y] of walls){
  c.fillStyle='rgba(255,255,190,.3)';if(!mazeWall(x,y-1))c.fillRect(x*cell,y*cell,cell,2);
  c.fillStyle='rgba(22,62,22,.6)';if(!mazeWall(x,y+1))c.fillRect(x*cell,(y+1)*cell-2,cell,2);if(!mazeWall(x-1,y))c.fillRect(x*cell,y*cell,1,cell);if(!mazeWall(x+1,y))c.fillRect((x+1)*cell-1,y*cell,1,cell);
 }
 const tint=theme==='sunset'?['#f6b27a',.38]:['shrine','stadium'].includes(theme)?['#6a76b4',.7]:null;
 if(tint){c.globalCompositeOperation='multiply';c.globalAlpha=tint[1];c.fillStyle=tint[0];c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over';c.globalAlpha=1;}
 c.restore();
}
// Entrance and exit flags stand in their opening cells (pole at the given share of the width).
function mazeFlag(c,image,pole,x,ground,height,aspect){const w=height*aspect;c.save();c.imageSmoothingEnabled=false;c.drawImage(image,Math.round(x-pole*w),Math.round(ground-height),Math.round(w),height);c.restore();}
// Practice maze for the technique training (owner, #30 B1 2026-10-25): a small hedge maze
// laid like a board on the training ground. The hero walks it alone; no race UI.
export const PRACTICE_MAZE=['###############','#...........#.#','#####.#####.#.#','#...#...#.....#','#.#.#.#.#####.#','..#.#.#...#.#..','###.#####.#.#.#','#.........#...#','###############'];
export const PRACTICE_ROUTE=mazeWander(PRACTICE_MAZE,[0,2]);
// Each practice walks its own route: wrong turns by the hero's きようさ and that day's luck, like the race
// maze; a failed practice always shows a wrong turn. Without a practice, the demo route above.
export function practiceRoute(practice=null){
 if(!practice)return PRACTICE_ROUTE;const opts={ability:practice.ability??50,luck:practice.luck??0,lost:!!practice.lost},key='practice|'+opts.ability+'|'+opts.luck+'|'+opts.lost;
 if(!routeCache.has(key))routeCache.set(key,mazeWander(PRACTICE_MAZE,mazeTurns(PRACTICE_MAZE,opts)));return routeCache.get(key);
}
// Walk one cell per beat; stop and wonder ("？") at each dead end and at every junction
// until the goal is near, then walk straight in.
const timelines=new Map();
function practiceTimeline(R){if(timelines.has(R))return timelines.get(R);const deg=(x,y)=>STEPS.filter(([dx,dy])=>isOpen(PRACTICE_MAZE,x+dx,y+dy)).length,path=mazeSolution(PRACTICE_MAZE),sure=new Set(path.slice(mazeSureFrom(path)).map(p=>p.join())),beats=[];let t=0;
 R.forEach((p,i)=>{const deadEnd=i>0&&i<R.length-1&&R[i-1].join()===R[i+1].join(),junction=deg(...p)>=3&&!sure.has(p.join());const pause=deadEnd?2.2:junction&&i>0?.9:0;beats.push({i,t,pause});t+=pause+(i<R.length-1?1:0);});const out={beats,total:t};timelines.set(R,out);return out;}
export function practicePoint(progress,R=PRACTICE_ROUTE){
 const {beats,total}=practiceTimeline(R),t=Math.max(0,Math.min(1,progress))*total;
 for(let k=0;k<beats.length;k++){const b=beats[k],a=R[b.i];if(t<=b.t+b.pause||k===beats.length-1)return {x:a[0],y:a[1],dx:k?Math.sign(a[0]-R[b.i-1][0]):1,corner:b.pause>0&&t>=b.t};const n=R[b.i+1],u=Math.min(1,t-b.t-b.pause);if(u<1)return {x:a[0]+(n[0]-a[0])*u,y:a[1]+(n[1]-a[1])*u,dx:Math.sign(n[0]-a[0])||(k?Math.sign(a[0]-R[b.i-1][0]):1),corner:false};}
 return {x:R.at(-1)[0],y:R.at(-1)[1],dx:1,corner:false};
}
export function drawPracticeMaze(c,variant,pose,practice=null){
 if(!images.mazeFloor||!images.mazeHedge||typeof c.createPattern!=='function')return false;
 const cell=15,cols=PRACTICE_MAZE[0].length,rows=PRACTICE_MAZE.length,W=cols*cell,H=rows*cell,x0=Math.round(192-W/2),y0=54,{entry,exit}=mazeEnds(PRACTICE_MAZE);
 // a wooden board with a soft shadow, so the maze sits on the ground
 c.save();c.globalAlpha=.25;rect(c,x0-4,y0+H+3,W+12,6,'#3b2533');c.restore();rect(c,x0-5,y0-5,W+10,H+10,'#795367');rect(c,x0-3,y0-3,W+6,H+6,'#b77652');
 mazeArt(c,x0,y0,cell,'day',PRACTICE_MAZE);
 if(images.mazeGateIn&&images.mazeGateOut){mazeFlag(c,images.mazeGateIn,.18,x0+cell*.5,y0+cell*(entry[1]+1)-1,20,58/60);mazeFlag(c,images.mazeGateOut,.3,x0+cell*(exit[0]+.5),y0+cell*(exit[1]+1)-1,20,67/60);}
 // the hero walks the route; a short pause at each corner to look around
const cycle=pose/260,progress=cycle%1.12,p=practicePoint(Math.min(1,progress),practiceRoute(practice)),px=x0+(p.x+.5)*cell,ground=y0+(p.y+.5)*cell+5,h=12,face=p.dx<0?-1:1;
 c.save();if(face<0){c.translate(2*px,0);c.scale(-1,1);}
 drawUnifiedActor(c,{id:'player',variant},px,ground,h,'idle',p.corner||progress>=1?null:{active:true,phase:Math.floor(pose/2),stridePhase:pose/2,bob:0});
 c.restore();
 const say=(t,x,y,color,size)=>{c.save();c.font='900 '+size+'px HamMaru,sans-serif';c.textAlign='center';c.lineJoin='round';c.lineWidth=3;c.strokeStyle='#3b2533';c.strokeText(t,x,y);c.fillStyle=color;c.fillText(t,x,y);c.restore();};
 if(p.corner)say('？',px+8,ground-h-1,'#e8457a',10);
 if(progress>=1)say('ゴール！',px-14,ground-h-3,'#ffd382',10);
 return true;
}
function maze(c,focus,variant,fallback){
 const hero=focus.rows[0],a=zoneActionAt(focus,hero,variant),night=['shrine','stadium'].includes(focus.theme?.id),cell=MAZE_CELL,mapX=MAZE_X,mapY=MAZE_Y,rows=MAZE_GRID.length,cols=MAZE_GRID[0].length,{entry,exit}=mazeEnds(MAZE_GRID);
 rect(c,0,0,384,156,night?'#b5bed3':'#e7efd0');c.save();c.beginPath();c.rect(9,8,260,140);c.clip();
 // Keep every actual entrant in the overview; the separate card supplies the close-up.
 const art=images.mazeFloor&&images.mazeHedge&&typeof c.createPattern==='function';
 if(art)mazeArt(c,mapX,mapY,cell,focus.theme?.id);else for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)tile(c,MAZE_GRID[y][x]==='#'?(night?6:4)+(x+y)%2:night?1:focus.theme?.id==='sunset'?3:0,mapX+x*cell,mapY+y*cell,cell);
 // Display-only route variants use recorded progress. Pauses are recorded stalls; no extra penalty.
 const all=focus.overviewRows||focus.rows,featured=new Set(['player',...all.filter(r=>r.id!=='player').sort((a,b)=>Math.abs(a.progress-hero.progress)-Math.abs(b.progress-hero.progress)).slice(0,7).map(r=>r.id)]);
 for(const row of [...all].reverse()){const [x,y]=mazePoint(row.progress,row.id,row.maze),px=mapX+(x+.5)*cell,py=mapY+(y+.5)*cell+(row.startOrder%3-1)*2;rect(c,px-2,py-2,row.id==='player'?5:3,row.id==='player'?5:3,row.id==='player'?'#ffd382':'#ab6b78');if(featured.has(row.id)){const [nextX]=mazePoint(Math.min(1,row.progress+.001),row.id,row.maze),left=nextX<x;c.save();if(left){c.translate(2*px,0);c.scale(-1,1);}const phase=Math.floor(focus.time*8+row.startOrder),runner={...row,variant:row.id==='player'?variant:row.variant??(row.index||0)%3};if(!drawAnimatedRunner(c,runner,px,py+6,14,{active:!row.stalled&&!row.finished,phase,frame:phase%4,bob:0})){if(isHamster(row))actor(c,focus,row,runner.variant,px,py+6,14);else if(!portrait(c,row,px,py+6,13))fallback(c,row,px,py+6,13,false,0);}c.restore();if(row.stalled)drawConfusion(c,px,py-14,focus.time);if(row.id==='player')rect(c,px-3,py-12,6,2,'#ffd382');}}
 c.restore();
 if(images.mazeGateIn&&images.mazeGateOut){mazeFlag(c,images.mazeGateIn,.18,mapX+cell*.5,mapY+cell*(entry[1]+1)-1,22,58/60);mazeFlag(c,images.mazeGateOut,.3,mapX+cell*(exit[0]+.5),mapY+cell*(exit[1]+1)-1,22,67/60);}else{rect(c,1,68,8,3,'#ffd382');rect(c,269,68,7,3,'#ffd382');}text(c,'入口',10,154,night?'#fff0d2':'#403046',8);text(c,'出口 →',226,154,night?'#fff0d2':'#403046',8);
 rect(c,282,7,96,143,'#fff9ed');if(!drawUnifiedActor(c,{...hero,variant},330,113,44,'idle',null,{expression:hero.finished?'happy':hero.stalled||a.phase==='junction'?'worried':'determined'}))actor(c,focus,hero,variant,330,113,44);if(hero.stalled||a.phase==='junction')drawConfusion(c,330,58,focus.time);text(c,'同時に '+all.length+'匹',287,20,'#795367',8);text(c,hero.finished?'出口に到着！':a.phase==='junction'?'こっちかな？':a.phase==='exit-close'?'出口だ！':'道を見わたそう',287,125,'#795367',8);text(c,Math.floor(hero.progress*100)+'%  / '+hero.rank+'位',290,137,'#403046',9);meter(c,hero,289,143,82,true);
}
export function drawCheckpointStage(c,focus,variant=0,fallback=()=>{}){if(!images.eating||!images.study||!images.maze||!images.tiles||!images.sets||!images.night||!images.zodiac)return false;c.save();c.imageSmoothingEnabled=false;c.beginPath();c.rect(0,0,384,156);c.clip();if(focus.id==='maze')maze(c,focus,variant,fallback);else if(focus.id==='eating')drawBanquetCheckpoint(c,focus,variant,(ctx,row,x,y,h,run,pose,action)=>isHamster(row)?actor(ctx,focus,row,row.id==='player'?variant:row.variant??(row.index||0)%3,x,y,h):fallback(ctx,row,x,y,h,run,pose,action),heldSeed);else drawBanquetCheckpoint(c,focus,variant,(ctx,row,x,y,h,run,pose,action)=>run||!drawVisualNPC(ctx,row.species,x,y,h)?fallback(ctx,row,x,y,h,run,pose,action):true,null,{study:{background:studyBackdrop,paper:studyPaper}});c.restore();return true;}
