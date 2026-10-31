import {heroSheet} from './hero-colors.js';
import {SLEEP_BOXES} from './sleep-boxes.js';let image,loading;
export function loadSleepArt(){if(typeof Image==='undefined')return Promise.resolve(false);return loading||=new Promise(resolve=>{const i=new Image();i.onload=()=>{image=i;resolve(true);};i.onerror=()=>resolve(false);i.src=new URL(heroSheet('./assets/polish-v25/sleep-v25.png'),import.meta.url).href;});}
export function drawSleepingHamster(c,variant=0,time=0){if(!image)return false;const [l,t,r,b]=SLEEP_BOXES[Math.floor(time/12)%2][variant%3],width=115,height=width*(b-t)/(r-l);c.save();c.imageSmoothingEnabled=false;c.drawImage(image,l,t,r-l,b-t,194-width/2,190-height,width,height);c.restore();return true;}
