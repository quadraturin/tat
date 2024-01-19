import type L from 'leaflet';

// class that defines an image on the map
export class MapImage
{
    data:File;
    overlay:L.ImageOverlay;
    rect:L.Rectangle;
    originalWidth:number;
    originalHeight:number;
    opacity:number;
    order:number;

    constructor(data:File, overlay:L.ImageOverlay, rect:L.Rectangle, w:number, h:number, opacity?:number, order?:number)
    {
        this.data = data;
        this.overlay = overlay;
        this.rect = rect;
        this.originalWidth = w;
        this.originalHeight = h;

        if (typeof opacity != "undefined") this.opacity = opacity;
        else this.opacity = 1;
        
        if (typeof order != "undefined") this.order = order;
        else this.order = 1;
    }
}