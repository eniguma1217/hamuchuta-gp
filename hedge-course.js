// ONE complete, perspective-specific PNG; no stacked shrubs or green fallback.
// The owner's hedge (2026-10-24, docs/references/owner-supplied-20261024/hedge).
import {fancyImage} from './fancy-backgrounds.js';
export const HEDGE_BACK=124,HEDGE_FRONT=176,HEDGE_STEP=52;
// Where the hedge's base meets the front and back lanes in the PNG (measured from
// its lower outline): the hedge is scaled so these two points span the five lanes.
const HEDGE_BASE_FRONT=[296,1971],HEDGE_BASE_BACK=[739,880];
const SCALE=HEDGE_STEP/(HEDGE_BASE_FRONT[1]-HEDGE_BASE_BACK[1]),SPAN=HEDGE_BASE_BACK[0]-HEDGE_BASE_FRONT[0];
export function loadHedgeArt(){return Promise.resolve(true);}
export function hedgeXAt(worldX,ground){return worldX+(160-ground)*SPAN*SCALE/HEDGE_STEP;}
// Opaque hedge height above the ground at the column a runner of that depth
// crosses, measured from hedge-v34.png as hedgeSlices draws it: [ground, px].
// Jumps peak just above this (#30 D5; owner kept this rule with the new art, #30 D9).
export const HEDGE_PROFILE=Object.freeze([[124,16.2],[124.9,18.3],[127.3,21.2],[129.8,23.6],[132.2,26],[134.6,29.2],[137.1,31.7],[139.6,34.6],[142,37.6],[144.4,40.4],[146.8,42.8],[149.3,43.9],[151.7,45.8],[154.1,46.8],[156.6,46.2],[159,47.3],[161.4,47.8],[163.9,46.2],[166.3,47.3],[168.8,45.9],[171.2,47.8],[173.6,47.1],[176,46.6]]);
export function hedgeClearance(ground){return interpolate(HEDGE_PROFILE,ground);}
// Middle of the hedge as drawn at a runner's body height (rows ground-20..ground-2),
// per lane, measured from hedge-v34.png at worldX=0: [ground, x].
export const HEDGE_MIDDLE=Object.freeze([[124,7],[128,6],[132,5],[136,4.5],[140,3.5],[144,1.5],[148,.5],[152,-1],[156,-2.5],[160,-4],[164,-5],[168,-5.5],[172,-6],[176,-7]]);
function interpolate(t,ground){const g=Math.max(t[0][0],Math.min(t.at(-1)[0],ground));let i=1;while(i<t.length-1&&t[i][0]<g)i++;const [g0,v0]=t[i-1],[g1,v1]=t[i];return v0+(v1-v0)*(g-g0)/(g1-g0);}
export function hedgeMiddleAt(worldX,ground){return worldX+interpolate(HEDGE_MIDDLE,ground);}
// Where a runner is highest: a quarter body before the hedge's middle (owner, #30 2026-10-24).
export function hedgeLeapX(worldX,ground,height){return hedgeMiddleAt(worldX,ground)-height*.25;}
export function hedgeSlices(worldX,zoom=1){
 const [sx,sy,sw,sh]=HEDGE_SOURCE,width=Math.round(sw*SCALE),scale=width/sw,anchorX=HEDGE_BASE_FRONT[0]+SPAN*(HEDGE_FRONT-160)/HEDGE_STEP,left=Math.round(worldX-(anchorX-sx)*scale),top=Math.round(HEDGE_FRONT-(HEDGE_BASE_FRONT[1]-sy)*scale);
 // Disjoint source columns assemble the SAME complete PNG once. Each column
 // is depth-sorted with the animals, so a far leaf cannot cover a near jumper.
 return Array.from({length:width},(_,i)=>{const from=sx+Math.round(i*sw/width),to=sx+Math.round((i+1)*sw/width),mid=(from+to)/2,ground=Math.max(HEDGE_BACK,Math.min(HEDGE_FRONT,HEDGE_FRONT-(mid-HEDGE_BASE_FRONT[0])*HEDGE_STEP/SPAN));return {kind:'hedge',ground,worldX,zoom,x:left+i,source:[from,sy,to-from,sh],destination:[left+i,top,1,sh*scale]};});
}
// Opaque bounds of hedge-v34.png (789x1994).
export const HEDGE_SOURCE=Object.freeze([57,469,726,1503]);
export function drawHedgeSlice(c,part){const image=fancyImage('raceHedge');if(!image)return false;c.save();c.imageSmoothingEnabled=false;c.drawImage(image,...part.source,...part.destination);c.restore();return true;}
