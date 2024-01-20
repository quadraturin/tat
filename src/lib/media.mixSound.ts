import * as R from '$lib/registry';
import type { MapSound } from './classes/MapSound';

// toggle a sound muted/unmuted by index
export async function toggleMute(id:number) {
    let soundList = R.getSoundList();
    mute(soundList[id], !soundList[id].muted);
}

// pass in MapSound and boolean (true = mute, false = unmute)
async function mute(sound:MapSound, toMute:boolean) {
    sound.sound.mute = toMute;
    sound.muted = toMute;
}

// toggle a sound soloed/unsoloed by index
export async function toggleSolo(id:number) {
    let soundList = R.getSoundList();
    solo(soundList[id], !soundList[id].solo);
}

// pass in MapSound and boolean (true = solo, false = unsolo)
async function solo(sound:MapSound, toSolo:boolean) {
    let soundList = R.getSoundList();
    for (let i=0; i<soundList.length; i++) {
        if (sound == R.getSoundList()[i]) {
            if (toSolo) {
                R.getSoundList()[i].sound.mute = false;
                R.getSoundList()[i].muted = false;
                R.getSoundList()[i].solo = true;
            }
            else{
                R.getSoundList()[i].sound.mute = R.getSoundList()[i].muted; // restore muted state
                R.getSoundList()[i].solo = false;
            }
        } else {
            if (toSolo) {
                R.getSoundList()[i].sound.mute = true; // mute all but solo (don't set muted state)
            } else {
                R.getSoundList()[i].sound.mute = R.getSoundList()[i].muted; // restore muted state
            }
            R.getSoundList()[i].solo = false;
        }
    }
}