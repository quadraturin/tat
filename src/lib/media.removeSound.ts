import * as R from '$lib/registry.svelte'
import { ask } from "@tauri-apps/plugin-dialog";
import { t } from './util.localization';
import type { CanvasSound } from './classes/CanvasSound.svelte';


/**
 * Remove a sound from project.
 * @param snd The CanvasSound to remove.
 * @param removeFromList Whether or not to remove the sound from the sound list.
 * @param force Whether or not to force removal of the sound even if it's unique.
 */
export async function removeSound(snd:CanvasSound, removeFromList:boolean = true, force:boolean = false) {
    let soundList = R.getSounds();
    let soundIndex:number|null = null;
    let unique = true;

    for (let i=0; i<soundList.length; i++) {
        if (snd.uuid == soundList[i].uuid)
            soundIndex = i;
        else if (snd.uuid != soundList[i].uuid && snd.src == soundList[i].src)
            unique = false;
    }

    if (unique && !force) {
        let approveDelete = await ask(snd.src + "\n\n" + t.get('dialog.confirmDeleteSound'));
        if (!approveDelete) return;
    }
    
    snd.sound.pause();
    snd.sound.removeAttribute("src");
    snd.sound.load();
    if(removeFromList && soundIndex != null) soundList.splice(soundIndex, 1);
    R.setProjectDirty();
}
