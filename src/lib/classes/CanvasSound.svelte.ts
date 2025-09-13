import { CanvasObject } from "./CanvasObject.svelte";
import { getAudioContext, getCanvas, getHandleSize, getHandleSlop, getListener, getMasterGain, SoundType, TriggerType } from "$lib/registry.svelte";
import { Vector2D } from "$lib/util.vectors";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getUserSettings } from "$lib/settings.userSettings.svelte";
import { pointCircleCollision, pointPolyCollision } from "$lib/util.collision";
import { niceName } from "$lib/util.getNiceName";

export type Timer = {
    setHours: number;
    setMinutes: number;
    setSeconds: number;
    hours: number;
    minutes: number;
    seconds: number;
    active: boolean;
}

/** Canvas Sound options. */
export type CanvasSoundOptions = {
    src:                 string,
    areaCoords?:         Vector2D[],
    locked?:           boolean,
    localHandleAngle?:   number,
    loop?:               boolean,
    muted?:              boolean,
    name?:               string,
    niceName?:           string,
    radius?:             number,
    selected?:           boolean,
    solo?:               boolean,
    soundType?:          SoundType,
    timer?:              Timer,
    triggerType?:        TriggerType,
    volume?:             number,
    x?:                  number,
    y?:                  number
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
    #timer:                 Timer;
    #timerID:               number              = 0;
    #track:                 MediaElementAudioSourceNode;
    #triggerType:           TriggerType;
    #volume:                number              = $state(0);

    constructor(options:CanvasSoundOptions) {
        super({ 
            x:options.x, 
            y:options.y, 
            name:options.name ? options.name : "Sound",
            niceName:options.niceName,
            locked:options.locked,
            selected:options.selected,
        });
        this.#src = options.src;
        this.niceName = options.niceName ? options.niceName : niceName(this.name);
        this.#sound = new Audio(convertFileSrc(this.#src));
        this.#sound.volume = options.volume ? options.volume : 1;
        this.#sound.loop = options.loop ? options.loop : true;
        this.#soundType = options.soundType ? options.soundType : SoundType.Local;
        this.#radius = options.radius ? options.radius : 30;

        const newAreaCoords = [ new Vector2D(this.x, this.y + this.#radius), 
                                new Vector2D(this.x + this.#radius, this.y), 
                                new Vector2D(this.x, this.y - this.#radius), 
                                new Vector2D(this.x - this.#radius, this.y)];

        this.#areaCoords = options.areaCoords ? options.areaCoords : newAreaCoords;
        this.#areaBounds = this.setBounds();
        this.#areaHandleIndex = 0;
        this.#originalAreaCoords = this.#areaCoords;
        this.#localHandleAngle = options.localHandleAngle ? options.localHandleAngle : 0;

        this.#gain = getAudioContext().createGain();
        this.#loop = options.loop ? options.loop : true;
        this.#muted = options.muted ? options.muted : false;
        this.#solo = options.solo ? options.solo : false;
        this.#timer = options.timer ? options.timer : {
            setHours: 0,
            setMinutes: 0,
            setSeconds: 30,
            hours: 0,
            minutes: 0,
            seconds: 30,
            active: false,
        };
        this.#triggerType = options.triggerType ? options.triggerType : TriggerType.Manual;
        if (this.#triggerType == TriggerType.Manual) this.#sound.addEventListener("canplaythrough", () => {
            this.#sound.play();
        });
        this.#volume = options.volume ? options.volume : 1;
        this.#track = getAudioContext().createMediaElementSource(this.#sound);
        this.#gain = getAudioContext().createGain();

        // Hook up audio context nodes
        // Track -> Track gain -> Master gain (-> Destination)
        this.#track
            .connect(this.#gain)
            .connect(getMasterGain());
    }

    /** Get if the sound is looped. @returns True: looped. False: not looped. */
    public get loop() { return this.#loop; }
    /** Set if the sound is looped. @param loop True: looped. False: not looped. */
    public set loop(loop:boolean) { 
        this.#loop = loop; 
        if (this.#triggerType == TriggerType.PlayOnTimer) this.#sound.loop = false;
        else this.#sound.loop = loop;
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
        min.x -= getCanvas().w_toLen(getHandleSize()*2 + getHandleSlop());
        min.y -= getCanvas().w_toLen(getHandleSize()*2 + getHandleSlop());
        max.x += getCanvas().w_toLen(getHandleSize()*2 + getHandleSlop());
        max.y += getCanvas().w_toLen(getHandleSize()*2 + getHandleSlop());
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
    public get gainNode() {return this.#gain; }

    public get timer() { return this.#timer; }
    public get timerID() { return this.#timerID; }
    public set timerID(id:number) { this.#timerID = id; }

    public setTimer(n:number, hms:string) {
        if (hms == "h") this.timer.setHours = n;
        if (hms == "m") this.timer.setMinutes = n;
        if (hms == "s") this.timer.setSeconds = n;
    }

    public changeTimerWheel(e:WheelEvent, hms:string) {
        let delta = e.deltaY;
        if (getUserSettings().invertVolumeScroll) delta *= -1;
        delta = delta < 0 ? -1 : 1;
        if (hms == "h") {
            this.#timer.setHours += delta;
            if (this.#timer.setHours < 0) this.#timer.setHours = 0;
            else if (this.#timer.setHours > 99) this.#timer.setHours = 99;
            this.#timer.hours = this.#timer.setHours;
        } else if (hms == "m") {
            this.#timer.setMinutes += delta;
            if (this.#timer.setMinutes < 0) this.#timer.setMinutes = 0;
            else if (this.#timer.setMinutes > 59) this.#timer.setMinutes = 59;
            this.#timer.minutes = this.#timer.setMinutes;
        } else if (hms == "s") {
            this.#timer.setSeconds += delta;
            if(this.#timer.setSeconds < 0) this.#timer.setSeconds = 0;
            else if (this.#timer.setSeconds > 59) this.#timer.setSeconds = 59;
            this.#timer.seconds = this.#timer.setSeconds;
        }
        if(this.#timer.setSeconds == 0 && this.#timer.setMinutes == 0 && this.#timer.setHours == 0) {
            this.#timer.setSeconds = 1;
            this.#timer.seconds = 1;
        }
    }
    public startTimer():number{
        this.#timer.hours = this.#timer.setHours;
        this.#timer.minutes = this.#timer.setMinutes;
        this.#timer.seconds = this.#timer.setSeconds;
        this.#timer.active = true;
        return setInterval(()=>this.runTimer(),1000);
    }
    public stopTimer(id:number){
        clearInterval(id);
        this.#timer.active = false;
        this.#timer.hours = this.#timer.setHours;
        this.#timer.minutes = this.#timer.setMinutes;
        this.#timer.seconds = this.#timer.setSeconds;
    }
    private runTimer(){
        // If at 1s, count down to 0 and play the sound.
        if (this.timer.hours == 0 && this.timer.minutes == 0 && this.timer.seconds == 1) {
            this.timer.seconds--;
            this.sound.play();
            this.sound.fastSeek(0);
            this.stopTimer(this.timerID);
            if (this.loop) {
                this.timerID = this.startTimer();
            }
            return;
        }
        // Seconds is over 0: decrement seconds.
        if (this.timer.seconds > 0) { 
            this.timer.seconds--;
            return;
        }
        if (this.timer.seconds == 0) {
            if (this.timer.minutes > 0) {
                this.timer.minutes--;
                this.timer.seconds = 59;
                return;
            }
            if (this.timer.minutes == 0) {
                if (this.timer.hours > 0) {
                    this.timer.hours--;
                    this.timer.minutes = 59;
                    this.timer.seconds = 59;
                    return;
                }
            }
        }

    }


    public changeVolumeWheel(e:WheelEvent) {
        let delta = e.deltaY;
        
        // invert based on user settings.
        if (getUserSettings().invertVolumeScroll) delta *= -1;
        
        delta = delta < 0 ? -0.01 : 0.01;
        delta *= getUserSettings().uiScrollSensitivity;

        // adjust and clamp volume.
        this.volume += delta;
        if (this.volume < 0) this.volume = 0;
        else if (this.volume > 1) this.volume = 1;
    }


    public changeVolumeClick(e:MouseEvent) {
        if (e.currentTarget instanceof Element) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (rect.bottom - e.y) / (rect.bottom - rect.top);
            this.volume = pct;
            if (this.volume < 0) this.volume = 0;
            else if (this.volume > 1) this.volume = 1;
            }
    }


    /**
     * Cycle a canvas sound between the 3 types (area, global, local).
     * @param sound canvas sound to change.
     */
    public async cycleSoundType() {
        // Local -> Area
        if (this.soundType == SoundType.Local) { 
            this.soundType = SoundType.Area; 
        }
        // Area -> Global: Unset invalid trigger types.
        else if (this.soundType == SoundType.Area){ 
            this.soundType = SoundType.Global;
            if (this.triggerType != TriggerType.Manual && this.triggerType != TriggerType.PlayOnTimer) {
                this.triggerType = TriggerType.Manual;
            }
        }
        // Global -> Local
        else if (this.soundType == SoundType.Global) { 
            this.soundType = SoundType.Local; 
        }
    }


    /**
     * Cycle a canvas sound trigger between the types (onload, onenter, onexit, ontimer).
     * @param sound canvas sound to change.
     */
    public async cycleTriggerType() {
        // Global sound:
        // PlayOnLoad -> PlayOnTimer -> back
        if (this.soundType == SoundType.Global) {
            if (this.triggerType == TriggerType.Manual)  { 
                this.triggerType = TriggerType.PlayOnTimer; 
                this.sound.pause(); 
            } else if (this.triggerType == TriggerType.PlayOnTimer) { 
                this.triggerType = TriggerType.Manual; 
            }
        }

        // Local or Area sound, listener colliding: 
        // PlayOnLoad -> PlayInside -> ReplayInside -> PlayOnTimer -> back
        else if ((this.soundType == SoundType.Local && pointCircleCollision(getListener().x, getListener().y, this.x, this.y, this.radius)) ||
                (this.soundType == SoundType.Area && pointPolyCollision(getListener().x, getListener().y, this.areaCoords))) {
            if (this.triggerType == TriggerType.Manual) { 
                this.triggerType = TriggerType.PlayInside;   
                this.loop = true; 
            } else if (this.triggerType == TriggerType.PlayInside) { 
                this.triggerType = TriggerType.RestartInside; 
                this.loop = true; 
            } else if (this.triggerType == TriggerType.RestartInside) {
                this.triggerType = TriggerType.PlayOnTimer;
                this.sound.pause(); 
                this.#sound.loop = false; 
            } else if (this.triggerType == TriggerType.PlayOnTimer) { 
                this.triggerType = TriggerType.Manual; 
                this.#sound.loop = this.#loop;
            }
        } 

        // Local or Area sound, listener not colliding:
        // PlayOnLoad -> PlayOnEnter -> ReplayOnEnter -> PlayInside -> ReplayInside -> PlayOnTimer -> back
        else {
            if (this.triggerType == TriggerType.Manual) {
                this.triggerType = TriggerType.PlayOnEnter;
                this.sound.pause(); 
            } else if (this.triggerType == TriggerType.PlayOnEnter) { 
                this.triggerType = TriggerType.RestartOnEnter; 
                this.sound.pause(); 
            } else if (this.triggerType == TriggerType.RestartOnEnter) { 
                this.triggerType = TriggerType.PlayInside;
                this.loop = true; 
            } else if (this.triggerType == TriggerType.PlayInside) { 
                this.triggerType = TriggerType.RestartInside;
                this.loop = true;
            } else if (this.triggerType == TriggerType.RestartInside) { 
                this.triggerType = TriggerType.PlayOnTimer; 
                this.sound.pause();
                this.#sound.loop = false; 
            } else if (this.triggerType == TriggerType.PlayOnTimer) { 
                this.triggerType = TriggerType.Manual; 
                this.#sound.loop = this.#loop;
            }
        }
    }

    
}
