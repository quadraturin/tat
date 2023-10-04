import type L from 'leaflet';

// class that defines an image on the map
export class MapImage
{
    data:File;
    overlay:L.ImageOverlay;

    constructor(data:File, overlay:L.ImageOverlay)
    {
        this.data = data;
        this.overlay = overlay;
    }
}