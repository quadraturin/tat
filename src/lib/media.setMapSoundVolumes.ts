import * as R from "$lib/registry"
import L from "leaflet";
import * as T from '@turf/turf'
import { SOUNDTYPE_AREA, SOUNDTYPE_GLOBAL, SOUNDTYPE_LOCAL } from "./settings.appSettings";

/**
 * set all sound volumes on the map.
 */
export function setMapSoundVolumes(){
    // tell registry that the project has changed.
    R.setProjectDirty();

    // cycle through each sound, checking sound type.
    const listener = R.getListener();
    R.getSoundList().forEach(e => {
        if (e.soundType == SOUNDTYPE_GLOBAL) { 
            // global sound: just uses base volume.
            e.sound.volume.value = (e.volume*50)-50; 
            console.log(e.sound.volume.value);

        } else if (e.soundType == SOUNDTYPE_AREA) {
            // area sound: find the corresponding polygon.
            R.getMap().eachLayer((layer) => {
                if(layer instanceof L.Polygon) {
                    // check if the listener is inside.
                    const inside = T.booleanPointInPolygon([listener.getLatLng().lng,listener.getLatLng().lat], layer.toGeoJSON());
                    // set volume to base volume if inside, 0 if outside.
                    if (inside) {
                        if (e.sound.mute) {
                            e.sound.mute = false;
                        }
                        e.sound.volume.value = (e.volume*50)-50;
                    } else {
                        if (!e.sound.mute) {
                            e.sound.mute = true;
                        }
                    }
                }
            });

        } else if (e.soundType == SOUNDTYPE_LOCAL) { 
            // local sound: find the corresponding circle.
            R.getMap().eachLayer((layer) => {
                if(layer instanceof L.Circle) {
                    // check listener's distance to center.
                    const a = layer.getLatLng().lat - listener.getLatLng().lat;
                    const b = layer.getLatLng().lng - listener.getLatLng().lng;
                    const c = Math.sqrt(a*a + b*b);

                    // set volume based on base volume and distance from center. beyond the radius is muted.
                    if (c > layer.getRadius()) {
                        e.sound.mute = true;
                    } else {
                        const baseVolume = Math.max(0,(layer.getRadius() - c) / layer.getRadius());
                        e.sound.mute = false;
                        e.sound.volume.value = baseVolume*(e.volume*50)-50; 
                    }
                }
            });
        }
    })
}