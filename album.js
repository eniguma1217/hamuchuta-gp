// 図鑑・殿堂・自己ベスト (#30, owner 2026-10-25 「何回も繰り返しやりたくなる要素」).
// Everything is read from the saved runs (育成記録 + the run in progress), so runs played before this
// existed fill it too. Display only: nothing here changes saves, stats, friendship or races. Re-reading
// builds the scene from the run where it was seen, as of that turn, and opens it as a preview.
import {PARTNERS,COMPETITIONS} from './game.js';
import {endingDefinition,individualName} from './story.js';
import {randomDefinitions,sideDefinitions,visitDefinition} from './story-today.js';
import {DAILY_IDS,DAILY_TITLES,monthOf,v3SideStoryBeats} from './story-side.js';
import {sideStoryBeats} from './story-expansion.js';
import {catResult} from './story-v3.js';

// The event id a run used for this scene. The first four daily scenes used to carry their turn
// ('daily-footprints-6'), so runs from before the side-story review count too.
const OLD_DAILY=new Set(['daily-footprints','daily-crumbs','daily-note','daily-slope']);
const seenAs=(r,id)=>r.events?.history?.find(h=>h.eventId===id||OLD_DAILY.has(id)&&new RegExp(`^${id}-\\d+$`).test(h.eventId))?.eventId||null;
const seen=(r,id)=>!!seenAs(r,id);
const isV3=r=>r.storyVersion===3;
// Endings: the four story endings (domestic split by year) and the Cat's six (story v3).
export const ENDINGS=[
 {id:'zodiac_member',title:'きみが、誰かの憧れになる日',hint:'世界十二支決定戦で、12位以内に入る',match:r=>r.ending==='zodiac_member'},
 {id:'zodiac_loss',title:'同じ風の中で',hint:'世界十二支決定戦まで行って、12の席に届かない',match:r=>r.ending==='zodiac_loss'},
 {id:'representative_loss',title:'帰ってこられる場所',hint:'3年目の代表決定戦で、代表になれない',match:r=>r.ending==='representative_loss'},
 {id:'domestic_loss_1',title:'1年目の帰り道',hint:'1年目の国内予選で、復活戦にも届かない',match:r=>r.ending==='domestic_loss'&&r.turn<=24},
 {id:'domestic_loss_2',title:'2年目の帰り道',hint:'2年目の国内予選で、復活戦にも届かない',match:r=>r.ending==='domestic_loss'&&r.turn>24},
 {id:'cat-both',title:'13番目じゃ、なかった',hint:'新しい物語で、ネコと二匹とも12の席に入る',match:r=>isV3(r)&&r.ending==='zodiac_member'&&catResult(r.lastRace)?.inTwelve},
 {id:'cat-13',title:'また13番目か',hint:'十二支になって、ネコがちょうど13位',match:r=>isV3(r)&&r.ending==='zodiac_member'&&catResult(r.lastRace)?.rank===13},
 {id:'cat-behind',title:'13番目にもなれなかった',hint:'十二支になって、ネコが14位より後ろ',match:r=>isV3(r)&&r.ending==='zodiac_member'&&catResult(r.lastRace)?.rank>13},
 {id:'cat-seat',title:'席は、もらった',hint:'十二支になれず、ネコだけが12の中に入る',match:r=>isV3(r)&&r.ending==='zodiac_loss'&&catResult(r.lastRace)?.inTwelve},
 {id:'cat-out',title:'二匹とも、外か',hint:'十二支になれず、ネコも12の外',match:r=>isV3(r)&&r.ending==='zodiac_loss'&&catResult(r.lastRace)&&!catResult(r.lastRace).inTwelve},
 {id:'cat-slope',title:'まだ、走れる足だろ',hint:'新しい物語で、国内で敗れる（ネコに会ったあと）',match:r=>isV3(r)&&['domestic_loss','representative_loss'].includes(r.ending)&&r.events?.storyProgress?.['cat-met']}
];
const DAILY_HINTS={
 'daily-footprints':'いつでも。帰り道で','daily-crumbs':'いつでも。練習のあとに','daily-note':'いつでも。こよりのノート','daily-slope':'いつでも。神社の坂で',
 'daily-cheeks':'いつでも。練習の前に','daily-sand':'夏に','daily-sunflower-plant':'1年目に、種屋さんで','daily-sunflower-bloom':'「一粒、まく？」のあと、夏に',
 'daily-radio':'大会のあとに','daily-new-year':'冬に','daily-rain-plan':'いつでも。雨の日に','daily-chobi-copy':'ちょびと出会ったあと',
 'daily-potechi-arrow':'ぽてちと出会ったあと','daily-beaver-box':'いつでも。練習場で','daily-flag-wish':'いつでも。神社で','daily-height':'3年目に',
 'daily-first-slope':'3年目の後半に','daily-cat-rerun':'新しい物語で、ネコに会ったあと','daily-cat-roof':'新しい物語で、ネコに会ったあと',
 'daily-cat-potechi':'新しい物語で、ネコとぽてちに会ったあと','daily-cat-snow':'新しい物語で、坂の勝負のあと、冬に','daily-rat-dawn':'新しい物語で、ネズミの昔話を聞いたあと'
};
const MET={'child-first':'ちょびと出会ったあと','rival-first':'ぽてちと出会ったあと','cat-first':'ネコに会ったあと','cat-slope':'坂の勝負のあと','rat-confession':'ネズミの昔話のあと'};
const when=turn=>`${Math.floor(Math.max(0,turn)/24)+1}年目の${monthOf(turn)}月`;
const sideHint=e=>[e.v3?'新しい物語で':'',...(e.requires||[]).map(id=>MET[id]).filter(Boolean),`${when(e.min)}〜${when(e.max)}`].filter(Boolean).join('、');
export const SIDES=[...sideStoryBeats,...v3SideStoryBeats].map(e=>({id:e.id,title:e.title,hint:sideHint(e)}));
export const DAILIES=DAILY_IDS.map(id=>({id,title:DAILY_TITLES[id],hint:DAILY_HINTS[id]||'いつでも'}));
export const TOWN=[['seedshop','種屋さん'],['tanuki','神社の管理役'],['beaver','練習場の手入れ役'],['rival','ぽてち'],['cat','ネコ']].map(([id,name])=>({id,name,hint:id==='rival'?'ぽてちと出会ったあと、町で会う':id==='cat'?'新しい物語で、ネコに会ったあと、町で会う':`町で${name}に会う`}));
export const TOWN_STEPS=5;

