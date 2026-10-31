// Which story a conversation belongs to, and its episode (#30, owner 2026-10-26 「どのストーリーかわかるように
// ストーリー名丸話みたいな感じでわかるようにして欲しい」). Shown in two lines above the title (owner pick).
// Numbers are the same in every run (owner pick 「毎回同じ番号」): a story that does not happen in this run
// leaves a gap. A reply after a choice keeps the episode of its story.
import {DAILY_IDS,v3SideStoryBeats} from './story-side.js';
import {sideStoryBeats} from './story-expansion.js';
import {TALENTS} from './individuality.js';
import {HERO_SERIES} from './story-v3.js';
// 本編, in story order (story v3: the default since PR #57; story v2: earlier runs).
export const MAIN_V3=['main-prologue','goal-y1','child-first','cat-first','exp-fireworks-promise','rival-first','trainer-worry','cat-slope','main-year1','goal-y2','cat-shortcut','rat-imitation','exp-rival-hard-question','coach-return','exp-rival-make-up','rat-confession','festival-2','main-year2','goal-y3','rival-changes','cat-past','exp-fireworks-answer','festival-3','exp-child-snow-senior','trainer-confession','main-final'];
export const MAIN_V2=['main-prologue','exp-notebook-first','child-first','trainer-private','exp-fireworks-promise','rival-first','festival-1','trainer-worry','main-year1','rat-imitation','coach-rival','exp-rival-hard-question','coach-return','exp-rival-make-up','festival-2','trainer-doubt-2','main-year2','rival-changes','exp-fireworks-answer','festival-3','exp-child-snow-senior','trainer-confession','main-final'];
// 寄り道, in the album's order; できごと: scenes that only a great or failed practice brings.
export const SIDE_IDS=[...sideStoryBeats,...v3SideStoryBeats].map(e=>e.id);
export const EVENT_IDS=['exp-great-success','exp-unsold-seeds'];
export const TOWN_SERIES={seedshop:'種屋さん',tanuki:'神社の管理役',beaver:'練習場の手入れ役',rival:'ぽてち',cat:'ネコ'};
export function episodeOf(id,storyVersion=3){
 const all=[...MAIN_V3,...MAIN_V2,...DAILY_IDS,...SIDE_IDS,...EVENT_IDS],base=all.includes(id)?id:String(id).replace(/-answer$/,''),n=list=>list.indexOf(base)+1;
 if(base==='main-ending')return {series:'エンディング'};
 // Rare events (#30, owner 2026-10-30): no number (they come by chance); a gold one says so.
 const rare=String(id).match(/^rare-(.+)$/);if(rare)return TALENTS[rare[1]]?.gold?{series:'レアイベント',note:'金の才能'}:{series:'レアイベント'};
 const main=n(storyVersion===2?MAIN_V2:MAIN_V3);if(main)return {series:'本編',number:main};
 // 主人公ごとの話 (#30, owner 2026-10-30): 第1〜3話 of the hero's own series.
 const hero=base.match(/^hero-(mochi|dash|hakase)-([123])$/);if(hero)return {series:HERO_SERIES[hero[1]],number:+hero[2]};
 const bench=base.match(/^ordinary-response-([123])$/);if(bench)return {series:'反省会',number:+bench[1]};
 if(n(DAILY_IDS))return {series:'日常',number:n(DAILY_IDS)};
 if(n(SIDE_IDS))return {series:'寄り道',number:n(SIDE_IDS)};
 if(n(EVENT_IDS))return {series:'できごと',number:n(EVENT_IDS)};
 // 町の人: the five stories are 第1〜5話; later visits are the everyday chat.
 const visit=base.match(/^visit-(seedshop|tanuki|beaver|rival|cat)-(\d+)$/);
 if(visit)return +visit[2]<=5?{series:TOWN_SERIES[visit[1]],number:+visit[2]}:{series:TOWN_SERIES[visit[1]],note:'いつものおしゃべり'};
 return null;
}
export function episodeLabel(id,storyVersion=3){const e=episodeOf(id,storyVersion);return e?e.series+(e.number?` 第${e.number}話`:e.note?'・'+e.note:''):'';}
