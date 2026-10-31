// Latest Issue #4/#5 rules. Unanswered settings stay null; this is not a calendar.
export const DOMESTIC_RULES=Object.freeze({
 version:1,ordinaryPerYear:1,ordinaryTotal:3,selectionTotal:3,
 ordinaryTurns:Object.freeze([null,null,null]),yearEndActionOrder:null,
 stages:Object.freeze([
  Object.freeze({year:1,entrants:50,advance:25,yearEndTurnHint:24,repechage:true}),
  Object.freeze({year:2,entrants:25,advance:12,yearEndTurnHint:48,repechage:true}),
  Object.freeze({year:3,entrants:12,advance:1,yearEndTurnHint:72,repechage:false})
 ]),
 repechage:Object.freeze({timing:'immediately-after-preliminary',entrants:null,qualifyingRank:null,slots:null,replacementPolicy:null,attempts:null,lossOutcome:null}),
 cutoffTiePolicy:null
});
const copy=x=>JSON.parse(JSON.stringify(x));
const safeId=x=>typeof x==='string'&&x.length>0&&x.length<=180;
const uint=x=>Number.isInteger(x)&&x>=0&&x<=0xffffffff;
const ids=rows=>rows.map(x=>x.id);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
function validRoster(rows,n){return Array.isArray(rows)&&rows.length===n&&rows.every(x=>x&&safeId(x.id)&&x.species==='hamster')&&new Set(ids(rows)).size===n;}
export function createDomesticSelection(runId,ownedHamsterId,roster){
 if(!safeId(runId)||!safeId(ownedHamsterId)||!validRoster(roster,50)||!roster.some(r=>r.id==='player'))return null;
 const initial=roster.map(r=>({id:r.id,species:r.species}));
 return {version:1,runId,ownedHamsterId,year:1,status:'selection-ready',initialRoster:initial,roster:copy(initial),records:[],pending:null,qualification:null};
}
function reduce(s,input){
 const stage=DOMESTIC_RULES.stages[s.year-1];
 if(s.status!=='selection-ready'||!stage||!input||!safeId(input.id)||input.runId!==s.runId||input.ownedHamsterId!==s.ownedHamsterId||input.year!==s.year||!uint(input.seedBefore)||!uint(input.seedAfter)||!validRoster(input.standings,stage.entrants)||!same([...ids(input.standings)].sort(),[...ids(s.roster)].sort())||!input.standings.every((r,i,a)=>Number.isFinite(r.total)&&r.total>=0&&(i===0||r.total>=a[i-1].total))||s.records.some(r=>r.id===input.id))return null;
 const result={id:input.id,runId:input.runId,ownedHamsterId:input.ownedHamsterId,year:input.year,seedBefore:input.seedBefore,seedAfter:input.seedAfter,standings:input.standings.map(r=>({id:r.id,species:r.species,total:r.total}))};
 const next=copy(s);next.records.push(result);
 const top=result.standings.slice(0,stage.advance),rank=result.standings.findIndex(r=>r.id==='player')+1;
 if(result.standings[stage.advance-1].total===result.standings[stage.advance].total){
  next.status='cutoff-tie-pending-rules';next.pending={year:s.year,resultId:result.id,provisionalAdvancers:top.map(r=>({id:r.id,species:r.species})),reason:'cutoff-tie'};return next;
 }
 if(rank>stage.advance){
  if(stage.repechage){next.status='repechage-pending-rules';next.pending={year:s.year,resultId:result.id,timing:DOMESTIC_RULES.repechage.timing,provisionalAdvancers:top.map(r=>({id:r.id,species:r.species})),unresolved:copy(DOMESTIC_RULES.repechage)};}
  else{next.status='finished-loss';next.roster=top.map(r=>({id:r.id,species:r.species}));next.pending=null;}
  return next;
 }
 next.roster=top.map(r=>({id:r.id,species:r.species}));
 if(s.year===3){next.status='qualified';next.qualification={runId:s.runId,ownedHamsterId:s.ownedHamsterId,resultId:result.id};}
 else next.year++;
 return next;
}
export function validDomesticSelection(s){
 if(!s||s.version!==1||!Array.isArray(s.records)||s.records.length>3)return false;
 let rebuilt=createDomesticSelection(s.runId,s.ownedHamsterId,s.initialRoster);if(!rebuilt)return false;
 for(const result of s.records){rebuilt=reduce(rebuilt,result);if(!rebuilt)return false;}
 return same(canonical(s),canonical(rebuilt));
}
export function recordDomesticSelection(s,result){return validDomesticSelection(s)?reduce(s,result):null;}
export function domesticWorldQualification(s,runId,ownedHamsterId){return validDomesticSelection(s)&&s.status==='qualified'&&s.qualification?.runId===runId&&s.qualification.ownedHamsterId===ownedHamsterId;}
export function domesticBlockers(s){
 if(s&&!validDomesticSelection(s))return ['invalid-selection-state'];
 if(s?.status==='repechage-pending-rules')return Object.entries(DOMESTIC_RULES.repechage).filter(([,v])=>v===null).map(([k])=>'repechage.'+k);
 if(s?.status==='cutoff-tie-pending-rules')return ['cutoffTiePolicy'];
 return ['ordinaryTurns','yearEndActionOrder'];
}
