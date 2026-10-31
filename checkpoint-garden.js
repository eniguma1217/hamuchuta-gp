// Bright GBA-inspired garden stages shared by the eating and study gates.
// Pixel-quantized and character-free. Actors and actual recorded progress are
// still rendered separately by checkpoint-art.js.
const px=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function flower(c,x,y,pink=false){
 const petal=pink?'#f7b6c7':'#fff7e7',middle=pink?'#fff4aa':'#ffd36f';
 px(c,x-1,y-6,3,3,petal);px(c,x-5,y-2,4,3,petal);
 px(c,x+2,y-2,4,3,petal);px(c,x-1,y+2,3,3,petal);
 px(c,x-1,y-2,3,3,middle);px(c,x,y+5,2,5,'#71a878');
}
function sunflower(c,x,y){
 px(c,x,y+6,3,23,'#689c75');px(c,x-4,y+14,6,3,'#8bbf7a');
 for(const [dx,dy] of [[-6,0],[6,0],[0,-6],[0,6],[-4,-4],[4,-4],[-4,4],[4,4]])px(c,x+dx-2,y+dy-2,5,5,'#ffdc76');
 px(c,x-3,y-3,8,8,'#95634d');px(c,x-1,y-1,4,4,'#d5a169');
}
export function drawCheckpointGarden(c,id,solo=false,banquet=false){
 const eating=id==='eating';
 px(c,0,0,384,156,'#bfeaf0');
 px(c,0,55,384,37,'#c4dca8');
 // Rounded clouds and distant soft hills.
 for(const [x,y] of [[28,20],[215,13],[327,28]]){
  px(c,x,y+5,38,6,'#fff8ec');px(c,x+7,y,21,13,'#fff8ec');
 }
 for(let x=-26;x<420;x+=75){
  px(c,x,58,62,22,'#a3cc9a');px(c,x+9,51,41,16,'#a3cc9a');
 }
 // The race world continues outside the checkpoints: pastel garden fence.
 for(let x=0;x<384;x+=28){
  px(c,x,74,4,18,'#b98b68');px(c,x-1,77,29,4,'#f4dcaa');
 }
 px(c,0,92,384,64,eating?'#f4dba8':'#e7d9b8');
 for(let x=13;x<390;x+=45){
  flower(c,x,86,x%2===0);flower(c,x+15,96,x%3===0);
 }
 sunflower(c,20,58);sunflower(c,356,58);
 // Warm little garden pavilion / learning nook.
 if(!eating){
  px(c,112,24,158,49,'#f9efcf');
  px(c,112,24,158,5,'#ad7f79');
  px(c,120,32,142,34,'#a7cba4');
  px(c,130,41,37,3,'#fff5d9');
  px(c,130,48,25,3,'#fff5d9');
  px(c,224,43,18,2,'#fff5d9');
  px(c,228,37,3,18,'#fff5d9');
 }else{
  // Decorative picnic canopy above the seed-eating table.
  px(c,109,17,168,9,'#f5b7b5');
  for(let x=109;x<277;x+=24)px(c,x,25,14,8,'#fff1d7');
  px(c,116,32,5,45,'#d5aa81');px(c,265,32,5,45,'#d5aa81');
  px(c,169,35,43,5,'#f4c99b');
 }
 // Foreground desk/table: repainting this band after actor draw makes feet
 // and hands appear behind the tabletop, without erasing their heads.
 if(banquet)return;
 const tableY=solo?116:100;
 px(c,20,tableY,344,6,'#795367');
 px(c,23,tableY+3,338,9,'#d59e75');
 px(c,30,tableY+12,11,Math.max(0,156-tableY-12),'#ad7a61');
 px(c,343,tableY+12,11,Math.max(0,156-tableY-12),'#ad7a61');
 px(c,54,tableY+16,276,3,'#f1c69c');
}
