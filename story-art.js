import {drawCastExpression} from './cast-expressions.js';
import {drawFancyPortrait} from './fancy-portrait-art.js';
import {drawFancySpecies} from './fancy-species-art.js';
import {drawUnifiedActor,conversationPose} from './unified-art.js';
import {drawHamsterCharacter} from './hamster-character-art.js';
// Measured transparent bounds, with padding. Display only.
const boxes={"trainer": {"neutral": [50, 71, 227, 237], "delighted": [50, 335, 227, 236], "worried": [50, 595, 227, 238]}, "rival": {"neutral": [316, 70, 240, 238], "delighted": [316, 332, 240, 239], "worried": [316, 595, 240, 238]}, "child": {"neutral": [616, 111, 205, 200], "delighted": [616, 375, 206, 199], "worried": [616, 637, 205, 199]}, "seed_shop": {"neutral": [868, 61, 238, 250], "delighted": [868, 327, 238, 247], "worried": [868, 587, 238, 249]}, "tanuki": {"neutral": [1153, 72, 251, 239], "delighted": [1153, 337, 251, 237], "worried": [1153, 598, 251, 238]}, "beaver": {"neutral": [1446, 75, 281, 236], "delighted": [1446, 338, 281, 236], "worried": [1446, 598, 281, 238]}, "ox": {"neutral": [83, 95, 371, 355]}, "snake": {"neutral": [547, 161, 310, 291]}, "horse": {"neutral": [895, 76, 379, 381]}, "sheep": {"neutral": [1345, 155, 361, 297]}, "monkey": {"neutral": [61, 496, 409, 321]}, "rooster": {"neutral": [491, 481, 355, 343]}, "dog": {"neutral": [909, 514, 359, 305]}, "boar": {"neutral": [1323, 499, 396, 319]}};
const images={};let loading;
export function loadStoryArt(){if(typeof Image==='undefined')return Promise.resolve(false);return loading||=Promise.all([['town','./assets/story-v5/town-cast-v5.png'],['zodiac','./assets/story-v5/zodiac-champions-v5.png']].map(([id,url])=>new Promise(resolve=>{const i=new Image();i.onload=()=>{images[id]=i;resolve(true);};i.onerror=()=>resolve(false);i.src=new URL(url,import.meta.url).href;}))).then(x=>x.every(Boolean));}
export function drawStoryActor(c,id,x,ground,height,expression='normal'){
 if(drawCastExpression(c,{id},x,ground,height,expression))return true;
 if(drawFancyPortrait(c,id,x,ground,height,expression))return true;
 if(drawFancySpecies(c,{id},x,ground,height))return true;
 if(drawUnifiedActor(c,{id},x,ground,height,conversationPose(expression)))return true;
 if(drawHamsterCharacter(c,id,x,ground,height,expression))return true;
 id=({seedshop:'seed_shop',friend:'child',ウシ:'ox',ヘビ:'snake',ウマ:'horse',ヒツジ:'sheep',サル:'monkey',ニワトリ:'rooster',イヌ:'dog',イノシシ:'boar'})[id]||id;
 const poses=boxes[id],image=images[['trainer','rival','child','seed_shop','tanuki','beaver'].includes(id)?'town':'zodiac'];if(!poses||!image)return false;
 const emotion=['happy','joy','delighted'].includes(expression)?'delighted':['sad','worried','surprised'].includes(expression)?'worried':'neutral',b=poses[emotion]||poses.neutral||Object.values(poses)[0],w=Math.round(height*b[2]/b[3]);
 c.save();c.imageSmoothingEnabled=false;c.drawImage(image,...b,Math.round(x-w/2),Math.round(ground-height),w,height);c.restore();return true;
}
