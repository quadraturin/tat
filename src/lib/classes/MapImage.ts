import type L from 'leaflet';

// class that defines an image on the map
export class MapImage
{
    data:File;
    overlay:L.ImageOverlay;
    originalWidth:number;
    originalHeight:number;

    constructor(data:File, overlay:L.ImageOverlay, w:number, h:number)
    {
        this.data = data;
        this.overlay = overlay;
        this.originalWidth = w;
        this.originalHeight = h;
    }
}