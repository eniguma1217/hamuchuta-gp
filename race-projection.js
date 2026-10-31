// A wider *drawn* course makes the ground travel at a believable running pace.
// Every runner, hurdle and finish uses this same mapping; ranking stays saved.
export const COURSE_PIXELS=9000;
export const STRIDE_BODY_RATIO=.80;
export function projectRaceX(distance,cameraDistance,center=179,zoom=1){return center+(distance-cameraDistance)*COURSE_PIXELS*zoom;}
// Steady broadcast camera (#30 D3/D5): one zoom and one actor size for the whole race.
export const STEADY_RACE_ZOOM=.36,STEADY_ACTOR_SCALE=.84;
export const JUMP_HALF_PIXELS=56;
export function jumpHalfDistance(){return JUMP_HALF_PIXELS/COURSE_PIXELS;}
export function jumpArc(phase,height=32){if(phase<=0||phase>=1)return 0;return Math.pow(Math.sin(phase*Math.PI),.65)*height*.8125;}
export function gaitCadence(speed,height=32,dash=false){const normal=Math.max(4,Math.min(18,Math.max(0,speed)*COURSE_PIXELS/(height*STRIDE_BODY_RATIO)*4));return normal*(dash?1.18:1);}
