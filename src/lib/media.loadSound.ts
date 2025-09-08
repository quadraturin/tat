import * as R from '$lib/registry.svelte';
import { basename } from '@tauri-apps/api/path';
import type { CanvasSound, CanvasSoundOptions } from './classes/CanvasSound.svelte';
import { Vector2D } from './util.vectors';


/**
 * Create a new sound on the canvas.
 * @param options New sound options.
 */
export async function newSound(options:CanvasSoundOptions) {
    try {
        let o = Object.assign({}, options);
        o.name = options.name ? options.name : await basename(o.src);
        R.setHasMedia(true);
        R.setProjectDirty;
        R.addToSounds(o);
        R.getCanvas().update();
    } catch(err) {
        console.error(err);
    }
}


/**
 * Create a new sound in the project from a file path, optionally with X,Y coordinates.
 * @param src File path to the image.
 * @param x X position of the image.
 * @param y Y position of the image.
 */
export async function newSoundFromPath(src:string, x?:number, y?:number) {
    try {
        let options:CanvasSoundOptions = { src: src, x:x, y:y };
        newSound(options);
    } catch (err) {
        console.error(err);
    }
}


/**
 * Duplicate a canvas sound.
 * @param sound The canvas sound to duplicate.
 */
export async function duplicateSound(sound:CanvasSound) {

    // Offset the area coords
    let newAreaCoords:Vector2D[] = [];
    sound.areaCoords.forEach(val => newAreaCoords.push(Object.assign({}, val)));
    newAreaCoords.forEach(val => { val.x += 10; val. y += 10; });

    newSound({
        areaCoords:newAreaCoords,
        locked:sound.locked,
        loop:sound.loop,
        localHandleAngle:sound.localHandleAngle,
        muted:sound.muted,
        name:sound.name,
        niceName:sound.niceName,
        radius:sound.radius,
        selected:sound.selected,
        solo:sound.solo,
        src:sound.src,
        soundType:sound.soundType,
        timer:Object.assign(new Object, sound.timer),
        triggerType:sound.triggerType,
        volume:sound.volume,
        x:sound.x + 10,
        y:sound.y + 10,
    });
}
