import {heroSheet} from './hero-colors.js';
// Four independent painted limbs. Display only; no RNG, clocks or save changes.
import {RIG_BOXES,RIG_HULLS} from './quadruped-boxes.js';const images={};let loading;
export function loadQuadrupedRig(){if(typeof Image==='undefined')return Promise.resolve(false);return loading||=Promise.all(Object.keys(RIG_BOXES).map(key=>new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve(true);};im.onerror=()=>resolve(false);im.src=new URL(heroSheet('./assets/polish-v25/'+(key==='heroes'?'hero':'friend')+'-rig-v25.png'),import.meta.url).href;}))).then(r=>r.every(Boolean));}
export function quadrupedFrame(phase=0,jump=false){
 // Short alternating four-paw stride; the head and approved body PNG stay unchanged.
 const t=phase*Math.PI/2;
 return [0,1,2,3].map(i=>{const a=t+[0,Math.PI,Math.PI,0][i],front=i<2;
  return {front,far:i%2===1,angle:jump?(front?-.72:.72):Math.sin(a)*.60,lift:jump?.21:Math.max(0,Math.cos(a))*.085,reach:0};
 });
}
// Shoulder/hip anchors stay INSIDE the silhouette, not under the nose/tail.
// Solve limb length from the rotated opaque hull: a planted paw touches the
// ground throughout body bob; a lifted paw cannot penetrate it. No moving hip.
export function quadrupedPlacement(design,height,phase=0,jump=false){
 const parts=RIG_BOXES[design.sheet]?.[design.index],hulls=RIG_HULLS[design.sheet]?.[design.index];
 if(!parts)return null;
 const h=height*(design.scale||1),bodyH=h*.85,bodyW=(parts[0][2]-parts[0][0])*bodyH/(parts[0][3]-parts[0][1]),bob=jump?0:Math.abs(Math.sin(phase*Math.PI/2))*h*.012,base=-bob;
 const limbs=quadrupedFrame(phase,jump).map((a,i)=>{
  // Root stays inside the painted torso; only the short paw tip shows below the belly.
  const box=parts[i+1],aspect=(box[2]-box[0])/(box[3]-box[1]),hipX=(a.front?.19:-.23)*bodyW+(a.far?.018:-.014)*h,hipY=base-h*(jump?.34:.17),target=-a.lift*h;
  const support=Math.max(...hulls[i+1].map(([u,v])=>Math.sin(a.angle)*(u-.5)*aspect+Math.cos(a.angle)*(v-.16)));
  const length=(target-hipY)/support;
  return {...a,source:box,hipX,hipY,length,width:length*aspect,footY:target};
 });
 // Lower belly removes the dangling/stilt-leg silhouette seen in the real race.
 return {h,bodyH,bodyW,base,bodyBottom:base-h*.085,limbs};
}
export function drawQuadrupedRig(c,design,x,ground,height,motion={}){
 const im=images[design.sheet],parts=RIG_BOXES[design.sheet]?.[design.index];if(!im||!parts)return false;
 const cycle=Number.isFinite(motion.stridePhase)?motion.stridePhase:Number.isFinite(motion.phase)?motion.phase:motion.frame||0,p=quadrupedPlacement(design,height,cycle,!!motion.jump),{h,bodyH,bodyW}=p,base=ground+p.base;
 const draw=(box,xx,yy,hh)=>{const [l,t,r,b]=box;c.drawImage(im,l,t,r-l,b-t,xx-(r-l)*hh/(b-t)/2,yy-hh,(r-l)*hh/(b-t),hh);};
 const leg=i=>{const a=p.limbs[i];c.save();c.translate(x+a.hipX,ground+a.hipY);c.rotate(a.angle);draw(a.source,0,a.length*.84,a.length);c.restore();};
 c.save();c.imageSmoothingEnabled=false;
 // The painted body occludes the roots of all four short legs, including the
 // near pair; otherwise the thigh patch reads as a detached extra arm.
 leg(1);leg(3);leg(0);leg(2);draw(parts[0],x,ground+p.bodyBottom,bodyH);
 // Small brows and sweat sit on the painted face; the body and its four
 // original limbs stay intact, rather than swapping to a standing portrait.
 if(motion.obstacleExpression&&motion.jump){
  const worry=motion.obstacleExpression==='worried',strong=motion.obstacleExpression==='determined';
  if(worry||strong){c.strokeStyle='#543545';c.lineWidth=Math.max(.8,h*.035);c.beginPath();
   for(const [xx,side] of [[x+bodyW*.17,-1],[x+bodyW*.39,1]]){const yy=base-h*.18-bodyH*.61;c.moveTo(xx-h*.065,yy+(worry?-side:side)*h*.035);c.lineTo(xx+h*.065,yy-(worry?-side:side)*h*.035);}c.stroke();
   if(worry){c.fillStyle='#b3dce3';c.fillRect(x+bodyW*.45,base-h*.65,Math.max(1,h*.06),Math.max(2,h*.13));}
  }
 }
 c.restore();return true;}
