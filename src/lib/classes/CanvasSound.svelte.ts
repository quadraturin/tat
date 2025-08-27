import { CanvasObject } from "./CanvasObject.svelte";

/** Canvas Sound options. */
export type canvasSoundOptions = {
    src:string,
    x:number,
    y:number,
    radius:number,
    opacity:number,
    order:number,
    name:string,
    niceName:string,
    editable:boolean,
    selected:boolean,
    grabbed:boolean,
    locked:boolean
    soundType:string,
    volume:number,
    muted:boolean,
    solo:boolean
}

/**
 * The Canvas Sound class.
 * @extends CanvasObject
 */
export class CanvasSound extends CanvasObject{
    #src:string;
    #radius:number = $state(0);
    #soundType:string = $state("");
    #volume:number = $state(0);
    #muted:boolean = $state(false);
    #solo:boolean = $state(false);

    constructor(options:canvasSoundOptions) {
        super({ 
            x:options.x, 
            y:options.y, 
            order:options.order,
            name:options.name,
            niceName:options.niceName,
            editable:options.editable,
            selected:options.selected,
            grabbed:options.grabbed,
            locked:options.locked
        });
        this.#src = options.src;
        this.#radius = options.radius;
        this.#soundType = options.soundType;
        this.#volume = options.volume;
        this.#muted = options.muted;
        this.#solo = options.solo;
    }

    /** Get the sound emitter radius. @returns The radius. */
    public get radius() { return this.#radius; }
    /** Set the sound emitter radius. @param r The radius. */
    public set radius(r:number) { this.#radius = r; }

    /** Get the sound emitter volume. @returns The volume. */
    public get volume() { return this.#volume; }
    /** Set the sound emitter volume. @param v The volume. */
    public set volume(v:number) { this.#volume = v; }

    /** Get whether or not the sound emitter is muted. @returns True: muted. False: not muted. */
    public get muted() { return this.#muted; }
    /** Set whether or not the sound emitter is muted. @param m True: muted. False: not muted. Null: toggle the muted state. */
    public set muted(m:boolean|null) {   
        if (m == null) this.#muted = !this.#muted;
        else this.#muted = m; 
    }

    /** Get whether or not the sound emitter is soloed. @returns True: soloed. False: not soloed. */
    public get solo() { return this.#muted; }
    /** Set whether or not the sound emitter is soloed. @param s True: soloed. False: not soloed. Null: toggle the soloed state. */
    public set solo(s:boolean|null) {
        if (s == null) this.#solo = !this.#solo;
        else this.#solo = s; 
    }
}
