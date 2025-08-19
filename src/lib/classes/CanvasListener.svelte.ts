/**
 * map image options.
 */
export type canvasListenerOptions = {
    x:number,
    y:number,
    order:number,
    name:string,
    niceName:string,
    editEnabled:boolean,
    selected:boolean,
    grabbed:boolean,
    locked:boolean,
}

/**
 * canvas image class.
 */
export class CanvasListener {
    #x:number = $state(0);
    #y:number = $state(0);
    #order:number = $state(0);
    #name:string;
    #niceName:string;
    #editEnabled:boolean = $state(true);
    #selected:boolean = $state(false);
    #grabbed:boolean = $state(false);
    #locked:boolean = $state(false);

    constructor(options:canvasListenerOptions) {
        this.#x = options.x;
        this.#y = options.y;
        this.#order = options.order;
        this.#name = options.name;
        this.#niceName = options.niceName;
        this.#editEnabled = options.editEnabled;
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
    setGrabbed(g?:boolean) {
        if(typeof g == "undefined") this.#grabbed = !this.#grabbed;
        else this.#grabbed = g;
    }

    getLocked() { return this.#locked; }
    setLocked(l?:boolean) {
        if(typeof l == "undefined") this.#locked = !this.#locked;
        else this.#locked = l;
    }
}
