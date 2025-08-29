import type { CanvasSound } from "./classes/CanvasSound.svelte";
import { getUserSettings } from "./settings.userSettings.svelte";
import * as H from 'howler';

/**
 * pause a playing sound or play a paused sound.
 * @param sound the sound to pause or play.
 */
export async function togglePause(sound:CanvasSound) {
    /*if (sound.sound){
        if (sound.sound.playing()) {
            sound.sound.pause();
        }
        else {
            sound.sound.play();
        }
    }*/
}

/**
 * seek to a location in the sound by clicking on the sound's seek bar.
 * @param sound the sound to seek.
 * @param mouseX the mouse's x position.
 */
export async function seekToByClick(sound:CanvasSound, mouseX:number) {
    /*if (sound.sound) {
        let pct = (mouseX-24)/192; // 18px from left edge of screen, 170px wide
        let pos = sound.sound.duration() * pct;
        sound.sound.seek(pos);
    }*/
}

/**
 * change the base volume of a sound based on a mouse wheel scroll.
 * @param sound the sound to change the base volume of.
 * @param event a mouse wheel event.
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
 * change the master volume of the app based on a mouse wheel scroll.
 * @param event a mouse wheel event.
 */
export async function changeMasterVolume(event:WheelEvent) {
    let delta = event.deltaY;

    // invert based on user settings.
    if (getUserSettings().invertVolumeScroll) delta *= -1;

    // adjust and clamp volume.
    H.Howler.volume(H.Howler.volume() + delta * 0.01 * getUserSettings().uiScrollSensitivity);
    
    //console.log('changing master volume', H.Howler.volume())
}
