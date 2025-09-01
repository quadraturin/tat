import * as R from '$lib/registry.svelte';
import { updateLoadingModal } from './ui.modals';
import { help } from './util.help';
import { basename } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/core';
import { t, locales, locale } from '$lib/util.localization';
import type { CanvasSound, canvasSoundOptions } from './classes/CanvasSound.svelte';
import { Vector2D } from './util.vectors';
import { pointCircleCollision, pointPolyCollision } from './util.collision';


/**
 * Create a new sound on the canvas.
 * @param options New sound options.
 */
export async function newSound(options?:canvasSoundOptions) {
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
        const newX = x ? x : 50;
        const newY = y ? y : 50;
        const newAreaCoords = [ new Vector2D(newX, newY + newR), 
                                new Vector2D(newX + newR, newY), 
                                new Vector2D(newX, newY - newR), 
                                new Vector2D(newX - newR ,newY)];
        let options:canvasSoundOptions = {
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
        triggerType:sound.triggerType,
        volume:sound.volume,
        x:sound.x + 10,
        y:sound.y + 10,
    });
}

/**
 * Cycle a canvas sound between the 3 types (area, global, local).
 * @param sound canvas sound to change.
 */
export async function cycleSoundType(sound:CanvasSound) {
    // Local -> Area
    if (sound.soundType == R.SoundType.Local) { 
        sound.soundType = R.SoundType.Area; 
    }
    // Area -> Global: Unset invalid trigger types.
    else if (sound.soundType == R.SoundType.Area){ 
        sound.soundType = R.SoundType.Global;
        if (sound.triggerType != R.TriggerType.PlayOnLoad && sound.triggerType != R.TriggerType.PlayOnTimer) {
            sound.triggerType = R.TriggerType.PlayOnLoad;
        }
    }
    // Global -> Local
    else if (sound.soundType == R.SoundType.Global) { 
        sound.soundType = R.SoundType.Local; 
    }
}

/**
 * Cycle a canvas sound trigger between the types (onload, onenter, onexit, ontimer).
 * @param sound canvas sound to change.
 */
export async function cycleTriggerType(sound:CanvasSound) {

    // Global sound:
    // PlayOnLoad -> PlayOnTimer -> back
    if (sound.soundType == R.SoundType.Global) {
        if      (sound.triggerType == R.TriggerType.PlayOnLoad)  sound.triggerType = R.TriggerType.PlayOnTimer;
        else if (sound.triggerType == R.TriggerType.PlayOnTimer) sound.triggerType = R.TriggerType.PlayOnLoad;
    }

    // Local or Area sound, listener colliding: 
    // PlayOnLoad -> PlayInside -> ReplayInside -> PlayOnTimer -> back
    if ((sound.soundType == R.SoundType.Local &&
            pointCircleCollision(R.getListener().x, R.getListener().y, sound.x, sound.y, sound.radius)) ||
        (sound.soundType == R.SoundType.Area &&
            pointPolyCollision(R.getListener().x, R.getListener().y, sound.areaCoords))) {
        if      (sound.triggerType == R.TriggerType.PlayOnLoad) { sound.triggerType = R.TriggerType.PlayInside; }
        else if (sound.triggerType == R.TriggerType.PlayInside)  sound.triggerType = R.TriggerType.ReplayInside;
        else if (sound.triggerType == R.TriggerType.ReplayInside)  sound.triggerType = R.TriggerType.PlayOnTimer;
        else if (sound.triggerType == R.TriggerType.PlayOnTimer)  sound.triggerType = R.TriggerType.PlayOnLoad;
    } 

    // Local or Area sound, listener not colliding:
    // PlayOnLoad -> PlayOnEnter -> ReplayOnEnter -> PlayInside -> ReplayInside -> PlayOnTimer -> back
    else {
        if      (sound.triggerType == R.TriggerType.PlayOnLoad)  { sound.triggerType = R.TriggerType.PlayOnEnter;   sound.sound.pause(); }
        else if (sound.triggerType == R.TriggerType.PlayOnEnter) { sound.triggerType = R.TriggerType.ReplayOnEnter; sound.sound.pause(); }
        else if (sound.triggerType == R.TriggerType.ReplayOnEnter) sound.triggerType = R.TriggerType.PlayInside;
        else if (sound.triggerType == R.TriggerType.PlayInside)    sound.triggerType = R.TriggerType.ReplayInside;
        else if (sound.triggerType == R.TriggerType.ReplayInside)  sound.triggerType = R.TriggerType.PlayOnTimer;
        else if (sound.triggerType == R.TriggerType.PlayOnTimer)   sound.triggerType = R.TriggerType.PlayOnLoad;    
    }
}
