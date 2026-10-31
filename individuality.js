// Personality affects approach; talent affects aptitude. Neither is a condition/fatigue meter.
export const PERSONALITIES = {
 relaxed:{id:'relaxed',name:'おおらか',description:'食べる練習が得意。焦らず取り組み、失敗率が4ポイント低い。',growth:[0,0,1,0,0],failureOffset:-4,greatChance:.16},
 spirited:{id:'spirited',name:'負けずぎらい',description:'かけっこが伸びやすく、成功時の大成功率は26%。勢い余って失敗率も3ポイント高い。',growth:[1,0,0,0,0],failureOffset:3,greatChance:.26},
 careful:{id:'careful',name:'しんちょう',description:'迷路で力を発揮。失敗率が8ポイント低く、こつこつ成長する。',growth:[0,0,0,0,1],failureOffset:-8,greatChance:.12}
};
export const TALENTS = {
 pouch:{id:'pouch',name:'ほお袋の才能',description:'食いしんぼの基本成長＋2、スタミナ＋1。',growth:[0,1,2,0,0]},
 rocket:{id:'rocket',name:'駆け足の才能',description:'スピードの基本成長＋2、スタミナ＋1。',growth:[2,1,0,0,0]},
 insight:{id:'insight',name:'ひらめきの才能',description:'かしこさの基本成長＋2、きようさ＋1。',growth:[0,0,0,2,1]}
};
export const DEFAULT_INDIVIDUALITY = {
 mochi:{personalityId:'relaxed',talentId:'pouch'},
 dash:{personalityId:'spirited',talentId:'rocket'},
 hakase:{personalityId:'careful',talentId:'insight'}
};
export function validIndividuality(h){return !!h&&Object.hasOwn(PERSONALITIES,h.personalityId)&&Object.hasOwn(TALENTS,h.talentId);}
export function personalityOf(h){return PERSONALITIES[h.personalityId]||PERSONALITIES[DEFAULT_INDIVIDUALITY[h.characterId||h.id]?.personalityId]||PERSONALITIES.relaxed;}
export function talentOf(h){return TALENTS[h.talentId]||TALENTS[DEFAULT_INDIVIDUALITY[h.characterId||h.id]?.talentId]||TALENTS.pouch;}

// New runs use the approved three personalities. Legacy IDs above remain valid.
Object.assign(PERSONALITIES,{
 energetic:{id:'energetic',name:'元気',description:'かけっこが伸びやすい。大成功率26%、失敗率＋3。',growth:[1,0,0,0,0],failureOffset:3,greatChance:.26},
 cool:{id:'cool',name:'クール',description:'迷路に強く、失敗率が8ポイント低い。',growth:[0,0,0,0,1],failureOffset:-8,greatChance:.12},
 hungry:{id:'hungry',name:'食いしん坊',description:'食べる練習が得意。失敗率が4ポイント低い。',growth:[0,0,1,0,0],failureOffset:-4,greatChance:.16}
});
// Per-run talents (#30 R1, owner 2026-10-26): six new talents. Each run offers three from all nine; the
// player picks one at the start. yearGrowth multiplies a training's base growth by year; friendGrowth adds
// to the growth with friends; costMul scales a training's energy cost.
Object.assign(TALENTS,{
 wheel:{id:'wheel',name:'回し車の才能',description:'スタミナの基本成長＋2、スピード＋1。',growth:[1,2,0,0,0]},
 maze:{id:'maze',name:'迷路の才能',description:'きようさの基本成長＋2、かしこさ＋1。',growth:[0,0,0,1,2]},
 early:{id:'early',name:'早咲き',description:'1年目と2年目によく伸びる。',growth:[0,0,0,0,0],yearGrowth:[1.4,1.15,1]},
 late:{id:'late',name:'遅咲き',description:'1年目は伸びにくいが、3年目に大きく伸びる。',growth:[0,0,0,0,0],yearGrowth:[.85,1,1.45]},
 friendly:{id:'friendly',name:'仲間思い',description:'仲間が練習によく来る。一緒だと成長がさらに＋30%。',growth:[0,0,0,0,0],friendGrowth:.3,friendChance:.3},
 sturdy:{id:'sturdy',name:'丈夫',description:'練習で使う体力が35%少なく、失敗も少し減る。',growth:[0,0,0,0,0],costMul:.65,failMinus:5}
});
export const TALENT_POOL=['pouch','rocket','insight','wheel','maze','early','late','friendly','sturdy'];
// Three different talents for this run, fixed by the run's seed (a reload shows the same three).
export function talentCandidates(seed){let x=(seed^0x5bd1e995)>>>0;const pool=[...TALENT_POOL],out=[];while(out.length<3){x=(Math.imul(x,1664525)+1013904223)>>>0;out.push(pool.splice(x%pool.length,1)[0]);}return out;}
export const MODERN_INDIVIDUALITY={mochi:{personalityId:'hungry',talentId:'pouch'},dash:{personalityId:'energetic',talentId:'rocket'},hakase:{personalityId:'cool',talentId:'insight'}};

