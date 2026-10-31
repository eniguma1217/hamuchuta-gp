import {FANCY_PORTRAITS} from './fancy-portrait-boxes.js';
import {SPECIES_ALIASES} from './fancy-species-art.js';
import {loadOwnerZodiac,drawOwnerZodiacTalk} from './zodiac-owner-art.js';
const images={};let pending;
export function loadFancyPortraits(){if(typeof Image==='undefined')return Promise.resolve(false);return pending||=Promise.all([loadOwnerZodiac(),...[0,1,2].map(n=>new Promise(resolve=>{const image=new Image();image.onload=()=>{images[n]=image;resolve(true);};image.onerror=()=>resolve(false);image.src=new URL('./assets/fancy-v15/emotions-'+n+'-v15.png',import.meta.url).href;}))]).then(r=>r.every(Boolean));}
export function drawFancyPortrait(c,id,x,ground,height,expression='normal'){
 // The owner's zodiac and rival cat: full-body poses chosen by expression (#30 I3/I4).
 if(drawOwnerZodiacTalk(c,id,x,ground,height,expression))return true;
 const d=FANCY_PORTRAITS[SPECIES_ALIASES[id]||({seedshop:'seed_shop'})[id]||id];if(!d||!images[d.sheet])return false;
 const frame=['happy','joy','delighted'].includes(expression)?1:['worried','sad','surprised'].includes(expression)?2:['determined','serious'].includes(expression)?3:0,[l,t,r,b]=d.boxes[frame],ref=d.boxes[0],scale=height/(ref[3]-ref[1]),guard=4,w=(r-l+8)*scale,h=(b-t+8)*scale;
 c.save();c.imageSmoothingEnabled=false;c.drawImage(images[d.sheet],l-guard,t-guard,r-l+8,b-t+8,Math.round(x-w/2),Math.round(ground-(b-t+guard)*scale),w,h);c.restore();return true;
}
