// Start grid (#30 D4): five abreast across the track, lines one behind another.
// The drawn offset fades out over the opening seconds, so the display returns to
// the recorded distances. Display only: recorded distance, rank, clock and RNG stay intact.
import {COURSE_PIXELS,STEADY_RACE_ZOOM} from './race-projection.js';
export const START_LANES=5;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export function startSlot(row){const order=Math.max(0,row.startOrder??row.index??0);return {line:Math.floor(order/START_LANES),lane:order%START_LANES};}
// Screen pixels between lines at the steady race zoom.
export function startLineSpacing(count){return count>=26?30:34;}
// 0 at the gun, 1 once the field has had time to spread out (8-18 s).
export function startGridFade(time,duration){const u=clamp(time/clamp(duration*.12,8,18));return u*u*(3-2*u);}
// Course-distance offset that places a runner on its start line; never positive,
// and it only shrinks, so a runner's drawn position never moves backwards.
// Each line stands straight across the track (owner choice A: five in a column).
export function startOffset(row,count,time,duration){
 const {line}=startSlot(row);if(!line)return 0;
 return -line*startLineSpacing(count)/(COURSE_PIXELS*STEADY_RACE_ZOOM)*(1-startGridFade(time,duration));
}
export function displayDistance(row,live){return row.distance+startOffset(row,live.entrants??live.standings.length,live.time,live.duration);}
