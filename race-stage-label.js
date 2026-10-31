// On-screen names for race sections (#30 D1, owner 2026-10-25). A plan names its final
// run "ラストスパート", which made a straight-only course read as a spurt from the gun.
// The spurt now starts at SPURT_FROM of the whole course on every course, and only from
// then does the screen say ラストスパート; before it a run section is just 走る.
// Display only: saved plans, splits and results are untouched. Older (pre-v6) courses
// keep their own section names.
export const SPURT_FROM=.9;
const current=course=>course?.version===6;
// The section the runner is in, as the broadcast shows it.
export function liveStageLabel(course,index,{spurt=false,finished=false}={}){
 const stage=course?.stages?.[index];
 if(!current(course)||stage?.action!=='speed')return {name:stage?.name||'走行区間',short:stage?.short||stage?.name||'走る'};
 if(finished)return {name:'ゴール',short:'ゴール'};
 return spurt?{name:'ラストスパート',short:'ラスト'}:{name:'走行区間',short:'走る'};
}
// The spurt as seen from the runner's own place on the course.
export const inSpurt=(course,row)=>!!row&&!row.finished&&row.stageIndex===(course?.stages?.length||0)-1&&row.distance>=SPURT_FROM;
// After the race: one name per section for the analysis table and coaching notes.
export function resultStageName(course,index){
 const stages=course?.stages||[],stage=stages[index];if(!stage)return '区間'+(index+1);
 if(!current(course)||stage.action!=='speed')return stage.name;
 const runs=stages.filter(s=>s.action==='speed').length,n=stages.slice(0,index+1).filter(s=>s.action==='speed').length;
 return runs===1?'コース全体':n===runs?'最後の走行区間':'走行区間'+n;
}
