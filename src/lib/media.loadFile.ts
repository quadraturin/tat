import { extname } from '@tauri-apps/api/path';
import { imageFileTypes, soundFileTypes } from '$lib/settings.appSettings';
import { newSoundFromPath } from "./media.loadSound";
import { newImageFromPath } from "./media.loadImage";

/**
 * Load a file from a file path.
 * @param filePath Path of file to load. 
 * @param x X position of mouse cursor, if file was dragged-and-dropped.
 * @param y Y position of mouse cursor, if file was dragged-and-dropped.
 */
export async function loadFile(filePath: string, x?:number, y?:number): Promise<void> {
    try {
        const ext = (await extname(filePath)).toLowerCase();
        if (imageFileTypes.includes(ext)) { 
            // file is an image.
            if (typeof x != "undefined" && typeof y != "undefined") newImageFromPath(filePath, x, y);
            else newImageFromPath(filePath);
        }
        else if (soundFileTypes.includes(ext)) { 
            // file is a sound.
            if (typeof x != "undefined" && typeof y != "undefined") newSoundFromPath(filePath, x, y);
            else newSoundFromPath(filePath);
        }
    }
    catch (err) {
        console.error(err);
    }
}