// Every saved run, newest last; the run in progress counts once it has started.
export function albumRuns(data){const runs=[...(data?.archives||[])];const a=data?.activeRun;if(a&&a.phase!=='select'&&!runs.some(r=>r.id===a.id))runs.push(a);return runs.filter(r=>r&&r.events);}
const latest=(runs,test)=>{for(let i=runs.length-1;i>=0;i--)if(test(runs[i]))return runs[i];return null;};
export function album(data){
 const runs=albumRuns(data),done=runs.filter(r=>r.phase==='finished'),story=id=>latest(runs,r=>seen(r,id));
 return {
  endings:ENDINGS.map(e=>({...e,run:latest(done,e.match)})),
  dailies:DAILIES.map(e=>({...e,run:story(e.id)})),
  sides:SIDES.map(e=>({...e,run:story(e.id)})),
  town:TOWN.map(f=>({...f,steps:Array.from({length:TOWN_STEPS},(_,i)=>({n:i+1,run:story(`visit-${f.id}-${i+1}`)}))}))
 };
}

// The run as it was when the scene was seen: earlier history only, that turn, the races run by then.
export function stateAt(run,eventId){
 const s=JSON.parse(JSON.stringify(run)),i=s.events.history.findIndex(h=>h.eventId===eventId);if(i<0)return null;const h=s.events.history[i];
 s.events.history=s.events.history.slice(0,i);s.events.pending=null;s.turn=h.turn;s.phase='training';
 s.races=(s.races||[]).filter(r=>(r.turn??COMPETITIONS[r.competitionId]?.turn??0)<=h.turn);s.lastRace=s.races.at(-1)||null;return s;
}
// The scene to re-read, or null if it cannot be rebuilt (e.g. an old prototype run).
export function replayDefinition(data,kind,id){
 const a=album(data);
 try{
  if(kind==='ending'){const e=a.endings.find(x=>x.id===id);return e?.run?endingDefinition(e.run):null;}
  if(kind==='daily'){const e=a.dailies.find(x=>x.id===id),s=e?.run&&stateAt(e.run,seenAs(e.run,id));return s?randomDefinitions(s).find(d=>d.id===id)||null:null;}
  if(kind==='side'){const e=a.sides.find(x=>x.id===id),s=e?.run&&stateAt(e.run,id);return s?sideDefinitions(s).find(d=>d.id===id)||null:null;}
  if(kind==='town'){const [friend,n]=id.split(':'),f=a.town.find(x=>x.id===friend),step=f?.steps[Number(n)-1],s=step?.run&&stateAt(step.run,`visit-${friend}-${n}`);return s?visitDefinition(s,friend,Number(n)):null;}
 }catch{return null;}
 return null;
}