// Talents from now on (#30, owner 2026-10-30 「才能はランダムで選べないようにして　途中のレアイベントでさらに
// ゲットできるようにして　パワプロとかウマ娘イメージで」). Owner picks: the first talent is one of the nine at
// random (the run's seed decides it); rare events give more, about 1–2 a run; the rare events can also give
// gold talents, a little stronger than the nine; the overall strength stays as it was.
// greatPlus adds to the chance of a great training.
Object.assign(TALENTS,{
 'gold-idaten':{id:'gold-idaten',gold:true,name:'金・韋駄天',description:'スピードの基本成長＋3、スタミナ＋1。練習の大成功率＋8%。',growth:[3,1,0,0,0],greatPlus:.08},
 'gold-heart':{id:'gold-heart',gold:true,name:'金・鉄のしんぞう',description:'スタミナの基本成長＋3。練習で使う体力が20%少ない。',growth:[0,3,0,0,0],costMul:.8},
 'gold-glutton':{id:'gold-glutton',gold:true,name:'金・大食い王',description:'食欲の基本成長＋3、スタミナ＋1。失敗が少し減る。',growth:[0,1,3,0,0],failMinus:4},
 'gold-guide':{id:'gold-guide',gold:true,name:'金・道しるべ',description:'きようさの基本成長＋3、かしこさ＋2。',growth:[0,0,0,2,3]},
 'gold-idol':{id:'gold-idol',gold:true,name:'金・町の人気者',description:'仲間がとてもよく練習に来る。一緒だと成長がさらに＋40%。',growth:[0,0,0,0,0],friendGrowth:.4,friendChance:.45},
 'gold-bloom':{id:'gold-bloom',gold:true,name:'金・大器晩成',description:'2年目から伸びはじめ、3年目に大きく伸びる。',growth:[0,0,0,0,0],yearGrowth:[1,1.15,1.5]}
});
export const GOLD_POOL=['gold-idaten','gold-heart','gold-glutton','gold-guide','gold-idol','gold-bloom'];
// The first talent of a run: one of the nine, from the seed (a reload shows the same one).
export function startingTalent(seed){let z=(seed^0x2c1b3c6d)>>>0;z=Math.imul(z^(z>>>16),0x85ebca6b)>>>0;z=Math.imul(z^(z>>>13),0xc2b2ae35)>>>0;return TALENT_POOL[((z^(z>>>16))>>>0)%TALENT_POOL.length];}
// Every talent this run has: the first one, then the ones from rare events, in the order they came.
export function ownedTalents(s){return [talentOf(s),...(s.extraTalents||[]).map(id=>TALENTS[id]).filter(Boolean)];}
// All of them working together: growth adds up, the year and cost factors multiply, the rest adds up
// (friends' visit chance takes the highest).
export function talentEffects(s){const list=ownedTalents(s);if(list.length===1)return list[0];
 const chances=list.map(t=>t.friendChance).filter(n=>n!==undefined);
 return {id:list.map(t=>t.id).join('+'),growth:[0,1,2,3,4].map(i=>list.reduce((n,t)=>n+(t.growth?.[i]||0),0)),
  yearGrowth:[0,1,2].map(y=>list.reduce((n,t)=>n*(t.yearGrowth?.[y]??1),1)),friendGrowth:list.reduce((n,t)=>n+(t.friendGrowth||0),0),
  ...(chances.length?{friendChance:Math.max(...chances)}:{}),costMul:list.reduce((n,t)=>n*(t.costMul??1),1),
  failMinus:list.reduce((n,t)=>n+(t.failMinus||0),0),greatPlus:list.reduce((n,t)=>n+(t.greatPlus||0),0)};}
