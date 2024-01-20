import * as R from '$lib/registry'
import { open } from "@tauri-apps/api/dialog";
import { imageFileTypes, soundFileTypes } from '$lib/settings.appSettings';
import { loadFile } from "./media.loadFile";
import { closeAllMenus } from './ui.menus';
import { closeModal, openLoadingModal, updateLoadingModal } from './ui.modals';

/**
 * read files and handle loading state.
 */
export async function readFiles() {
    try {
        // close any open menus.
        await closeAllMenus();

        // prompt to open one or more image or audio files.
        const selected = await open({
            multiple: true,
            title: "open file",
            filters: [{
                extensions: imageFileTypes.concat(soundFileTypes),
                name: "*"
            }]
        });

        // check if the user opened one or more files.
        if (selected === null) {
            // user cancelled the selection.
            console.log('canceled selection');
            return;
        }
        else if (Array.isArray(selected)) {
            // user selected files.

            // catch promises: ensures that the modal stays open until everything is loaded.
            let promises = new Array<Promise<any>>;

            // open the loading modal.
            openLoadingModal();
            R.setIsLoading(true);

            // load each selected file.
            selected.forEach(e => {
                console.log("LOAD", e);
                promises.push(loadFile(e as string));
            });

            // when all promises are settled, finish loading and close the modal.
            await Promise.allSettled(promises);
            R.setIsLoading(false);
            closeModal();
        }
    }
    catch (err) {
        console.error(err);
    }
}

