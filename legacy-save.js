import {DEFAULT_INDIVIDUALITY,validIndividuality} from './individuality.js';
import {freshEvents,hasPendingDialogue} from './events.js';
import {VERSION,PARTNERS,freshState,freshProfile,validState,validResult,ownedCandidates} from './legacy-game.js';

export const SAVE_KEY='hamster-zodiac-72-v5';
export const V4_KEY='hamster-zodiac-72-v4';
export const V3_KEY='hamster-zodiac-72-v3';
export const LEGACY_KEYS=['hamster-zodiac-72-v2','hamzodiac_v1'];
const clone=x=>JSON.parse(JSON.stringify(x));
const tabOrDefault=x=>['training','ability','records'].includes(x)?x:'training';
const within=x=>Number.isFinite(x)&&x>=0&&x<=100;
export function freshSave(seed){return {schemaVersion:VERSION,profile:freshProfile(),activeRun:freshState(seed),archives:[],tab:'training',migration:null};}
export function validProfile(p){return !!p&&Array.isArray(p.ownedHamsters)&&p.ownedHamsters.every(h=>validIndividuality(h)&&typeof h.id==='string'&&h.id.length>0&&PARTNERS.some(c=>c.id===h.characterId))&&new Set(p.ownedHamsters.map(h=>h.id)).size===p.ownedHamsters.length&&Array.isArray(p.unavailableLegacyHamsters);}
export function validSave(d){return !!d&&d.schemaVersion===VERSION&&validProfile(d.profile)&&validState(d.activeRun)&&(d.activeRun.phase==='select'||d.profile.ownedHamsters.some(h=>h.id===d.activeRun.hamsterInstanceId&&h.characterId===d.activeRun.characterId))&&Array.isArray(d.archives)&&d.archives.every(validState)&&['training','ability','records'].includes(d.tab);}
export function nextTraining(data,seed){
 if(hasPendingDialogue(data.activeRun))return false;
 const run=data.activeRun;
 if(run.phase!=='select'&&!data.archives.some(x=>x.id===run.id))data.archives.push(clone(run));
 data.activeRun=freshState(seed);const first=ownedCandidates(data.profile)[0];if(first){data.activeRun.characterId=first.characterId;data.activeRun.stats=[...PARTNERS.find(p=>p.id===first.characterId).stats];Object.assign(data.activeRun,{personalityId:first.personalityId,talentId:first.talentId});}
 data.tab='training';return data.activeRun;
}
function legacyShape(s,version){return !!s&&s.version===version&&Number.isInteger(s.turn)&&s.turn>=0&&s.turn<=72&&Number.isInteger(s.partner)&&s.partner>=0&&s.partner<3&&Array.isArray(s.stats)&&s.stats.length===5&&s.stats.every(within)&&['energy','mood','trust'].every(k=>within(s[k]))&&Array.isArray(s.races)&&Array.isArray(s.skills)&&s.skills.every(x=>Number.isInteger(x)&&x>=0&&x<5)&&['select','training','race-ready','results','finished'].includes(s.phase);}
function convertResult(old,run,index){
 if(!old||!Array.isArray(old.checkpoints))return null;
 const result={...clone(old),id:`${run.id}:legacy-${index}`,runId:run.id,hamsterInstanceId:run.hamsterInstanceId,characterId:run.characterId,competitionId:'legacy-'+index,kind:'legacy',legacy:true};
 return validResult(result)?result:null;
}
function continueLegacy(data,old,characterId){
 const h=data.profile.ownedHamsters.find(x=>x.characterId===characterId);if(!h||!Array.isArray(old.stats)||!old.stats.every(within))return false;
 const s=data.activeRun;s.characterId=characterId;s.hamsterInstanceId=h.id;Object.assign(s,{personalityId:h.personalityId,talentId:h.talentId});s.turn=old.turn;s.stats=[...old.stats];s.seed=(Number.isInteger(old.seed)?old.seed:s.seed)>>>0;
 for(const k of ['energy','mood','trust'])if(within(old[k]))s[k==='trust'?'trainerBond':k]=old[k];
 s.skills=[...old.skills];s.lastAction=old.lastAction?clone(old.lastAction):null;
 s.log=(old.log||[]).map(x=>typeof x==='string'?{turn:s.turn,text:x}:x).filter(x=>x&&typeof x.text==='string'&&Number.isInteger(x.turn)).slice(0,60);
 s.legacyRaces=(old.races||[]).map((r,i)=>convertResult(r,s,i)).filter(Boolean);
 if(s.turn===72){s.phase='race-ready';s.pendingCompetitionId='representative';data.migration.notes.push('72ターン分の能力を引き継ぎ、新ルールの代表決定戦から再開します。旧版の最終戦記録は代表資格として扱いません。');}
 else if(old.phase==='results'&&[24,48].includes(s.turn)){
  let last=s.legacyRaces.find(r=>r.year===old.lastRace?.year&&r.title===old.lastRace?.title&&r.rank===old.lastRace?.rank);
  if(!last){last=convertResult(old.lastRace,s,s.legacyRaces.length);if(last)s.legacyRaces.push(last);}
  if(last){s.phase='results';s.lastRace=last;s.legacyRecovery=true;}
  else{s.phase='race-ready';s.pendingCompetitionId=s.turn===24?'debut':'exchange';}
 }else if(old.phase==='race-ready'&&[24,48].includes(s.turn)){s.phase='race-ready';s.pendingCompetitionId=s.turn===24?'debut':'exchange';}
 else s.phase='training';
 return true;
}
export function migrateV2(input){
 const old=input?.state;if(!legacyShape(old,2))return null;
 const d=freshSave(old.seed);d.tab=tabOrDefault(input.tab);d.migration={sourceKey:LEGACY_KEYS[0],notes:['旧版の保存データを引き継ぎました。旧保存キーは変更せず残しています。']};
 if(old.phase!=='select')continueLegacy(d,old,PARTNERS[old.partner].id);
 return validSave(d)?d:null;
}
export function migrateV1(old){
 if(!old||!Number.isInteger(old.turn)||old.turn<0||old.turn>72||!Array.isArray(old.owned)||!old.owned.every(i=>Number.isInteger(i)&&i>=0&&i<5))return null;
 const d=freshSave(),mapping=['dash','mochi','hakase'],legacyNames=['ダッシュ','もち丸','博士','ごんた','ルル'];
 d.profile.ownedHamsters=[...new Set(old.owned)].filter(i=>i<3).map(i=>({id:'legacy-v1-'+i,characterId:mapping[i],...DEFAULT_INDIVIDUALITY[mapping[i]]}));
 d.profile.unavailableLegacyHamsters=[...new Set(old.owned)].filter(i=>i>=3).map(i=>({id:'legacy-v1-'+i,name:legacyNames[i],sourceIndex:i}));
 d.profile.legacyInventory={coins:old.coins,ownedIndices:[...old.owned],history:clone(old.history||[]),skills:clone(old.skills||[])};
 d.migration={sourceKey:LEGACY_KEYS[1],notes:['元ZIPの所持情報を引き継ぎました。旧保存キー、コイン・旧履歴などの原本は残しています。']};
 if(d.profile.unavailableLegacyHamsters.length)d.migration.notes.push('旧版のごんた・ルルは所持情報だけを保管しています。今回の育成対象は既存の3種類です。');
 const skills=['ロケットスタート','不屈の精神','早食い名人','ひらめき','方向感覚'];
 const selected=old.selected;
 if(Number.isInteger(selected)&&selected>=0&&selected<3&&Array.isArray(old.stats)&&old.stats.length===5&&old.stats.every(within)){
  const normalized={...old,trust:old.friend,skills:(old.skills||[]).map(x=>skills.indexOf(x)).filter(x=>x>=0),races:[],log:old.log||[],phase:old.stage==='final'?'race-ready':'training'};
  continueLegacy(d,normalized,mapping[selected]);
 }else if(selected!==null&&selected!==undefined)d.migration.notes.push('旧版の未対応個体の育成は原本に残し、新しい育成選択から開始します。');
 const first=d.profile.ownedHamsters[0];if(d.activeRun.phase==='select'&&first){d.activeRun.characterId=first.characterId;d.activeRun.stats=[...PARTNERS.find(p=>p.id===first.characterId).stats];Object.assign(d.activeRun,{personalityId:first.personalityId,talentId:first.talentId});}
 return validSave(d)?d:null;
}
export function migrateV3(input){
 if(!input||input.schemaVersion!==3||!input.profile||!Array.isArray(input.profile.ownedHamsters)||!input.activeRun||!Array.isArray(input.archives))return null;
 const d=clone(input);d.schemaVersion=VERSION;
 d.profile.ownedHamsters=d.profile.ownedHamsters.map(h=>({...h,...DEFAULT_INDIVIDUALITY[h.characterId]}));
 for(const s of [d.activeRun,...d.archives]){
  if(s.version!==3||!within(s.trust))return null;
  s.version=VERSION;s.events=freshEvents(s.seed);s.trainerBond=s.trust;delete s.trust;s.npcRelations={};
  Object.assign(s,DEFAULT_INDIVIDUALITY[s.characterId]);
  s.pendingCourseId=s.pendingCompetitionId==='debut'?'sprint':s.pendingCompetitionId==='exchange'?'eating':s.pendingCompetitionId?'allround':null;
 }
 d.migration={sourceKey:V3_KEY,notes:['性格・才能と関係値の保存形式に引き継ぎました。能力・乱数・代表資格・確定した旧大会結果は維持しています。旧保存キーは変更せず残しています。']};
 return validSave(d)?d:null;
}
export function migrateV4(input){
 if(!input||input.schemaVersion!==4||!input.activeRun||!Array.isArray(input.archives))return null;
 const d=clone(input);d.schemaVersion=VERSION;
 for(const s of [d.activeRun,...d.archives]){if(s.version!==4)return null;s.version=VERSION;s.events=freshEvents(s.seed);}
 d.migration={sourceKey:V4_KEY,notes:['会話を途中から再開できる保存形式に引き継ぎました。所持・育成・確定結果・乱数は維持し、旧v4保存は変更しません。']};
 return validSave(d)?d:null;
}
export function loadSave(storage){
 const fallback=()=>({data:freshSave(),canWrite:false,notice:'保存データにアクセスできません。この画面の間は遊べます。'});
 try{
  const raw=storage.getItem(SAVE_KEY);
  if(raw!==null){try{const data=JSON.parse(raw);if(validSave(data))return {data,canWrite:true,notice:data.migration?.notes?.join(' ')||''};}catch{}
   return {data:freshSave(),canWrite:false,notice:'新形式の保存データを読み込めませんでした。原本を保護するため、この画面からは上書きしません。'};
  }
  const v4=storage.getItem(V4_KEY);if(v4!==null){try{const data=migrateV4(JSON.parse(v4));if(data)return {data,canWrite:true,notice:data.migration.notes.join(' ')};}catch{}return {data:freshSave(),canWrite:false,notice:'旧v4保存を読み込めませんでした。原本を保護するため保存を停止しています。'};}
  const v3=storage.getItem(V3_KEY);if(v3!==null){try{const data=migrateV3(JSON.parse(v3));if(data)return {data,canWrite:true,notice:data.migration.notes.join(' ')};}catch{}return {data:freshSave(),canWrite:false,notice:'前形式の保存データを読み込めませんでした。原本を保護するため保存を停止しています。'};}
  for(const key of LEGACY_KEYS){const old=storage.getItem(key);if(old===null)continue;try{const data=key===LEGACY_KEYS[0]?migrateV2(JSON.parse(old)):migrateV1(JSON.parse(old));if(data)return {data,canWrite:true,notice:data.migration.notes.join(' ')};}catch{}}
  return {data:freshSave(),canWrite:true,notice:''};
 }catch{return fallback();}
}
export function writeSave(storage,data,canWrite=true){if(!canWrite||!validSave(data))return false;try{storage.setItem(SAVE_KEY,JSON.stringify(data));return true;}catch{return false;}}
