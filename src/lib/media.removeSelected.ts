import * as R from '$lib/registry'
import L from 'leaflet'
import { removeImageByRect } from './media.removeImage'
import { removeSoundbyCircle } from './media.removeSound'

export function removeSelected() {
    let selectedList = R.getSelectedList();
    for (let i=0; i<selectedList.length; i++) {
        if (selectedList[i] instanceof L.Circle) {
            removeSoundbyCircle(selectedList[i] as L.Circle);
        } else if (selectedList[i] instanceof L.Rectangle) {
            removeImageByRect(selectedList[i] as L.Rectangle);
        }
    }
}