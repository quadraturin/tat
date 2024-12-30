import type L from 'leaflet';

/**
 * map image options.
 */
type mapImageOptions = {
    src:string,
    overlay:L.ImageOverlay,
    rect:L.Rectangle,
    originalWidth:number,
    originalHeight:number,
    opacity:number,
    order:number,
    name:string,
    niceName:string
}

/**
 * map image class.
 */
export class MapImage {
    src:string;
    overlay:L.ImageOverlay;
    rect:L.Rectangle;
    originalWidth:number;
    originalHeight:number;
    opacity:number = $state(1);
    order:number;
    name:string;
    niceName:string;

    constructor(options:mapImageOptions) {
        this.src = options.src;
        this.overlay = options.overlay;
        this.rect = options.rect;
        this.originalWidth = options.originalWidth;
        this.originalHeight = options.originalHeight;
        this.opacity = options.opacity;
        this.order = options.order;
        this.name = options.name;
        this.niceName = options.niceName;
    }
}
