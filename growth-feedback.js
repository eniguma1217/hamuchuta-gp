// Read-only feedback derived from already finalized race results.
// No RNG, state mutation, race replay or changes to old save formats.
const finite=n=>typeof n==='number'&&Number.isFinite(n);
export function officialRunner(result,id){
 const row=result?.standings?.find?.(x=>x.id===id);
 return row&&finite(row.total)&&row.total>=0?row:null;
}
export function recordedProgress(races){
 if(!Array.isArray(races))return [];
 return races.filter(r=>officialRunner(r,'player')&&Number.isInteger(r.entrants)&&r.entrants>0&&Number.isInteger(r.rank)&&r.rank>=1&&r.rank<=r.entrants)
  .map(r=>({id:r.id,title:r.title||'大会',turn:r.turn??(r.year||0)*24,rank:r.rank,entrants:r.entrants,time:officialRunner(r,'player').total,
   // Percentage is comparable across fields of different sizes; time is not.
   placement:r.entrants>1?100*(r.entrants-r.rank)/(r.entrants-1):100,
   stats:Array.isArray(r.stats)&&r.stats.length===5&&r.stats.every(finite)?[...r.stats]:null}))
  .sort((a,b)=>a.turn-b.turn||String(a.id).localeCompare(String(b.id)));
}
export function comparableCourse(a,b){
 if(!a?.course||!b?.course)return false;
 const stages=c=>c.stages?.map(s=>[s.action,Math.round(s.length*100000)/100000])||[];
 const aStages=stages(a.course),bStages=stages(b.course);
 return aStages.length>0&&bStages.length>0&&a.course.typeId===b.course.typeId&&a.course.baseTime===b.course.baseTime&&JSON.stringify(aStages)===JSON.stringify(bStages);
}
export function rivalGapFeedback(races,current,id='domestic-0'){
 if(!Array.isArray(races)||!current)return null;
 const player=officialRunner(current,'player'),rival=officialRunner(current,id);
 if(!player||!rival)return null;
 const previous=[...races].filter(r=>r!==current&&r?.id!==current.id&&officialRunner(r,'player')&&officialRunner(r,id)&&(r.turn??0)<=(current.turn??Infinity)).at(-1);
 if(!previous)return null;
 const oldGap=officialRunner(previous,'player').total-officialRunner(previous,id).total;
 const gap=player.total-rival.total,improvement=oldGap-gap,comparable=comparableCourse(previous,current);
 let mood='steady';
 if(!comparable)mood='different-course';
 else if(oldGap>0&&gap<0)mood='reversal';
 else if(improvement>.05)mood='closing';
 else if(improvement<-.05)mood='widening';
 const comment=mood==='different-course'?'こより「今回は違うコースだね。秒差だけで成長を決めず、一つずつ振り返ろう。」':mood==='reversal'?'こより「前に負けた相手を追い越したんだね！」':
  mood==='closing'?'こより「前より差が縮まってる！ ちゃんと記録に残ってるよ。」':
  mood==='widening'?'こより「今回は差が開いたね。でも、次の練習のヒントになるよ。」':
  'こより「今回もいい勝負だったね。記録を一緒に見てみよう。」';
 return {rivalId:id,previousId:previous.id,previousGap:oldGap,gap,improvement,comparable,mood,comment,
  note:comparable?'同じコース構成での比較です。':'コース条件が異なるため、秒差の変化は参考値です。'};
}
export function progressChartMarkup(races){
 const rows=recordedProgress(races);
 if(!rows.length)return '<p class="empty-state">最初の大会が終わると、ここに成長の足あとが残るよ。</p>';
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const w=360,h=122,left=19,right=15,top=14,bottom=25;
 const x=i=>left+(w-left-right)*(rows.length===1?.5:i/(rows.length-1));
 const y=p=>top+(h-top-bottom)*(1-Math.max(0,Math.min(100,p))/100);
 const coords=rows.map((r,i)=>x(i).toFixed(1)+','+y(r.placement).toFixed(1)).join(' ');
 const points=rows.map((r,i)=>'<circle cx="'+x(i).toFixed(1)+'" cy="'+y(r.placement).toFixed(1)+'" r="4" fill="#eaa35c" stroke="#403046" stroke-width="1.5"><title>'+safe(r.title)+' '+r.rank+'/'+r.entrants+'位</title></circle>').join('');
 const labels=rows.map((r,i)=>'<text x="'+x(i).toFixed(1)+'" y="'+(h-5)+'" text-anchor="middle" font-size="8" fill="#795367">'+safe(String(r.turn))+'</text>').join('');
 const ability=rows.filter(r=>r.stats),first=ability[0],last=ability.at(-1);
 return '<section class="progress-card" aria-label="大会の順位率と能力の成長記録"><div class="progress-card-title"><h2>小さな足あと、成長の記録</h2><small>保存された正式結果のみ</small></div><p>参加匹数の違いをそろえた「順位率」の推移。上ほど上位だよ。</p><svg class="progress-chart" viewBox="0 0 360 122" role="img" aria-label="大会ごとの順位率グラフ"><path d="M19 14V97H345" fill="none" stroke="#d8c4b3" stroke-width="2"/><path d="M19 55H345" stroke="#d8c4b3" stroke-dasharray="3 4"/><polyline points="'+coords+'" fill="none" stroke="#795367" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+points+labels+'<text x="0" y="18" font-size="8" fill="#795367">上</text><text x="0" y="99" font-size="8" fill="#795367">下</text><text x="348" y="118" font-size="8" fill="#795367" text-anchor="end">ターン</text></svg>'+
 (first&&last&&ability.length>1?'<p class="progress-stats">5能力の合計：'+first.stats.reduce((a,b)=>a+b,0).toFixed(1)+' → '+last.stats.reduce((a,b)=>a+b,0).toFixed(1)+'（大会時点）</p>':'')+
 '<p class="progress-disclaimer">※コースが違う大会のタイムを、速さの成長として単純比較しません。</p></section>';
}
