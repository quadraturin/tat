import * as R from "$lib/registry"
import L from "leaflet";
import * as T from '@turf/turf'
import { SOUNDTYPE_AREA, SOUNDTYPE_GLOBAL } from "./settings.appSettings";

export function setMapSoundVolumes(): void
{
    R.setProjectDirty();
    const listener = R.getListener();
    
    R.getSoundList().forEach(e => {
        if (e.soundType == SOUNDTYPE_GLOBAL) { 
            e.sound.volume(e.volume); 
        } else if (e.soundType == SOUNDTYPE_AREA) {
            R.getMap().eachLayer((layer) => {
                if(layer instanceof L.Polygon) 
                {
                    const inside = T.booleanPointInPolygon([listener.getLatLng().lng,listener.getLatLng().lat], layer.toGeoJSON());
                    let baseVolume = 0;
                    if (inside) baseVolume = 1;
                    e.sound.volume(baseVolume*e.volume);
                }
            });
        } else { // default to local
            R.getMap().eachLayer((layer) => 
            {
                if(layer instanceof L.Circle) 
                {
                    const a = layer.getLatLng().lat - listener.getLatLng().lat;
                    const b = layer.getLatLng().lng - listener.getLatLng().lng;
                    const c = Math.sqrt(a*a + b*b);
                    const baseVolume = Math.max(0,(layer.getRadius() - c) / layer.getRadius());
                    e.sound.volume(baseVolume*e.volume);
                }
            });
        }
    })
}