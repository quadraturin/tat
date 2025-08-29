import { Handle } from "$lib/registry.svelte";

/** Canvas Object options. */
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

/** The base Canvas Object class. */
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
    #handle:Handle = Handle.None;
    #hoverHandle:Handle = Handle.None;

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
        this.#handle = Handle.None;
        this.#hoverHandle = Handle.None;
    }

    /** Get the X position of the object. @returns The X position. */
    public get x() { return this.#x; }
    /** Set the X position of the object. @param newX The new X position. */
    public set x(newX:number) { this.#x = newX; }

    /** Get the Y position of the object. @returns The Y position. */
    public get y() { return this.#y; }
    /** Set the Y position of the object. @param newY The new Y position.*/
    public set y(newY:number) { this.#y = newY; }

    /** Get whether or not the image is selected. @returns True: selected. False: not selected. */
    public get selected() { return this.#selected; }
    /** Set whether or not the image is selected. @param s True: selected. False: not selected. Null: toggle selected state. */
    public set selected(s:boolean|null) {
        if(s == null) this.#selected = !this.#selected;
        else this.#selected = s;
    }

    /** Get whether the object is currently grabbed. */
    public get grabbed() { return this.#grabbed; }

    /** Grab or release the object. 
     * @param g True to grab, False to release. 
     * @param x Mouse X position.
     * @param y Mouse Y position. */
    public grab(g?:boolean, x?:number, y?:number) {
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

    /** Get the difference on the X axis from the object's origin to the mouse. */
    public get grabOffsetX() { return this.#grabOffsetX; }
    /** Get the difference on the Y axis from the object's origin to the mouse. */
    public get grabOffsetY() { return this.#grabOffsetY; }

    /** Get if the object is locked. */
    public get locked() { return this.#locked; }
    /** Set if the object is locked. @param l True: lock the object. False: unlock the object. Null: toggle the locked state. */
    public set locked(l:boolean|null) {
        if(l == null) this.#locked = !this.#locked;
        else this.#locked = l;
    }

    /** Get if the object is editable. */
    public get editable() { return this.#editable; }
    /** Set if the object is editable. @param l True: make the object editable. False: make the object not editable. Null: toggle the editable state. */
    public set editable(enable:boolean|null) {
        if (enable == null) this.#editable = !this.#editable;
        else this.#editable = enable;
    }

    /** Get the edit handle (if any) under the mouse. */
    public get hoverHandle() { return this.#hoverHandle; }
    /** Set the edit handle (if any) under the mouse. @param h The handle to set. */
    public set hoverHandle(h:Handle) { this.#hoverHandle = h; }

    /** Get the active edit handle. */
    public get handle() { return this.#handle; }
    /** Set the active edit handle. @param h The handle to set. If null, sets the current hoverHandle as the active handle. */
    public set handle(h:Handle|null) {
        if (h == null) this.#handle = this.#hoverHandle;
        else this.#handle = h;
    }

    /** Get the name of the object. @returns The name. */
    public get name() { return this.#name; }
    /** Set the name of the object. @param newName The new name. */
    public set name(newName:string) { this.#name = newName; }

    /** Get the cleaned up name of the object. @returns The name. */
    public get niceName() { return this.#niceName; }
    /** Set the cleaned up name of the object. @param newName The new name. */
    public set niceName(newName:string) { this.#niceName = newName; }
}
