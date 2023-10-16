import * as R from '$lib/registry'
import type L from 'leaflet'

export function removeSound(emitter:L.Circle, removeFromList:boolean = true) {
    let soundList = R.getSoundList();
    for(let i = 0; i < soundList.length; i++) {
        if (soundList[i].circle === emitter) {
            soundList[i].circle.remove();
            if(removeFromList) soundList.splice(i, 1);
            R.setProjectDirty();
            break;
        }
    }
}