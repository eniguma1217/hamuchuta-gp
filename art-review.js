// Opt-in art proof. No save, race, stat or gameplay state is stored here.
let enabled=typeof location!=='undefined'&&new URLSearchParams(location.search).get('art')==='v2';
export const setArtReviewMode=value=>{enabled=!!value;};
export const artReviewEnabled=()=>enabled;
const images={};let pending;
export const HERO_REVIEW_BOXES=[[[87,136,316,356],[430,135,658,356],[786,135,1015,356]],[[81,489,331,693],[425,483,679,693],[780,483,1030,693]],[[76,804,316,1019],[429,804,663,1018],[785,804,1019,1018]],[[77,1115,313,1332],[426,1115,660,1332],[777,1115,1014,1332]]];
export const ZODIAC_REVIEW_BOXES=[[99,255,302,363],[433,226,629,366],[783,247,988,367],[1190,206,1331,365],[87,502,315,649],[452,521,641,639],[787,504,991,645],[1172,519,1339,642],[99,805,277,932],[452,775,636,934],[803,792,984,929],[1174,795,1359,929]];
export const VENUE_BOXES=[[0,0,836,470],[836,0,1672,470],[0,470,836,941],[836,470,1672,941]];
export const SET_BOXES=[[0,0,1086,469],[0,469,1086,941],[0,941,1086,1448]];
const zodiac=['ネズミ','ウシ','トラ','ウサギ','タツ','ヘビ','ウマ','ヒツジ','サル','ニワトリ','イヌ','イノシシ'],aliases={rat:'ネズミ',tiger:'トラ',rabbit:'ウサギ',dragon:'タツ'};
export function loadReviewArt(){
 if(!enabled||typeof Image==='undefined')return Promise.resolve(true);if(pending)return pending;
 const files={hero:'hero-actions-v2.png',zodiac:'zodiac-runners-v2.png',venue:'race-venues-v2.png',sets:'checkpoint-sets-v2.png'};
 pending=Promise.all(Object.entries(files).map(([id,name])=>new Promise(resolve=>{const image=new Image();image.onload=()=>{images[id]=image;resolve(true);};image.onerror=()=>resolve(false);image.src=new URL('./assets/art-review-v2/'+name,import.meta.url).href;}))).then(r=>r.every(Boolean));return pending;
}
export function spritePlacement(box,x,ground,height,padding=8){const [l,t,r,b]=box,sw=r-l+padding*2,sh=b-t+padding*2,dh=Math.round(sh*height/(b-t)),dw=Math.round(sw*dh/sh),dy=ground-Math.round((b-t+padding)*dh/sh);return {source:[l-padding,t-padding,sw,sh],destination:[Math.round(x-dw/2),dy,dw,dh],visibleFeet:ground};}
export function drawReviewActor(c,row,x,ground,height,running,pose,action={}){
 if(!enabled)return null;const hamster=['hamster','ハムスター'].includes(row.species),species=aliases[row.species||row.id]||row.species,index=zodiac.indexOf(species);let image,box;
 if(hamster&&images.hero){image=images.hero;const v=row.variant??0,a=action.action==='eat'?2:action.action==='study'?3:running?1:0;box=HERO_REVIEW_BOXES[a][v%3];}
 else if(index>=0&&images.zodiac){image=images.zodiac;box=ZODIAC_REVIEW_BOXES[index];}else return null;
 const placement=spritePlacement(box,x,ground,height);c.save();c.imageSmoothingEnabled=false;c.drawImage(image,...placement.source,...placement.destination);c.restore();return {placement,box,hamster};
}
function cover(c,image,box,x,y,w,h){const [sx,sy,sw,sh]=box,scale=Math.max(w/sw,h/sh),cw=w/scale,ch=h/scale;c.drawImage(image,sx+(sw-cw)/2,sy+(sh-ch)/2,cw,ch,x,y,w,h);}
export function drawReviewVenue(c,theme,cameraPixels=0){
 if(!enabled||!images.venue)return false;const i=Math.max(0,['day','sunset','stadium','shrine'].indexOf(theme.id)),[l,t,r,b]=VENUE_BOXES[i];c.save();c.imageSmoothingEnabled=false;cover(c,images.venue,[l,t,r-l,b-t],0,0,384,216);c.restore();return true;
}
export function drawReviewSet(c,focus){
 if(!enabled||!images.sets)return false;const i=['eating','study','maze'].indexOf(focus.id);if(i<0)return false;const [l,t,r,b]=SET_BOXES[i];c.save();c.imageSmoothingEnabled=false;
 // Equal-aspect viewport. Solo keeps the left real seat instead of an empty rival chair.
 const solo=focus.rows.length===1&&i<2;cover(c,images.sets,[l,t,solo?(r-l)/2:r-l,b-t],0,0,384,174);c.restore();return true;
}
// Positions measured from the generated set, projected with the same uniform crop.
export function reviewDeskLayout(focus,index){
 const food=focus.id==='eating',solo=focus.rows.length===1,[l,t,r,b]=SET_BOXES[food?0:1],sw=solo?(r-l)/2:r-l,sh=b-t,scale=Math.max(384/sw,174/sh),cropY=(sh-174/scale)/2;
 const plateX=(index===0?(food?301:305):(food?784:779))*scale,plateY=((food?292:285)-cropY)*scale;
 return {plateX,plateY,ground:plateY+7,actorX:plateX-(solo?32:24),height:solo?78:58};
}
export function drawReviewTableFront(c,focus,slot,plateY){
 c.save();c.beginPath();c.rect(slot.x,plateY-6,slot.w,174-plateY+6);c.clip();drawReviewSet(c,focus);c.restore();
}
