import * as R from '$lib/registry'
import { ask } from "@tauri-apps/api/dialog";
import type L from 'leaflet'
import type { MapImage } from './classes/MapImage';

export function removeImageByRect(imageRect:L.Rectangle, removeFromList:boolean = true) {
    let imageList = R.getImageList();
    for(let i = 0; i < imageList.length; i++) {
        if (imageList[i].rect === imageRect) {
            removeImage(i, removeFromList);
            break;
        }
    }
}

export async function removeImage(id:number, removeFromList:boolean = true) {
    let imageList = R.getImageList();
    if (id < imageList.length) {
        let unique = true;
        for (let i=0; i<imageList.length; i++) {
            if (i != id && imageList[i].data.name == imageList[id].data.name) {
                unique = false;
                break;
            }
        }
        if (unique) {
            let approveDelete = await ask("this is the only instance of this image file in this project!\n\nif you remove it and save the project, the image file will be deleted from the project folder.\n\ndo you still want to remove the image?");
            if (!approveDelete) return;
        }
        imageList[id].rect.remove();
        imageList[id].overlay.remove();
        if(removeFromList) imageList.splice(id, 1);
        R.setProjectDirty();
    }
}

async function lastInstanceOfImageCheck(image:MapImage) {
    
}