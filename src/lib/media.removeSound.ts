import * as R from '$lib/registry'
import type L from 'leaflet'

export function removeSoundbyCircle(emitter:L.Circle, removeFromList:boolean = true) {
    let soundList = R.getSoundList();
    for(let i = 0; i < soundList.length; i++) {
        if (soundList[i].circle === emitter) {
            removeSound(i, removeFromList);
            break;
        }
    }
}

export function removeSound(id:number, removeFromList:boolean = true) {
    let soundList = R.getSoundList();
    if (id < soundList.length) {
        soundList[id].sound.stop();
        soundList[id].circle.remove();
        if(removeFromList) soundList.splice(id, 1);
        R.setProjectDirty();
    }
}