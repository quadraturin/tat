import * as R from '$lib/registry'
import { ask } from "@tauri-apps/api/dialog";
import type L from 'leaflet'

export async function removeSoundbyEmitter(emitter:L.Circle|L.Polygon, removeFromList:boolean = true, force:boolean=false) {
    let soundList = R.getSoundList();
    for(let i = 0; i < soundList.length; i++) {
        if (soundList[i].emitter === emitter) {
            await removeSound(i, removeFromList, force);
            break;
        }
    }
}

export async function removeSound(id:number, removeFromList:boolean = true, force:boolean = false) {
    let soundList = R.getSoundList();
    if (id < soundList.length) {
        if (!force) {
            let unique = true;
            for (let i=0; i<soundList.length; i++) {
                if (i != id && soundList[i].data.name == soundList[id].data.name) {
                    unique = false;
                    break;
                }
            }
            if (unique) {
                let approveDelete = await ask(R.t.dialog.confirmDeleteSound);
                if (!approveDelete) return;
            }
        }
        soundList[id].sound.stop();
        soundList[id].emitter.remove();
        if(removeFromList) soundList.splice(id, 1);
        R.setProjectDirty();
    }
}