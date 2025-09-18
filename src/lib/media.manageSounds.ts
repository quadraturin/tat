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

    // Cycle through all sounds.
    R.getSounds().forEach(snd => {

        // Manage volume.
        if ((solo && !snd.solo) || snd.muted) {
            snd.gainListener = 0;
        }
        else {
            // Global sound: Listener gain is always 1.
            if (snd.soundType == R.SoundType.Global) { 
                if(snd.gainListener != 1) {
                    snd.gainListenerNode.gain.cancelScheduledValues(R.getAudioContext().currentTime);
                    snd.gainListenerNode.gain.setTargetAtTime(1, R.getAudioContext().currentTime, 0.1); 
                }
            }
            // Area sound: at 1 if listener in area, 0 if outside. Ramp sound up and down on enter/exit.
            else if (snd.soundType == R.SoundType.Area) {
                if (pointPolyCollision(l.x, l.y, snd.areaCoords)){
                    if(snd.gain != 1) {
                        //snd.gainListenerNode.gain.cancelScheduledValues(R.getAudioContext().currentTime);
                        snd.gainListenerNode.gain.setTargetAtTime(1, R.getAudioContext().currentTime, 0.1); 
                    }
                } else {
                    if(snd.gain != 0) {
                        //snd.gainListenerNode.gain.cancelScheduledValues(R.getAudioContext().currentTime);
                        snd.gainListenerNode.gain.setTargetAtTime(0, R.getAudioContext().currentTime, 0.1); 
                    }
                }
            }
            // Local sound: at 0 outside, louder approaching 1 as listener approaches center.
            else if (snd.soundType == R.SoundType.Local) {
                // In the circle.
                if (pointCircleCollision(l.x, l.y, snd.x, snd.y, snd.radius)) {
                    // Check listener's distance to center.
                    const x = snd.x - l.x;
                    const y = snd.y - l.y;
                    const dist = Math.sqrt(x**2 + y**2);

                    // Set volume based on base volume and distance from center. beyond the radius is muted.
                    const distVolume = Math.max(0,(snd.radius - dist) / snd.radius);
                    if(snd.gainListener != distVolume) {
                        //snd.gainListenerNode.gain.cancelScheduledValues(R.getAudioContext().currentTime);
                        snd.gainListenerNode.gain.setTargetAtTime(distVolume, R.getAudioContext().currentTime, 0.015); 
                    }
                }
                // Outside the circle. 
                else {
                    if(snd.gainListener != 0) {
                        //snd.gainListenerNode.gain.cancelScheduledValues(R.getAudioContext().currentTime);
                        snd.gainListenerNode.gain.setTargetAtTime(0, R.getAudioContext().currentTime, 0.015); 
                    }
                }
            }
        }

        // Manage play state.

        // Local or Area sound: check collision.
        if ((snd.soundType == R.SoundType.Local && pointCircleCollision(l.x, l.y, snd.x, snd.y, snd.radius)) ||
            (snd.soundType == R.SoundType.Area  && pointPolyCollision(l.x, l.y, snd.areaCoords))) {

            // Inside PlayOnEnter trigger: play & set trigger type to PlayOnLoad.
            if (snd.triggerType == R.TriggerType.PlayOnEnter && snd.paused) {
                snd.play();
                snd.triggerType = R.TriggerType.Manual;
            }
            // Inside PlayInside trigger: play.
            else if (snd.triggerType == R.TriggerType.PlayInside && snd.paused) {
                snd.play();
            }
            // Inside ReplayOnEnter trigger: restart, play, & set trigger type to PlayOnLoad.
            else if (snd.triggerType == R.TriggerType.RestartOnEnter && snd.paused) {
                snd.seekPercent(0);
                snd.play();
                snd.triggerType = R.TriggerType.Manual;
            }
            // Inside ReplayInside: restart & play.
            else if (snd.triggerType == R.TriggerType.RestartInside && snd.paused) {
                snd.seekPercent(0);
                snd.play();
            }
        }
        // If not colliding and sound is PlayInside/ReplayInside/PlayOnEnter/ReplayOnEnter: pause.
        else if ((  snd.triggerType == R.TriggerType.PlayInside || 
                    snd.triggerType == R.TriggerType.RestartInside || 
                    snd.triggerType == R.TriggerType.PlayOnEnter || 
                    snd.triggerType == R.TriggerType.RestartOnEnter) && 
                !snd.paused) {
            snd.pause();
        }
        // Timer sound.
        else if (snd.triggerType == R.TriggerType.PlayOnTimer) {
            
        }
        
    });
}
