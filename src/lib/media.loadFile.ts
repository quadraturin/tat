import { extname } from '@tauri-apps/api/path';
import { imageFileTypes, soundFileTypes } from '$lib/settings';
import { loadSoundFile, newSound } from "./media.loadSound";
import { loadImageFile, newImage } from "./media.loadImage";

export async function loadFile({ filePath }: { filePath: string; }): Promise<void> {
    try {
        const ext = await extname(filePath);
        if (imageFileTypes.includes(ext)) { // file is an image
            let file = await loadImageFile(filePath);
            if (typeof file != "undefined") newImage(file);
        }
        else if (soundFileTypes.includes(ext)) { // file is a sound
            let file = await loadSoundFile(filePath);
            if (typeof file != "undefined") newSound(file);
        }
    }
    catch (err) {
        console.error(err);
    }
}
