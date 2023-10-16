import * as R from '$lib/registry'
import type L from 'leaflet'

export function removeImage(imageRect:L.Rectangle) {
    let imageList = R.getImageList();
    for(let i = 0; i < imageList.length; i++) {
        if (imageList[i].rect === imageRect) {
            imageList[i].rect.remove();
            imageList[i].overlay.remove();
            imageList.splice(i, 1);
            break;
        }
    }
}