import { CanvasObject } from "./CanvasObject.svelte";
import { Handle } from "$lib/registry.svelte";

/** Canvas Listener options. */
export type canvasListenerOptions = {
    x:number,
    y:number,
    order:number,
    name:string,
    niceName:string,
    editable:boolean,
    selected:boolean,
    grabbed:boolean,
    locked:boolean,
    handle:Handle
}

/** The Canvas Listener class. @extends CanvasObject */
export class CanvasListener extends CanvasObject {
    constructor(options:canvasListenerOptions) {
        super(options);
    }
}
