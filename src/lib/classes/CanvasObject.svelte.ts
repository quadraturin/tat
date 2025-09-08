import { getCanvas, Handle } from "$lib/registry.svelte";
import { niceName } from "$lib/util.getNiceName";

/** Canvas Object options. */
export type canvasObjectOptions = {
    locked?:boolean,
    name?:string,
    niceName?:string,
    selected?:boolean,
    x?:number,
    y?:number,
}

/** The base Canvas Object class. */
export class CanvasObject {
    #x:number = $state(0);
    #y:number = $state(0);
    #name:string;
    #niceName:string;
    #locked:boolean = $state(false);
    #selected:boolean = $state(false);
    #grabbed:boolean = $state(false);
    #grabOffsetX:number = 0;
    #grabOffsetY:number = 0;
    #handle:Handle = Handle.None;
    #hoverHandle:Handle = Handle.None;
    #uuid:`${string}-${string}-${string}-${string}-${string}`;

    constructor(options:canvasObjectOptions) {
        this.#x = options.x ? options.x : 0; //getCanvas().viewportCenterInWorldSpace().x;
        this.#y = options.y ? options.y : 0; //getCanvas().viewportCenterInWorldSpace().y;
        this.#name = options.name ? options.name : "Object";
        this.#niceName = options.niceName ? options.niceName : niceName(this.#name);
        this.#locked = options.locked ? options.locked : false;
        this.#selected = options.selected ? options.selected : false;
        this.#handle = Handle.None;
        this.#hoverHandle = Handle.None;
        this.#uuid = self.crypto.randomUUID();
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
    public set selected(s:boolean) { this.#selected = s; }

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
    public get uuid() { return this.#uuid; }

    /** Get the difference on the X axis from the object's origin to the mouse. */
    public get grabOffsetX() { return this.#grabOffsetX; }
    /** Get the difference on the Y axis from the object's origin to the mouse. */
    public get grabOffsetY() { return this.#grabOffsetY; }

    /** Get if the object is editable. */
    public get locked() { return this.#locked; }
    /** Set if the object is editable. @param isLocked True: make the object not editable. False: make the object editable. */
    public set locked(isLocked:boolean) { this.#locked = isLocked; }

    /** Get the edit handle (if any) under the mouse. */
    public get hoverHandle() { return this.#hoverHandle; }
    /** Set the edit handle (if any) under the mouse. @param h The handle to set. */
    public set hoverHandle(h:Handle) { this.#hoverHandle = h; }

    /** Get the active edit handle. */
    public get handle() { return this.#handle; }
    /** Set the active edit handle. @param h The handle to set. If null, sets the current hoverHandle as the active handle. */
    public set handle(h:Handle) { this.#handle = h; }

    /** Get the name of the object. @returns The name. */
    public get name() { return this.#name; }
    /** Set the name of the object. @param newName The new name. */
    public set name(newName:string) { this.#name = newName; }

    /** Get the cleaned up name of the object. @returns The name. */
    public get niceName() { return this.#niceName; }
    /** Set the cleaned up name of the object. @param newName The new name. */
    public set niceName(newName:string) { this.#niceName = newName; }
}
