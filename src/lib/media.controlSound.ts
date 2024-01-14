import type { MapSound } from "./classes/MapSound";


export async function togglePause(sound:MapSound) {
    if (sound.sound.playing()) sound.sound.pause();
    else sound.sound.play();
}

export async function seekToByClick(sound:MapSound, element:HTMLButtonElement, mouseX:number) {
    console.log(element.getBoundingClientRect().left, element.offsetWidth, mouseX);
    let pct = (mouseX-element.getBoundingClientRect().left)/element.offsetWidth;
    console.log((pct*100) + "%");
    let pos = sound.sound.duration() * pct;
    sound.sound.seek(pos);
}