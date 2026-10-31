// 37 non-zodiac world-final entrants. Every species has its own silhouette,
// face details and stable color design, separate from the 12 zodiac sprite art.
// Canvas-only: never reads or changes competition results, RNG or save data.
const INK='#403046',WHITE='#fff5e5',BLUSH='#e79c9a';
const species=[
 ['ネコ','cat','#d4b5a0','#fff0d2'],['キツネ','fox','#eaa35c','#fff0d2'],
 ['タヌキ','tanuki','#a48c82','#e9d3b2'],['クマ','bear','#b77652','#eac99c'],
 ['パンダ','panda','#fff0d2','#403046'],['リス','squirrel','#d59b5f','#ffe0ad'],
 ['モモンガ','glider','#b6a49d','#fff0d2'],['カピバラ','capybara','#b68d69','#d9ba8b'],
 ['モルモット','guinea','#e9c6a5','#fff0d2'],['チンチラ','chinchilla','#b9b8c8','#fff0d2'],
 ['フェレット','ferret','#d6bb9b','#fff0d2'],['ハリネズミ','hedgehog','#9d7b6b','#fff0d2'],
 ['コアラ','koala','#a5a8b4','#e5d8cf'],['カンガルー','kangaroo','#bf8d62','#ffe0b0'],
 ['ウォンバット','wombat','#9d8d85','#d9c5ad'],['ナマケモノ','sloth','#b49b85','#f0ddc3'],
 ['アライグマ','raccoon','#9b989b','#fff0d2'],['カワウソ','otter','#a17c62','#e7c6a4'],
 ['ビーバー','beaver','#9a6b51','#e6c29d'],['ラッコ','seaotter','#8c6c5a','#ffe0c4'],
 ['アザラシ','seal','#b5bac7','#f3e6df'],['ペンギン','penguin','#403046','#fff0d2'],
 ['フクロウ','owl','#a68973','#eacda3'],['タカ','hawk','#986f5b','#e4c7a1'],
 ['ワシ','eagle','#795367','#fff0d2'],['フラミンゴ','flamingo','#eaa9b3','#ffd3cf'],
 ['ダチョウ','ostrich','#9a817a','#e9c8a9'],['クジャク','peacock','#689c99','#b3dce3'],
 ['カメ','turtle','#73916b','#d6c49a'],['ワニ','crocodile','#73916b','#b5d59a'],
 ['カエル','frog','#8bbd7b','#d8f0b1'],['シカ','deer','#b68b6e','#f4d5af'],
 ['キリン','giraffe','#e4b86e','#fff0d2'],['ゾウ','elephant','#b4b4c0','#e1d9d5'],
 ['サイ','rhino','#9f9b9d','#ded3c5'],['カバ','hippo','#aa8794','#ebc6d0'],
 ['ライオン','lion','#e1b363','#ffe0a0']
];
export const WORLD_SPECIES=Object.freeze(species.map(([name])=>name));
export const WORLD_DESIGNS=Object.freeze(Object.fromEntries(species.map(([name,kind,coat,belly],index)=>[name,Object.freeze({kind,coat,belly,index})])));
const px=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
function ellipse(c,x,y,rx,ry,col){for(let yy=-Math.ceil(ry);yy<=ry;yy+=2){const half=Math.floor(rx*Math.sqrt(Math.max(0,1-yy*yy/(ry*ry))));px(c,x-half,y+yy,half*2+1,2,col);}}
const spike=(c,x,y,side,col)=>{for(let i=0;i<8;i+=2)px(c,x+i*(side||1),y-i,Math.max(2,8-i),3,col);};
const ear=(c,x,y,r,col)=>{ellipse(c,x,y,r,r*.9,INK);ellipse(c,x,y,r-2,r*.9-2,col);};
function drawSpecies(c,d,phase){
 const {kind,coat,belly,index}=d;const move=phase%2?2:0;
 // Each species begins with a different body type and contact footprint.
 const long=['ferret','otter','beaver','seaotter','seal','crocodile'].includes(kind);
 const tall=['penguin','owl','hawk','eagle','flamingo','ostrich','peacock','giraffe'].includes(kind);
 const flat=['turtle','frog','crocodile'].includes(kind);
 const bodyY=flat?42:tall?37:40,bodyRx=long?27:tall?17:22,bodyRy=flat?13:tall?23:18;
 if(kind==='seal'){ellipse(c,19,50,16,5,coat);ellipse(c,49,51,16,5,coat);}
 else if(kind==='peacock'){for(let i=-3;i<=3;i++){ellipse(c,31+i*8,17+Math.abs(i)*3,7,18,i%2?'#73916b':'#689c99');px(c,30+i*8,14+Math.abs(i)*3,3,4,'#ffd382');}}
 else if(kind==='squirrel'||kind==='fox'){ellipse(c,54,27,10,21,kind==='fox'?'#eaa35c':'#c68b54');ellipse(c,55,18,7,9,WHITE);}
 else if(kind==='beaver'){ellipse(c,6,50,12,6,'#795367');}
 else if(kind==='raccoon'){for(let i=0;i<4;i++)px(c,2+i*3,35+i*4,10,4,i%2?'#403046':'#b8b2c0');}
 else if(kind==='hedgehog'){for(let i=0;i<10;i++)spike(c,9+i*5,22+(i%2)*2,1,'#795367');}
 else if(kind==='glider'){ellipse(c,12,44,14,10,'#e9d9bd');ellipse(c,53,44,14,10,'#e9d9bd');}
 else if(kind==='kangaroo'){px(c,0,50,25,5,coat);ellipse(c,6,46,13,5,coat);}
 else if(kind==='crocodile'){px(c,1,39,22,10,coat);for(let i=0;i<5;i++)px(c,4+i*5,35-i%2*2,4,5,'#527e57');}
 ellipse(c,32,bodyY,bodyRx+2,bodyRy+2,INK);ellipse(c,32,bodyY,bodyRx,bodyRy,coat);
 if(kind!=='panda'&&kind!=='penguin'&&kind!=='turtle')ellipse(c,32,bodyY+7,Math.max(8,bodyRx-6),Math.max(6,bodyRy-9),belly);
 if(kind==='turtle'){ellipse(c,31,34,23,15,'#506c53');ellipse(c,31,33,20,12,'#8fae73');for(let i=0;i<4;i++)px(c,16+i*10,26+(i%2)*6,7,3,'#567951');}
 if(kind==='penguin'){ellipse(c,31,39,11,17,WHITE);ellipse(c,14,39,6,13,'#795367');ellipse(c,49,39,6,13,'#795367');}
 if(['cat','fox','raccoon','tanuki','ferret','crocodile','lion','deer'].includes(kind)){
  for(const ex of [17,46]){px(c,ex-4,12,10,12,INK);px(c,ex-2,13,6,10,kind==='fox'?'#eaa35c':coat);}
 }else if(['bear','panda','koala','chinchilla','mouse','wombat','hippo','capybara','guinea','sloth'].includes(kind)){
  ear(c,13,17,kind==='koala'||kind==='chinchilla'?11:7,kind==='koala'?WHITE:coat);
  ear(c,51,17,kind==='koala'||kind==='chinchilla'?11:7,kind==='koala'?WHITE:coat);
 }else if(['rabbit','kangaroo','giraffe','deer'].includes(kind)){
  px(c,13,1,6,20,INK);px(c,44,1,6,20,INK);px(c,15,3,3,15,BLUSH);px(c,46,3,3,15,BLUSH);
 }
 if(kind==='deer'){for(const x of [12,49]){px(c,x,2,3,15,'#795367');px(c,x-5,5,12,3,'#795367');px(c,x-4,0,3,7,'#795367');}}
 if(kind==='giraffe'){px(c,28,4,13,34,coat);for(let i=0;i<4;i++)px(c,30+i%2*7,10+i*6,5,4,'#b77652');px(c,27,1,3,8,INK);px(c,40,1,3,8,INK);}
 if(kind==='elephant'){ear(c,11,30,14,coat);ear(c,53,30,14,coat);px(c,30,39,9,19,coat);px(c,32,53,11,5,coat);}
 if(kind==='rhino'){spike(c,36,34,1,WHITE);px(c,32,32,5,8,WHITE);}
 if(kind==='hippo'){ellipse(c,34,43,20,11,'#d8adb9');px(c,20,49,7,4,WHITE);px(c,42,49,7,4,WHITE);}
 if(kind==='lion'){for(let i=0;i<9;i++){const x=10+i*5;spike(c,x,12+(i%2)*3,1,'#b77652');}ellipse(c,31,28,17,18,'#b77652');ellipse(c,31,30,13,14,coat);}
 if(kind==='koala')ellipse(c,32,37,5,9,'#403046');
 if(kind==='panda'){ellipse(c,20,29,9,9,INK);ellipse(c,43,29,9,9,INK);}
 if(kind==='tanuki'||kind==='raccoon'||kind==='ferret'||kind==='sloth'){ellipse(c,19,29,9,6,'#795367');ellipse(c,44,29,9,6,'#795367');}
 if(kind==='frog'){ellipse(c,16,20,9,9,coat);ellipse(c,48,20,9,9,coat);}
 if(kind==='owl'){spike(c,14,8,-1,coat);spike(c,49,8,1,coat);ellipse(c,20,30,11,11,WHITE);ellipse(c,44,30,11,11,WHITE);}
 if(kind==='hawk'||kind==='eagle'){px(c,8,40,8,14,'#795367');px(c,49,40,8,14,'#795367');if(kind==='eagle')ellipse(c,32,19,16,12,WHITE);}
 if(kind==='flamingo'||kind==='ostrich'){px(c,29,4,8,32,coat);px(c,21,56,3,8,'#795367');px(c,42,56,3,8,'#795367');}
 if(kind==='crocodile'){px(c,33,35,30,9,coat);px(c,52,40,3,2,WHITE);px(c,59,40,3,2,WHITE);}
 if(kind==='beaver'){px(c,27,41,6,8,WHITE);px(c,34,41,6,8,WHITE);}
 if(kind==='hedgehog'){for(let i=0;i<6;i++)px(c,9+i*7,15+(i%2)*2,4,5,'#795367');}
 if(kind==='chinchilla'){px(c,14,14,5,5,BLUSH);px(c,47,14,5,5,BLUSH);}
 if(kind==='glider'){px(c,6,45,14,3,'#795367');px(c,45,45,14,3,'#795367');}
 if(kind==='guinea'){ellipse(c,19,30,10,10,'#b77652');ellipse(c,44,39,9,9,WHITE);}
 if(kind==='peacock'){px(c,29,5,4,15,'#689c99');px(c,27,3,8,3,'#ffd382');}
 if(kind==='seal'){px(c,5,55,13,3,coat);px(c,49,55,13,3,coat);}
 // Different neutral eye placements and pupil shapes are part of the species,
 // not just accessory/recolor changes.
 const ey=kind==='giraffe'?17:kind==='owl'?29:kind==='frog'?20:kind==='flamingo'?17:kind==='elephant'?26:28;
 const left=kind==='panda'?20:kind==='koala'?18:16+(index*5)%8;
 const gap=kind==='owl'?24:kind==='frog'?32:23+(index*7)%8;
 for(const ex of [left,Math.min(53,left+gap)]){
  const radius=kind==='owl'?5:kind==='frog'?4:kind==='panda'?3:2+(index%2);
  ellipse(c,ex,ey,radius,radius,INK);px(c,ex-1,ey-2,2,2,WHITE);
 }
 if(['penguin','owl','hawk','eagle','flamingo','ostrich','peacock'].includes(kind)){
  px(c,28,35,10,4,'#ffd382');px(c,35,37,6,3,'#eaa35c');
 }else if(kind==='elephant')px(c,35,56,5,3,BLUSH);
 else{px(c,30,39,5,3,'#795367');px(c,31,43,3,2,'#795367');}
 if(kind==='fox'||kind==='cat'||kind==='otter'||kind==='seaotter'){px(c,7,42,8,1,INK);px(c,49,42,8,1,INK);}
 if(!['seal','flamingo','ostrich','crocodile'].includes(kind)){
  px(c,14+move,56,11,4,INK);px(c,42-move,56,11,4,INK);
  px(c,16+move,56,7,2,BLUSH);px(c,44-move,56,7,2,BLUSH);
 }
}
export function drawWorldAnimal(c,name,x,ground,height=28,pose=0){
 const d=WORLD_DESIGNS[name];if(!c||!d||!(height>0))return false;
 const size=Math.round(height);c.save();c.imageSmoothingEnabled=false;
 c.translate(Math.round(x-size/2),Math.round(ground-size));c.scale(size/64,size/64);
 drawSpecies(c,d,Math.floor(pose));c.restore();return true;
}
