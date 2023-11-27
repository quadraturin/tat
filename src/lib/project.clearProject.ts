import * as R from "$lib/registry"
import * as S from "$lib/settings"
import { removeImage } from "./media.removeImage";
import { removeSound } from "./media.removeSound";
import type { MapSound } from "./classes/MapSound";
import type { MapImage } from "./classes/MapImage";
import { shouldSaveProject } from "./project.shouldSaveProject";
import { saveProject } from "./project.saveProject";

export async function clearProject() {

    // check if we should save the project
    if (await shouldSaveProject()) {
        // if we should, prompt user to save
        if(!await saveProject()){
            // if they cancel the save, back out. if they do save, continue.
            return;
        }
    }

    R.getImageList().forEach(e => {
        removeImage(e.rect, false);
    });
    R.setImageList(new Array<MapImage>);

    R.getSoundList().forEach(e => {
        removeSound(e.circle, false);
    });
    R.setSoundList(new Array<MapSound>);

    R.setProjectPath('');
    
    R.setProjectClean();
    R.setHasMedia(false);
    R.setProjectName(S.defaultProjectName);
}