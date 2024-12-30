import * as R from "$lib/registry.svelte"
import L from "leaflet";
import * as T from '@turf/turf'
import { SOUNDTYPE_AREA, SOUNDTYPE_GLOBAL, SOUNDTYPE_LOCAL } from "./settings.appSettings";

/**
 * set all sound volumes on the map. gets called repeatedly while the app is open.
 */
export function setMapSoundVolumes(){

    // cycle through each sound, checking sound type.
    const listener = R.getListener();
    R.getSoundList().forEach(e => {

        if (e.sound) {

            if (e.soundType == SOUNDTYPE_GLOBAL) { 

                // global sound: just uses base volume.
                e.sound.volume(e.volume); 

            } else if (e.soundType == SOUNDTYPE_AREA) {

                // area sound: find the corresponding polygon.
                R.getMap().eachLayer((layer) => {
                    if(layer instanceof L.Polygon && layer == e.emitter) {

                        // check if the listener is inside.
                        const inside = T.booleanPointInPolygon([listener.getLatLng().lng,listener.getLatLng().lat], layer.toGeoJSON());
                        
                        // set volume to base volume if inside, 0 if outside.
                        if (e.sound){
                            if (inside) {
                                e.sound.volume(e.volume);
                            } else {
                                e.sound.volume(0);
                            }
                        }
                    }
                });
            } else if (e.soundType == SOUNDTYPE_LOCAL) { 

                // local sound: find the corresponding circle.
                R.getMap().eachLayer((layer) => {
                    if(layer instanceof L.Circle && layer == e.emitter) {
                        // check listener's distance to center.
                        const a = layer.getLatLng().lat - listener.getLatLng().lat;
                        const b = layer.getLatLng().lng - listener.getLatLng().lng;
                        const c = Math.sqrt(a*a + b*b);

                        // set volume based on base volume and distance from center. beyond the radius is muted.
                        const baseVolume = Math.max(0,(layer.getRadius() - c) / layer.getRadius());
                        if(e.sound) e.sound.volume(baseVolume*e.volume); 
                    }
                });
            }
        }
    })
}
