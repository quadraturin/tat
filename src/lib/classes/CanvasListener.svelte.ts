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
    #locked:boolean = $state(false);

    constructor(options:canvasListenerOptions) {
        this.#x = options.x;
        this.#y = options.y;
        this.#order = options.order;
        this.#name = options.name;
        this.#niceName = options.niceName;
        this.#editEnabled = options.editEnabled;
        this.#selected = options.selected;
        this.#locked = options.locked;
    }

    setX(newX:number) { this.#x = newX; }
    setY(newY:number) { this.#y = newY; }
    getX() { return this.#x; }
    getY() { return this.#y; }
}
