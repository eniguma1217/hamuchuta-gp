import {drawZoneFocus} from './zone-focus.js';
// The approved checkpoint owns the centre of the screen. The original race HUD
// and whole-field tracker remain above/below it; no thumbnail covers a face,
// meal count or the maze portrait. snapshot remains an accepted legacy argument.
export function drawCheckpointBroadcast(canvas,focus,variant,snapshot){drawZoneFocus(canvas,focus,variant,{embedded:true});}
