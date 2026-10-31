import {FANCY_SPECIES,FANCY_SPECIES_SILHOUETTES} from './fancy-species-boxes.js';
import {isolateSilhouette,CAST_RUN_GUARD} from './cast-run-art.js';
import {loadOwnerZodiac,ownerZodiac,ownerRacePose,ownerZodiacPlacement,drawOwnerZodiacPlacement} from './zodiac-owner-art.js';
const images={},frames={};let pending;
export const SPECIES_ALIASES={rat:'ネズミ',ox:'ウシ',tiger:'トラ',rabbit:'ウサギ',dragon:'タツ',snake:'ヘビ',horse:'ウマ',sheep:'ヒツジ',monkey:'サル',rooster:'ニワトリ',dog:'イヌ',boar:'イノシシ',tanuki:'タヌキ',beaver:'ビーバー',cat:'ネコ'};
export function loadFancySpecies(){if(typeof Image==='undefined')return Promise.resolve(false);return pending||=Promise.all([loadOwnerZodiac(),...Array.from({length:7},(_,n)=>new Promise(resolve=>{const i=new Image();i.onload=()=>{images[n]=i;cutFrames(n,i);resolve(true);};i.onerror=()=>resolve(false);i.src=new URL('./assets/fancy-v15/species-'+n+'-v15.png',import.meta.url).href;}))]).then(r=>r.every(Boolean));}
// Each frame masked to its own silhouette (no slivers of neighbouring animals).
function cutFrames(n,image){if(typeof document==='undefined')return;for(const [name,d] of Object.entries(FANCY_SPECIES))if(d.sheet===n)frames[name]=FANCY_SPECIES_SILHOUETTES[name].map((box,f)=>isolateSilhouette(image,box,`species:${name}:${f}`,d.boxes[f],true));}
export function speciesPlacement(row,x,ground,height,motion=null){
 const name=SPECIES_ALIASES[row.species||row.id]||row.species||row.id,owner=ownerZodiac(name);
 // The owner's zodiac and rival-cat art takes over these species (#30 I3/I4).
 if(owner)return {...ownerZodiacPlacement(owner,ownerRacePose(motion),x,ground,height,{bob:motion?.bob||0}),name};
 const d=FANCY_SPECIES[name];if(!d)return null;
 const frame=motion?.active?motion.jump||motion.frame===5?5:1+(((motion.phase??0)%4+4)%4):0;
 // Whole silhouette; the size still comes from the old idle box.
 const [l,t,r,b]=FANCY_SPECIES_SILHOUETTES[name][frame],idle=d.boxes[0],scale=height/(idle[3]-idle[1]),p=Math.min(CAST_RUN_GUARD,l,t,1254-r,1254-b),w=(r-l+2*p)*scale,h=(b-t+2*p)*scale;
 return {sheet:d.sheet,name,frame,source:[l-p,t-p,r-l+2*p,b-t+2*p],destination:[Math.round(x-w/2),Math.round(ground-(b-t+p)*scale-(motion?.bob||0)),w,h],feet:ground};
}
export function drawFancySpecies(c,row,x,ground,height,motion=null){const p=speciesPlacement(row,x,ground,height,motion);if(p?.owner)return drawOwnerZodiacPlacement(c,p)&&{placement:p,animated:!!motion?.active};if(!p||!images[p.sheet])return false;const cut=frames[p.name]?.[p.frame];c.save();c.imageSmoothingEnabled=false;if(cut){const o=CAST_RUN_GUARD-(p.source[2]-(FANCY_SPECIES_SILHOUETTES[p.name][p.frame][2]-FANCY_SPECIES_SILHOUETTES[p.name][p.frame][0]))/2;c.drawImage(cut,o,o,p.source[2],p.source[3],...p.destination);}else c.drawImage(images[p.sheet],...p.source,...p.destination);c.restore();return {placement:p,animated:!!motion?.active};}
