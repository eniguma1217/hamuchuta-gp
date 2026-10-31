// Traffic-light heroes (#30, owner 2026-10-26 「主人公の色を信号機に」): もちまる soft red, ダッシュ blue-grey
// with a navy bandana, はかせ cream yellow; natural, not too vivid (owner picks, option A each).
// These rules paint recoloured copies of the hero sheets once (scripts/build-signal-heroes.mjs); the game
// loads the copies from assets/signal-v62/ and the owner's original sheets stay untouched.
// Only the fur's own hue/lightness band moves: outlines, eyes, whites, pinks, straw, seeds and props keep
// their colours. The cream belly, muzzle and paws stay cream for all three, so ダッシュ is blue above and cream
// below like the others (owner 2026-10-26 「ダッシュの上半分はそのままで下半分はもち丸とかと色合わせて」).
export const HERO_COLORS=Object.freeze([
 {id:'mochi',name:'もちまる',color:'やわらかい赤',from:'orange',hue:4,sat:.62,light:-.06},
 {id:'dash',name:'ダッシュ',color:'青い灰色',from:'orange',hue:212,sat:.34,bandana:{hue:222,sat:.5,dark:.72}},
 {id:'hakase',name:'はかせ',color:'クリーム黄',from:'beige',hue:43,sat:.68}
]);
export const SIGNAL_DIR='signal-v62';
// The sheets painted in the hero colours (paths under assets/). Loaders pass their path through heroSheet().
export const SIGNAL_SHEETS=Object.freeze(['owner-v51/home/mochi.png','owner-v51/home/dash.png','owner-v51/home/hakase.png','owner-v38/run/mochi.png','owner-v38/run/dash.png','owner-v38/run/hakase.png','polish-v25/heroes-v25.png','polish-v25/hero-rig-v25.png','polish-v25/cast-expressions-v25.png','polish-v25/sleep-v25.png','hero-running-safe-48-20261020.png','hero-portraits-cropfix-20261020.png','title-v22/zodiac-challenge-v22.png']);
export const heroSheet=path=>{const rel=path.replace(/^\.\/assets\//,'');return SIGNAL_SHEETS.includes(rel)?`./assets/${SIGNAL_DIR}/${rel}`:path;};

export function hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;}return [h,s,l];}
export function rgb(h,s,l){h=(((h%360)+360)%360)/360;const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return l-a*Math.max(-1,Math.min(k-3,9-k,1));};return [Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255)];}
const clamp=x=>Math.max(0,Math.min(1,x));
// What a pixel of this hero's sheet is: 'fur' or null (keep). The bandana is found by bandanaMask().
export function pixelKind(rule,h,s,l){
 if(rule.from==='orange'){const [lo,hi]=rule.furHue||[14,38],[dark,light]=rule.furLight||[.55,.82];return h>=lo&&h<=hi&&s>=.45&&l>=dark&&l<=light?'fur':null;}
 return rule.from==='beige'&&h>=6&&h<=30&&s>=.2&&s<=.75&&l>=.58&&l<=.88?'fur':null;
}
export function recolorPixel(rule,r,g,b){
 const [h,s,l]=hsl(r,g,b);return pixelKind(rule,h,s,l)?furColor(rule,s,l):null;
}
function furColor(rule,s,l){
 const ns=rule.from==='beige'?rule.sat*(.75+.25*Math.min(1,s/.5)):rule.sat*(.6+.4*s),nl=l+(rule.light||0)*(1-Math.abs(l-.7)*2);
 // Yellow shadows lean warm (golden), so the darker fur never turns khaki.
 const hue=rule.from==='beige'?rule.hue-Math.max(0,.8-l)*55:rule.hue;
 return rgb(hue,clamp(ns),clamp(nl));
}
export const bandanaRed=(h,s,l)=>(h<=12||h>=345)&&s>=.55&&l>=.25&&l<=.62;
export const navy=(rule,r,g,b)=>rgb(rule.bandana.hue,rule.bandana.sat,hsl(r,g,b)[2]*rule.bandana.dark);
const N8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
// ダッシュ's bandana inside [l,t,r,b]: 1 for each bandana pixel, 2 for red fur shading (indexed y*width+x).
// Red patches are grouped. The bandana's patches are vivid (mean saturation .75 or more): big ones (50 pixels
// or more) are not crimson, small ones are dark (a corner peeping between the paws). An open mouth (crimson,
// or small, vivid and lighter) and the inner ears (paler, mean saturation below .75) keep their colours, and
// so do the small dark rims of the ears. A paler red patch ringed by orange (three quarters of
// its non-outline neighbours; an inner ear is ringed by pink) is the fur's own shading and is painted as fur. sortReds:false counts every red
// patch as the bandana, for tiny sprites. The bandana then grows into the softer and darker reds touching it
// (its shading, its dark tips and the dithered dots of small sprites); the plum outline stops it.
export function bandanaMask(data,width,box,keep=null,rule={}){
 const [l0,t0,r0,b0]=box,height=data.length/4/width,mask=new Uint8Array(width*height),other=new Uint8Array(width*height),seen=new Uint8Array(width*height);
 const ok=(x,y)=>x>=Math.max(0,l0)&&y>=Math.max(0,t0)&&x<Math.min(width,r0)&&y<Math.min(height,b0)&&data[(y*width+x)*4+3]>=10&&(!keep||keep(x,y));
 const hslAt=k=>hsl(data[k*4],data[k*4+1],data[k*4+2]),red=k=>bandanaRed(...hslAt(k)),sortReds=rule.sortReds!==false;
 for(let y=Math.max(0,t0);y<Math.min(height,b0);y++)for(let x=Math.max(0,l0);x<Math.min(width,r0);x++){const k=y*width+x;if(seen[k]||!ok(x,y)||!red(k))continue;
  const patch=[],stack=[k];seen[k]=1;
  while(stack.length){const q=stack.pop(),qx=q%width,qy=(q-qx)/width;patch.push(q);for(const [dx,dy] of N8){const nx=qx+dx,ny=qy+dy,n=ny*width+nx;if(ok(nx,ny)&&!seen[n]&&red(n)){seen[n]=1;stack.push(n);}}}
  let mh=0,ms=0,ml=0;for(const q of patch){const [h,s,lt]=hslAt(q);mh+=h>180?h-360:h;ms+=s;ml+=lt;}mh/=patch.length;ms/=patch.length;ml/=patch.length;
  const small=patch.length<50,bandana=!sortReds||ms>=.75&&(small?ml<.42:mh>=-10),mouth=!bandana&&(mh<-10&&ml>=.4||small&&ms>=.75);let kind=bandana?1:0;
  if(!bandana&&!mouth){let fur=0,rest=0;const inPatch=new Set(patch);
   for(const q of patch){const qx=q%width,qy=(q-qx)/width;for(const [dx,dy] of N8){const nx=qx+dx,ny=qy+dy,n=ny*width+nx;if(!ok(nx,ny)||inPatch.has(n))continue;const [h,s,lt]=hslAt(n);if(lt<.3||red(n))continue;if(h>=3&&h<=40&&s>=.45&&lt<=.82)fur++;else rest++;}}
   if(fur>=3*rest&&fur>0)kind=2;}
  if(kind)for(const q of patch)mask[q]=kind;else if(mouth||ms<.75&&ml>=.45)for(const q of patch)other[q]=1;}
 const stack=[];for(let k=0;k<mask.length;k++)if(mask[k]===1)stack.push(k);
 while(stack.length){const q=stack.pop(),qx=q%width,qy=(q-qx)/width;for(const [dx,dy] of N8){const nx=qx+dx,ny=qy+dy,n=ny*width+nx;if(!ok(nx,ny)||mask[n]||other[n])continue;
  const [h,s,lt]=hslAt(n);if((h<=15||h>=335)&&(s>=.38&&lt>=.3&&lt<=.62||s>=.5&&lt>=.24&&lt<.3)){mask[n]=1;stack.push(n);}}}
 return mask;
}
// Recolour RGBA pixels in place inside [l,t,r,b] (sheet coordinates) for one hero; keep(x,y) can limit it further.
// A hero with a bandana rule also turns its bandana (bandanaMask, or the given mask) navy and its red fur
// shading into fur.
export function recolorRegion(data,width,box,rule,keep=null,{mask=null}={}){
 const [l,t,r,b]=box;let changed=0;
 if(rule.bandana&&!mask)mask=bandanaMask(data,width,box,keep,rule);
 for(let y=Math.max(0,t);y<b;y++)for(let x=Math.max(0,l);x<Math.min(width,r);x++){const k=y*width+x,i=k*4;if(data[i+3]<10)continue;
  const m=mask?.[k],c=m===1?navy(rule,data[i],data[i+1],data[i+2]):m===2?furColor(rule,...hsl(data[i],data[i+1],data[i+2]).slice(1)):keep&&!keep(x,y)?null:recolorPixel(rule,data[i],data[i+1],data[i+2]);
  if(c){data[i]=c[0];data[i+1]=c[1];data[i+2]=c[2];changed++;}}
 return changed;
}
