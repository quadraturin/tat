import { getUserSettings } from "$lib/settings.userSettings.svelte";
import { CanvasObject } from "./CanvasObject.svelte";

/** Canvas Image options. */
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
    name:string,
    niceName:string,
    editable:boolean,
    selected:boolean,
    grabbed:boolean,
    locked:boolean
}

/**
 * The Canvas Image class. 
 * @extends CanvasObject
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
        super({ 
            x:options.x, 
            y:options.y, 
            name:options.name,
            niceName:options.niceName,
            editable:options.editable,
            selected:options.selected,
            grabbed:options.grabbed,
            locked:options.locked
        });
        this.#image = options.image;
        this.#src = options.src;
        this.#height = options.height;
        this.#width = options.width;
        this.#originalWidth = options.originalWidth;
        this.#originalHeight = options.originalHeight;
        this.#opacity = options.opacity;
    }

    /** Get the image element. @returns The image element. */
    public get image() { return this.#image; }

    /** Get the image height. @returns The height. */
    public get height() { return this.#height; }
    /** Set the image height. @param h The height. */
    public set height(h:number) { this.#height = h; }

    /** Get the image width. @returns The width. */
    public get width() { return this.#width; }
    /** Set the image width. @param w The width. */
    public set width(w:number) { this.#width = w; }

    /** Get the image opacity. @returns The opacity. */
    public get opacity() { return this.#opacity; }
    /** Set the image height. @param h The height. */
    public set opacity(o:number) { this.#opacity = o; }

    /** Get the image src. @returns The src. */
    public get src() { return this.#src; }
    /** Set the image src. @param src The src. */
    public set src(src:string) { this.#src = src; }

    /** Get the image file's original width. @returns The original width. */
    public get originalWidth() { return this.#originalWidth; }
    /** Get the image file's original height. @returns The original height. */
    public get originalHeight() { return this.#originalHeight; }

    public changeOpacity(e:WheelEvent) {
        try {
            let delta = e.deltaY;
            // invert based on user settings.
            if (getUserSettings().invertVolumeScroll) delta *= -1;
            this.#opacity += delta * 0.01 * getUserSettings().uiScrollSensitivity;
            if (this.#opacity < 0) this.#opacity = 0;
            else if (this.#opacity > 1) this.#opacity = 1;
        } catch(err) {
            console.error(err);
        }
    }
}
