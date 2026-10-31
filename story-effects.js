// What each conversation changes (#30, owner 2026-10-26 「各会話で体力が増えたり減ったりステータス上がったり
// やる気が上がったり下がったりキャラとの有効度が上がったり下がったりして欲しい　いいイベントの方が多くして」).
// Owner picks: good 7 : bad 3, small. Good: an ability +2〜5 (one or two), energy +10〜20, motivation one level
// up, friendship +5〜10. Bad: energy −10〜15, motivation one level down, friendship −5. Abilities never go down.
// Every effect follows what happens in the scene; a choice carries its own effect (hidden until the talk ends).
const st=(...pairs)=>{const a=[0,0,0,0,0];for(let i=0;i<pairs.length;i+=2)a[pairs[i]]=pairs[i+1];return a;};
const SPD=0,STA=1,APP=2,INT=3,TEC=4,UP=25,DOWN=-25;
const rel=(id,n)=>({npcRelations:{[id]:n}});
const R='domestic-0';// ぽてち's friendship is kept under his rival id (owner 2026-10-25)

export const STORY_EFFECTS={
 // 本編
 'main-prologue':{trainerBond:5,mood:UP},
 'goal-y1':{mood:UP},
 'exp-notebook-first':{stats:st(TEC,2),trainerBond:5},
 'child-first':{stats:st(SPD,2),...rel('child',8)},
 'trainer-private':{trainerBond:5},
 'cat-first':{},// by choice
 'exp-fireworks-promise':{},// by choice
 'rival-first':{stats:st(APP,2),...rel(R,5)},
 'festival-1':{mood:UP,...rel('child',5)},
 'trainer-worry':{energy:20,mood:DOWN},// made to stop for the day
 'cat-slope':{stats:st(STA,3),...rel('cat',5)},
 'main-year1':{mood:UP},
 'goal-y2':{stats:st(INT,3)},
 'cat-shortcut':{},// by choice
 'rat-imitation':{trainerBond:-5},// 「……今の、言いすぎた」
 'coach-rival':{trainerBond:5,...rel(R,5)},
 'exp-rival-hard-question':{mood:DOWN,...rel(R,5)},
 'coach-return':{trainerBond:10},
 'exp-rival-make-up':{},// by choice
 'rat-confession':{},// by choice
 'festival-2':{mood:UP,...rel('child',5)},
 'trainer-doubt-2':{trainerBond:10},
 'main-year2':{mood:UP,trainerBond:5},
 'goal-y3':{mood:UP},
 'rival-changes':{mood:UP,...rel(R,10)},
 'cat-past':{stats:st(STA,2),mood:DOWN},// the cat runs off without looking back
 'exp-fireworks-answer':{mood:UP,trainerBond:10},
 'festival-3':{mood:UP,energy:10},
 'exp-child-snow-senior':{stats:st(STA,3),...rel('child',10)},
 'trainer-confession':{mood:UP,trainerBond:10},
 'main-final':{mood:UP},
 // 主人公ごとの話（2026-10-30）: all good, small
 'hero-mochi-1':{stats:st(APP,3),mood:UP},
 'hero-mochi-2':{stats:st(STA,2),...rel('cat',8)},
 'hero-mochi-3':{trainerBond:10,mood:UP},
 'hero-dash-1':{stats:st(SPD,3)},
 'hero-dash-2':{mood:UP,...rel(R,8)},
 'hero-dash-3':{stats:st(SPD,2),...rel('rat',8)},
 'hero-hakase-1':{stats:st(INT,3)},
 'hero-hakase-2':{trainerBond:10,mood:UP},
 'hero-hakase-3':{stats:st(TEC,3),...rel('child',5)},
 // できごと
 'exp-great-success':{mood:UP,npcRelations:{seedshop:5,tanuki:5,beaver:5}},
 'exp-unsold-seeds':{mood:UP,...rel('seedshop',8)},
 // 寄り道
 'exp-sleepy-trainer':{stats:st(TEC,2),trainerBond:5},
 'exp-beaver-puddle':{energy:-10,...rel('beaver',5)},// cleaning up in the rain
 'exp-child-wheel':{},// by choice
 'exp-seed-tasting':{stats:st(APP,3),npcRelations:{[R]:5,seedshop:-5}},// 「無料で食べに来たんじゃねえだろうな」
 'exp-winter-coat':{stats:st(STA,3),energy:-10},// a cold morning
 'exp-summer-melt':{energy:-15},// melting in the heat
 'exp-seedshop-scale':{stats:st(APP,2),...rel('seedshop',-5)},// 「おめえは売り物じゃねえぞ」
 'exp-shop-keeper':{energy:-10,...rel('seedshop',8)},// a day of shop work
 'exp-cat-night':{stats:st(STA,3),energy:-10,...rel('cat',5)},// late on the slope
 'exp-cat-eating':{stats:st(APP,2),npcRelations:{cat:5,[R]:5}},
 'exp-rat-apology':{...rel('rat',8)},
 // 日常
 'daily-sunflower-plant':{mood:UP,energy:-10},// 「さよなら、ぼくのおやつ」
 'daily-slope':{mood:UP},
 'daily-cat-roof':{npcRelations:{cat:5,seedshop:5}},
 'daily-crumbs':{trainerBond:5},
 'daily-note':{stats:st(INT,2),trainerBond:5},
 'daily-rain-plan':{stats:st(INT,3),trainerBond:-5},// the plan was eaten
 'daily-cat-rerun':{stats:st(STA,2)},// the photo of the Cat climbing the slope to the end, every time
 'daily-cat-potechi':{npcRelations:{cat:5,[R]:5}},
 'daily-potechi-arrow':{energy:-10,...rel(R,5)},// searching for a lost ぽてち
 'daily-cheeks':{trainerBond:5,mood:DOWN},// the cheek stash is taken out
 'daily-rat-dawn':{stats:st(STA,3)},
 'daily-chobi-copy':{stats:st(APP,2),...rel('child',8)},
 'daily-footprints':{mood:UP,energy:-10},// 「……おなかすいた」
 'daily-sunflower-bloom':{mood:UP,trainerBond:5},
 'daily-first-slope':{stats:st(STA,2),mood:UP},
 'daily-sand':{energy:15},
 'daily-radio':{mood:UP,...rel('seedshop',5)},
 'daily-beaver-box':{energy:10,...rel('beaver',5)},
 'daily-flag-wish':{trainerBond:5,...rel('tanuki',5)},
 'daily-new-year':{mood:UP,npcRelations:{[R]:5,cat:5}},
 'daily-height':{stats:st(INT,2),mood:DOWN},// 「ぜんぜん伸びてない」
 'daily-cat-snow':{stats:st(STA,2),...rel('cat',5)},
 // 町の人（1〜5話）
 'visit-seedshop-1':{...rel('seedshop',8)},// + choice
 'visit-seedshop-2':{energy:10,...rel('seedshop',8)},
 'visit-seedshop-3':{mood:UP,...rel('seedshop',8)},
 'visit-seedshop-4':{mood:UP,...rel('seedshop',10)},
 'visit-seedshop-5':{stats:st(APP,3),...rel('seedshop',10)},
 'visit-tanuki-1':{stats:st(STA,2),...rel('tanuki',8)},
 'visit-tanuki-2':{stats:st(SPD,3),energy:-10,...rel('tanuki',8)},// chasing a flag round the town
 'visit-tanuki-3':{mood:UP,...rel('tanuki',8)},
 'visit-tanuki-4':{trainerBond:5,...rel('tanuki',10)},
 'visit-tanuki-5':{stats:st(INT,2),...rel('tanuki',10)},
 'visit-beaver-1':{stats:st(TEC,2),...rel('beaver',8)},
 'visit-beaver-2':{stats:st(STA,2),...rel('beaver',8)},
 'visit-beaver-3':{...rel('beaver',8)},// + the tool (3 turns +10%)
 'visit-beaver-4':{energy:-10,...rel('beaver',8)},// climbing the start tower
 'visit-beaver-5':{mood:UP,...rel('beaver',10)},
 'visit-rival-1':{stats:st(APP,2),...rel(R,8)},
 'visit-rival-2':{mood:UP,...rel(R,8)},
 'visit-rival-3':{energy:-10,...rel(R,8)},// walking ぽてち to the practice ground
 'visit-rival-4':{mood:UP,...rel(R,10)},
 'visit-rival-5':{stats:st(SPD,2),...rel(R,10)},
 'visit-cat-1':{stats:st(STA,2),...rel('cat',8)},
 'visit-cat-2':{trainerBond:5,...rel('cat',8)},
 'visit-cat-3':{stats:st(SPD,3),...rel('cat',8)},
 'visit-cat-4':{npcRelations:{cat:-5,rat:5}},// the cat is cross about the rat
 'visit-cat-5':{mood:UP,...rel('cat',10)}
};
export const CHOICE_EFFECTS={
 'cat-first':{'talk-back':{mood:UP,...rel('cat',5)},quiet:{mood:DOWN},seed:{stats:st(APP,2),...rel('cat',8)}},
 'exp-fireworks-promise':{together:{trainerBond:10},share:{energy:15,trainerBond:5}},
 'cat-shortcut':{try:{stats:st(TEC,4),trainerBond:-5,...rel('cat',5)},koyori:{trainerBond:10,mood:DOWN},own:{stats:st(INT,3),trainerBond:5,...rel('cat',5)}},
 'exp-rival-make-up':{'take-seed':{stats:st(APP,3),...rel(R,8)},'hold-paw':{mood:UP,...rel(R,10)},'stop-drum':{mood:UP,...rel(R,5)}},
 'rat-confession':{tell:{npcRelations:{rat:8,cat:5}},keep:{mood:DOWN,...rel('rat',5)}},
 'exp-child-wheel':{wait:{stats:st(INT,2),...rel('child',8)},beside:{energy:-10,...rel('child',10)}},
 'visit-seedshop-1':{crunchy:{stats:st(APP,2)},small:{stats:st(STA,2)}}
};
// The reply that follows a choice belongs to the same talk: no effects of its own.
const REPLIES=new Set(['cat-first-answer','cat-shortcut-answer','rat-confession-answer','exp-rival-make-up-answer','exp-fireworks-promise-answer','exp-child-wheel-answer','visit-seedshop-1-answer','visit-beaver-3-answer']);
export const isReply=id=>REPLIES.has(id);
const BENCH=/^ordinary-response-[123]$/,VISIT=/^visit-(seedshop|tanuki|beaver|rival|cat)-(\d+)$/;
export function storyEffects(s,id){
 if(id==='main-ending'||REPLIES.has(id))return null;
 if(Object.hasOwn(STORY_EFFECTS,id))return STORY_EFFECTS[id];
 // 反省会: a win lifts the mood; otherwise the two of them go over the race together.
 if(BENCH.test(id))return s.lastRace?.rank===1?{mood:UP,trainerBond:5}:{stats:st(INT,2),trainerBond:5};
 // Later chats with the town (after the five stories): friendship +8 only, as every visit gave before (owner
 // 2026-10-25), so a visit every three turns is no shortcut to abilities.
 const v=id.match(VISIT);if(v)return rel(v[1]==='rival'?R:v[1],8);
 return null;
}
// Gives a story definition its effects (the table replaces the old flat town +8) and each choice its own.
export function withStoryEffects(s,def){
 const effects=storyEffects(s,def.id),choices=CHOICE_EFFECTS[def.id];if(!effects&&!choices)return def;
 const out={...def};if(effects){if(Object.keys(effects).length)out.effects=effects;else delete out.effects;}
 if(choices&&out.choices)out.choices=out.choices.map(c=>choices[c.id]?{...c,effects:choices[c.id]}:c);
 return out;
}
export const isBadEffect=e=>!!e&&((e.stats||[]).some(n=>n<0)||e.energy<0||e.mood<0||e.trainerBond<0||Object.values(e.npcRelations||{}).some(n=>n<0));
