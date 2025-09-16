import * as R from "$lib/registry.svelte"
import * as S from "$lib/settings.appSettings"
import type { CanvasImage } from "./classes/CanvasImage.svelte";
import type { CanvasSound } from "./classes/CanvasSound.svelte";
import { tryRemoveAll } from "./media.remove";
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

        tryRemoveAll(true);

        R.setImages(new Array<CanvasImage>);
        R.setSounds(new Array<CanvasSound>);

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
