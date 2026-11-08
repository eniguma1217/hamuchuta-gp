// 夏合宿と年ごとのできごと (#30, owner 2026-11-08 「もうすこしゲームをおもしろくしたい」 → 「夏合宿と、年ごとのできごと」;
// picks 「2・3年目の夏」「行き先を3つから選ぶ」「その年のできごと」「お正月のおみくじ」「今と同じくらいに合わせる」).
// Earlier decision (2026-10-26): the year's event comes by luck and is told at the start of the year.
// New runs only: a run already started keeps its rules. Nothing here touches the race calculation.
export const YEAR_FLAG='year-events';
export const hasYearEvents=s=>!!s?.events?.storyProgress?.[YEAR_FLAG];
const KEYS=['speed','stamina','appetite','intelligence','technique'];
const NAMES={speed:'かけっこ',stamina:'回し車',appetite:'早食い',intelligence:'勉強',technique:'迷路'};
const monthOf=turn=>(3+Math.floor((turn%24)/2))%12+1;
const yearOf=s=>Math.min(3,Math.floor(Math.max(0,s.turn)/24)+1);
const hash=t=>[...String(t)].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
// The luck of a run: from the race plans made when it began (saved), so the same seed gives the same years.
const runKey=s=>s.plans?.['ordinary-1']?.planSeed??s.id;
const summer=s=>[6,7,8].includes(monthOf(s.turn)),winter=s=>[12,1,2].includes(monthOf(s.turn));

// その年のできごと: one a year, by luck (the run and the year), never the same twice in a run. 5 good, 3 mixed.
export const YEAR_EVENTS=[
 {id:'harvest',name:'豊作の年',say:'ひまわりがよく実って、種がおいしいんだって。早食いの練習が、よく伸びるよ。',info:'早食いの伸び＋20%',growth:{appetite:1.2}},
 {id:'rain',name:'長雨の年',say:'雨の日が多くなるらしい。かけっこは失敗しやすいけど、勉強ははかどるよ。',info:'かけっこの失敗率＋6・勉強の伸び＋20%',fail:{speed:6},growth:{intelligence:1.2}},
 {id:'heat',name:'猛暑の年',say:'夏がすごく暑くなるって。夏は体力を多く使うけど、合宿はよく伸びるよ。',info:'夏（6〜8月）の体力の消費＋20%・合宿の伸び＋10%',summerCost:1.2,campGrowth:1.1,notYear:1},
 {id:'festival',name:'お祭りの年',say:'町が一年じゅうお祭り気分なんだって。町へ行ったり、お出かけしたりすると、やる気がうんと上がるよ。',info:'町へ・お出かけで、やる気がもう1段階上がる',moodBonus:25},
 {id:'shooting-star',name:'流れ星の年',say:'夜空に流れ星が、よく見えるらしいよ。めずらしいことが起きやすいって。',info:'レアイベントが起きやすい（2倍）',rareMul:2},
 {id:'tools',name:'新しい道具の年',say:'練習場に、新しい迷路が届くんだって。迷路の練習が、よく伸びるよ。',info:'迷路の伸び＋20%',growth:{technique:1.2}},
 {id:'snow',name:'大雪の年',say:'冬に雪がたくさん降るらしい。冬はかけっこが失敗しやすいけど、回し車はよく伸びるよ。',info:'冬（12〜2月）：かけっこの失敗率＋6・回し車の伸び＋20%',winterFail:{speed:6},winterGrowth:{stamina:1.2}},
 {id:'lively',name:'にぎやかな年',say:'練習場が、にぎやかになるんだって。仲間が練習に来やすいよ。',info:'仲間が練習に来やすい（20%→30%）',friendChance:.3}
];
// Which event a year has (fixed for the run: the same after a reload).
export function yearEventOf(s,year=yearOf(s)){
 if(!hasYearEvents(s))return null;
 const used=[];
 for(let y=1;y<=year;y++){const pool=YEAR_EVENTS.filter(e=>!used.includes(e.id)&&e.notYear!==y),e=pool[hash(runKey(s)+':year:'+y)%pool.length];used.push(e.id);if(y===year)return e;}
 return null;
}

