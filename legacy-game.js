import {DEFAULT_INDIVIDUALITY,personalityOf,talentOf,validIndividuality} from './individuality.js';
import {COURSES,validCourse,courseAbility} from './courses.js';
import {freshEvents,validEvents,hasPendingDialogue} from './events.js';
export const VERSION = 5;
export const STAT_KEYS = ['speed','stamina','appetite','intelligence','technique'];
export const STAT_NAMES = ['スピード','スタミナ','食いしんぼ','かしこさ','きようさ'];
export const PARTNERS = [
 {id:'mochi',name:'もちまる',type:'食いしんぼう',desc:'ほお袋には、夢もいっぱい。',stats:[25,28,38,23,26],trait:2,skill:'もちもちほお袋'},
 {id:'dash',name:'ダッシュ',type:'かけっこ好き',desc:'小さな足で、世界を追いこせ。',stats:[38,28,23,25,26],trait:0,skill:'ちいさなロケット'},
 {id:'hakase',name:'はかせ',type:'ひらめき上手',desc:'どんな迷路も、きっと解ける。',stats:[24,25,26,38,27],trait:3,skill:'ひまわりのひらめき'}
];
export const TRAININGS = [
 {key:'speed',name:'かけっこ',sub:'風より、もう一歩。',target:0,secondary:1,gain:3,cost:18,icon:'shoe'},
 {key:'stamina',name:'回し車',sub:'最後まで走れる体に。',target:1,secondary:0,gain:4,cost:17,icon:'wheel'},
 {key:'appetite',name:'もぐもぐ練習',sub:'おいしさも、才能だ。',target:2,secondary:1,gain:3,cost:16,icon:'seed'},
 {key:'intelligence',name:'おべんきょう',sub:'ひらめきを、ひとつ。',target:3,secondary:4,gain:3,cost:15,icon:'book'},
 {key:'technique',name:'迷路チャレンジ',sub:'くねくね道も、おまかせ。',target:4,secondary:3,gain:3,cost:17,icon:'maze'},
 {key:'rest',name:'ひとやすみ',sub:'がんばらない日も、大切。',gain:46,cost:0,icon:'bed'}
];
export const ANIMALS = ['ネズミ','ウシ','トラ','ウサギ','タツ','ヘビ','ウマ','ヒツジ','サル','ニワトリ','イヌ','イノシシ','ネコ','キツネ','タヌキ','クマ','パンダ','リス','モモンガ','カピバラ','モルモット','チンチラ','フェレット','ハリネズミ','コアラ','カンガルー','ウォンバット','ナマケモノ','アライグマ','カワウソ','ビーバー','ラッコ','アザラシ','ペンギン','フクロウ','タカ','ワシ','フラミンゴ','ダチョウ','クジャク','カメ','ワニ','カエル','シカ','キリン','ゾウ','サイ','カバ','ライオン'];
export const STAGES = COURSES.allround.stages;
const clamp=(v,a=0,b=100)=>Math.min(b,Math.max(a,v));
function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
const roll=(s,a,b)=>Math.floor(random(s)*(b-a+1))+a;
let runSequence=0;
export const COMPETITIONS = {
 debut:{id:'debut',title:'ひまわりデビュー杯',kind:'ordinary',turn:24,entrants:12,courseId:'sprint',courseIds:['sprint','eating','maze']},
 exchange:{id:'exchange',title:'ハムスター交流グランプリ',kind:'ordinary',turn:48,entrants:16,courseId:'eating',courseIds:['sprint','eating','maze']},
 representative:{id:'representative',title:'ハムスター界代表決定戦',kind:'representative',turn:72,entrants:20,courseId:'allround'},
 zodiac:{id:'zodiac',title:'十二支決定レース',kind:'zodiac',turn:72,entrants:50,courseId:'allround'}
};
export function freshProfile(){return {ownedHamsters:PARTNERS.map(p=>({id:'owned-'+p.id,characterId:p.id,...DEFAULT_INDIVIDUALITY[p.id]})),unavailableLegacyHamsters:[]};}
export function ownedCandidates(profile){return (profile?.ownedHamsters||[]).filter(h=>PARTNERS.some(p=>p.id===h.characterId));}
export function partnerIndex(s){return Math.max(0,PARTNERS.findIndex(p=>p.id===s.characterId));}
export function freshState(seed=Date.now()>>>0){return {version:VERSION,id:`run-${Date.now().toString(36)}-${++runSequence}`,seed:seed>>>0,events:freshEvents(seed),phase:'select',characterId:'mochi',hamsterInstanceId:null,turn:0,stats:[...PARTNERS[0].stats],energy:100,mood:75,trainerBond:0,npcRelations:{},...DEFAULT_INDIVIDUALITY.mochi,skills:[],races:[],legacyRaces:[],log:[],lastAction:null,lastRace:null,pendingCompetitionId:null,pendingCourseId:null,qualification:null,ending:null,legacyRecovery:false};}
const valueInRange=v=>Number.isFinite(v)&&v>=0&&v<=100;
export function validResult(r){return !!r&&typeof r.id==='string'&&typeof r.runId==='string'&&typeof r.hamsterInstanceId==='string'&&['ordinary','representative','zodiac','legacy'].includes(r.kind)&&typeof r.title==='string'&&Number.isInteger(r.rank)&&r.rank>=1&&r.rank<=r.entrants&&Array.isArray(r.standings)&&r.standings.length===r.entrants&&new Set(r.standings.map(x=>x.id)).size===r.entrants&&r.standings.every(x=>typeof x.id==='string'&&typeof x.name==='string'&&typeof x.species==='string'&&Number.isFinite(x.total))&&r.standings.findIndex(x=>x.id==='player')+1===r.rank&&Array.isArray(r.splits)&&r.splits.length===(r.course?.stages?.length??4)&&(r.course===undefined||validCourse(r.course))&&r.splits.every(Number.isFinite)&&Array.isArray(r.checkpoints)&&r.checkpoints.length===r.splits.length&&r.checkpoints.every(x=>Array.isArray(x.standings)&&x.standings.length===r.entrants&&Number.isInteger(x.rank));}
export function canEnterZodiac(s){const q=s.qualification;if(!q||q.runId!==s.id||q.hamsterInstanceId!==s.hamsterInstanceId||s.turn!==72)return false;const r=s.races.find(x=>x.id===q.resultId);return !!r&&r.kind==='representative'&&r.competitionId==='representative'&&r.runId===s.id&&r.hamsterInstanceId===s.hamsterInstanceId&&r.rank===1&&r.standings[0]?.id==='player';}
export function currentCompetition(s){return COMPETITIONS[s.pendingCompetitionId]||null;}
export function currentCourse(s){const c=currentCompetition(s);if(!c)return null;const id=s.pendingCourseId||c.courseId;return (c.courseIds||[c.courseId]).includes(id)?COURSES[id]:null;}
export function chooseCourse(s,id){const c=currentCompetition(s);if(hasPendingDialogue(s)||s.phase!=='race-ready'||!c?.courseIds?.includes(id))return false;s.pendingCourseId=id;return true;}
export function validState(s){
 if(!s||s.version!==VERSION||!validEvents(s.events)||(s.events.pending&&!s.events.pending.instanceId.startsWith(s.id+':event:'))||typeof s.id!=='string'||!Number.isInteger(s.seed)||s.seed<0||s.seed>4294967295||!Number.isInteger(s.turn)||s.turn<0||s.turn>72||!PARTNERS.some(p=>p.id===s.characterId)||!['select','training','race-ready','results','finished'].includes(s.phase)||!Array.isArray(s.stats)||s.stats.length!==5||!s.stats.every(valueInRange)||!['energy','mood','trainerBond'].every(k=>valueInRange(s[k]))||!validIndividuality(s)||!s.npcRelations||Array.isArray(s.npcRelations)||typeof s.npcRelations!=='object'||!Object.values(s.npcRelations).every(valueInRange)||!Array.isArray(s.skills)||!s.skills.every(x=>Number.isInteger(x)&&x>=0&&x<5)||!Array.isArray(s.races)||!s.races.every(validResult)||!Array.isArray(s.legacyRaces)||!s.legacyRaces.every(validResult)||!Array.isArray(s.log))return false;
 if(s.phase==='select')return s.turn===0&&s.hamsterInstanceId===null;
 if(typeof s.hamsterInstanceId!=='string')return false;
 if(s.phase==='training')return s.turn<72&&s.pendingCompetitionId===null;
 if(s.phase==='race-ready'){const c=currentCompetition(s);return !!c&&s.turn===c.turn&&!!currentCourse(s)&&(c.kind!=='zodiac'||canEnterZodiac(s));}
 if(s.phase==='results')return validResult(s.lastRace)&&s.lastRace.runId===s.id&&[...s.races,...s.legacyRaces].some(r=>r.id===s.lastRace.id);
 return ['representative_loss','zodiac_loss','zodiac_member'].includes(s.ending)&&validResult(s.lastRace);
}
export function start(s,instanceId,profile){const h=ownedCandidates(profile).find(x=>x.id===instanceId);if(hasPendingDialogue(s)||s.phase!=='select'||!h)return false;const def=PARTNERS.find(p=>p.id===h.characterId);s.characterId=def.id;s.hamsterInstanceId=h.id;s.stats=[...def.stats];s.personalityId=h.personalityId;s.talentId=h.talentId;s.phase='training';s.log=[{turn:0,text:`${def.name}との3年間の育成がはじまった！`}];return true;}
export function failureChance(s,key){if(key==='rest')return 0;return clamp(Math.round((40-s.energy)*1.3+(55-s.mood)*.2+personalityOf(s).failureOffset),0,65);}
export function previewGain(s,key){const t=TRAININGS.find(x=>x.key===key);if(!t)return 0;return t.gain+(key!=='rest'?(s.turn>=48?1:0)+personalityOf(s).growth[t.target]+talentOf(s).growth[t.target]:0);}
export function train(s,key){
 if(hasPendingDialogue(s)||s.phase!=='training'||s.turn>=72)return false;
 const t=TRAININGS.find(x=>x.key===key);if(!t)return false;
 const old=[...s.stats];let text='',outcome='success',friendship=false;
 if(key==='rest'){s.energy=clamp(s.energy+46);s.mood=clamp(s.mood+12);s.trainerBond=clamp(s.trainerBond+6);text='おふとんでぐっすり。体力が46回復！ 次もいっしょにがんばろう。';outcome='rest';}
 else{
  const fail=random(s)*100<failureChance(s,key);friendship=!fail&&s.trainerBond>=50&&random(s)<.30;
  const great=!fail&&random(s)<personalityOf(s).greatChance;const gain=fail?2:previewGain(s,key)+(great?2:0)+(friendship?2:0);
  s.stats[t.target]=clamp(s.stats[t.target]+gain);s.stats[t.secondary]=clamp(s.stats[t.secondary]+(fail?0:1));
  s.energy=clamp(s.energy-t.cost);s.mood=clamp(s.mood+(fail?-8:2));s.trainerBond=clamp(s.trainerBond+(fail?3:5));
  outcome=fail?'failure':friendship?'friendship':great?'great':'success';
  text=`${t.name}、${fail?'ちょっぴり失敗。でも、経験になった！':friendship?'友情トレーニング！':great?'大成功！':'成功！'} ${STAT_NAMES[t.target]}＋${s.stats[t.target]-old[t.target]}`;
 }
 s.turn++;
 let event='';if(s.turn%6===0&&s.turn%24!==0){s.mood=clamp(s.mood+10);s.trainerBond=clamp(s.trainerBond+8);event=['街のみんなから応援の手紙。やる気＋10、きずな＋8！','帰り道で大きなひまわりを発見。やる気＋10、きずな＋8！','練習ノートがいっぱいになった。やる気＋10、きずな＋8！'][Math.floor(s.turn/6)%3];}
 const learned=[];s.stats.forEach((v,i)=>{if(v>=58&&!s.skills.includes(i)){s.skills.push(i);learned.push(['ロケットスタート','不屈のあしどり','早食い名人','天才のひらめき','迷路の達人'][i]);}});
 s.lastAction={key,outcome,friendship,gains:s.stats.map((v,i)=>v-old[i]),text,event,learned};s.log.unshift({turn:s.turn,text:text+(event?' '+event:'')});s.log=s.log.slice(0,60);
 if(s.turn%24===0){s.phase='race-ready';s.pendingCompetitionId=s.turn===24?'debut':s.turn===48?'exchange':'representative';s.pendingCourseId=COMPETITIONS[s.pendingCompetitionId].courseId;}return true;
}
export function raceTitle(s){return currentCompetition(s)?.title||s.lastRace?.title||'大会';}
function stageTime(s,stats,z,player=false){
 let value=courseAbility(stats,z);
 if(player){value+=s.mood*.02+s.trainerBond*.01;if(z.keys.includes(PARTNERS[partnerIndex(s)].trait))value+=3;if(s.skills.includes(z.keys[0]))value+=3;value-=Math.max(0,45-s.energy)*.07;}
 return Math.round((72-value*.42+(random(s)-.5)*6)*10)/10;
}
export function runRace(s){
 const competition=currentCompetition(s);
 if(hasPendingDialogue(s)||s.phase!=='race-ready'||!competition||s.turn!==competition.turn||s.races.some(r=>r.competitionId===competition.id)||(competition.kind==='zodiac'&&!canEnterZodiac(s)))return false;
 const course=currentCourse(s);if(!course)return false;
 const final=competition.kind==='zodiac',representative=competition.kind==='representative',entrants=competition.entrants,year=s.turn/24,seedBefore=s.seed;
 const runners=[{id:'player',name:PARTNERS[partnerIndex(s)].name,species:'ハムスター',hamsterInstanceId:s.hamsterInstanceId,stats:[...s.stats],times:[]}];
 const shuffled=[...ANIMALS];if(final)for(let i=shuffled.length-1;i>0;i--){const j=roll(s,0,i);[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 for(let i=0;i<entrants-1;i++){
  const base=final?64+(i/(entrants-2))*33:representative?64+(i/(entrants-2))*25:year===2?53+(i/(entrants-2))*15:34+(i/(entrants-2))*15;
  const stats=STAT_KEYS.map((_,k)=>clamp(Math.round(base+roll(s,-10,10)+(k===i%5?12:0)),10,99));
  runners.push({id:'rival-'+i,name:final?shuffled[i]:`ハムスター${String(i+2).padStart(2,'0')}`,species:final?shuffled[i]:'ハムスター',stats,times:[]});
 }
 const checkpoints=[];
 for(let z=0;z<course.stages.length;z++){
  runners.forEach(r=>r.times.push(stageTime(s,r.stats,course.stages[z],r.id==='player')));
  const ranks=runners.map(r=>({id:r.id,name:r.name,species:r.species,total:Math.round(r.times.reduce((a,b)=>a+b,0)*10)/10,split:r.times[z]})).sort((a,b)=>a.total-b.total||a.id.localeCompare(b.id));
  checkpoints.push({stage:z,rank:ranks.findIndex(r=>r.id==='player')+1,standings:ranks});
 }
 const standings=checkpoints.at(-1).standings,rank=standings.findIndex(x=>x.id==='player')+1;
 const result={id:`${s.id}:${competition.id}`,runId:s.id,hamsterInstanceId:s.hamsterInstanceId,characterId:s.characterId,competitionId:competition.id,kind:competition.kind,course:JSON.parse(JSON.stringify(course)),simulationVersion:4,title:competition.title,year,final,entrants,rank,qualified:final&&rank<=12,participants:runners,checkpoints,standings,splits:runners[0].times,stats:[...s.stats],seedBefore};
 s.lastRace=result;s.races.push(result);s.phase='results';s.log.unshift({turn:s.turn,text:`${result.title}：${entrants}匹中 ${rank}位！`});return result;
}
export function acceptRace(s){
 if(hasPendingDialogue(s)||s.phase!=='results'||!validResult(s.lastRace))return false;const r=s.lastRace;if(r.runId!==s.id||r.hamsterInstanceId!==s.hamsterInstanceId||![...s.races,...s.legacyRaces].some(x=>x.id===r.id))return false;
 if(r.kind==='representative'){
  if(r.rank===1){s.qualification={resultId:r.id,runId:s.id,hamsterInstanceId:s.hamsterInstanceId};if(!canEnterZodiac(s)){s.qualification=null;return false;}s.phase='race-ready';s.pendingCompetitionId='zodiac';s.pendingCourseId='allround';}
  else{s.phase='finished';s.ending='representative_loss';s.pendingCompetitionId=null;s.pendingCourseId=null;s.qualification=null;}
 }else if(r.kind==='zodiac'){s.phase='finished';s.ending=r.rank<=12?'zodiac_member':'zodiac_loss';s.pendingCompetitionId=null;s.pendingCourseId=null;}
 else if(r.kind==='ordinary'||(r.kind==='legacy'&&s.legacyRecovery&&s.turn<72)){
  s.phase='training';s.pendingCompetitionId=null;s.pendingCourseId=null;s.legacyRecovery=false;s.energy=clamp(s.energy+35);s.mood=clamp(s.mood+12);s.stats=s.stats.map(v=>clamp(v+3));s.lastAction={outcome:'race',text:'大会でひとまわり成長！ 全能力＋3、体力＋35。次の1年が始まるよ。',gains:[3,3,3,3,3],learned:[]};
 }else return false;
 return true;
}
export function gameDate(s){if(s.turn===72)return {year:3,month:3,half:'後半',label:'3年目・育成おわり'};const month=(Math.floor(s.turn%24/2)+3)%12+1;const half=s.turn%2?'後半':'前半';return {year:Math.floor(s.turn/24)+1,month,half,label:`${Math.floor(s.turn/24)+1}年目 ${month}月 ${half}`};}
export const grade=v=>v>=85?'S':v>=70?'A':v>=55?'B':v>=40?'C':v>=25?'D':'E';
