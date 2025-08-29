import * as R from '$lib/registry.svelte'
import { ask } from "@tauri-apps/plugin-dialog";
import { t } from './util.localization';


/**
 * remove an image from the map, using its position in the image list as an identifier.
 * @param id the id of the image to remove.
 * @param removeFromList whether or not to remove the image from the image list.
 * @returns 
 */
export async function removeImage(id:number, removeFromList:boolean = true, force:boolean = false) {
    let imageList = R.getImages();
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
                let approveDelete = await ask(t.get('dialog.confirmDeleteImage'));
                if (!approveDelete) return;
                let imageToRemove = imageList[id];
                imageToRemove.image.removeAttribute("src");
            }
        }
        if(removeFromList) imageList.splice(id, 1);
        R.setProjectDirty();
    }
}
