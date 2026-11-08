// Story location is presentation data only: never touches saves, RNG or training.
const names={
 town:'ひまわりタウン', 'town-dusk':'夕暮れのひまわりタウン',
 'town-snow':'雪のひまわりタウン','town-summer':'真夏のひまわりタウン',
 training:'練習場','training-morning':'朝の練習場','training-rain':'雨の練習場',
 'training-dusk':'夕方の練習場', 'training-night':'夜の練習場',
 seedshop:'ひまわりの種屋','seedshop-interior':'種屋の店内','seedshop-rain':'雨の種屋',
 workshop:'ビーバーの工作場',shrine:'神社の石段','shrine-night':'お祭りの夜の神社',
 'bench-dusk':'大会帰りのベンチ',bedroom:'こよりの部屋','bedroom-morning':'朝のこよりの部屋',
 'race-day':'大会の控え場所','race-sunset':'大会後の会場',world:'世界大会の控え場所',
 // The four stories (#30, owner 2026-11-01): the 幕間 long ago, and the slope and steps at night and at dawn.
 'past-slope':'むかしの坂','past-plaza':'むかしの広場','slope-night':'夜の神社の坂','slope-snow':'雪の夜の坂','shrine-dawn':'夜明け前の神社の石段'
};
const mapped={
 'main-prologue':'seedshop','main-year1':'race-sunset','main-year2':'race-sunset',
 'main-final':'world','main-ending':'race-sunset','child-first':'town',
 'trainer-private':'bedroom','rival-first':'race-day','festival-1':'shrine-night',
 'trainer-worry':'training-dusk','rat-imitation':'bedroom','coach-rival':'training',
 'coach-return':'training-dusk','festival-2':'shrine','trainer-doubt-2':'bedroom',
 'rival-changes':'training-dusk','festival-3':'shrine','trainer-confession':'bedroom',
 'ordinary-response-1':'bench-dusk','ordinary-response-2':'bench-dusk',
 'ordinary-response-3':'bench-dusk'
};
export function storyScene(def,turn=0){
 const id=def?.id||'';
 let scene=def?.scene||mapped[id];
 if(['slope','shop','tv','note','morning'].includes(scene))return {scene,name:({slope:'神社へ続く夕暮れの坂',shop:'ひまわりの種屋',tv:'種屋のテレビ',note:'2匹の練習ノート',morning:'朝の練習場'})[scene]};
 if(!scene){
  if(id.startsWith('visit-seedshop'))scene='seedshop';
  else if(id.startsWith('visit-beaver'))scene='workshop';
  else if(id.startsWith('visit-tanuki'))scene='shrine';
  else if(id.startsWith('visit-'))scene='training';
  else if(id.includes('slope'))scene='shrine';
  else if(id.startsWith('daily-'))scene='town';
  else scene='town';
 }
 return {scene,name:names[scene]||names.town};
}
