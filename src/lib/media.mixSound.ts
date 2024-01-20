import * as R from '$lib/registry';
import type { MapSound } from './classes/MapSound';

/**
 * toggle a sound muted/unmuted by index.
 * @param id the id of the sound.
 */
export async function toggleMute(id:number) {
    let soundList = R.getSoundList();
    mute(soundList[id], !soundList[id].muted);
}

/**
 * mute/unmute a sound.
 * @param sound the sound to mute.
 * @param toMute whether to mute (true) or unmute (false) the sound.
 */
async function mute(sound:MapSound, toMute:boolean) {
    sound.sound.mute(toMute)
    sound.muted = toMute;
}

/**
 * toggle a sound soloed/unsoloed by index.
 * @param id the id of the sound.
 */
export async function toggleSolo(id:number) {
    let soundList = R.getSoundList();
    solo(soundList[id], !soundList[id].solo);
}

/**
 * solo/unsolo a sound.
 * @param sound the sound to solo or unsolo.
 * @param toSolo whether to solo (true) or unsolo (false).
 */
async function solo(sound:MapSound, toSolo:boolean) {
    let soundList = R.getSoundList();
    for (let i=0; i<soundList.length; i++) {
        if (sound == R.getSoundList()[i]) {
            if (toSolo) {
                R.getSoundList()[i].sound.mute(false);
                R.getSoundList()[i].muted = false;
                R.getSoundList()[i].solo = true;
            }
            else{
                // restore muted state.
                R.getSoundList()[i].sound.mute(R.getSoundList()[i].muted); 
                R.getSoundList()[i].solo = false;
            }
        } else {
            if (toSolo) {
                // mute all but solo (don't set muted state).
                R.getSoundList()[i].sound.mute(true); 
            } else {
                // restore muted state.
                R.getSoundList()[i].sound.mute(R.getSoundList()[i].muted); 
            }
            R.getSoundList()[i].solo = false;
        }
    }
}