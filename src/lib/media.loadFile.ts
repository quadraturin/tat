import { extname } from '@tauri-apps/api/path';
import { imageFileTypes, soundFileTypes } from '$lib/settings.appSettings';
import { newSound } from "./media.loadSound";
import { loadImageFile, newImage } from "./media.loadImage";

/**
 * load a file.
 * @param filePath path of file to load. 
 */
export async function loadFile(filePath: string): Promise<void> {
    try {
        const ext = await extname(filePath);
        if (imageFileTypes.includes(ext)) { 
            // file is an image.
            let file = await loadImageFile(filePath);
            if (typeof file != "undefined") newImage(file);
        }
        else if (soundFileTypes.includes(ext)) { 
            // file is a sound.
            newSound({src:filePath});
        }
    }
    catch (err) {
        console.error(err);
    }
}
