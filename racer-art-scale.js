// Visual proportions only. These values never affect abilities, time or rank.
// The player is identified by YOU, not a larger body than the other hamsters.
import {SPECIES_ALIASES} from './fancy-species-art.js';
export const ANIMAL_ART_HEIGHT=Object.freeze({
 ネズミ:20,ウシ:35,トラ:33,ウサギ:24,タツ:35,ヘビ:18,ウマ:34,ヒツジ:30,サル:26,ニワトリ:24,イヌ:28,イノシシ:30,
 ネコ:25,キツネ:27,オオカミ:30,クマ:35,パンダ:33,レッサーパンダ:26,タヌキ:26,コアラ:25,カンガルー:32,ウォンバット:25,ナマケモノ:25,
 リス:21,モモンガ:21,カピバラ:29,モルモット:22,チンチラ:22,フェレット:23,ハリネズミ:21,
 アライグマ:26,カワウソ:24,ビーバー:26,ラッコ:24,アザラシ:27,ペンギン:25,フクロウ:24,タカ:26,ワシ:29,フラミンゴ:30,ダチョウ:35,クジャク:28,
 カメ:20,ワニ:24,カエル:18,シカ:32,キリン:37,ゾウ:36,サイ:35,カバ:34,ライオン:34
});
export function hamsterArt(row={}){return row.id==='player'||['hamster','ハムスター','はむちゅたー'].includes(row.species)||/^domestic-/.test(row.id||'');}
export function racerArtHeight(row,world=false){
 if(hamsterArt(row))return world?22:29;
 return ANIMAL_ART_HEIGHT[SPECIES_ALIASES[row.species||row.id]||row.species||row.id]||27;
}
export function banquetArtHeight(row,world=false){
 if(hamsterArt(row))return 24;
 return Math.max(19,Math.min(32,racerArtHeight(row,world)*.90));
}
