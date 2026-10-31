// Latest Issue #4/#5: reserve slots (22 + 3, 10 + 2). Earlier swap rules are superseded.
export const DOMESTIC_RULES={version:2,ordinaryPerYear:1,ordinaryTotal:3,selectionTotal:3,ordinaryTurns:[12,36,60],yearEndActionOrder:'after-training',stages:[{year:1,entrants:50,advance:25,direct:22,revivalSlots:3,yearEndTurnHint:24,repechage:true},{year:2,entrants:25,advance:12,direct:10,revivalSlots:2,yearEndTurnHint:48,repechage:true},{year:3,entrants:12,advance:1,direct:1,revivalSlots:0,yearEndTurnHint:72,repechage:false}],repechage:{timing:'immediately-after-preliminary',entrants:'all-preliminary-nonqualifiers',qualifyingRank:[3,2],slots:[3,2],replacementPolicy:'reserved-slots-no-replacements',attempts:1,lossOutcome:'end-run'},cutoffTiePolicy:'raw-time-then-saved-start-order'};
const copy=x=>JSON.parse(JSON.stringify(x)),safeId=x=>typeof x==='string'&&x.length>0&&x.length<=180,uint=x=>Number.isInteger(x)&&x>=0&&x<=0xffffffff;
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b)),ids=rows=>rows.map(x=>x.id);
function validRoster(rows,n){return Array.isArray(rows)&&rows.length===n&&rows.every(x=>x&&safeId(x.id)&&x.species==='hamster')&&new Set(ids(rows)).size===n;}
export function createDomesticSelection(runId,ownedHamsterId,roster){
 if(!safeId(runId)||!safeId(ownedHamsterId)||!validRoster(roster,50)||!roster.some(x=>x.id==='player'))return null;
 const initial=roster.map(({id,species})=>({id,species}));return {version:2,runId,ownedHamsterId,year:1,status:'selection-ready',initialRoster:initial,roster:copy(initial),records:[],pending:null,qualification:null};
}
function reduce(s,input){
 const stage=DOMESTIC_RULES.stages[s.year-1],revival=s.status==='repechage-ready',expected=revival?s.pending.nonqualifiers:s.roster;
 if(!['selection-ready','repechage-ready'].includes(s.status)||!stage||!input||!safeId(input.id)||input.runId!==s.runId||input.ownedHamsterId!==s.ownedHamsterId||input.year!==s.year||input.kind!==(revival?'repechage':'selection')||!uint(input.seedBefore)||!uint(input.seedAfter)||!validRoster(input.standings,expected.length)||!same([...ids(input.standings)].sort(),[...ids(expected)].sort())||s.records.some(r=>r.id===input.id))return null;
 if(!input.standings.every((r,i,a)=>Number.isFinite(r.total)&&r.total>=0&&Number.isInteger(r.startOrder)&&r.startOrder>=0&&r.startOrder<expected.length&&(i===0||r.total>a[i-1].total||(r.total===a[i-1].total&&r.startOrder>a[i-1].startOrder)))||new Set(input.standings.map(r=>r.startOrder)).size!==expected.length)return null;
 const record={id:input.id,runId:s.runId,ownedHamsterId:s.ownedHamsterId,year:s.year,kind:input.kind,seedBefore:input.seedBefore,seedAfter:input.seedAfter,standings:input.standings.map(({id,species,total,startOrder})=>({id,species,total,startOrder}))},next=copy(s);
 next.records.push(record);const rank=record.standings.findIndex(r=>r.id==='player')+1,small=r=>({id:r.id,species:r.species});
 if(revival){next.roster=[...s.pending.directQualifiers,...record.standings.slice(0,stage.revivalSlots).map(small)];next.pending=null;if(!next.roster.some(r=>r.id==='player')){next.status='finished-loss';return next;}next.year++;next.status='selection-ready';return next;}
 const top=record.standings.slice(0,stage.direct).map(small);
 if(stage.repechage){next.status='repechage-ready';next.pending={year:s.year,resultId:record.id,directQualifiers:top,nonqualifiers:record.standings.slice(stage.direct).map(small)};return next;}
 next.roster=top;if(rank===1){next.status='qualified';next.qualification={runId:s.runId,ownedHamsterId:s.ownedHamsterId,resultId:record.id};}else next.status='finished-loss';return next;
}
export function validDomesticSelection(s){if(!s||s.version!==2||!Array.isArray(s.records)||s.records.length>5)return false;let rebuilt=createDomesticSelection(s.runId,s.ownedHamsterId,s.initialRoster);if(!rebuilt)return false;for(const r of s.records){rebuilt=reduce(rebuilt,r);if(!rebuilt)return false;}return same(s,rebuilt);}
export function recordDomesticSelection(s,result){return validDomesticSelection(s)?reduce(s,result):null;}
export function domesticWorldQualification(s,runId,ownedHamsterId){return validDomesticSelection(s)&&s.status==='qualified'&&s.qualification?.runId===runId&&s.qualification.ownedHamsterId===ownedHamsterId;}
export function domesticBlockers(s){return s&&!validDomesticSelection(s)?['invalid-selection-state']:[];}
