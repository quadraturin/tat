import { CanvasObject } from "./CanvasObject.svelte";
import { Handle } from "$lib/registry.svelte";

/** Canvas Listener options. */
export type canvasListenerOptions = {
    x?:number,
    y?:number,
}

/** The Canvas Listener class. @extends CanvasObject */
export class CanvasListener extends CanvasObject {
    constructor(options:canvasListenerOptions) {
        super(options);
    }
}
