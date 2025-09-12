import type { CanvasSound, CanvasSoundOptions } from "./classes/CanvasSound.svelte";
import { getAudioContext, getMasterGain, getMasterOpacity, getMasterVolume, getSounds, setMasterOpacity, setMasterVolume } from "./registry.svelte";
import { getUserSettings } from "./settings.userSettings.svelte";


/**
 * Seek to a playback location in the sound by clicking on the sound's seek bar.
 * @param sound The sound to seek.
 * @param mouseX The mouse's x position.
 */
export async function seekToByClick(sound:CanvasSound, mouseX:number) {
    if (sound.sound) {
        let pct = (mouseX-24)/192; // 18px from left edge of screen, 170px wide
        let pos = sound.sound.duration * pct;
        sound.sound.currentTime = pos;
    }
}

/**
 * Change the master volume of the app based on a mouse wheel scroll.
 * @param event A mouse wheel event.
 */
export async function changeMasterVolume(event:WheelEvent) {
    let delta = event.deltaY;

    // Invert based on user settings.
    if (getUserSettings().invertVolumeScroll) delta *= -1;

    delta = delta < 0 ? -0.01 : 0.01;
    delta *= getUserSettings().uiScrollSensitivity;

    // Set master volume, clamped between 0 and 1.
    const val = Math.max(0, Math.min(1, getMasterGain().gain.value + delta))
    if (getMasterGain().gain.value != val) {
        getMasterGain().gain.cancelScheduledValues(getAudioContext().currentTime);
        getMasterGain().gain.setValueAtTime(val, getAudioContext().currentTime);
    }
}

/**
 * Change the master opacity of the app based on a mouse wheel scroll.
 * @param event A mouse wheel event.
 */
export async function changeMasterOpacity(event:WheelEvent) {
    let delta = event.deltaY;

    // invert based on user settings.
    if (getUserSettings().invertVolumeScroll) delta *= -1;

    delta = delta < 0 ? -0.01 : 0.01;
    delta *= getUserSettings().uiScrollSensitivity;

    // adjust and clamp volume.
    setMasterOpacity(getMasterOpacity() + delta);
}


export async function changeMasterVolumeClick(e:MouseEvent){
    const bar = document.getElementById("master-volume");
    if (bar) {
        const rect = bar.getBoundingClientRect();
        const pct = (rect.bottom - e.y) / (rect.bottom - rect.top);
        
        // Set master volume, clamped between 0 and 1.
        if (getMasterGain().gain.value != pct) {
            getMasterGain().gain.cancelScheduledValues(getAudioContext().currentTime);
            getMasterGain().gain.setValueAtTime(pct, getAudioContext().currentTime);
        }
    }
}



export async function changeMasterOpacityClick(e:MouseEvent){
    const bar = document.getElementById("master-opacity");
    if (bar) {
        const rect = bar.getBoundingClientRect();
        const pct = (rect.bottom - e.y) / (rect.bottom - rect.top);
        
        // Set master volume, clamped between 0 and 1.
        setMasterOpacity(pct);
    }
}


/**
 * Solo/unsolo a sound.
 * @param sound The sound to solo or unsolo.
 */
export async function solo(sound:CanvasSound) {
    // Flip the solo state on the sound.
    sound.solo = !sound.solo;
    // Unmute the sound if soloed.
    if (sound.solo) sound.muted = false;

    // Cycle thru all sounds and unsolo all others.
    for (let i=0; i<getSounds().length; i++) {
        const snd = getSounds()[i];
        if (sound != snd) {
            snd.solo = false;
        }
    }
}
