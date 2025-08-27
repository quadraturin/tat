import { CanvasObject } from "./CanvasObject.svelte";
import { Handle } from "$lib/registry.svelte";

/**
 * map image options.
 */
export type canvasImageOptions = {
    src:string,
    image:HTMLImageElement,
    x:number,
    y:number,
    width:number,
    height:number,
    originalWidth:number,
    originalHeight:number,
    opacity:number,
    order:number,
    name:string,
    niceName:string,
    editable:boolean,
    selected:boolean,
    grabbed:boolean,
    locked:boolean,
    handle:Handle
}

/**
 * canvas image class.
 */
export class CanvasImage extends CanvasObject {
    #image:HTMLImageElement;
    #src:string;
    #width:number = $state(0);
    #height:number = $state(0);
    #originalWidth:number;
    #originalHeight:number;
    #opacity:number = $state(1);

    constructor(options:canvasImageOptions) {
        super({ x:options.x, 
                y:options.y, 
                order:options.order,
                name:options.name,
                niceName:options.niceName,
                editable:options.editable,
                selected:options.selected,
                grabbed:options.grabbed,
                locked:options.locked});
        this.#image = options.image;
        this.#src = options.src;
        this.#height = options.height;
        this.#width = options.width;
        this.#originalWidth = options.originalWidth;
        this.#originalHeight = options.originalHeight;
        this.#opacity = options.opacity;
    }

    getImage() { return this.#image; }

    getHeight() { return this.#height; }
    setHeight(h:number) { this.#height = h; }

    getWidth() { return this.#width; }
    setWidth(w:number) { this.#width = w; }

    getOriginalWidth() { return this.#originalWidth; }
    getOriginalHeight() { return this.#originalHeight; }
}
