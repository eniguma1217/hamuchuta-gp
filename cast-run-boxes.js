// Run frames (run-0..3) of the six principal hamsters: the owner's new 4-frame run
// sheets (2026-10-24, docs/references/owner-supplied-20261024b/run), downscaled
// so the frames keep the old painted size, one sheet per hamster. Boxes are the
// whole silhouettes (alpha>16) in each sheet; frames are at least 9px apart, so a
// 4px guard never takes in a neighbour.
export const CAST_RUN_SHEETS=Object.freeze({"heroes":["mochi","dash","hakase"],"friends":["koyori","potechi","chobi"]});
export const CAST_RUN_BOXES=Object.freeze({"heroes":[[[16,219,231,351],[251,219,438,355],[458,219,638,355],[663,218,853,355]],[[14,208,229,356],[249,210,443,360],[453,213,632,360],[650,206,831,358]],[[17,237,245,375],[272,237,472,379],[491,237,673,379],[693,234,902,373]]],"friends":[[[16,76,213,213],[251,73,440,216],[472,75,635,216],[677,73,859,213]],[[18,87,253,231],[289,84,484,234],[527,84,709,232],[743,85,954,228]],[[19,69,223,220],[257,72,440,223],[476,70,644,222],[684,71,878,220]]]});
// Hurdle jump: the most gathered frame (narrowest silhouette; the sheets' 3rd frame).
export const CAST_JUMP_RUN=Object.freeze({"heroes":[2,2,2],"friends":[2,2,2]});
// Faces in those jump frames, in run-sheet pixels: [back eye, front eye] centres
// (measured as the enclosed dark blobs), brow height above each eye, brow
// half-length and the sweat drop, scaled from the old anchors by eye spacing.
export const CAST_JUMP_FACE=Object.freeze({
 heroes:[
  {"eyes":[[572,283],[615,281]],"lift":16,"half":8,"sweat":[628,256]},
  {"eyes":[[567,285],[612,282]],"lift":16,"half":8,"sweat":[626,257]},
  {"eyes":[[594,313],[641,308]],"lift":28,"half":11,"sweat":[661,270]}
 ],
 friends:[
  {"eyes":[[566,147],[610,141]],"lift":17,"half":9,"sweat":[625,114]},
  {"eyes":[[632,160],[686,161]],"lift":15,"half":8,"sweat":[700,134]},
  {"eyes":[[574,158],[620,151]],"lift":18,"half":9,"sweat":[635,124]}
 ]
});
// Every other pose of the six principal hamsters (idle, jump, eating, study, rest,
// joy), measured the same way (#30 C2). The POLISH boxes stop at the 209px grid
// and cut feet by up to 25px; scale still comes from the POLISH idle crop.
export const CAST_POSE_BOXES=Object.freeze({"heroes":[{"idle":[16,78,191,231],"jump":[1074,78,1236,218],"eat-0":[17,267,191,433],"eat-1":[218,268,413,435],"study-0":[438,277,626,433],"study-1":[641,272,831,436],"rest":[864,320,1062,440],"joy":[1078,256,1243,435]},{"idle":[18,480,192,643],"jump":[1074,480,1243,644],"eat-0":[18,672,195,842],"eat-1":[224,672,416,845],"study-0":[445,685,630,842],"study-1":[646,682,834,842],"rest":[861,725,1054,848],"joy":[1070,664,1244,842]},{"idle":[16,893,198,1047],"jump":[1071,893,1245,1042],"eat-0":[14,1078,191,1240],"eat-1":[221,1078,416,1243],"study-0":[440,1084,631,1238],"study-1":[642,1078,839,1243],"rest":[865,1126,1060,1246],"joy":[1078,1069,1245,1241]}],"friends":[{"idle":[30,65,196,234],"jump":[1077,68,1239,211],"eat-0":[24,259,191,429],"eat-1":[239,266,415,429],"study-0":[451,262,623,424],"study-1":[657,260,832,427],"rest":[862,322,1048,431],"joy":[1068,257,1236,433]},{"idle":[20,457,199,636],"jump":[1071,459,1240,632],"eat-0":[14,664,208,840],"eat-1":[233,671,428,840],"study-0":[448,673,636,840],"study-1":[645,674,846,841],"rest":[854,720,1063,839],"joy":[1076,665,1248,841]},{"idle":[16,889,198,1061],"jump":[1081,891,1242,1045],"eat-0":[29,1078,192,1237],"eat-1":[245,1075,413,1237],"study-0":[462,1078,628,1237],"study-1":[660,1076,837,1237],"rest":[868,1119,1065,1236],"joy":[1076,1072,1244,1236]}]});
