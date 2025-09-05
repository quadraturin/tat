import * as R from '$lib/registry.svelte';
import { updateLoadingModal } from './ui.modals';
import { help } from './util.help';
import { basename } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/core';
import { t, locales, locale } from '$lib/util.localization';
import type { Timer, CanvasSound, CanvasSoundOptions } from './classes/CanvasSound.svelte';
import { Vector2D } from './util.vectors';
import { pointCircleCollision, pointPolyCollision } from './util.collision';


/**
 * Create a new sound on the canvas.
 * @param options New sound options.
 */
export async function newSound(options?:CanvasSoundOptions) {
    try {
        // Load defaults, overwrite with options.
        let o = Object.assign({
            volume: 1,
        }, options);

        // Generate a nice name for the sound based on the filename.
        o.name = await basename(o.src);
        o.niceName = o.name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim();

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
        // Construct canvas sound options.
        const snd = new Audio(convertFileSrc(src));
        const name = await basename(src);
        const newR = 30;
        const vpc = R.getCanvas().viewportCenterInWorldSpace();
        const newX = x ? x : vpc.x;
        const newY = y ? y : vpc.y;
        const newAreaCoords = [ new Vector2D(newX, newY + newR), 
                                new Vector2D(newX + newR, newY), 
                                new Vector2D(newX, newY - newR), 
                                new Vector2D(newX - newR ,newY)];
        let options:CanvasSoundOptions = {
            areaCoords: newAreaCoords,
            editable: true,
            grabbed: false,
            localHandleAngle: 0,
            loop: true,
            muted: false,
            name: name,
            niceName: name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim(),
            radius: newR,
            selected: false,
            solo: false,
            sound: snd,
            soundType: R.SoundType.Local,
            timer: {setHours:0, setMinutes:0, setSeconds:1, hours:0, minutes:0, seconds:1, active:false},
            triggerType: R.TriggerType.PlayOnLoad,
            src: src,
            volume: 1,
            x: newX,
            y: newY,
        }
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
        sound:new Audio(),
        src:sound.src,
        soundType:sound.soundType,
        timer:Object.assign(new Object, sound.timer),
        triggerType:sound.triggerType,
        volume:sound.volume,
        x:sound.x + 10,
        y:sound.y + 10,
    });
}
