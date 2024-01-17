import * as R from "$lib/registry"
import L from "leaflet";
import * as T from '@turf/turf'

export function setMapSoundVolumes(): void
{
    R.setProjectDirty();
    const listener = R.getListener();
    R.getMap().eachLayer((layer) => 
    {
        if(layer instanceof L.Polygon) 
        {
            const inside = T.booleanPointInPolygon([listener.getLatLng().lng,listener.getLatLng().lat], layer.toGeoJSON());
            let baseVolume = 0;
            if (inside) {
                baseVolume = 1;
            }
            R.getSoundList().forEach(e => {
                if (e.emitter == layer) {
                    e.sound.volume(baseVolume*e.volume);
                }
            })
        }
        if(layer instanceof L.Circle) 
        {
            const a = layer.getLatLng().lat - listener.getLatLng().lat;
            const b = layer.getLatLng().lng - listener.getLatLng().lng;
            const c = Math.sqrt(a*a + b*b);
            const baseVolume = Math.max(0,(layer.getRadius() - c) / layer.getRadius());
            R.getSoundList().forEach(e => {
                if (e.emitter == layer) e.sound.volume(baseVolume*e.volume);
            });
        }
    })
}