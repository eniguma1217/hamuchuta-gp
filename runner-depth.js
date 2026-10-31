// Stable visual depth bands. These are not gameplay lanes or collision data.
export function runnerDepth(row,raceKey='race'){
 let hash=2166136261;for(const char of raceKey+':'+row.id)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;
 const band=row.id==='player'?1:hash%3,offset=row.id==='player'?0:Math.floor(hash/3)%5-2;
 // All opaque paws must land on the actual illustrated dirt track.
 // The old 120px back lane sat in the flowerbed ABOVE the road, making
 // runners appear to float over the fence despite correct sprite baselines.
 return {band,ground:[145,160,175][band]+offset,scale:[.94,1,1.04][band]};
}
export function depthOrder(rows,raceKey){return [...rows].sort((a,b)=>{const x=runnerDepth(a,raceKey),y=runnerDepth(b,raceKey);return x.band-y.band||(a.id==='player'?1:b.id==='player'?-1:0)||x.ground-y.ground||a.id.localeCompare(b.id);});}
// A broadcast establishing shot, not simulated lanes or a distance head start.
// Fifty separate slots prevent the old 5-column/3-band pile-up at time zero.
export function openingPlacement(row,count){
 // A real staggered marathon grid, seen in one stable SIDE-ON camera.
 // More than 50 actors fit without being stacked in one giant blob:
 // distant rows have smaller sprites, front rows larger, all feet grounded.
 const columns=count>=32?9:count>=15?6:count>=10?5:Math.min(4,Math.max(1,count));
 const rows=Math.ceil(count/columns),order=Math.max(0,row.startOrder??row.index??0);
 const col=order%columns,rank=Math.floor(order/columns);
 const spacing=columns>=9?37:columns>=6?45:50;
 const x=192-(columns-1)*spacing/2+col*spacing+(rank%2?8:0);
 const step=rows>=5?12:18,ground=176-(rows-1-rank)*step;
 const height=rows>=5?16+rank*1.9:22+rank*2.6;
 return {x:Math.round(x),ground:Math.round(ground),height:Math.round(height)};
}
