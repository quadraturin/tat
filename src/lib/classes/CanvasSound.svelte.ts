import { CanvasObject } from "./CanvasObject.svelte";
import { getCanvas, getHandleSize, getHandleSlop, SoundType } from "$lib/registry.svelte";
import { Vector2D } from "$lib/util.vectors";

/** Canvas Sound options. */
export type canvasSoundOptions = {
    src:string,
    x:number,
    y:number,
    radius:number,
    order:number,
    name:string,
    niceName:string,
    editable:boolean,
    selected:boolean,
    grabbed:boolean,
    locked:boolean
    soundType:SoundType,
    volume:number,
    muted:boolean,
    solo:boolean,
    localHandleAngle:number,
    areaCoords:Vector2D[]
}

/**
 * The Canvas Sound class.
 * @extends CanvasObject
 */
export class CanvasSound extends CanvasObject{
    #src:string;
    #radius:number = $state(0);
    #soundType:SoundType;
    #volume:number = $state(0);
    #muted:boolean = $state(false);
    #solo:boolean = $state(false);
    #localHandleAngle = 0;
    #areaCoords:Vector2D[];
    #areaBounds:[Vector2D,Vector2D];
    #areaHandleIndex:number;
    #originalAreaCoords:Vector2D[];

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
        this.#localHandleAngle = options.localHandleAngle;
        this.#areaCoords = options.areaCoords;
        this.#areaBounds = this.setBounds();
        this.#areaHandleIndex = 0;
        this.#originalAreaCoords = options.areaCoords;
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

    /** Get the angle of the local sound handle. @returns The angle. */
    public get localHandleAngle() { return this.#localHandleAngle; }
    /** Set the angle of the local sound handle. @param h The angle. */
    public set localHandleAngle(h:number) { this.#localHandleAngle = h; }

    /** Get the coordinates of the area sound. @returns The coords. */
    public get areaCoords() { return this.#areaCoords; }
    /** Set the coordinates of the area sound. @param c The coords. */
    public set areaCoords(c:Vector2D[]) { this.areaCoords = c; }

    public get soundType() { return this.#soundType; }
    public set soundType(t:SoundType) { this.#soundType = t; }

    public get areaBounds() { return this.#areaBounds; }
    public setBounds() {
        const c = this.#areaCoords;
        let min:Vector2D = new Vector2D(c[0].x, c[0].y);
        let max:Vector2D = new Vector2D(c[0].x, c[0].y);
        
        for (let i = 1; i < c.length; i++) {
            if (min.x > c[i].x) min.x = c[i].x;
            if (min.y > c[i].y) min.y = c[i].y;
            if (max.x < c[i].x) max.x = c[i].x;
            if (max.y < c[i].y) max.y = c[i].y;
        }
        min.x -= getCanvas().toWorldLength(getHandleSize()*2 + getHandleSlop());
        min.y -= getCanvas().toWorldLength(getHandleSize()*2 + getHandleSlop());
        max.x += getCanvas().toWorldLength(getHandleSize()*2 + getHandleSlop());
        max.y += getCanvas().toWorldLength(getHandleSize()*2 + getHandleSlop());
        return this.#areaBounds = [min, max];
    }

    public get areaHandleIndex() { return this.#areaHandleIndex; }
    public set areaHandleIndex(i:number) { this.#areaHandleIndex = i; }

    public addAreaVertex(x:number, y:number, i:number) {
        if (this.#areaCoords.length > i) {
            this.#areaCoords.splice(i, 0, new Vector2D(x,y));
        }
    }

    public removeAreaVertex(i:number) {
        if (this.#areaCoords.length > i) {
            this.#areaCoords.splice(i, 1);
        }
    }

    public get originalAreaCoords() { return this.#originalAreaCoords; }
    public set originalAreaCoords(coords:Vector2D[]) { this.#originalAreaCoords = coords; }
}
