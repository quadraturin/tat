import { CanvasObject } from "./CanvasObject.svelte";
import { getAudioContext, getCanvas, getHandleSize, getHandleSlop, getMasterGain, SoundType, TriggerType } from "$lib/registry.svelte";
import { Vector2D } from "$lib/util.vectors";
import { convertFileSrc } from "@tauri-apps/api/core";

/** Canvas Sound options. */
export type canvasSoundOptions = {
    areaCoords:         Vector2D[],
    editable:           boolean,
    grabbed:            boolean,
    localHandleAngle:   number,
    loop:               boolean,
    muted:              boolean,
    name:               string,
    niceName:           string,
    radius:             number,
    selected:           boolean,
    solo:               boolean,
    sound:              HTMLAudioElement,
    src:                string,
    soundType:          SoundType,
    triggerType:        TriggerType,
    volume:             number,
    x:                  number,
    y:                  number
}

/**
 * The Canvas Sound class.
 * @extends CanvasObject
 */
export class CanvasSound extends CanvasObject{
    #areaBounds:            [Vector2D,Vector2D];
    #areaCoords:            Vector2D[];
    #areaHandleIndex:       number;
    #gain:                  GainNode;
    #localHandleAngle:      number              = 0;
    #loop:                  boolean             = true;
    #muted:                 boolean             = $state(false);
    #originalAreaCoords:    Vector2D[];
    #radius:                number              = $state(0);
    #solo:                  boolean             = $state(false);
    #src:                   string;
    #sound:                 HTMLAudioElement;
    #soundType:             SoundType;
    #track:                 MediaElementAudioSourceNode;
    #triggerType:           TriggerType;
    #volume:                number              = $state(0);

    constructor(options:canvasSoundOptions) {
        super({ 
            x:options.x, 
            y:options.y, 
            name:options.name,
            niceName:options.niceName,
            editable:options.editable,
            selected:options.selected,
            grabbed:options.grabbed,
        });
        this.#src = options.src;
        this.#sound = new Audio(convertFileSrc(this.#src));
        this.#sound.addEventListener("canplaythrough", () => {
            this.#sound.volume = 0;
            this.#sound.loop = true;
            this.#sound.play();
        });
        this.#soundType = options.soundType;

        this.#areaCoords = options.areaCoords;
        this.#areaBounds = this.setBounds();
        this.#areaHandleIndex = 0;
        this.#originalAreaCoords = options.areaCoords;
        this.#localHandleAngle = options.localHandleAngle;
        this.#radius = options.radius;

        this.#gain = getAudioContext().createGain();
        this.#loop = options.loop;
        this.#muted = options.muted;
        this.#solo = options.solo;
        this.#triggerType = options.triggerType;
        this.#volume = options.volume;

        this.#track = getAudioContext().createMediaElementSource(this.#sound);
        this.#gain = getAudioContext().createGain();

        // Hook up audio context nodes
        // Track -> Track gain -> Master gain -> Output
        this.#track
            .connect(this.#gain)
            .connect(getMasterGain())
            .connect(getAudioContext().destination);
    }

    /** Get if the sound is looped. @returns True: looped. False: not looped. */
    public get loop() { return this.#loop; }
    /** Set if the sound is looped. @param loop True: looped. False: not looped. */
    public set loop(loop:boolean) { 
        this.#loop = loop; 
        this.#sound.loop = loop;
    }

    /** Get the sound emitter radius. @returns The radius. */
    public get triggerType() { return this.#triggerType; }
    /** Set the sound emitter radius. @param r The radius. */
    public set triggerType(t:TriggerType) { this.#triggerType = t; }

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
    public set muted(m:boolean) { this.#muted = m; }

    /** Get the sound location. @returns The location. */
    public get src() { return this.#src; }
    /** Set the sound location. @param src The location. */
    public set src(src:string) { this.#src = src; }

    /** Get whether or not the sound emitter is soloed. @returns True: soloed. False: not soloed. */
    public get solo() { return this.#solo; }
    /** Set whether or not the sound emitter is soloed. @param s True: soloed. False: not soloed. */
    public set solo(s:boolean) { this.#solo = s; }

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

    public get sound() { return this.#sound; }
    public set sound(snd:HTMLAudioElement) { this.#sound = snd; }

    public get track() { return this.#track; }
    public set track(t:MediaElementAudioSourceNode) { this.#track = t; }

    public get gain() { return this.#gain.gain.value; }
    public set gain(g:number) { 
        if (g<0) g=0;
        else if (g>1) g=1;
        this.#gain.gain.value = g; 
    }
}
