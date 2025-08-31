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
        snd.addEventListener("canplaythrough", (e) => {
            snd.volume = 0;
            snd.loop = true;
            snd.play();
        })
        const name = await basename(src);
        let options:canvasSoundOptions = {
            areaCoords:[new Vector2D(20,0), new Vector2D(10,20), new Vector2D(80,90), new Vector2D(120,45)],
            editable: true,
            grabbed: false,
            localHandleAngle: 0,
            loop: true,
            muted: false,
            name: name,
            niceName: name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim(),
            radius: 23,
            selected: false,
            solo: false,
            sound: snd,
            soundType: R.SoundType.Local,
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


/**
 * create a new image on the canvas.
 * @param options new image options.
 */
export async function newSound(options?:canvasSoundOptions) {
    try {
        console.log("dupe sound")
        // Load defaults, overwrite with options.
        let o = Object.assign({
            volume: 1,
        }, options);

        // Generate a nice name for the image based on the filename.
        o.name = await basename(o.src);
        o.niceName = o.name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim();

        // Make a sound.
        const snd = new Audio(convertFileSrc(o.src));
        snd.addEventListener("canplaythrough", (e) => {
            snd.volume = 0;
            snd.loop = true;
            snd.play();
        })

        // Determine the sound origin point coords if they haven't been provided.
        if (typeof o.x == "undefined") o.x = 0;
        if (typeof o.y == "undefined") o.y = 0; 

        R.setHasMedia(true);
        R.setProjectDirty;
        R.addToSounds(o);
        R.getCanvas().update();
    } catch(err) {
        console.error(err);
    }
}


/**
 * duplicate a map sound.
 * @param sound the map sound to duplicate.
 */
export async function duplicateSound(sound:CanvasSound) {
    newSound({
        areaCoords:sound.areaCoords,
        editable:sound.editable,
        grabbed:sound.grabbed,
        loop:sound.loop,
        localHandleAngle:sound.localHandleAngle,
        muted:sound.muted,
        name:sound.name,
        niceName:sound.niceName,
        radius:sound.radius,
        selected:sound.selected,
        solo:sound.solo,
        sound:sound.sound,
        src:sound.src,
        soundType:sound.soundType,
        volume:sound.volume,
        x:sound.x + 20,
        y:sound.y + 20,
    });
}

/**
 * cycle a map sound between the 3 types (area, global, local).
 * @param sound map sound to change.
 */
export async function cycleSoundType(sound:CanvasSound) {
    if (sound.sound) {
        if (sound.soundType == R.SoundType.Area)        sound.soundType = R.SoundType.Global;
        else if (sound.soundType == R.SoundType.Global) sound.soundType = R.SoundType.Local;
        else if (sound.soundType == R.SoundType.Local)  sound.soundType = R.SoundType.Area;
    }
}
