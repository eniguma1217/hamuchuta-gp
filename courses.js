const sprint={id:'dash',name:'かけっこ平原',short:'かけっこ',keys:[0,0,0,1],action:'speed',desc:'スピード75%・スタミナ25%'};
const eating={id:'eat',name:'もぐもぐ広場',short:'早食い',keys:[2,2,2,2,4],action:'appetite',desc:'食いしんぼ80%・きようさ20%'};
const maze={id:'maze',name:'ひらめき迷路',short:'勉強／迷路',keys:[3,3,3,3,3,3,3,4,4,4],action:'technique',desc:'かしこさ70%・きようさ30%'};
const endurance={id:'last',name:'ラストスパート',short:'持久走',keys:[1,1,0],action:'speed',desc:'スタミナ67%・スピード33%'};
export const COURSES = {
 sprint:{id:'sprint',name:'かけっこ競技',description:sprint.desc,stages:[sprint]},
 eating:{id:'eating',name:'早食い競技',description:eating.desc,stages:[eating]},
 maze:{id:'maze',name:'勉強・迷路競技',description:maze.desc,stages:[maze]},
 allround:{id:'allround',name:'総合競技',description:'かけっこ・早食い・勉強／迷路・持久走の4区間合計',stages:[sprint,eating,maze,endurance]}
};
// Already recorded races retain their original four-stage labels and values.
export const LEGACY_COURSE={id:'legacy-allround',name:'旧版の総合競技',description:'旧版の4区間合計',stages:[
 {...sprint,keys:[0,0,1]}, {...eating,keys:[2,2,4]}, {...maze,keys:[3,3,4]}, endurance
]};
export function validCourse(c){return !!c&&typeof c.id==='string'&&typeof c.name==='string'&&Array.isArray(c.stages)&&c.stages.length>0&&c.stages.length<=4&&c.stages.every(z=>typeof z.name==='string'&&typeof z.short==='string'&&['speed','appetite','intelligence','technique'].includes(z.action)&&Array.isArray(z.keys)&&z.keys.length>0&&z.keys.every(k=>Number.isInteger(k)&&k>=0&&k<5));}
export const resultCourse=r=>r.course||LEGACY_COURSE;
export const courseAbility=(stats,stage)=>stage.keys.reduce((sum,k)=>sum+stats[k],0)/stage.keys.length;
