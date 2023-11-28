import * as R from '$lib/registry'
import L from 'leaflet'
import { removeImage } from './media.removeImage'
import { removeSound } from './media.removeSound'

export function removeSelected() {
    let selectedList = R.getSelectedList();
    for (let i=0; i<selectedList.length; i++) {
        if (selectedList[i] instanceof L.Circle) {
            removeSound(selectedList[i] as L.Circle);
        } else if (selectedList[i] instanceof L.Rectangle) {
            removeImage(selectedList[i] as L.Rectangle);
        }
    }
}