// Identity details on the existing hand-pixelled hero atlas.
// A temporary, reusable visual layer while full replacement art is reviewed.
// Only Canvas drawing: never modifies race, save or character data.
const INK='#403046',CREAM='#fff0d2',PINK='#e79c9a';
const dot=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
export const HERO_IDENTITY=Object.freeze([
 {id:'mochi',face:'round',mark:'soft cheeks'},
 {id:'dash',face:'alert',mark:'forehead star'},
 {id:'hakase',face:'calm',mark:'round glasses'}
]);
export function drawHeroIdentity(c,variant,x,ground,height,{running=false,expression='normal'}={}){
 if(!c||!(height>=18))return false;
 const id=((variant%3)+3)%3;
 c.save();c.imageSmoothingEnabled=false;
 c.translate(Math.round(x-height/2),Math.round(ground-height));
 c.scale(height/64,height/64);
 if(id===0){
  // Mochimaru: low, rounded muzzle and tiny symmetric cheek markings.
  dot(c,12,36,6,3,'#f5c8b5');dot(c,46,36,6,3,'#f5c8b5');
  dot(c,14,39,3,2,PINK);dot(c,47,39,3,2,PINK);
 }else if(id===1){
  // Dash: star-shaped *fur marking*, not a sticker or an accessory.
  const star=['0001000','0001000','1111111','0111110','0011100','0110110','1100011'];
  star.forEach((line,j)=>{for(let i=0;i<line.length;i++)if(line[i]==='1')dot(c,25+i*2,9+j*2,2,2,'#fff1bc');});
  // Short sharp brows make the face different even without the mark.
  dot(c,15,26,8,2,INK);dot(c,40,25,8,2,INK);
  if(running)dot(c,49,36,3,2,PINK);
 }else{
  // Hakase: fine rounded glasses and a thoughtful expression.
  const frame='#664a60';
  for(const cx of [20,44]){
   dot(c,cx-7,27,14,2,frame);dot(c,cx-8,29,2,9,frame);
   dot(c,cx+6,29,2,9,frame);dot(c,cx-6,37,12,2,frame);
   dot(c,cx-4,30,2,2,CREAM); // tiny glass highlight
  }
  dot(c,27,31,10,2,frame); // bridge
  dot(c,30,40,4,2,INK); // quieter, smaller mouth
 }
 if(expression==='determined'&&id!==1){dot(c,16,24,7,2,INK);dot(c,41,24,7,2,INK);}
 c.restore();return true;
}
