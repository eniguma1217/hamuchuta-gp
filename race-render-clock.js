// Smooth pictures between the existing 40ms broadcast/UI ticks. This never
// advances the game's RNG, official result, or the logical playback schedule.
export function renderTickAt(tick,elapsedMs,speed=1){
 return tick+Math.max(0,Math.min(40,Number.isFinite(elapsedMs)?elapsedMs:0))/80*speed;
}
