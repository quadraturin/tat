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
    #editable:boolean = $state(true);
    #selected:boolean = $state(false);
    #grabbed:boolean = $state(false);
    #grabOffsetX:number = $state(0);
    #grabOffsetY:number = $state(0);
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
        this.#editable = options.editable;
        this.#selected = options.selected;
        this.#grabbed = options.grabbed;
        this.#locked = options.locked;
    }

    getImage() { return this.#image; }

    getX() { return this.#x; }
    setX(newX:number) { this.#x = newX; }

    getY() { return this.#y; }
    setY(newY:number) { this.#y = newY; }

    getHeight() { return this.#height; }

    getWidth() { return this.#width; }
    
    getName() { return this.#name; }
    
    getLocked() { return this.#locked; }
    
    getGrabbed() { return this.#grabbed; }
    setGrabbed(g?:boolean, x?:number, y?:number) {
        if (typeof g == "undefined") this.#grabbed = !this.#grabbed;
        else this.#grabbed = g;

        if (this.#grabbed) {
            if (typeof x == "undefined" || typeof y == "undefined") {
                this.#grabOffsetX = 0;
                this.#grabOffsetY = 0;
            } else {
                this.#grabOffsetX = this.#x - x;
                this.#grabOffsetY = this.#y - y;
            }
            console.log(this.#grabOffsetX, this.#grabOffsetY);
        }
    }
    
    getGrabOffsetX() { return this.#grabOffsetX; }
    
    getGrabOffsetY() { return this.#grabOffsetY; }
    
    getSelected() { return this.#selected; }
    setSelected(select?:boolean) {
        if (typeof select == "undefined") this.#selected = !this.#selected;
        else this.#selected = select;
    }

    getEditable() { return this.#editable; }
    setEditable(enable?:boolean) {
        if (typeof enable == "undefined") this.#editable = !this.#editable;
        else this.#editable = enable;
    }



}
