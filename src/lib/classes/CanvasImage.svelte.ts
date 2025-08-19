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
    editEnabled:boolean,
    selected:boolean,
    grabbed:boolean,
    locked:boolean
}

/**
 * canvas image class.
 */
export class CanvasImage {
    #image:HTMLImageElement;
    #src:string;
    #x:number = $state(0);
    #y:number = $state(0);
    #width:number = $state(0);
    #height:number = $state(0);
    #originalWidth:number;
    #originalHeight:number;
    #opacity:number = $state(1);
    #order:number = $state(0);
    #name:string;
    #niceName:string;
    #editEnabled:boolean = $state(true);
    #selected:boolean = $state(false);
    #grabbed:boolean = $state(false);
    #locked:boolean = $state(false);

    constructor(options:canvasImageOptions) {
        this.#image = options.image;
        this.#src = options.src;
        this.#x = options.x;
        this.#y = options.y;
        this.#height = options.height;
        this.#width = options.width;
        this.#originalWidth = options.originalWidth;
        this.#originalHeight = options.originalHeight;
        this.#opacity = options.opacity;
        this.#order = options.order;
        this.#name = options.name;
        this.#niceName = options.niceName;
        this.#editEnabled = options.editEnabled;
        this.#selected = options.selected;
        this.#grabbed = options.grabbed;
        this.#locked = options.locked;
    }

    getImage() { return this.#image; }
    getX() { return this.#x; }
    getY() { return this.#y; }
    getHeight() { return this.#height; }
    getWidth() { return this.#width; }
    getName() { return this.#name; }
    getLocked() { return this.#locked; }
    getGrabbed() { return this.#grabbed; }

    setX(newX:number) { this.#x = newX; }
    setY(newY:number) { this.#y = newY; }
    setGrabbed(g:boolean) {
        if (typeof g == "undefined") this.#grabbed = !this.#grabbed;
        else this.#grabbed = g;
    }
}
