import * as Today from './story-today.js';
import {setEventCompletionHandler} from './events.js';
import {isBook,BOOK_FLAG} from './story-book.js';
import * as YE from './year-events.js';
setEventCompletionHandler(Today.afterDialogue);
export {townOffer,visitTown} from './story-today.js';
// 町へ (#30, owner 2026-10-31 「街へのコマンドは行くと1ターン進むようにして」, pick 「話す＋体力少し回復・やる気アップ」): going
// to town takes the turn. A little rest (less than お出かけ), the mood one level up, then the talk with a friend or a
// side story read in town; that talk is the turn's talk, so no random talk or rare event comes with it.
export const TOWN_REST=10;
export function goToTown(s,{visit,side}={}){
 if(isLegacy(s)||!Today.isToday(s)||hasPendingDialogue(s)||s.phase!=='training'||s.turn>=72)return false;
 const talk=Today.townTalk(s,{visit,side});if(!Today.canQueueTownTalk(s,talk))return false;
 const old=[...s.stats],beforeEnergy=s.energy,beforeBond=s.trainerBond;
 s.energy=clamp(s.energy+TOWN_REST);s.mood=clamp(s.mood+25+YE.moodBonus(s));s.trainerBond=clamp(s.trainerBond+bondGain(s,'town'));s.turn++;
 const text=`町へ。${visit?talk.name+'とひと息':'「'+talk.name+'」'}。体力＋${s.energy-beforeEnergy}、やる気1段階アップ。`;
 s.lastAction={key:'town',outcome:'town',friendship:false,gains:[0,0,0,0,0],text,event:'',learned:[],beforeStats:old,afterStats:[...s.stats],energyDelta:s.energy-beforeEnergy,bondDelta:s.trainerBond-beforeBond};
 s.log.unshift({turn:s.turn,text,trainingKey:'town',beforeStats:old,afterStats:[...s.stats]});s.log=s.log.slice(0,72);
 if(!Today.queueTownTalk(s,talk))return false;
 schedule(s);Today.afterTraining(s);return true;
}
import * as Legacy from './legacy-game.js';
import {MODERN_INDIVIDUALITY,personalityOf,talentOf,validIndividuality,talentCandidates,TALENTS,TALENT_POOL,startingTalent,talentEffects} from './individuality.js';
import {freshEvents,validEvents,hasPendingDialogue,queueEvent} from './events.js';
import {createDomesticSelection,validDomesticSelection,recordDomesticSelection,domesticWorldQualification} from './domestic-selection.js';
import {rng,makeRacePlan,simulateRace,STYLES,compareFinish,moodLevel} from './race-system.js';
import {queueMain,randomDefinitions,NPCS,individualName,trainingReaction} from './story.js';
export const VERSION=6,STAT_KEYS=Legacy.STAT_KEYS,STAT_NAMES=['スピード','スタミナ','食欲','かしこさ','きようさ'],STAGES=Legacy.STAGES,ANIMALS=Legacy.ANIMALS;
export const PARTNERS=Legacy.PARTNERS.map(p=>({...p,type:{mochi:'食いしん坊',dash:'元気',hakase:'クール'}[p.id],coat:{mochi:'やわらかい赤',dash:'青い灰色',hakase:'クリーム黄'}[p.id]}));
export const TRAININGS=[...Legacy.TRAININGS.filter(t=>t.key!=='rest'),{key:'rest',name:'休息',sub:'体力を大きく回復。',gain:46,cost:0,icon:'bed'},{key:'outing',name:'お出かけ',sub:'体力を少し回復、やる気を上げる。',gain:18,cost:0,icon:'seed'},{key:'scout',name:'大会の下見',sub:'1ターンで次のコースとゾーンを調査。',gain:0,cost:0,icon:'maze'}];
export const COMPETITIONS={};
for(let year=1;year<=3;year++){
 COMPETITIONS['ordinary-'+year]={id:'ordinary-'+year,title:['ひまわりデビュー杯','どんぐり交流杯','夢の前夜グランプリ'][year-1],kind:'ordinary',year,turn:12+(year-1)*24,entrants:[12,16,20][year-1],cutoff:null};
 const id=year===3?'representative':'selection-'+year;
 COMPETITIONS[id]={id,title:year===3?'はむちゅたー界 最終代表決定戦':year+'年目 国内代表選抜',kind:year===3?'representative':'selection',year,turn:year*24,entrants:[50,25,12][year-1],cutoff:[22,10,1][year-1],totalAdvance:[25,12,1][year-1],revivalSlots:[3,2,0][year-1]};
 if(year<3)COMPETITIONS['repechage-'+year]={id:'repechage-'+year,title:year+'年目 敗者復活戦',kind:'repechage',year,turn:year*24,entrants:year===1?28:15,cutoff:year===1?3:2};
}
COMPETITIONS.zodiac={id:'zodiac',title:'世界十二支決定戦',kind:'zodiac',year:3,turn:72,entrants:50,cutoff:12};
export const isLegacy=s=>s?.version===5;
const copy=x=>JSON.parse(JSON.stringify(x)),clamp=n=>Math.max(0,Math.min(100,n)),uint=n=>Number.isInteger(n)&&n>=0&&n<=0xffffffff,inRange=n=>Number.isFinite(n)&&n>=0&&n<=100;
let sequence=0;
export function freshProfile(){return {ownedHamsters:PARTNERS.map(p=>({id:'owned-'+p.id,characterId:p.id,...MODERN_INDIVIDUALITY[p.id]})),unavailableLegacyHamsters:[]};}
export const ownedCandidates=Legacy.ownedCandidates,partnerIndex=Legacy.partnerIndex,grade=Legacy.grade;
export function freshState(seed=Date.now()>>>0){return {version:6,storyVersion:3,social:Today.freshSocial(),balanceVersion:2,growthRemainder:[0,0,0,0,0],ruleset:'annual-selection-v1',id:`run-${Date.now().toString(36)}-${++sequence}`,seed:seed>>>0,events:freshEvents(seed),phase:'select',characterId:'mochi',individualName:'もちまる',hamsterInstanceId:null,turn:0,stats:[...PARTNERS[0].stats],energy:100,mood:75,trainerBond:0,npcRelations:{},...MODERN_INDIVIDUALITY.mochi,skills:[],races:[],legacyRaces:[],log:[],lastAction:null,lastRace:null,pendingCompetitionId:null,pendingStyle:'skitter',plans:{},scouted:[],rivals:[],domestic:null,qualification:null,ending:null,newZodiac:null,completedAt:null};}
export function currentCompetition(s){return isLegacy(s)?Legacy.currentCompetition(s):COMPETITIONS[s.pendingCompetitionId]||null;}
export function currentCourse(s){return isLegacy(s)?Legacy.currentCourse(s):s.plans?.[s.pendingCompetitionId]||null;}
export function chooseCourse(s,id){return isLegacy(s)?Legacy.chooseCourse(s,id):false;}
export function chooseStyle(s,id){if(isLegacy(s)||hasPendingDialogue(s)||s.phase!=='race-ready'||!Object.hasOwn(STYLES,id))return false;s.pendingStyle=id;return true;}
export function canEnterZodiac(s){if(isLegacy(s))return Legacy.canEnterZodiac(s);if(s.turn!==72||!domesticWorldQualification(s.domestic,s.id,s.hamsterInstanceId))return false;const q=s.domestic.qualification,r=s.races.find(r=>r.id===q.resultId);return !!r&&r.kind==='representative'&&r.rank===1&&r.hamsterInstanceId===s.hamsterInstanceId&&r.runId===s.id;}
export function validPlan(c){return !!c&&c.version===6&&typeof c.name==='string'&&['short','middle','long','curves','special'].includes(c.typeId)&&Number.isFinite(c.baseTime)&&c.baseTime>0&&Array.isArray(c.stages)&&c.stages.length>=1&&c.stages.length<=7&&Array.isArray(c.zones)&&c.zones.length<=3&&new Set(c.zones).size===c.zones.length&&c.zones.every(x=>['maze','eating','study'].includes(x))&&c.stages.every(z=>typeof z.name==='string'&&typeof z.short==='string'&&['speed','appetite','intelligence','technique'].includes(z.action)&&Array.isArray(z.keys)&&z.keys.length&&z.keys.every(k=>Number.isInteger(k)&&k>=0&&k<5)&&Number.isFinite(z.length)&&z.length>0&&Number.isFinite(z.start))&&Math.abs(c.stages.reduce((n,z)=>n+z.length,0)-1)<1e-8;}
export function validResult(r){
 if(r?.simulationVersion!==6)return Legacy.validResult(r);
 if(!r||typeof r.id!=='string'||typeof r.runId!=='string'||typeof r.hamsterInstanceId!=='string'||!['ordinary','selection','repechage','representative','zodiac'].includes(r.kind)||!validPlan(r.course)||!uint(r.seedBefore)||!uint(r.seedAfter)||!Number.isInteger(r.entrants)||r.entrants<2||r.entrants>50||!Array.isArray(r.standings)||r.standings.length!==r.entrants||new Set(r.standings.map(x=>x.id)).size!==r.entrants||!r.standings.every((x,i,a)=>typeof x.id==='string'&&typeof x.name==='string'&&typeof x.species==='string'&&Number.isFinite(x.total)&&x.total>0&&Number.isInteger(x.startOrder)&&(i===0||compareFinish(a[i-1],x)<0))||r.standings.findIndex(x=>x.id==='player')+1!==r.rank)return false;
 if(r.kind!=='zodiac'&&r.standings.some(x=>x.species!=='hamster'))return false;
 if(r.kind==='zodiac'&&new Set(r.standings.map(x=>x.species)).size!==50)return false;
 if(!Array.isArray(r.participants)||r.participants.length!==r.entrants||new Set(r.participants.map(x=>x.id)).size!==r.entrants||!Array.isArray(r.checkpoints)||r.checkpoints.length!==r.course.stages.length||!Array.isArray(r.splits)||r.splits.length!==r.course.stages.length||!r.splits.every(x=>Number.isFinite(x)&&x>0)||!Array.isArray(r.incidents))return false;
 return r.participants.every(p=>Array.isArray(p.analysis)&&p.analysis.length===r.splits.length&&p.analysis.every(a=>Number.isFinite(a.loss)&&a.loss>=0&&a.loss<=5&&Number.isFinite(a.styleFactor))&&Array.isArray(p.times)&&p.times.length===r.splits.length&&p.times.every(x=>Number.isFinite(x)&&x>0)&&Math.abs(p.times.reduce((a,b)=>a+b,0)-r.standings.find(x=>x.id===p.id)?.total)<1e-8)&&r.checkpoints.every(c=>Array.isArray(c.standings)&&c.standings.length===r.entrants&&c.standings.every(x=>Number.isFinite(x.split)&&Number.isFinite(x.total)));
}
export function validState(s){
 if(isLegacy(s))return Legacy.validState(s);
 if(!Today.validSocial(s))return false;
 if(s?.balanceVersion!==undefined&&s.balanceVersion!==2)return false;
 if(s?.growthRemainder!==undefined&&(!Array.isArray(s.growthRemainder)||s.growthRemainder.length!==5||!s.growthRemainder.every(v=>Number.isFinite(v)&&v>=0&&v<1)))return false;
 if(!s||s.version!==6||typeof s.id!=='string'||!uint(s.seed)||!validEvents(s.events)||(s.events.pending&&!s.events.pending.instanceId.startsWith(s.id+':event:'))||!Number.isInteger(s.turn)||s.turn<0||s.turn>72||!PARTNERS.some(p=>p.id===s.characterId)||!validIndividuality(s)||(s.extraTalents!==undefined&&!(Array.isArray(s.extraTalents)&&s.extraTalents.length<=3&&new Set(s.extraTalents).size===s.extraTalents.length&&s.extraTalents.every(id=>Object.hasOwn(TALENTS,id)&&id!==s.talentId)))||!Array.isArray(s.stats)||s.stats.length!==5||!s.stats.every(inRange)||!['energy','mood','trainerBond'].every(k=>inRange(s[k]))||!s.npcRelations||Array.isArray(s.npcRelations)||!Object.values(s.npcRelations).every(inRange)||!Array.isArray(s.skills)||!s.skills.every(x=>Number.isInteger(x)&&x>=0&&x<5)||!Array.isArray(s.log)||!Array.isArray(s.races)||s.races.length>9||!s.races.every(validResult)||new Set(s.races.map(x=>x.competitionId)).size!==s.races.length||!Array.isArray(s.scouted)||!s.plans||!Object.values(s.plans).every(validPlan)||typeof s.individualName!=='string'||s.individualName.length>40)return false;
 if(s.phase==='select')return s.turn===0&&s.hamsterInstanceId===null&&s.domestic===null;
 if(typeof s.hamsterInstanceId!=='string'||!validDomesticSelection(s.domestic)||s.domestic.runId!==s.id||s.domestic.ownedHamsterId!==s.hamsterInstanceId||!Array.isArray(s.rivals)||s.rivals.length!==49||new Set(s.rivals.map(x=>x.id)).size!==49||!s.domestic.records.every(d=>!d.standings.some(x=>x.id==='player')?d.kind==='repechage':s.races.some(r=>r.id===d.id&&r.standings.every((x,i)=>x.id===d.standings[i]?.id&&x.total===d.standings[i]?.total))))return false;
 if(s.phase==='training')return s.turn<72&&s.pendingCompetitionId===null&&s.domestic.status==='selection-ready';
 if(s.phase==='race-ready'){const c=currentCompetition(s);return !!c&&c.turn===s.turn&&validPlan(currentCourse(s))&&Object.hasOwn(STYLES,s.pendingStyle)&&(c.kind!=='zodiac'||canEnterZodiac(s))&&(c.kind!=='repechage'||s.domestic.status==='repechage-ready');}
 if(s.phase==='results')return validResult(s.lastRace)&&s.lastRace.runId===s.id&&s.races.some(r=>r.id===s.lastRace.id);
 return s.phase==='finished'&&['domestic_loss','representative_loss','zodiac_loss','zodiac_member'].includes(s.ending)&&validResult(s.lastRace)&&typeof s.completedAt==='string';
}
// Koyori's bond (shown on the ability page; never part of a race). In a run with the four stories it is what
// こよりのノート waits for (owner 2026-11-01 「止める。きずなの上がり方をゆっくりに」), so it grows slowly from practice
// and more from the turns spent looking after the hero.
// Tried in play (owner 2026-11-08 「ためしてみて」, pick 「練習0・休む3・お出かけ3」): 第4話 comes about ten turns late in
// ordinary play, and nearly everyone (93〜100%) still reads 第5話.
export const BOND_GAIN={classic:{training:5,failure:3,rest:6,outing:4,town:2},book:{training:0,failure:1,rest:3,outing:3,town:1}};
export const bondGain=(s,kind)=>BOND_GAIN[isBook(s)?'book':'classic'][kind];
export function start(s,instanceId,profile,talentId){
 if(isLegacy(s)){if(s.phase!=='select'||hasPendingDialogue(s)||!ownedCandidates(profile).some(h=>h.id===instanceId))return Legacy.start(s,instanceId,profile);const id=s.id;Object.assign(s,freshState(s.seed));s.id=id;}
 const h=ownedCandidates(profile).find(x=>x.id===instanceId);if(hasPendingDialogue(s)||s.phase!=='select'||!h)return false;
 const def=PARTNERS.find(p=>p.id===h.characterId);Object.assign(s,{characterId:def.id,individualName:h.name||def.name,hamsterInstanceId:h.id,stats:[...def.stats],personalityId:h.personalityId,talentId:s.storyVersion===3?(TALENT_POOL.includes(talentId)?talentId:startingTalent(s.seed)):Today.isToday(s)&&talentCandidates(s.seed).includes(talentId)?talentId:h.talentId,phase:'training'});
 // #30 (owner 2026-10-30): a new run's first talent comes at random and rare events add more (story-today.js).
 // New runs are story v3; a story v2 run keeps the three-card pick it began with.
 if(s.storyVersion===3)Object.assign(s,{talentRule:'random',extraTalents:[]});
 // The four stories (#30, owner 2026-11-01): new runs only (owner pick 「前のお話のまま最後まで」).
 if(s.storyVersion===3)s.events.storyProgress[BOOK_FLAG]=1;
 // 夏合宿と年ごとのできごと (#30, owner 2026-11-08): new runs only.
 if(s.storyVersion===3)s.events.storyProgress[YE.YEAR_FLAG]=1;
 const r=rng(s.seed^0x917a21e3);s.rivals=Array.from({length:49},(_,i)=>({id:'domestic-'+i,name:['こむぎ','まめた','ぴの','くるみ','ぽてと','あずき','こはく'][i%7]+(Math.floor(i/7)+1),species:'hamster',dna:STAT_KEYS.map(()=>r.int(19,36)),growth:r.int(9,14),style:Object.keys(STYLES)[r.int(0,2)],variant:i%3}));
 if(Today.isToday(s))Object.assign(s.rivals[0],{name:'ぽてち',variant:1});
 s.domestic=createDomesticSelection(s.id,h.id,[{id:'player',species:'hamster'},...s.rivals]);for(const id of Object.keys(COMPETITIONS))s.plans[id]=makeRacePlan(r.int(0,0xffffffff));
 s.log=[{turn:0,text:`${s.individualName}との3年間がはじまった！`}];queueMain(s,'prologue');return true;
}
export function failureChance(s,key){if(isLegacy(s))return Legacy.failureChance(s,key);if(['rest','outing','scout'].includes(key))return 0;return Math.max(0,Math.min(65,Math.round((40-s.energy)*1.3+(2-moodLevel(s.mood))*4+personalityOf(s).failureOffset)-(friendsHelp(s,key)?FRIEND_FAIL:0)-(Today.isToday(s)?talentEffects(s).failMinus||0:0)+YE.failAdd(s,key)));}
// Training friends (#30 B2, owner 2026-10-25): in the today story every friend met so far comes on their own,
// 20% a turn, to their favourite training (65%) or any training. With at least one friend the training costs
// 40% less energy and fails 15 points less often; the growth bonus by friendship is unchanged.
export const FRIEND_CHANCE=.2,FRIEND_COST=.6,FRIEND_FAIL=15;
// Conversations now give small abilities, energy and motivation (#30, owner 2026-10-26); to keep the zodiac rate
// where it was (owner pick 「今と同じくらいに合わせる」), each year's growth target is this much lower.
// Measured (3 heroes x 100 seeds): zodiac rate 93% -> 95% (lowest-ability play), 99% -> 98% (chasing friends).
export const STORY_TARGET_SHIFT=6;
// Talents from rare events (#30, owner 2026-10-30, pick 「今と同じくらいに合わせる」): runs that collect talents
// aim a little lower each year so the zodiac rate stays where it was (measured in docs/qa/talent-rare-v69).
// Same seeds, 1,200 runs × 2 ways of playing: before 94.3% / 90.3%, after 94.0% / 90.0% (another 1,500: 93.7 / 89.3 → 93.9 / 89.3).
export const RARE_TARGET_SHIFT=2.2;
// 夏合宿と年ごとのできごと (#30, owner 2026-11-08, pick 「今と同じくらいに合わせる」): runs with them aim this much lower
// each year so the zodiac rate stays where it was (docs/qa/year-events-v78). 3 heroes x 60 seeds x 5 ways of playing,
// average zodiac rate: before 80.9%, with no shift 85.8%, 0.5 → 81.5%, 1 → 79.4%, 2 → 73.3%.
export const YEAR_TARGET_SHIFT=0.5;
const idHash=id=>[...id].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
const friendsHelp=(s,key)=>Today.isToday(s)&&trainingNPCs(s,key).length>0;
export function trainingCost(s,key){const t=TRAININGS.find(x=>x.key===key);if(!t)return 0;return Math.round(t.cost*(friendsHelp(s,key)?FRIEND_COST:1)*(Today.isToday(s)?talentEffects(s).costMul??1:1)*YE.costMul(s));}
export function trainingNPCs(s,key){
 if(isLegacy(s)||!s.plans?.['ordinary-1'])return [];
 // Each friend has one independent, stable offer for the whole turn; querying another card cannot reroll it.
 if(Today.isToday(s)){const chance=Math.max(talentEffects(s).friendChance??FRIEND_CHANCE,YE.friendChanceOf(s));return Today.localTrainingBuddies(s).filter(n=>{const r=rng(s.plans['ordinary-1'].planSeed^Math.imul(s.turn+1,0x9e3779b1)^0x63a14bc7^idHash(n.id));if(r.next()>=chance)return false;return (n.favorite&&r.next()<.65?n.favorite:TRAININGS[r.int(0,4)].key)===key;});}
 const r=rng(s.plans['ordinary-1'].planSeed^Math.imul(s.turn+1,0x9e3779b1)^0x63a14bc7);
 if(r.next()>=.60)return [];
 const available=Today.isToday(s)?Today.localTrainingBuddies(s):NPCS;if(!available.length)return [];
 const n=available[r.int(0,available.length-1)],slot=n.favorite&&r.next()<.65?n.favorite:TRAININGS[r.int(0,4)].key;
 return slot===key?[n]:[];
}
// Fractional progress is saved, so small gains are never discarded by rounding.
export function trainingPreview(s,key){
 const t=TRAININGS.find(x=>x.key===key),gains=[0,0,0,0,0];
 if(!t||t.target===undefined)return {gains,greatGains:[...gains],remainders:[...(s.growthRemainder||gains)],friendshipBonus:0,accumulating:false};
 if(isLegacy(s)){gains[t.target]=Math.min(100-s.stats[t.target],Legacy.previewGain(s,key));gains[t.secondary]=Math.min(100-s.stats[t.secondary],1);const greatGains=[...gains];greatGains[t.target]=Math.min(100-s.stats[t.target],gains[t.target]+2);return {gains,greatGains,friendshipBonus:0,accumulating:false};}
 const friendshipBonus=Math.max(0,...trainingNPCs(s,key).map(n=>(s.npcRelations[n.id]||0)/100*.25)),year=Math.min(2,Math.floor(s.turn/24)),target=[75,88,102][year]-(Today.isToday(s)?STORY_TARGET_SHIFT:0)-(s.talentRule==='random'?RARE_TARGET_SHIFT:0)-(YE.hasYearEvents(s)?YEAR_TARGET_SHIFT:0);
 const attenuate=(i,n)=>n*Math.max(.04,Math.min(1,(target-s.stats[i])/35));
 const tal=Today.isToday(s)?talentEffects(s):talentOf(s),base=(t.gain+personalityOf(s).growth[t.target]+tal.growth[t.target])*(1+(moodLevel(s.mood)-2)*.05)*(tal.yearGrowth?.[year]??1)*YE.growthMul(s,key),friendsHere=friendshipBonus>0||trainingNPCs(s,key).length>0;
 const boost=Today.isToday(s)&&s.social.boost?.key===key?1+s.social.boost.percent:1;
 const raw=[0,0,0,0,0];raw[t.target]=attenuate(t.target,base)*(1+friendshipBonus+(friendsHere&&tal.friendGrowth||0));raw[t.secondary]=attenuate(t.secondary,.8);for(let i=0;i<5;i++)raw[i]*=boost;
 const carry=s.growthRemainder||[0,0,0,0,0],project=great=>{const remaining=[],values=raw.map((n,i)=>{const total=n+carry[i]+(great&&i===t.target?attenuate(i,.6)*boost:0),v=Math.min(100-s.stats[i],Math.floor(total+1e-9));remaining[i]=s.stats[i]+v>=100?0:Math.max(0,total-Math.floor(total+1e-9));return v;});return {values,remaining};};
 const normal=project(false),great=project(true);return {gains:normal.values,greatGains:great.values,remainders:normal.remaining,greatRemainders:great.remaining,friendshipBonus,accumulating:normal.values[t.target]===0&&s.stats[t.target]<100};
}
export function previewGain(s,key){if(isLegacy(s))return Legacy.previewGain(s,key);const t=TRAININGS.find(x=>x.key===key);return t?.target===undefined?t?.gain||0:trainingPreview(s,key).gains[t.target];}
export function nextScheduledCompetition(s){return Object.values(COMPETITIONS).filter(c=>c.kind!=='zodiac'&&c.kind!=='repechage'&&c.turn>s.turn&&!s.races.some(r=>r.competitionId===c.id)).sort((a,b)=>a.turn-b.turn)[0]||null;}
function schedule(s){const c=Object.values(COMPETITIONS).find(c=>c.turn===s.turn&&['ordinary','selection','representative'].includes(c.kind)&&!s.races.some(r=>r.competitionId===c.id));if(c){s.phase='race-ready';s.pendingCompetitionId=c.id;s.pendingStyle='skitter';}}
export function train(s,key){
 if(isLegacy(s))return Legacy.train(s,key);if(hasPendingDialogue(s)||s.phase!=='training'||s.turn>=72)return false;
 const t=TRAININGS.find(x=>x.key===key);if(!t)return false;const old=[...s.stats],beforeEnergy=s.energy,beforeBond=s.trainerBond,r=rng(s.seed);let outcome='success',text='',friendship=false,helpers=[];
 if(key==='rest'){s.energy=clamp(s.energy+46);s.trainerBond=clamp(s.trainerBond+bondGain(s,'rest'));outcome='rest';text='おふとんでぐっすり。体力＋46。';}
 else if(key==='outing'){s.energy=clamp(s.energy+18);s.mood=clamp(s.mood+25+YE.moodBonus(s));s.trainerBond=clamp(s.trainerBond+bondGain(s,'outing'));outcome='outing';text='町をのんびりお散歩。体力＋18、やる気1段階アップ。';}
 else if(key==='scout'){const next=nextScheduledCompetition(s);if(!next||s.scouted.includes(next.id))return false;s.scouted.push(next.id);outcome='scout';text=`${next.title}を下見。コースとゾーンの位置がわかった！`;}
 else{
  const fail=r.next()*100<failureChance(s,key),great=!fail&&r.next()<personalityOf(s).greatChance+(Today.isToday(s)?talentEffects(s).greatPlus||0:0)+YE.greatAdd(s);helpers=trainingNPCs(s,key);friendship=!fail&&helpers.some(n=>(s.npcRelations[n.id]||0)>=80);
  if(!fail){const growth=trainingPreview(s,key);s.stats=s.stats.map((v,i)=>clamp(v+(great?growth.greatGains:growth.gains)[i]));s.growthRemainder=great?growth.greatRemainders:growth.remainders;s.balanceVersion=2;}
  s.energy=clamp(s.energy-trainingCost(s,key));s.mood=clamp(s.mood+(fail?-25:1));s.trainerBond=clamp(s.trainerBond+bondGain(s,fail?'failure':'training'));for(const n of helpers)s.npcRelations[n.id]=clamp((s.npcRelations[n.id]||0)+20);
  outcome=fail?'failure':friendship?'friendship':great?'great':'success';text=`${t.name}、${fail?'失敗……能力は上がらなかった。':friendship?'友情練習！':great?'大成功！':'成功！'}${fail?'':` ${STAT_NAMES[t.target]}＋${s.stats[t.target]-old[t.target]}`}`;text+=' '+trainingReaction(s,outcome,helpers[0],key,helpers);
 }
 s.seed=r.seed;s.turn++;const learned=[];s.stats.forEach((v,i)=>{if(v>=58&&!s.skills.includes(i)){s.skills.push(i);learned.push(['ロケットスタート','不屈のあしどり','早食い名人','天才のひらめき','迷路の達人'][i]);}});
 if(Today.isToday(s)&&key==='rest')text=`おふとんでぐっすり。体力＋${s.energy-beforeEnergy}。`;if(Today.isToday(s)&&key==='outing')text=`町をのんびりお散歩。体力＋${s.energy-beforeEnergy}、やる気を整えた。`;
 s.lastAction={key,outcome,friendship,gains:s.stats.map((v,i)=>v-old[i]),text,event:'',learned,...(helpers.length?{with:helpers.map(n=>n.id)}:{}),...(Today.isToday(s)?{beforeStats:old,afterStats:[...s.stats],energyDelta:s.energy-beforeEnergy,bondDelta:s.trainerBond-beforeBond}:{})};s.log.unshift({turn:s.turn,text,...(Today.isToday(s)?{trainingKey:key,beforeStats:old,afterStats:[...s.stats]}:{})});s.log=s.log.slice(0,72);schedule(s);Today.afterTraining(s);
 // Story v2/v3: a random talk on 35% of the turns with no other talk (#30); older runs keep every sixth turn.
 if(Today.isToday(s)){if(!Today.rareTalentEvent(s))Today.randomTalk(s);}else if(s.phase==='training'&&s.turn%6===0)queueEvent(s,randomDefinitions(s),'turn-event-'+s.turn);return true;
}
// World final: the rival cat (owner, #30 I4, 2026-10-24) is a strong rival just below the zodiac:
// 78-92 (zodiac 82-96, others 50-74). The RNG sequence is unchanged, so every other entrant
// keeps its stats. In 150 sample finals the cat enters the twelve about 4 times in 10.
export function raceRunners(s,c=currentCompetition(s)){
 const hero={id:'player',name:individualName(s),species:'hamster',hamsterInstanceId:s.hamsterInstanceId,stats:[...s.stats],variant:partnerIndex(s)};
 if(c.kind==='zodiac'){const r=rng(s.plans.zodiac.planSeed^0x1948);return [hero,...ANIMALS.map((name,i)=>({id:i===0?'rat':'world-'+i,name,species:name,stats:(()=>{const exceptional=i>=12&&r.next()<.035,cat=name==='ネコ';return STAT_KEYS.map((_,k)=>Math.min(99,r.int(i<12?82:cat?78:exceptional?78:50,i<12?96:cat?92:exceptional?90:74)+(k===i%5?3:0)));})(),style:Object.keys(STYLES)[i%3]}))];}
 const ids=c.kind==='ordinary'?['player',...s.rivals.slice(0,c.entrants-1).map(x=>x.id)]:c.kind==='repechage'?s.domestic.pending.nonqualifiers.map(x=>x.id):s.domestic.roster.map(x=>x.id);
 return ids.map(id=>id==='player'?hero:(()=>{const x=s.rivals.find(x=>x.id===id);return {...x,stats:Today.isToday(s)&&x.id==='domestic-0'?[[64,60,76,58,63],[77,74,84,70,76],[84,82,88,80,83]][c.year-1]:x.dna.map((v,k)=>clamp(v+x.growth*c.year+(k===Number(x.id.split('-')[1])%5?6:0)))};})());
}
export function runRace(s){
 if(isLegacy(s))return Legacy.runRace(s);const c=currentCompetition(s);
 if(hasPendingDialogue(s)||s.phase!=='race-ready'||!c||s.turn!==c.turn||s.races.some(x=>x.competitionId===c.id)||(c.kind==='zodiac'&&!canEnterZodiac(s)))return false;
 const course=currentCourse(s),seedBefore=s.seed,sim=simulateRace({seed:s.seed,course,runners:raceRunners(s,c),player:s,style:s.pendingStyle}),rank=sim.standings.findIndex(x=>x.id==='player')+1;
 const result={id:s.id+':'+c.id,runId:s.id,hamsterInstanceId:s.hamsterInstanceId,characterId:s.characterId,competitionId:c.id,simulationVersion:6,title:c.title,kind:c.kind,year:c.year,turn:s.turn,entrants:c.entrants,cutoff:c.cutoff,course:copy(course),style:s.pendingStyle,rank,qualified:c.kind==='zodiac'&&rank<=12,final:c.kind==='zodiac',stats:[...s.stats],seedBefore,...sim};
 s.seed=sim.seedAfter;s.lastRace=result;s.races.push(result);s.phase='results';s.log.unshift({turn:s.turn,text:`${c.title}：${c.entrants}匹中${rank}位！`});return result;
}
export function acceptRace(s){
 if(isLegacy(s))return Legacy.acceptRace(s);if(hasPendingDialogue(s)||s.phase!=='results'||!validResult(s.lastRace))return false;const r=s.lastRace,c=COMPETITIONS[r.competitionId];if(r.runId!==s.id||r.hamsterInstanceId!==s.hamsterInstanceId||!s.races.some(x=>x.id===r.id)||!c)return false;
 const finish=ending=>{s.phase='finished';s.ending=ending;s.pendingCompetitionId=null;s.completedAt=new Date().toISOString();queueMain(s,'ending');};
 if(r.kind==='ordinary'){s.phase='training';s.pendingCompetitionId=null;s.energy=clamp(s.energy+35);s.mood=clamp(s.mood+12);s.stats=s.stats.map(v=>clamp(v+1));s.lastAction={key:'joy',outcome:'race',text:'大会の経験を、次の一歩に。全能力＋1、体力＋35。育成はつづく。',gains:[1,1,1,1,1],learned:[]};Today.afterOrdinary(s);return true;}
 if(r.kind==='zodiac'){s.newZodiac=r.standings.slice(0,12).map(x=>({id:x.id,species:x.species,name:x.name}));finish(r.rank<=12?'zodiac_member':'zodiac_loss');return true;}
 let next=recordDomesticSelection(s.domestic,{id:r.id,runId:s.id,ownedHamsterId:s.hamsterInstanceId,year:r.year,kind:r.kind==='repechage'?'repechage':'selection',seedBefore:r.seedBefore,seedAfter:r.seedAfter,standings:r.standings});if(!next)return false;s.domestic=next;
 if(next.status==='repechage-ready'&&!next.pending.nonqualifiers.some(x=>x.id==='player')){
  // Direct qualifiers never lose their place. Resolve the reserved NPC slots off-camera once.
  const revival=COMPETITIONS['repechage-'+r.year],seedBefore=s.seed,sim=simulateRace({seed:s.seed,course:s.plans[revival.id],runners:raceRunners(s,revival),player:s});
  next=recordDomesticSelection(s.domestic,{id:s.id+':'+revival.id+':automatic',runId:s.id,ownedHamsterId:s.hamsterInstanceId,year:r.year,kind:'repechage',seedBefore,seedAfter:sim.seedAfter,standings:sim.standings});if(!next)return false;s.seed=sim.seedAfter;s.domestic=next;
 }
 if(next.status==='repechage-ready'){s.phase='race-ready';s.pendingCompetitionId='repechage-'+r.year;s.pendingStyle='skitter';}
 else if(next.status==='finished-loss')finish(r.year===3?'representative_loss':'domestic_loss');
 else if(next.status==='qualified'){s.qualification=copy(next.qualification);s.phase='race-ready';s.pendingCompetitionId='zodiac';s.pendingStyle='skitter';queueMain(s,'final');}
 else{s.phase='training';s.pendingCompetitionId=null;s.energy=clamp(s.energy+30);queueMain(s,'year'+r.year);}
 return true;
}
export const raceTitle=s=>currentCompetition(s)?.title||s.lastRace?.title||'大会';
export const gameDate=Legacy.gameDate;
