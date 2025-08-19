import { CanvasObject } from "./CanvasObject.svelte";

/**
 * map image options.
 */
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
}

/**
 * canvas image class.
 */
export class CanvasListener extends CanvasObject {
    constructor(options:canvasListenerOptions) {
        super(options);
    }
}
