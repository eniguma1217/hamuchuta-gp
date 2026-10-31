// Race entry number, not current rank. Kept stable while runners overtake.
export function bibNumber(row){return 1+Math.max(0,Number.isInteger(row.startOrder)?row.startOrder:Number.isInteger(row.index)?row.index:0);}
export function bibPlacement(item){
 const {x,ground,height,motion,jump}=item,w=Math.max(10,Math.min(14,height*.42)),h=Math.max(8,Math.min(10,height*.31));
 return {number:bibNumber(item.row),x:x-height*.04-w/2,y:ground-(jump?.lift||0)-(motion?.active?motion.bob||0:0)-height*.56,width:w,height:h,font:height>=26?7:6};
}
export function drawRaceBib(c,item,spotlightId){
 const p=bibPlacement(item),hero=item.row.id==='player';
 c.save();c.fillStyle='#795367';c.fillRect(p.x,p.y,p.width,p.height);c.fillStyle=hero?'#ffd382':item.row.id===spotlightId?'#f5c8b5':'#fff0d2';c.fillRect(p.x+1,p.y+1,p.width-2,p.height-2);
 c.fillStyle='#403046';c.font='bold '+p.font+'px monospace';c.textAlign='center';c.fillText(String(p.number),p.x+p.width/2,p.y+p.height-2);c.restore();return p;
}
