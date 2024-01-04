import { extname } from '@tauri-apps/api/path';
import { imageFileTypes, soundFileTypes } from '$lib/settings';
import { loadSound } from "./media.loadSound";
import { loadImage } from "./media.loadImage";

export async function loadFile({ filePath }: { filePath: string; }): Promise<void> {
    try {
        const ext = await extname(filePath);
        if (imageFileTypes.includes(ext)) {
            // file is an image
            //console.log('file is image: ' + filePath);
            await loadImage(filePath);
        }
        else if (soundFileTypes.includes(ext)) {
            // file is a sound
            //console.log('file is sound: ' + filePath);
            await loadSound(filePath);
        }
    }
    catch (err) {
        console.error(err);
    }
}
