// One linear mapping for runners, hedges, shrine gates and the finish, so the
// course flows past at a constant pace. The former "broadcast lens" spread near
// ties by up to ~200px and shifted a hedge each time a runner crossed it, which
// made hedges and the camera jump backwards (#30 D3/D5). Recorded distance/rank,
// the full-field tracker and all race data stay untouched.
import {COURSE_PIXELS} from './race-projection.js';
export function fieldProjector(live,cameraDistance=live.player.distance,zoom=1,center=179){
 return d=>center+(d-cameraDistance)*COURSE_PIXELS*zoom;
}
