import * as LegacySave from './legacy-save.js';
import {hasPendingDialogue} from './events.js';
import {VERSION,PARTNERS,freshState,freshProfile,validState,ownedCandidates} from './game.js';
import {validIndividuality,MODERN_INDIVIDUALITY} from './individuality.js';
export const SAVE_KEY='hamster-zodiac-72-v6',V5_KEY='hamster-zodiac-72-v5',V4_KEY='hamster-zodiac-72-v4',V3_KEY='hamster-zodiac-72-v3',LEGACY_KEYS=LegacySave.LEGACY_KEYS;
const copy=x=>JSON.parse(JSON.stringify(x));
export function freshSave(seed){return {schemaVersion:6,profile:freshProfile(),activeRun:freshState(seed),archives:[],tab:'training',migration:null};}
export function validProfile(p){return !!p&&Array.isArray(p.ownedHamsters)&&p.ownedHamsters.every(h=>validIndividuality(h)&&typeof h.id==='string'&&h.id.length&&PARTNERS.some(c=>c.id===h.characterId)&&(h.name===undefined||typeof h.name==='string'&&h.name.length>0&&h.name.length<=40))&&new Set(p.ownedHamsters.map(h=>h.id)).size===p.ownedHamsters.length&&Array.isArray(p.unavailableLegacyHamsters);}
export function validSave(d){return !!d&&d.schemaVersion===VERSION&&validProfile(d.profile)&&validState(d.activeRun)&&(d.activeRun.phase==='select'||d.profile.ownedHamsters.some(h=>h.id===d.activeRun.hamsterInstanceId&&h.characterId===d.activeRun.characterId))&&Array.isArray(d.archives)&&d.archives.every(validState)&&new Set(d.archives.map(x=>x.id)).size===d.archives.length&&['training','ability','records'].includes(d.tab);}
export function archiveFinished(d){const s=d.activeRun;if(s.phase!=='finished')return false;const i=d.archives.findIndex(x=>x.id===s.id);if(i<0)d.archives.push(copy(s));else d.archives[i]=copy(s);return true;}
export function nextTraining(d,seed){if(hasPendingDialogue(d.activeRun))return false;const s=d.activeRun;if(s.phase!=='select'&&!d.archives.some(x=>x.id===s.id))d.archives.push(copy(s));d.activeRun=freshState(seed);const h=ownedCandidates(d.profile)[0];if(h){Object.assign(d.activeRun,{characterId:h.characterId,individualName:h.name||PARTNERS.find(p=>p.id===h.characterId).name,personalityId:h.personalityId,talentId:h.talentId});d.activeRun.stats=[...PARTNERS.find(p=>p.id===h.characterId).stats];}d.tab='training';return d.activeRun;}
function upgrade(old,key){
 if(!LegacySave.validSave(old))return null;const d=copy(old);d.schemaVersion=6;
 // Keep ongoing legacy runs, recorded results, RNG, names and ownership IDs intact.
 d.profile.ownedHamsters=d.profile.ownedHamsters.map(h=>({...h,legacyIndividuality:{personalityId:h.personalityId,talentId:h.talentId},personalityId:MODERN_INDIVIDUALITY[h.characterId].personalityId}));
 d.migration={sourceKey:key,notes:['旧保存の原本を残してv6へ保存します。途中の旧育成は当時の大会・計算で続行できます。次の育成から新しい年間選抜に切り替わります。']};return validSave(d)?d:null;
}
export const migrateV5=input=>upgrade(input,V5_KEY);
export const migrateV4=input=>{const d=LegacySave.migrateV4(input);return d?upgrade(d,V4_KEY):null;};
export const migrateV3=input=>{const d=LegacySave.migrateV3(input);return d?upgrade(d,V3_KEY):null;};
export const migrateV2=input=>{const d=LegacySave.migrateV2(input);return d?upgrade(d,LEGACY_KEYS[0]):null;};
export const migrateV1=input=>{const d=LegacySave.migrateV1(input);return d?upgrade(d,LEGACY_KEYS[1]):null;};
export function loadSave(storage){
 const blocked=message=>({data:freshSave(),canWrite:false,notice:message});
 try{
  const raw=storage.getItem(SAVE_KEY);if(raw!==null){try{const d=JSON.parse(raw);if(validSave(d))return {data:d,canWrite:true,notice:d.migration?.notes.join(' ')||''};}catch{}return blocked('v6保存を読めませんでした。原本を保護するため保存を停止しています。');}
  for(const [key,migrate] of [[V5_KEY,migrateV5],[V4_KEY,migrateV4],[V3_KEY,migrateV3],[LEGACY_KEYS[0],migrateV2],[LEGACY_KEYS[1],migrateV1]]){const raw=storage.getItem(key);if(raw===null)continue;try{const d=migrate(JSON.parse(raw));if(d)return {data:d,canWrite:true,notice:d.migration.notes.join(' ')};}catch{}return blocked('旧保存を読めませんでした。原本を保護するため保存を停止しています。');}
  return {data:freshSave(),canWrite:true,notice:''};
 }catch{return blocked('保存領域にアクセスできません。この画面の間は遊べます。');}
}
export function writeSave(storage,data,canWrite=true){if(!canWrite||!validSave(data))return false;try{storage.setItem(SAVE_KEY,JSON.stringify(data));return true;}catch{return false;}}
