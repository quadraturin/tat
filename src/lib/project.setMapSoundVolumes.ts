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
            const inside = T.booleanPointInPolygon([listener.getLatLng().lng,listener.getLatLng().lat],layer.toGeoJSON());
            if (!inside) return;
        }
        if(layer instanceof L.Circle) 
        {
            const a = layer.getLatLng().lat - listener.getLatLng().lat;
            const b = layer.getLatLng().lng - listener.getLatLng().lng;
            const c = Math.sqrt(a*a + b*b);
            const volume = Math.max(0,(layer.getRadius() - c) / layer.getRadius());
            //console.log("circle volume: " + Math.ceil(volume*100) + "%");
            R.getSoundList().forEach(e => 
            {
                if (e.circle == layer) e.sound.volume(volume*e.volume); // adjusted for base volume
            });
        }
    })
}