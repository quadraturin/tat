import * as R from "$lib/registry.svelte"
import { pointCircleCollision, pointPolyCollision } from "./util.collision";

/**
 * Set all sound volumes on the map. gets called repeatedly while the app is open.
 */
export function setCanvasSoundVolumes(){
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
        if (snd.sound) {
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
        }
    });
}
