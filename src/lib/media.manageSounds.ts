import * as R from "$lib/registry.svelte"
import { pointCircleCollision, pointPolyCollision } from "./util.collision";

/**
 * Set all sound volumes on the map. gets called repeatedly while the app is open.
 */
export async function manageCanvasSounds(){
    const l = R.getListener();
    // Check if any sound is soloed.
    let solo = false;
    for (let i = 0; i < R.getSounds().length; i++) {
        if (R.getSounds()[i].solo) {
            solo = true;
            break;
        }
    }
    R.getSounds().forEach(snd => {

        // Manage volume.

        if ((solo && !snd.solo) || snd.muted) {
            snd.gain = 0;
        }
        else {
            // Global sound: only modify with master volume.
            if (snd.soundType == R.SoundType.Global) { 
                if(snd.gain != snd.volume) {
                    snd.gainNode.gain.cancelScheduledValues(R.getAudioContext().currentTime);
                    snd.gainNode.gain.setTargetAtTime(snd.volume, R.getAudioContext().currentTime, 0.1); 
                }
            }
            // Area sound: only audible if listener in area, modify with master volume.
            else if (snd.soundType == R.SoundType.Area) {
                if (pointPolyCollision(l.x, l.y, snd.areaCoords)){
                    if(snd.gain != snd.volume) {
                        snd.gainNode.gain.cancelScheduledValues(R.getAudioContext().currentTime);
                        snd.gainNode.gain.setTargetAtTime(snd.volume, R.getAudioContext().currentTime, 0.1); 
                    }
                } else {
                    if(snd.gain != 0) {
                        snd.gainNode.gain.cancelScheduledValues(R.getAudioContext().currentTime);
                        snd.gainNode.gain.setTargetAtTime(0, R.getAudioContext().currentTime, 0.1); 
                    }
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
                    if(snd.gain != snd.volume * distVolume) {
                        snd.gainNode.gain.cancelScheduledValues(R.getAudioContext().currentTime);
                        snd.gainNode.gain.setTargetAtTime(snd.volume * distVolume, R.getAudioContext().currentTime, 0.015); 
                    }
                } else {
                    if(snd.gain != 0) {
                        snd.gainNode.gain.cancelScheduledValues(R.getAudioContext().currentTime);
                        snd.gainNode.gain.setTargetAtTime(0, R.getAudioContext().currentTime, 0.015); 
                    }
                }
            }
        }

        // Manage play state.

        // Local or Area sound: check collision.
        if ((snd.soundType == R.SoundType.Local && pointCircleCollision(l.x, l.y, snd.x, snd.y, snd.radius)) ||
            (snd.soundType == R.SoundType.Area  && pointPolyCollision(l.x, l.y, snd.areaCoords))) {

            // Inside PlayOnEnter trigger: play & set trigger type to PlayOnLoad.
            if (snd.triggerType == R.TriggerType.PlayOnEnter && snd.sound.paused) {
                snd.sound.play();
                snd.triggerType = R.TriggerType.PlayOnLoad;
            }
            // Inside PlayInside trigger: play.
            else if (snd.triggerType == R.TriggerType.PlayInside && snd.sound.paused) {
                snd.sound.play();
            }
            // Inside ReplayOnEnter trigger: restart, play, & set trigger type to PlayOnLoad.
            else if (snd.triggerType == R.TriggerType.ReplayOnEnter && snd.sound.paused) {
                snd.sound.play();
                snd.sound.fastSeek(0);
                snd.triggerType = R.TriggerType.PlayOnLoad;
            }
            // Inside ReplayInside: restart & play.
            else if (snd.triggerType == R.TriggerType.ReplayInside && snd.sound.paused) {
                snd.sound.play();
                snd.sound.fastSeek(0);
            }
        }
        // If not colliding and sound is PlayInside/ReplayInside/PlayOnEnter/ReplayOnEnter: pause.
        else if ((  snd.triggerType == R.TriggerType.PlayInside || 
                    snd.triggerType == R.TriggerType.ReplayInside || 
                    snd.triggerType == R.TriggerType.PlayOnEnter || 
                    snd.triggerType == R.TriggerType.ReplayOnEnter) && 
                !snd.sound.paused) {
            snd.sound.pause();
        }
        // Timer sound.
        else if (snd.triggerType == R.TriggerType.PlayOnTimer) {
            
        }
        
    });
}
