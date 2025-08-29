import * as R from '$lib/registry.svelte'
import { ask } from "@tauri-apps/plugin-dialog";
import { t } from './util.localization';


/**
 * Remove a sound from the map, using its sort order as an identifier.
 * @param id the id of the sound.
 * @param removeFromList whether or not to remvoe the sound from the sound list.
 * @param force whather or not to bypass dialogs while removing.
 * @returns 
 */
export async function removeSound(id:number, removeFromList:boolean = true, force:boolean = false) {
    let soundList = R.getSounds();
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
                let approveDelete = await ask(t.get('dialog.confirmDeleteSound'));
                if (!approveDelete) return;
            }
        }
        let soundToRemove = soundList[id];
        soundToRemove.sound.pause;
        soundToRemove.sound.removeAttribute("src");
        soundToRemove.sound.load();

        if(removeFromList) soundList.splice(id, 1);
        R.setProjectDirty();
    }
}
