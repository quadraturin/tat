import * as R from "$lib/registry"
import * as S from "$lib/settings.appSettings"
import { removeImageByRect } from "./media.removeImage";
import { removeSoundbyEmitter } from "./media.removeSound";
import type { MapSound } from "./classes/MapSound.svelte";
import type { MapImage } from "./classes/MapImage.svelte";
import { shouldSaveProject } from "./project.shouldSaveProject";
import { closeAllMenus } from "./ui.menus";

/**
 * try to clear the current project.
 * @returns whether or not the project was cleared.
 */
export async function clearProject():Promise<boolean> {
    try {
        await closeAllMenus();

        // check if we should save the project, prompt user if they really want to close it if so.
        // if they don't want to, back out.
        if (!await shouldSaveProject()) return false;

        R.getImageList().forEach(e => { removeImageByRect(e.rect, false, true); });
        R.setImageList(new Array<MapImage>);

        R.getSoundList().forEach(e => { removeSoundbyEmitter(e.emitter, false, true); });
        R.setSoundList(new Array<MapSound>);

        R.setProjectPath('');
        R.setProjectClean();
        R.setHasMedia(false);
        R.setProjectName(S.defaultProjectName);

        return true;
    } catch(err) {
        console.error(err);
        return false;
    }
}