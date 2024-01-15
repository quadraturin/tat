import type { MapSound } from "./classes/MapSound";
import { setMapSoundVolumes } from "./project.setMapSoundVolumes";


export async function togglePause(sound:MapSound) {
    if (sound.sound.playing()) sound.sound.pause();
    else sound.sound.play();
}

export async function seekToByClick(sound:MapSound, element:HTMLButtonElement, mouseX:number) {
    //console.log(element.getBoundingClientRect().left, element.offsetWidth, mouseX);
    let pct = (mouseX-element.getBoundingClientRect().left)/element.offsetWidth;
    //console.log((pct*100) + "%");
    let pos = sound.sound.duration() * pct;
    sound.sound.seek(pos);
}

export async function changeBaseVolume(sound:MapSound, event:WheelEvent) {
    sound.volume += event.deltaY*0.01;
    if (sound.volume < 0) sound.volume = 0;
    else if (sound.volume > 1) sound.volume = 1;
    setMapSoundVolumes();
    //console.log(sound.volume);
}