import type { MapSound } from "./classes/MapSound";
import { setMapSoundVolumes } from "./media.setMapSoundVolumes";
import { getUserSettings } from "./settings.userSettings";
import * as Tone from 'tone';


export async function togglePause(sound:MapSound) {
    if (sound.sound.state == "started") sound.sound.stop();
    else {
        sound.sound.start(0);
        sound.startTime = Date.now();
    }
}

export async function seekToByClick(sound:MapSound, element:HTMLButtonElement, mouseX:number) {
    //console.log(element.getBoundingClientRect().left, element.offsetWidth, mouseX);
    let pct = (mouseX-element.getBoundingClientRect().left)/element.offsetWidth;
    //console.log((pct*100) + "%");
    let pos = sound.sound.sampleTime * pct;
    sound.sound.seek(pos);
}

export async function changeBaseVolume(sound:MapSound, event:WheelEvent) {
    let delta = event.deltaY;
    if (getUserSettings().invertVolumeScroll) delta *= -1;
    sound.volume += delta*0.01;
    if (sound.volume < 0) sound.volume = 0;
    else if (sound.volume > 1) sound.volume = 1;
    setMapSoundVolumes();
}

export async function changeMasterVolume(event:WheelEvent) {
    let delta = event.deltaY;
    if (getUserSettings().invertVolumeScroll) 
        delta *= -1;

    Tone.Destination.volume.value += delta * 0.1;

    if (Tone.Destination.volume.value < -60) Tone.Destination.volume.value = -60;
    else if (Tone.Destination.volume.value > 0) Tone.Destination.volume.value = 0;
}