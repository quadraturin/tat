import * as R from '$lib/registry'
import L from 'leaflet'
import { removeImageByRect } from './media.removeImage'
import { removeSoundbyEmitter } from './media.removeSound'

export function removeSelected() {
    let selectedList = R.getSelectedList();
    for (let i=0; i<selectedList.length; i++) {
        if (selectedList[i] instanceof L.Circle) {
            removeSoundbyEmitter(selectedList[i] as L.Circle);
        } else if (selectedList[i] instanceof L.Rectangle) {
            removeImageByRect(selectedList[i] as L.Rectangle);
        }
    }
}