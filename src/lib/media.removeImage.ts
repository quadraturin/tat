import * as R from '$lib/registry'
import type L from 'leaflet'

export function removeImage(imageRect:L.Rectangle, removeFromList:boolean = true) {
    let imageList = R.getImageList();
    for(let i = 0; i < imageList.length; i++) {
        if (imageList[i].rect === imageRect) {
            imageList[i].rect.remove();
            imageList[i].overlay.remove();
            if(removeFromList) imageList.splice(i, 1);
            R.setProjectDirty();
            break;
        }
    }
}