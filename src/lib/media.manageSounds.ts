import * as R from "$lib/registry.svelte"
import { pointCircleCollision, pointPolyCollision } from "./util.collision";

/**
 * Set all sound volumes on the map. gets called repeatedly while the app is open.
 */
export function manageCanvasSounds(){
    // Check if any sound is soloed.
    let solo = false;
    for (let i = 0; i < R.getSounds().length; i++) {
        if (R.getSounds()[i].solo) {
            solo = true;
            break;
        }
    }
    const l = R.getListener();
    R.getSounds().forEach(snd => {

        // Manage play state

        // Inside PlayOnEnter: play & set trigger type to play on load.
        if (    snd.triggerType == R.TriggerType.PlayOnEnter && snd.sound.paused && 
                (snd.soundType == R.SoundType.Local && pointCircleCollision(l.x, l.y, snd.x, snd.y, snd.radius))) {
            snd.sound.play();
            snd.triggerType = R.TriggerType.PlayOnLoad;
        }
        // Inside PlayInside: play.
        else if (snd.triggerType == R.TriggerType.PlayInside && snd.sound.paused && 
                (snd.soundType == R.SoundType.Local && pointCircleCollision(l.x, l.y, snd.x, snd.y, snd.radius))) {
            snd.sound.play();
        }
        // Inside ReplayOnEnter: restart, play, & set trigger type to play on load.
        else if (snd.triggerType == R.TriggerType.ReplayOnEnter && snd.sound.paused &&
                (snd.soundType == R.SoundType.Local && pointCircleCollision(l.x, l.y, snd.x, snd.y, snd.radius))) {
            snd.sound.currentTime = 0;
            snd.sound.play();
            snd.triggerType = R.TriggerType.PlayOnLoad;
        }
        // Inside ReplayInside: restart & play.
        else if (snd.triggerType == R.TriggerType.ReplayInside && snd.sound.paused &&
                (snd.soundType == R.SoundType.Local && pointCircleCollision(l.x, l.y, snd.x, snd.y, snd.radius))) {
            snd.sound.currentTime = 0;
            snd.sound.play();
        }
        // Outside PlayInside/ReplayInside/PlayOnEnter/ReplayOnEnter: pause.
        else if ((  snd.triggerType == R.TriggerType.PlayInside || 
                    snd.triggerType == R.TriggerType.ReplayInside || 
                    snd.triggerType == R.TriggerType.PlayOnEnter || 
                    snd.triggerType == R.TriggerType.ReplayOnEnter) && 
                !snd.sound.paused && 
                (snd.soundType == R.SoundType.Local && !pointCircleCollision(l.x, l.y, snd.x, snd.y, snd.radius))) {
            snd.sound.pause();
        }

        // Manage volume
        if ((solo && !snd.solo) || snd.muted) snd.sound.volume = 0;
        else {
            // Global sound: only modify with master volume.
            if (snd.soundType == R.SoundType.Global) { 
                snd.sound.volume = snd.volume * R.getMasterVolume(); 
            }
            // Area sound: only audible if listener in area, modify with master volume.
            else if (snd.soundType == R.SoundType.Area) {
                if (pointPolyCollision(l.x, l.y, snd.areaCoords)){
                    snd.sound.volume = snd.volume * R.getMasterVolume();
                } else {
                    snd.sound.volume = 0;
                }
            }
            // Local sound: louder as listener approaches center, modify with master volume.
            else if (snd.soundType == R.SoundType.Local) {
                if (pointCircleCollision(l.x, l.y, snd.x, snd.y, snd.radius)) {
                    // check listener's distance to center.
                    const x = snd.x - l.x;
                    const y = snd.y - l.y;
                    const dist = Math.sqrt(x**2 + y**2);

                    // set volume based on base volume and distance from center. beyond the radius is muted.
                    const distVolume = Math.max(0,(snd.radius - dist) / snd.radius);
                    snd.sound.volume = snd.volume * distVolume * R.getMasterVolume(); 
                } else {
                    snd.sound.volume = 0;
                }
            }
        }
    });
}
