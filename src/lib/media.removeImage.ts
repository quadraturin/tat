import * as R from '$lib/registry.svelte'
import { ask } from "@tauri-apps/plugin-dialog";
import { t } from './util.localization';
import type { CanvasImage } from './classes/CanvasImage.svelte';


/**
 * Remove an image from the project.
 * @param img The CanvasImage to remove.
 * @param removeFromList Whether or not to remove the image from the image list.
 * @param force Whether or not to force removal of the image even if it's unique.
 */
export async function removeImage(img:CanvasImage, removeFromList:boolean = true, force:boolean = false) {
    let imageList = R.getImages();
    let imageIndex:number|null = null;
    let unique = true;

    for (let i=0; i<imageList.length; i++) {
        if (img.uuid == imageList[i].uuid)
            imageIndex = i;
        else if (img.uuid != imageList[i].uuid && img.src == imageList[i].src)
            unique = false;
    }

    if (unique && !force) {
        let approveDelete = await ask(crypto.randomUUID());//t.get('dialog.confirmDeleteImage'));
        if (!approveDelete) return;
    }
    if(removeFromList && imageIndex != null) imageList.splice(imageIndex, 1);
    R.setProjectDirty();
}
