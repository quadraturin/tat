import * as R from '$lib/registry.svelte';
import { updateLoadingModal } from './ui.modals';
import { help } from './util.help';
import { basename } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/core';
import { t, locales, locale } from '$lib/util.localization';
import type { CanvasSound, canvasSoundOptions } from './classes/CanvasSound.svelte';
import { Vector2D } from './util.vectors';


/**
 * Create a new sound in the project from a file path.
 * @param src File path to the image.
 * @param x X position of the image.
 * @param y Y position of the image.
 */
export async function newSoundFromPath(src:string, x?:number, y?:number) {
    try {
        // Construct canvas sound options.
        const snd = new Audio(convertFileSrc(src));
        const name = await basename(src);
        let options:canvasSoundOptions = {
            areaCoords:[new Vector2D(20,0), new Vector2D(10,20), new Vector2D(80,90), new Vector2D(120,45)],
            editable: true,
            grabbed: false,
            localHandleAngle: 0,
            muted: false,
            name: name,
            niceName: name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim(),
            radius: 23,
            selected: false,
            solo: false,
            sound: snd,
            soundType: R.SoundType.Area,
            src: src,
            volume: 1,
            x: x? x : Math.random()*100,
            y: y? y : Math.random()*100,
        }
        R.addToSounds(options);
        R.getCanvas().update();
    } catch (err) {
        console.error(err);
    }
}

export async function toggleSoundEdit(sound:any){}

/**
 * duplicate a map sound.
 * @param sound the map sound to duplicate.
 */
export async function duplicateSound(sound:CanvasSound) {
    /*newSound({
        src: sound.src,
        soundType: sound.soundType,
        volume: sound.volume, 
        muted: sound.muted, 
        solo: sound.solo
    });*/
}

/**
 * cycle a map sound between the 3 types (area, global, local).
 * @param sound map sound to change.
 */
export async function cycleSoundType(sound:CanvasSound) {
    /*if (sound.sound) {
        if (sound.soundType == SOUNDTYPE_AREA) {
            sound.soundType = SOUNDTYPE_GLOBAL;
            await removeSoundbyEmitter(sound.emitter, false, true);
        } else if (sound.soundType == SOUNDTYPE_GLOBAL) {
            sound.soundType = SOUNDTYPE_LOCAL;
            await removeSoundbyEmitter(sound.emitter, false, true);
            sound.emitter = await createEmitter({soundType:sound.soundType});
        } else { 
            // assume local as default
            sound.soundType = SOUNDTYPE_AREA;
            await removeSoundbyEmitter(sound.emitter, false, true);
            sound.emitter = await createEmitter({soundType:sound.soundType});
        }
        sound.sound.play();
    }*/
}
