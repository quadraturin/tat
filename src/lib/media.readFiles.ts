import * as R from '$lib/registry'
import { open } from "@tauri-apps/api/dialog";
import { imageFileTypes, soundFileTypes } from '$lib/settings';
import { loadFile } from "./media.loadFile";
import { closeAllMenus } from './menu.menus';
import { closeModal, openLoadingModal, updateLoadingModal } from './menu.modals';

// read in valid files, handle loading state
export async function readFiles(): Promise<void> {
    try {

        await closeAllMenus();

        // prompt to open one or more image or audio files
        const selected = await open({
            multiple: true,
            title: "open file",
            filters: [{
                extensions: imageFileTypes.concat(soundFileTypes),
                name: "*"
            }]
        });

        // check if they opened one or more files
        if (selected === null) {
            // user cancelled the selection
            console.log('canceled selection');
            return;
        }
        else if (Array.isArray(selected)) {
            let promises = new Array<Promise<any>>;
            openLoadingModal();
            R.setIsLoading(true);
            selected.forEach(e => {
                promises.push(loadFile({ filePath: e as string }));
            });
            await Promise.allSettled(promises);
            R.setIsLoading(false);
            closeModal();
        }
    }
    catch (err) {
        console.error(err);
    }
}

