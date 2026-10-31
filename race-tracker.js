// Read-only broadcast UI. Coordinates come directly from the saved race replay,
// never from the camera lens, avoidance animation, or an invented running order.
import {liveStageLabel,inSpurt} from './race-stage-label.js';
const clamp=n=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const color={player:'#ffd382',rival:'#e79c9a',top:'#fff0d2',other:'#9fc5b1'};
const stageColor={appetite:'#eaa35c',intelligence:'#9fc5b1',technique:'#e79c9a'};
export function trackerStages(course){
 let cursor=0,number=0;
 return (course?.stages||[]).map((s,index)=>{const start=cursor;cursor+=s.length;const special=s.action!=='speed';return {index,start:clamp(start),end:clamp(cursor),name:liveStageLabel(course,index).short,special,number:special?++number:null,color:stageColor[s.action]||'#d9cfbd'};});
}
export function trackerModel(live){
 const points=[...live.standings].sort((a,b)=>a.id.localeCompare(b.id)).map((row,index)=>({id:row.id,name:row.name||row.species||'選手',rank:row.rank,distance:clamp(row.distance),lane:index%4,kind:row.id==='player'?'player':row.id===live.spotlightId?'rival':row.rank<=3?'top':'other',finished:row.finished}));
 return {points,stages:trackerStages(live.course),rank:live.rank,entrants:live.entrants,remaining:Math.ceil((1-clamp(live.player.distance))*100),percent:Math.floor(clamp(live.player.distance)*100),stageIndex:live.player.stageIndex,finished:live.player.finished};
}
export function drawRaceTracker(c,live){
 const m=trackerModel(live);
 c.save();c.fillStyle='#403046';c.fillRect(0,182,384,34);
 c.font='bold 9px HamMaru,sans-serif';c.fillStyle='#ffd382';c.textAlign='left';c.fillText('YOU '+m.rank+'位 / '+m.entrants+'匹',10,192);
 c.textAlign='right';c.fillStyle='#fff0d2';c.fillText(m.finished?'ゴール！':'ゴールまで '+m.remaining+'%',374,192);
 c.fillStyle='#795367';c.fillRect(16,203,352,2);
 // Small underlines identify checkpoints without hiding the field's dots.
 for(const s of m.stages)if(s.special){c.fillStyle=s.color;c.fillRect(16+s.start*350,213,Math.max(1,(s.end-s.start)*350),2);}
 c.fillStyle='#fff0d2';c.fillRect(15,197,1,14);c.fillRect(368,197,1,14);
 // Keep all entrants, including runners outside the main camera and finishers.
 const ordered=[...m.points.filter(p=>p.kind!=='player'),...m.points.filter(p=>p.kind==='player')];
 for(const p of ordered){const x=Math.round(16+p.distance*347),y=p.kind==='player'?199:199+p.lane*3;c.fillStyle=color[p.kind];c.fillRect(x,y,p.kind==='player'||p.kind==='rival'?5:3,p.kind==='player'?10:p.kind==='rival'?5:3);}
 c.restore();
}
export function trackerMarkup(course,entrants){
 const stages=trackerStages(course);
 return `<section id="race-map" class="race-map" aria-label="全出走者の位置とコースの進み具合"><header><strong>全員の位置</strong><b data-map-rank>YOU —位 / ${entrants}匹</b></header><div class="race-map-axis"><span>スタート</span><span>ゴール →</span></div><div class="race-map-track">${stages.filter(s=>s.special).map(s=>`<span class="race-map-zone" style="left:${s.start*100}%;width:${(s.end-s.start)*100}%;--zone:${s.color}" title="${escape(s.name)}"><b>${s.number}</b></span>`).join('')}${Array.from({length:entrants},(_,i)=>`<i data-map-dot="${i}" class="race-map-dot"></i>`).join('')}</div><div class="race-map-key"><span class="key-player">◆ YOU</span><span class="key-top">● 上位3匹</span><span class="key-rival">● ライバル</span><span class="key-other">● その他</span></div><p data-map-status>まもなく一斉スタート</p><div class="race-map-route" aria-label="コースの順番">${stages.map(s=>`<span id="zone-${s.index}">${s.special?'<b>'+s.number+'</b> ':''}${escape(s.name)}</span>`).join('<i aria-hidden="true">→</i>')}${course?.version===6&&stages.length?'<i aria-hidden="true">→</i><span id="zone-spurt">ラスト</span>':''}</div></section>`;
}
export function updateRaceTracker(root,live){
 if(!root)return;const m=trackerModel(live);
 root.querySelector('[data-map-rank]').textContent=`YOU ${m.rank}位 / ${m.entrants}匹`;
 const stage=m.stages[m.stageIndex];root.querySelector('[data-map-status]').textContent=m.finished?'ゴール！ 全体コースを走り切った！':`いま：${liveStageLabel(live.course,m.stageIndex,{spurt:inSpurt(live.course,live.player)}).short} ／ ゴールまで ${m.remaining}%`;
 root.dataset.rank=String(m.rank);root.dataset.percent=String(m.percent);root.dataset.entrants=String(m.points.length);
 const nodes=root.querySelectorAll('[data-map-dot]');
 m.points.forEach((p,i)=>{const el=nodes[i];if(!el)return;el.className='race-map-dot map-'+p.kind;el.style.left=(p.distance*100)+'%';el.style.top=(14+p.lane*6)+'px';el.dataset.runner=p.id;el.dataset.distance=String(p.distance);el.dataset.rank=String(p.rank);el.title=`${p.name}：${p.rank}位・コース${Math.floor(p.distance*100)}%${p.finished?'・ゴール済み':''}`;});
}
