import L from "leaflet";

// find a random currently visible point on the map and return it
export function getRandomPointInViewport(map:L.Map)
{
    const min = map.getBounds().getSouthWest();
    const max = map.getBounds().getNorthEast();
    const w = max.lng - min.lng;
    const h = max.lat - min.lat;
    return new L.LatLng(Math.random() * h + min.lat, Math.random() * w + min.lng);
}