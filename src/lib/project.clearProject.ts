import * as R from "$lib/registry"
import * as S from "$lib/settings"
import { removeImage } from "./media.removeImage";
import { removeSound } from "./media.removeSound";
import type { MapSound } from "./classes/MapSound";
import type { MapImage } from "./classes/MapImage";
import { shouldSaveProject } from "./project.shouldSaveProject";
import { saveProject } from "./project.saveProject";
import { closeAllMenus } from "./ui.menus";

export async function clearProject():Promise<boolean> {
    
    await closeAllMenus();

    // check if we should save the project, prompt user if they really want to close it if so.
    // if they don't want to, back out.
    if (!await shouldSaveProject()) return false;

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

    return true;
}