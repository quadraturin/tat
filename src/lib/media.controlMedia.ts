import type { CanvasSound, canvasSoundOptions } from "./classes/CanvasSound.svelte";
import { getMasterOpacity, getMasterVolume, getSounds, setMasterOpacity, setMasterVolume } from "./registry.svelte";
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
 * Change the base volume of a sound based on a mouse wheel scroll.
 * @param sound The sound to change the base volume of.
 * @param event A mouse wheel event.
 */
export async function changeBaseVolume(sound:CanvasSound, event:WheelEvent) {
    let delta = event.deltaY;

    // invert based on user settings.
    if (getUserSettings().invertVolumeScroll) delta *= -1;

    // adjust and clamp volume.
    sound.volume += delta * 0.01 * getUserSettings().uiScrollSensitivity;
    if (sound.volume < 0) sound.volume = 0;
    else if (sound.volume > 1) sound.volume = 1;
}

/**
 * Change the master volume of the app based on a mouse wheel scroll.
 * @param event A mouse wheel event.
 */
export async function changeMasterVolume(event:WheelEvent) {
    let delta = event.deltaY;

    // invert based on user settings.
    if (getUserSettings().invertVolumeScroll) delta *= -1;

    // adjust and clamp volume.
    setMasterVolume(getMasterVolume() + delta * 0.01 * getUserSettings().uiScrollSensitivity);
}

/**
 * Change the master volume of the app based on a mouse wheel scroll.
 * @param event A mouse wheel event.
 */
export async function changeMasterOpacity(event:WheelEvent) {
    let delta = event.deltaY;

    // invert based on user settings.
    if (getUserSettings().invertVolumeScroll) delta *= -1;

    // adjust and clamp volume.
    setMasterOpacity(getMasterOpacity() + delta * 0.01 * getUserSettings().uiScrollSensitivity);
}


/**
 * Solo/unsolo a sound.
 * @param sound The sound to solo or unsolo.
 */
export async function solo(sound:CanvasSound) {
    // Flip the solo state on the sound.
    console.log(sound.name, "solo", sound.solo)
    sound.solo = !sound.solo;
    console.log(sound.name, "solo", sound.solo)
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

