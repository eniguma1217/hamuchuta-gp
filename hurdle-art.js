// Dedicated original pixel prop, not the old single vertical striped pole.
let image,pending;
export function loadHurdleArt(){if(typeof Image==='undefined')return Promise.resolve(false);return pending||=new Promise(resolve=>{const i=new Image();i.onload=()=>{image=i;resolve(true);};i.onerror=()=>resolve(false);i.src=new URL('./assets/race-props-v10/low-hurdle-v10.png',import.meta.url).href;});}
export const HURDLE_SOURCE=Object.freeze([219,232,1194,686]);
export function drawHurdle(c,x,ground,width=36){if(!image)return false;const height=width*HURDLE_SOURCE[3]/HURDLE_SOURCE[2];c.save();c.imageSmoothingEnabled=false;c.drawImage(image,...HURDLE_SOURCE,Math.round(x-width/2),Math.round(ground-height),width,height);c.restore();return true;}