// 夏合宿: years 2 and 3, the four turns of July and August. The destination is chosen when it starts.
export const CAMP_TURNS={2:[30,31,32,33],3:[54,55,56,57]};
export const CAMP_START={2:30,3:54},CAMP_END={2:34,3:58};
export const CAMP_GROWTH=1.5;
export const CAMP_PLACES=[
 {id:'sea',name:'海',keys:['speed','stamina'],scene:'camp-sea',place:'海の合宿所'},
 {id:'mountain',name:'山',keys:['stamina','technique'],scene:'camp-mountain',place:'山の合宿所'},
 {id:'forest',name:'森',keys:['intelligence','appetite'],scene:'camp-forest',place:'森の合宿所'}
];
// The destination is the answer picked in 「夏合宿へ」 (saved in the event history).
export const campPlaceOf=(s,year)=>{const id=s.events?.history?.find(h=>h.eventId==='camp-start-'+year)?.choiceId;return CAMP_PLACES.find(p=>p.id===id)||null;};
// The camp the hero is in this turn (or null).
export function campOf(s){
 if(!hasYearEvents(s))return null;const year=yearOf(s),turns=CAMP_TURNS[year];
 if(!turns?.includes(s.turn))return null;const place=campPlaceOf(s,year);if(!place)return null;
 return {year,place,left:turns.at(-1)-s.turn+1};
}
export const inCamp=s=>!!campOf(s);

// お正月のおみくじ: every January; the luck holds until that year's selection race.
export const OMIKUJI=[
 {id:'daikichi',name:'大吉',weight:15,info:'次の選抜まで、大成功しやすい（＋10%）',great:.1,say:'大吉！ 今年いちばんの運だって。大成功しやすくなるよ。'},
 {id:'chukichi',name:'中吉',weight:25,info:'次の選抜まで、練習の失敗率−5',fail:-5,say:'中吉。失敗しにくい年になるって。'},
 {id:'shokichi',name:'小吉',weight:25,info:'次の選抜まで、練習の体力の消費−10%',cost:.9,say:'小吉。「体を大事に」って書いてある。体力が長持ちしそうだね。'},
 {id:'kichi',name:'吉',weight:20,info:'やる気が1段階上がる',say:'吉。「笑う門には福来る」だって。'},
 {id:'suekichi',name:'末吉',weight:10,info:'体力＋15',say:'末吉。「あとから、よくなる」って。少し休んでから行こう。'},
 {id:'kyo',name:'凶',weight:5,info:'次の選抜まで、練習の失敗率＋3',fail:3,say:'凶……。でも凶は、ここから上がるしかないってことだよ。木に結んでいこう。'}
];
export const OMIKUJI_TURN={1:18,2:42,3:66};
export function omikujiDraw(s,year){const total=OMIKUJI.reduce((n,o)=>n+o.weight,0);let t=hash(runKey(s)+':omikuji:'+year)%total;return OMIKUJI.find(o=>(t-=o.weight)<0)||OMIKUJI[0];}
export function omikujiOf(s){
 if(!hasYearEvents(s))return null;const year=yearOf(s),n=s.events.storyProgress['omikuji-'+year];
 return n&&s.turn<year*24?OMIKUJI[n-1]:null;
}

// The effects, read by game.js and story-today.js.
export function growthMul(s,key){
 if(!hasYearEvents(s))return 1;const e=yearEventOf(s),camp=campOf(s);let m=1;
 if(e?.growth?.[key])m*=e.growth[key];
 if(e?.winterGrowth?.[key]&&winter(s))m*=e.winterGrowth[key];
 if(camp&&camp.place.keys.includes(key))m*=CAMP_GROWTH*(e?.campGrowth||1);
 return m;
}
export function failAdd(s,key){
 if(!hasYearEvents(s))return 0;const e=yearEventOf(s),o=omikujiOf(s);
 return (e?.fail?.[key]||0)+(winter(s)?e?.winterFail?.[key]||0:0)+(o?.fail||0);
}
export function costMul(s){if(!hasYearEvents(s))return 1;const e=yearEventOf(s),o=omikujiOf(s);return (e?.summerCost&&summer(s)?e.summerCost:1)*(o?.cost||1);}
export const greatAdd=s=>omikujiOf(s)?.great||0;
export const friendChanceOf=s=>yearEventOf(s)?.friendChance||0;
export const rareMul=s=>yearEventOf(s)?.rareMul||1;
export const moodBonus=s=>yearEventOf(s)?.moodBonus||0;
// The town friends stay in town during the camp.
export const CAMP_STAYS=['seedshop','tanuki','beaver'];
export const keyName=k=>NAMES[k];
export {KEYS as YEAR_KEYS};
