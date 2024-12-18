import * as R from '$lib/registry'
import { ask } from "@tauri-apps/plugin-dialog";
import type L from 'leaflet'

/**
 * remove an image from the map, using its rectangle as an identifier.
 * @param imageRect the image rectangle to remove.
 * @param removeFromList whether or not to remove the image from the image list.
 */
export function removeImageByRect(imageRect:L.Rectangle, removeFromList:boolean = true, force:boolean = false) {
    let imageList = R.getImageList();
    for(let i = 0; i < imageList.length; i++) {
        if (imageList[i].rect === imageRect) {
            removeImage(i, removeFromList, force);
            break;
        }
    }
}

/**
 * remove an image from the map, using its position in the image list as an identifier.
 * @param id the id of the image to remove.
 * @param removeFromList whether or not to remove the image from the image list.
 * @returns 
 */
export async function removeImage(id:number, removeFromList:boolean = true, force:boolean = false) {
    let imageList = R.getImageList();
    if (id < imageList.length) {
        if (!force) {
            let unique = true;
            for (let i=0; i<imageList.length; i++) {
                if (i != id && imageList[i].name == imageList[id].name) {
                    unique = false;
                    break;
                }
            }
            if (unique) {
                let approveDelete = await ask(R.t.dialog.confirmDeleteImage);
                if (!approveDelete) return;
            }
        }
        imageList[id].rect.remove();
        imageList[id].overlay.remove();
        if(removeFromList) imageList.splice(id, 1);
        R.setProjectDirty();
    }
}