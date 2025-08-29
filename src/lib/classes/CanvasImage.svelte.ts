import { getUserSettings } from "$lib/settings.userSettings.svelte";
import { CanvasObject } from "./CanvasObject.svelte";

/** Canvas Image options. */
export type canvasImageOptions = {
    editable:boolean,
    grabbed:boolean,
    height:number,
    image:HTMLImageElement,
    name:string,
    niceName:string,
    opacity:number,
    originalHeight:number,
    originalWidth:number,
    selected:boolean,
    src:string,
    width:number,
    x:number,
    y:number,
}

/**
 * The Canvas Image class. 
 * @extends CanvasObject
 */
export class CanvasImage extends CanvasObject {
    #image:HTMLImageElement;
    #height:number = $state(0);
    #originalHeight:number;
    #originalWidth:number;
    #opacity:number = $state(1);
    #src:string;
    #width:number = $state(0);

    constructor(options:canvasImageOptions) {
        super({ 
            editable:options.editable,
            grabbed:options.grabbed,
            name:options.name,
            niceName:options.niceName,
            selected:options.selected,
            x:options.x, 
            y:options.y, 
        });
        this.#height = options.height;
        this.#image = options.image;
        this.#opacity = options.opacity;
        this.#originalHeight = options.originalHeight;
        this.#originalWidth = options.originalWidth;
        this.#src = options.src;
        this.#width = options.width;
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