// 殿堂: every hamster that became one of the twelve, in the order they did.
const dateOf=r=>{const t=parseInt(String(r.id||'').split('-')[1],36);return Number.isFinite(t)&&t>1e12?new Date(t):null;};
const heroName=r=>PARTNERS.find(p=>p.id===r.characterId)?.name||'はむちゅたー';
const playerTime=race=>race?.standings?.find(x=>x.id==='player')?.total;
export function hall(data){
 return albumRuns(data).filter(r=>r.phase==='finished'&&r.ending==='zodiac_member').map(r=>({id:r.id,name:individualName(r),hero:heroName(r),characterId:r.characterId,rank:r.lastRace?.rank,time:playerTime(r.lastRace),date:dateOf(r),cat:isV3(r)?catResult(r.lastRace):null}))
  .sort((a,b)=>(a.date?.getTime()||0)-(b.date?.getTime()||0)).map((x,i)=>({...x,generation:i+1}));
}
// 自己ベスト: counts, the best world final, each hero's best, each friend's highest friendship.
const FRIENDS=[['domestic-0','ぽてち'],['child','ちょび'],['seedshop','種屋さん'],['tanuki','神社の管理役'],['beaver','練習場の手入れ役'],['cat','ネコ']];
const ORDER=['zodiac_member','zodiac_loss','representative_loss','domestic_loss'];
const RESULT={zodiac_member:'十二支になった',zodiac_loss:'世界大会へ',representative_loss:'代表決定戦まで',domestic_loss:'国内予選まで'};
export function bests(data){
 const runs=albumRuns(data),done=runs.filter(r=>r.phase==='finished'),world=done.map(r=>r.races?.find(x=>x.kind==='zodiac')).filter(Boolean);
 const best=(list,key)=>list.reduce((a,b)=>a==null||b[key]<a[key]?b:a,null);
 const bestWorld=best(world.map(x=>({rank:x.rank,time:playerTime(x)})),'rank'),fastest=best(world.map(x=>({time:playerTime(x)})).filter(x=>Number.isFinite(x.time)),'time');
 return {
  runs:done.length,champions:done.filter(r=>r.ending==='zodiac_member').length,worldRuns:world.length,
  bestRank:bestWorld?.rank??null,bestTime:fastest?.time??null,
  heroes:PARTNERS.map(p=>{const mine=done.filter(r=>r.characterId===p.id),top=mine.reduce((a,r)=>a==null||ORDER.indexOf(r.ending)<ORDER.indexOf(a.ending)?r:a,null),w=mine.map(r=>r.races?.find(x=>x.kind==='zodiac')?.rank).filter(Number.isFinite);
   return {id:p.id,name:p.name,runs:mine.length,result:top?RESULT[top.ending]||'—':null,bestRank:w.length?Math.min(...w):null};}),
  friends:FRIENDS.map(([id,name])=>({id,name,best:Math.max(0,...runs.map(r=>r.npcRelations?.[id]||0))}))
 };
}
export function albumCounts(a){const town=a.town.flatMap(f=>f.steps);const n=list=>list.filter(x=>x.run).length;return {endings:[n(a.endings),a.endings.length],stories:[n(a.dailies)+n(a.sides),a.dailies.length+a.sides.length],town:[n(town),town.length]};}
