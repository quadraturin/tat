/**
 * map image options.
 */
export type canvasObjectOptions = {
    x:number,
    y:number,
    order:number,
    name:string,
    niceName:string,
    editable:boolean,
    selected:boolean,
    grabbed:boolean,
    locked:boolean,
}

/**
 * canvas image class.
 */
export class CanvasObject {
    #x:number = $state(0);
    #y:number = $state(0);
    #order:number = $state(0);
    #name:string;
    #niceName:string;
    #editable:boolean = $state(true);
    #selected:boolean = $state(false);
    #grabbed:boolean = $state(false);
    #grabOffsetX:number = 0;
    #grabOffsetY:number = 0;
    #locked:boolean = $state(false);

    constructor(options:canvasObjectOptions) {
        this.#x = options.x;
        this.#y = options.y;
        this.#order = options.order;
        this.#name = options.name;
        this.#niceName = options.niceName;
        this.#editable = options.editable;
        this.#selected = options.selected;
        this.#grabbed = options.grabbed;
        this.#locked = options.locked;
    }

    getX() { return this.#x; }
    setX(newX:number) { this.#x = newX; }

    getY() { return this.#y; }
    setY(newY:number) { this.#y = newY; }

    getSelected() { return this.#selected; }
    setSelected(s?:boolean) {
        if(typeof s == "undefined") this.#selected = !this.#selected;
        else this.#selected = s;
    }

    getGrabbed() { return this.#grabbed; }
    setGrabbed(g?:boolean, x?:number, y?:number) {
        if (typeof g == "undefined") this.#grabbed = !this.#grabbed;
        else this.#grabbed = g;

        if (typeof x == "undefined" || typeof y == "undefined") {
            this.#grabOffsetX = 0;
            this.#grabOffsetY = 0;
        } else {
            this.#grabOffsetX = this.#x - x;
            this.#grabOffsetY = this.#y - y;
        }
    }

    getGrabOffsetX() { return this.#grabOffsetX; }
    getGrabOffsetY() { return this.#grabOffsetY; }

    getLocked() { return this.#locked; }
    setLocked(l?:boolean) {
        if(typeof l == "undefined") this.#locked = !this.#locked;
        else this.#locked = l;
    }

    getEditable() { return this.#editable; }
    setEditable(enable?:boolean) {
        if (typeof enable == "undefined") this.#editable = !this.#editable;
        else this.#editable = enable;
    }
}
