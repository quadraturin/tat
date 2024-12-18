import * as R from '$lib/registry'
import { ask } from "@tauri-apps/plugin-dialog";
import type L from 'leaflet'

/**
 * remove a sound from the map, using its emitter as an identifier.
 * @param emitter the emitter to use as an identifier.
 * @param removeFromList whether or not to remove the sound from the sound list.
 * @param force whether or not to bypass dialogs while removing.
 * @returns 
 */
export async function removeSoundbyEmitter(emitter:L.Circle|L.Polygon|undefined, removeFromList:boolean = true, force:boolean=false) {
    if (typeof emitter == "undefined") return;
    let soundList = R.getSoundList();
    for(let i = 0; i < soundList.length; i++) {
        if (soundList[i].emitter === emitter) {
            await removeSound(i, removeFromList, force);
            break;
        }
    }
}

/**
 * remove a sound from the map, using its sort order as an identifier.
 * @param id the id of the sound.
 * @param removeFromList whether or not to remvoe the sound from the sound list.
 * @param force whather or not to bypass dialogs while removing.
 * @returns 
 */
export async function removeSound(id:number, removeFromList:boolean = true, force:boolean = false) {
    let soundList = R.getSoundList();
    if (id < soundList.length) {
        if (!force) {
            let unique = true;
            for (let i=0; i<soundList.length; i++) {
                if (i != id && soundList[i].src == soundList[id].src) {
                    unique = false;
                    break;
                }
            }
            if (unique) {
                let approveDelete = await ask(R.t.dialog.confirmDeleteSound);
                if (!approveDelete) return;
            }
        }
        let soundToRemove = soundList[id];
        soundToRemove.sound.stop();
        if (typeof soundToRemove.emitter != "undefined") soundToRemove.emitter.remove();
        if(removeFromList) soundList.splice(id, 1);
        R.setProjectDirty();
    }
}