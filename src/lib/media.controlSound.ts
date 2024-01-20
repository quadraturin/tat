import type { MapSound } from "./classes/MapSound";
import { setMapSoundVolumes } from "./media.setMapSoundVolumes";
import { getUserSettings } from "./settings.userSettings";
import * as Tone from 'tone';

/**
 * pause a playing sound or play a paused sound.
 * @param sound the sound to pause or play.
 */
export async function togglePause(sound:MapSound) {
    if (sound.sound.state == "started") {
        sound.sound.stop();
    }
    else {
        sound.sound.start(0);
        sound.startTime = Date.now();
    }
}

/**
 * seek to a location in the sound by clicking on the sound's seek bar.
 * @param sound the sound to seek.
 * @param element the seek bar element clicked on.
 * @param mouseX the mouse's x position.
 */
export async function seekToByClick(sound:MapSound, element:HTMLButtonElement, mouseX:number) {
    let pct = (mouseX-element.getBoundingClientRect().left)/element.offsetWidth;
    let pos = sound.sound.buffer.duration * pct;
    sound.sound.seek(pos);
}

/**
 * change the base volume of a sound based on a mouse wheel scroll.
 * @param sound the sound to change the base volume of.
 * @param event a mouse wheel event.
 */
export async function changeBaseVolume(sound:MapSound, event:WheelEvent) {
    let delta = event.deltaY;

    // invert based on user settings.
    if (getUserSettings().invertVolumeScroll) delta *= -1;

    // adjust and clamp volume.
    sound.volume += delta*0.01;
    if (sound.volume < 0) sound.volume = 0;
    else if (sound.volume > 1) sound.volume = 1;
    setMapSoundVolumes();
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
    Tone.Destination.volume.value += delta * 0.1;
    if (Tone.Destination.volume.value < -60) Tone.Destination.volume.value = -60;
    else if (Tone.Destination.volume.value > 0) Tone.Destination.volume.value = 0;
}