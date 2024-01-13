import * as R from '$lib/registry'
import type L from 'leaflet'

export function removeImageByRect(imageRect:L.Rectangle, removeFromList:boolean = true) {
    let imageList = R.getImageList();
    for(let i = 0; i < imageList.length; i++) {
        if (imageList[i].rect === imageRect) {
            removeImage(i, removeFromList);
            break;
        }
    }
}

export function removeImage(id:number, removeFromList:boolean = true) {
    let imageList = R.getImageList();
    if (id < imageList.length) {
        imageList[id].rect.remove();
        imageList[id].overlay.remove();
        if(removeFromList) imageList.splice(id, 1);
        R.setProjectDirty();
    }
}