// Pure event state: dialogue never consumes the training/race RNG.
let completionHandler=()=>{};
export const setEventCompletionHandler=handler=>{completionHandler=handler;};
const copy=x=>JSON.parse(JSON.stringify(x));
const clamp=n=>Math.max(0,Math.min(100,n));
const id=x=>typeof x==='string'&&/^[a-zA-Z0-9_:-]{1,160}$/.test(x)&&!Object.hasOwn(Object.prototype,x)&&x!=='prototype';
const uint=x=>Number.isInteger(x)&&x>=0&&x<=0xffffffff;
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const text=x=>typeof x==='string'&&x.length>0&&x.length<=4000;
const mapOf=(x,p)=>object(x)&&Object.entries(x).every(([k,v])=>id(k)&&p(v));
const delta=x=>Number.isFinite(x)&&Math.abs(x)<=100;
export function freshEvents(seed=0){return {version:1,seed:((seed>>>0)^0x68e31da4)>>>0,sequence:0,checkpoints:[],history:[],storyProgress:{},skillHints:{},pending:null};}
function validEffects(e={}){
 return object(e)&&Object.keys(e).every(k=>['stats','energy','mood','trainerBond','npcRelations','skillHints','talent'].includes(k))&&(e.talent===undefined||typeof e.talent==='string'&&e.talent.length<=40)&&
  (e.stats===undefined||(Array.isArray(e.stats)&&e.stats.length===5&&e.stats.every(delta)))&&
  ['energy','mood','trainerBond'].every(k=>e[k]===undefined||delta(e[k]))&&
  (e.npcRelations===undefined||mapOf(e.npcRelations,delta))&&
  (e.skillHints===undefined||mapOf(e.skillHints,n=>Number.isInteger(n)&&n>=0&&n<=100));
}
export function validEventDefinition(d){
 if(!object(d)||!id(d.id)||!text(d.title)||!Array.isArray(d.characters)||d.characters.length>16||!d.characters.every(c=>object(c)&&id(c.id)&&text(c.name)&&(c.variant===undefined||c.variant===null||[0,1,2].includes(c.variant)))||new Set(d.characters.map(c=>c.id)).size!==d.characters.length)return false;
 const ids=d.characters.map(c=>c.id);
 if(!Array.isArray(d.lines)||!d.lines.length||d.lines.length>100||!d.lines.every(l=>object(l)&&(l.speakerId===null||ids.includes(l.speakerId))&&text(l.text)&&(l.visibleIds===undefined||(Array.isArray(l.visibleIds)&&l.visibleIds.length<=12&&l.visibleIds.every(v=>ids.includes(v))))&&(l.expressions===undefined||mapOf(l.expressions,v=>typeof v==='string'&&v.length<=40))))return false;
 if(d.choices!==undefined&&(!Array.isArray(d.choices)||d.choices.length>8||!d.choices.every(c=>object(c)&&id(c.id)&&text(c.label)&&validEffects(c.effects))||new Set(d.choices.map(c=>c.id)).size!==d.choices.length))return false;
 if(!validEffects(d.effects)||(d.progress!==undefined&&!mapOf(d.progress,n=>Number.isInteger(n)&&n>=0&&n<=100)))return false;
 if(d.requires!==undefined&&(!Array.isArray(d.requires)||!d.requires.every(id)))return false;
 if(d.weight!==undefined&&(!Number.isFinite(d.weight)||d.weight<=0||d.weight>100000))return false;
 if(d.cooldown!==undefined&&(!Number.isInteger(d.cooldown)||d.cooldown<0||d.cooldown>72))return false;
 if(d.once!==undefined&&typeof d.once!=='boolean')return false;
 if(d.mandatory!==undefined&&typeof d.mandatory!=='boolean')return false;
 const c=d.condition;
 return c===undefined||(object(c)&&Object.keys(c).every(k=>['minTurn','maxTurn','phases','minStats','minRelations'].includes(k))&&
  ['minTurn','maxTurn'].every(k=>c[k]===undefined||(Number.isInteger(c[k])&&c[k]>=0&&c[k]<=72))&&
  (c.phases===undefined||(Array.isArray(c.phases)&&c.phases.every(p=>['training','race-ready','results','finished'].includes(p))))&&
  (c.minStats===undefined||(Array.isArray(c.minStats)&&c.minStats.length===5&&c.minStats.every(n=>Number.isFinite(n)&&n>=0&&n<=100)))&&
  (c.minRelations===undefined||mapOf(c.minRelations,n=>Number.isFinite(n)&&n>=0&&n<=100)));
}
export function validEvents(e){
 if(!object(e)||e.version!==1||!uint(e.seed)||!Number.isSafeInteger(e.sequence)||e.sequence<0||!Array.isArray(e.checkpoints)||!e.checkpoints.every(id)||new Set(e.checkpoints).size!==e.checkpoints.length||!Array.isArray(e.history)||!e.history.every(h=>object(h)&&id(h.instanceId)&&id(h.eventId)&&Number.isInteger(h.turn)&&h.turn>=0&&h.turn<=72&&(h.choiceId===null||id(h.choiceId)))||new Set(e.history.map(h=>h.instanceId)).size!==e.history.length||!mapOf(e.storyProgress,n=>Number.isInteger(n)&&n>=0&&n<=100)||!mapOf(e.skillHints,n=>Number.isInteger(n)&&n>=0&&n<=100))return false;
 const p=e.pending;
 return p===null||(object(p)&&validEventDefinition(p)&&id(p.instanceId)&&['event','preview'].includes(p.mode)&&Number.isInteger(p.turn)&&p.turn>=0&&p.turn<=72&&Number.isInteger(p.cursor)&&p.cursor>=0&&p.cursor<p.lines.length&&!e.history.some(h=>h.instanceId===p.instanceId));
}
export const hasPendingDialogue=s=>!!s.events?.pending;
export const dialogueToken=s=>s.events?.pending?`${s.events.pending.instanceId}:${s.events.pending.cursor}`:null;
export function dialogueView(s){
 const p=s.events?.pending;if(!p)return null;
 const line=p.lines[p.cursor];
 return {title:p.title,mode:p.mode,token:dialogueToken(s),cursor:p.cursor,total:p.lines.length,scene:line.scene||null,text:line.text,speakerId:line.speakerId,speakerName:p.characters.find(c=>c.id===line.speakerId)?.name||'ナレーション',characters:p.characters.filter(c=>!line.visibleIds||line.visibleIds.includes(c.id)).map(c=>({...c,speaking:c.id===line.speakerId,expression:line.expressions?.[c.id]||'normal'})),choices:p.cursor===p.lines.length-1?p.choices||[]:[],last:p.cursor===p.lines.length-1};
}
function enqueue(s,d,mode){
 const e=s.events;e.sequence++;
 e.pending={...copy(d),instanceId:`${s.id}:event:${e.sequence}`,mode,turn:s.turn,cursor:0};
 return true;
}
export function openDialoguePreview(s,definition){
 if(!validEvents(s.events)||hasPendingDialogue(s)||!validEventDefinition(definition))return false;
 // Preview never applies effects/progress, even if a supplied definition has them.
 return enqueue(s,definition,'preview');
}
function eligible(s,d){
 const history=s.events.history,last=history.filter(h=>h.eventId===d.id).at(-1),c=d.condition||{};
 return !(d.once!==false&&last)&&!(last&&s.turn-last.turn<(d.cooldown||0))&&
  (d.requires||[]).every(r=>history.some(h=>h.eventId===r))&&s.turn>=(c.minTurn??0)&&s.turn<=(c.maxTurn??72)&&
  (!c.phases||c.phases.includes(s.phase))&&(!c.minStats||c.minStats.every((n,i)=>s.stats[i]>=n))&&
  (!c.minRelations||Object.entries(c.minRelations).every(([k,n])=>(s.npcRelations[k]||0)>=n));
}
export function queueEvent(s,definitions,checkpoint){
 if(!validEvents(s.events)||hasPendingDialogue(s)||!id(checkpoint)||s.events.checkpoints.includes(checkpoint)||!Array.isArray(definitions)||!definitions.every(validEventDefinition)||new Set(definitions.map(d=>d.id)).size!==definitions.length)return false;
 s.events.checkpoints.push(checkpoint);
 const pool=definitions.filter(d=>eligible(s,d)),mandatory=pool.find(d=>d.mandatory);
 if(mandatory)return enqueue(s,mandatory,'event');
 if(!pool.length)return false;
 s.events.seed=(Math.imul(s.events.seed,1664525)+1013904223)>>>0;
 let ticket=s.events.seed/4294967296*pool.reduce((n,d)=>n+(d.weight||1),0);
 const selected=pool.find(d=>(ticket-=d.weight||1)<0)||pool.at(-1);
 return enqueue(s,selected,'event');
}
function applyEffects(s,e={}){
 if(e.stats)s.stats=s.stats.map((n,i)=>clamp(n+e.stats[i]));
 for(const k of ['energy','mood','trainerBond'])if(e[k]!==undefined)s[k]=clamp(s[k]+e[k]);
 for(const [k,n] of Object.entries(e.npcRelations||{}))s.npcRelations[k]=clamp((s.npcRelations[k]||0)+n);
 for(const [k,n] of Object.entries(e.skillHints||{}))s.events.skillHints[k]=clamp((s.events.skillHints[k]||0)+n);
 // A rare event's talent (#30, owner 2026-10-30): added once, only to runs that collect talents.
 if(e.talent&&Array.isArray(s.extraTalents)&&s.extraTalents.length<3&&e.talent!==s.talentId&&!s.extraTalents.includes(e.talent))s.extraTalents.push(e.talent);
}
function complete(s,choice=null){
 const e=s.events,p=e.pending;
 if(p.mode==='event'){
  applyEffects(s,p.effects);applyEffects(s,choice?.effects);
  for(const [k,n] of Object.entries(p.progress||{}))e.storyProgress[k]=n;
  e.history.push({instanceId:p.instanceId,eventId:p.id,turn:p.turn,choiceId:choice?.id||null});
 }
 e.pending=null;
 if(p.mode==='event')completionHandler(s,p,choice);
 return true;
}
export function advanceDialogue(s,token){
 const p=s.events?.pending;if(!p||token!==dialogueToken(s))return false;
 if(p.cursor<p.lines.length-1){p.cursor++;return true;}
 if(p.choices?.length)return false;
 return complete(s);
}
export function chooseDialogue(s,token,choiceId){
 const p=s.events?.pending;if(!p||token!==dialogueToken(s)||p.cursor!==p.lines.length-1)return false;
 const choice=p.choices?.find(c=>c.id===choiceId);return choice?complete(s,choice):false;
}
