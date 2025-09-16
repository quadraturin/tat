import { CanvasObject } from "./CanvasObject.svelte";
import { getAudioContext, getCanvas, getHandleSize, getHandleSlop, getListener, getMasterGain, SoundType, TimerHMS, TriggerType } from "$lib/registry.svelte";
import { Vector2D } from "$lib/util.vectors";
import { getUserSettings } from "$lib/settings.userSettings.svelte";
import { pointCircleCollision, pointPolyCollision } from "$lib/util.collision";
import { niceName } from "$lib/util.getNiceName";
import { readFile } from "@tauri-apps/plugin-fs";
import { t } from "$lib/util.localization";

export type Timer = {
    setHours:   number;
    setMinutes: number;
    setSeconds: number;
    hours:      number;
    minutes:    number;
    seconds:    number;
    active:     boolean;
}

/** Canvas Sound options. */
export type CanvasSoundOptions = {
    src:                string,
    areaCoords?:        Vector2D[],
    locked?:            boolean,
    localHandleAngle?:  number,
    loop?:              boolean,
    muted?:             boolean,
    name?:              string,
    niceName?:          string,
    radius?:            number,
    selected?:          boolean,
    solo?:              boolean,
    soundType?:         SoundType,
    timer?:             Timer,
    triggerType?:       TriggerType,
    volume?:            number,
    x?:                 number,
    y?:                 number
}

/**
 * The Canvas Sound class.
 * Note: CanvasSound uses the CanvasObject x and y values for the location of the Local sound type.
 * 
 * @extends CanvasObject
 */
export class CanvasSound extends CanvasObject{
    // Start with fixed values.

    /** The currently grabbed handle on an Area sound polygon. */
    #areaHandleIndex:       number                = 0;
    /** The current AudioBufferSourceNode that plays or will play the sound. */
    #bufferNode:            AudioBufferSourceNode = new AudioBufferSourceNode(getAudioContext());
    /** The GainNode that the user uses to adjust the sound volume. */
    #gain:                  GainNode              = getAudioContext().createGain();
    /** The GainNode that the Listener affects. */
    #gainListener:          GainNode              = getAudioContext().createGain();
    /** The angle of the resize handle on an Area sound circle. */
    #localHandleAngle:      number                = 0;
    /** The radius of the circle on a Local sound. */
    #localRadius:           number                = $state(0);
    /** 
     * If the sound is looped or not. 
     * Distinct from bufferNode's loop value because bufferNode gets destroyed after each use.
     * Instead tracks if the timer is looped in Timer mode. 
     */
    #loop:                  boolean               = $state(true);
    /** ID of the interval that tracks if the sound has looped. */
    #loopIntervalID:        number                = 0;
    /** Whether or not the sound is muted. */
    #muted:                 boolean               = $state(false);
    /** Whether or not the sound is paused. This must be done manually because of how bufferNode works. */
    #paused:                boolean               = $state(true);
    /** The position in seconds that the sound is paused at and should replay from when played. */
    #pausePosition:         number                = $state(0);
    /** The time the track started playing. Used to track progress through the track. */
    #startTime:             number                = 1;
    /** Whether or not the sound is soloed. */
    #solo:                  boolean               = $state(false);
    /** The AudioBuffer holding the sound. Null if empty. */
    #buffer:                AudioBuffer | null    = null; 
    /** The ID of the current interval loop running the timer trigger. */
    #timerID:               number                = 0;
    /** The sound volume. Tracks the gain node, is used for UI display. */
    #volume:                number                = $state(0);

    // Set by constructor.

    /** Describes a bounding box around the Area sound polygon. */
    #areaBounds:            [Vector2D, Vector2D];
    /** The list of Vector2D coordinates describing the Area sound polygon. */
    #areaCoords:            Vector2D[];
    /** A copy of the areaCoords, only used for positioning the Area sound polygon. */
    #originalAreaCoords:    Vector2D[];
    /** The location of the source sound file. */
    #src:                   string;
    /** The sound Type: Local, Area, or Global. */
    #soundType:             SoundType;
    /** The sound timer trigger mode timer. Tracks time in hours, minutes, & seconds. */
    #timer:                 Timer;
    /** The sound Trigger type. */
    #triggerType:           TriggerType;

    /**
     * The CanvasSound constructor.
     * @param options 
     */
    constructor(options:CanvasSoundOptions) {
        // CanvasObject constructor.
        super({ 
            x:          options.x, 
            y:          options.y, 
            name:       options.name ? options.name : "Sound",
            niceName:   options.niceName,
            locked:     options.locked,
            selected:   options.selected,
        });

        // Set up the audio.
        this.#src       = options.src;
        this.niceName   = options.niceName  ? options.niceName  : niceName(this.name);
        this.#soundType = options.soundType ? options.soundType : SoundType.Local;
        this.#muted     = options.muted     ? options.muted     : false;
        this.#solo      = options.solo      ? options.solo      : false;
        this.#timer     = options.timer     ? options.timer     : {
                                                                    setHours: 0,
                                                                    setMinutes: 0,
                                                                    setSeconds: 30,
                                                                    hours: 0,
                                                                    minutes: 0,
                                                                    seconds: 30,
                                                                    active: false
                                                                };

        // Set up nodes.
        this.#gain.gain.value   = options.volume ? options.volume : 1;
        this.#gainListener.gain.value = 1;
        this.#bufferNode.loop   = options.loop   ? options.loop   : true;

        // Set up vars for tracking state.
        this.#volume = this.#gain.gain.value;
        this.#loop   = this.#bufferNode.loop;

        // Set up audio buffer & initialize the buffer node.
        this.setupBuffer().then(() => this.resetBufferNode());
        
        // Set up the Local sound mode.
        this.#localRadius       = options.radius           ? options.radius           : 30;
        this.#localHandleAngle  = options.localHandleAngle ? options.localHandleAngle : 0;

        // Set up the Area sound mode.
        this.#areaCoords         = options.areaCoords ? 
                                   options.areaCoords :
                                   [new Vector2D(this.x, this.y + this.#localRadius), 
                                    new Vector2D(this.x + this.#localRadius, this.y), 
                                    new Vector2D(this.x, this.y - this.#localRadius), 
                                    new Vector2D(this.x - this.#localRadius, this.y)];
        this.#areaBounds         = this.setBounds();
        this.#originalAreaCoords = this.#areaCoords;

        // Set the trigger type.
        this.#triggerType = options.triggerType ? options.triggerType : TriggerType.Manual;

        // debugging
        /*setInterval(() => {
            if (this.currentPositionPct != null)
            console.log(`loop: ${this.#bufferNode.loop}`);
        }, 500);*/
    }



    // ===== SETUP/RESET =====



    /** Load the audio file, create an audio buffer, and create a node to play it back. */
    private async setupBuffer(){
        try {
            const contents = (await readFile(this.#src)).buffer;
            this.#buffer = await getAudioContext().decodeAudioData(contents);
        } catch (err) {
            console.error(err);
        }
    }

    /** Reset the audio buffer node. */
    private resetBufferNode() {
        try {
            // Store the loop state of the previous buffer.
            const loop = this.#bufferNode.loop;

            // Replace the old buffer with a new one.
            this.#bufferNode = new AudioBufferSourceNode(getAudioContext());
            this.#bufferNode.buffer = this.#buffer;
            this.#bufferNode
                .connect(this.#gainListener)
                .connect(this.#gain)
                .connect(getMasterGain());

            // Set the loop state to match the old one.
            this.#bufferNode.loop = loop;
        } catch (err) {
            console.error(err);
        }
    }



    // ===== PLAYBACK CONTROLS =====



    /** 
     * Pause playback, set the pause position, and reset the audio buffer.
     * This is the ONLY way tat should stop playback.
     */
    public pause() {
        // If the track is already paused, bail.
        if (this.#paused) return;

        console.log('pausing!')

        // Stop and reset the buffer node
        this.#paused = true;
        this.#pausePosition = getAudioContext().currentTime - this.#startTime;
        this.#bufferNode.stop();
        this.resetBufferNode();
        clearInterval(this.#loopIntervalID);
    }

    /** 
     * Start playback of the track at the current pause position. 
     * This is the ONLY way tat should start playback.
     */
    public play() {
        // If the track is already playing, bail.
        if (!this.#paused) return;
        // Unpause.
        this.#paused = false;
        // Set start time as if track had played from beginning.
        this.#startTime = getAudioContext().currentTime - this.#pausePosition;
        // Start a timer that tracks if the track has looped.
        this.#loopIntervalID = setInterval(() => {
            const ctxTime = getAudioContext().currentTime;
            if (ctxTime >= this.startTime + this.duration) {
                this.startTime = ctxTime;
                if (!this.#bufferNode.loop)  {
                    this.pause();
                }
            }
        }, 1);

        // Start the track now at the pause position.
        this.#bufferNode.start(getAudioContext().currentTime, this.#pausePosition);
    }

    /** Get the track duration. @returns The duration. */
    public get duration() {return this.#buffer!.duration }

    /** Get the time the track started playing. @returns The start time. */
    public get startTime() { return this.#startTime; }

    /** Set the time the track started playing. @param t The start time. */
    public set startTime(t:number) { this.#startTime = t; }

    /** Seek to a track position by percent of track (0-1). @param [pct=0] The percent. */
    public seekPercent(pct:number = 0) {
        const pos = this.playbackPercentToSeconds(pct);
        if (pos == null) this.#pausePosition = 0;
        else this.#pausePosition = pos;
    }

    /** 
     * Seek to a point in the track from a click on the progress bar. 
     * @param sec The time in seconds to seek to. 
     * @param play Whether or not to play the track. 
     * */
    public seekOnClick(e:MouseEvent) {
        if (e.currentTarget instanceof Element) {
            // Determine percentage by where on the track was clicked.
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.x - rect.left) / (rect.right - rect.left);

            // Convert to seconds.
            let sec = this.playbackPercentToSeconds(pct);
            if (sec == null) sec = 0;

            // If playing, restart playing at new location.
            if (!this.#paused) {
                // Pause if already playing.
                if (!this.#paused) this.pause();

                // Set start time as if track had played from beginning.
                this.#pausePosition = sec;

                // Play the track at the desired position.
                this.play();
                this.#paused = false;
            }
            // If not playing, just move pause position.
            else {
                this.#pausePosition = sec;
            }
        }
    }



    // ===== PLAYBACK POSITION =====



    /** 
     * Get the current playback position as a percentage. 
     * @returns The playback position as a percentage, represented as 0-1. -1 if there is no source. 
     * */
    public get currentPositionPct():number|null {
        if      (!this.#buffer) return null;
        else if (this.#paused)  return this.#pausePosition / this.#buffer.duration;
        else                    return (getAudioContext().currentTime - this.#startTime) / this.#buffer.duration;
    }

    /** 
     * Get the current playback position of the track in seconds. 
     * @returns The playback position in seconds. -1 if there is no source. 
     * */
    public get currentPosition():number|null {
        if      (!this.#buffer) return null;
        else if (this.#paused)  return this.#pausePosition;
        else                    return getAudioContext().currentTime - this.#startTime;
    }

    public playbackPercentToSeconds(pct:number):number|null {
        if (this.#buffer == null) return null;
        // Clamp percent between 0 & 1.
        if (pct > 1) pct = 1;
        if (pct < 0) pct = 0;
        return this.#buffer?.duration * pct;
    }

    


    /** Get the sound volume. @returns The volume. */
    public get volume() { return this.#volume; }

    /** Get if the sound is looped. @returns True: looped. False: not looped. */
    public get loop() { return this.#loop; }

    /** Set if the sound is looped. @param loop True: looped. False: not looped. */
    public set loop(loop:boolean) { 
        // Set the loop tracking value, used for UI and the timer.
        this.#loop = loop;
        // If in timer mode, the actual track will not loop.
        if (this.#triggerType == TriggerType.PlayOnTimer) this.#bufferNode.loop = false;
        // Otherwise it will.
        else this.#bufferNode.loop = loop;
    }

    /** Get if the sound is paused. @returns If the sound is paused. */
    public get paused() { return this.#paused; }

    /** Get the sound emitter radius. @returns The radius. */
    public get triggerType() { return this.#triggerType; }

    /** Set the sound emitter radius. @param r The radius. */
    public set triggerType(t:TriggerType) { this.#triggerType = t; }

    /** Get the sound emitter radius. @returns The radius. */
    public get radius() { return this.#localRadius; }

    /** Set the sound emitter radius. @param r The radius. */
    public set radius(r:number) { this.#localRadius = r; }

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

    /** Get the sound type. @returns The sound type. */
    public get soundType() { return this.#soundType; }

    /** Set the sound type. @param t The sound type. */
    public set soundType(t:SoundType) { this.#soundType = t; }

    /** 
     * Get the bounding box around the Area sound's polygon.
     * @returns A pair of Vector2Ds describing opposite corners of the box.
     */
    public get areaBounds() { return this.#areaBounds; }

    /** 
     * Define a bounding box around the Area sound's polygon.
     * This is set as a pair of Vector2Ds describing opposite corners of the box.
     */
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

    /** Get the current Area polygon handle index. @returns The index. */
    public get areaHandleIndex() { return this.#areaHandleIndex; }

    /** Set the current Area polygon handle index. @param i The index to set. */
    public set areaHandleIndex(i:number) { this.#areaHandleIndex = i; }

    /** Add a vertex at (x, y) to the Area sound polygon at index i.
     * @param x The X coordinate of the vertex.
     * @param y The Y coordinate of the vertex.
     * @param i The index of the vertex, describing where in the polygon it is.
     */
    public addAreaVertex(x:number, y:number, i:number) {
        if (this.#areaCoords.length > i) {
            this.#areaCoords.splice(i, 0, new Vector2D(x,y));
        }
    }

    /** Remove a vertex from an Area sound polygon at an index. @param i The index. */
    public removeAreaVertex(i:number) {
        if (this.#areaCoords.length > i) {
            this.#areaCoords.splice(i, 1);
        }
    }

    /** Get the original coordinates list for an Area sound polygon. @returns The coordinates. */
    public get originalAreaCoords() { return this.#originalAreaCoords; }

    /** Set the original coordinates list for an Area sound polygon. @param coords The coordinates. */
    public set originalAreaCoords(coords:Vector2D[]) { this.#originalAreaCoords = coords; }

    /** Get the audio buffer source node for this sound object. @returns The node. */
    public get track() { return this.#bufferNode; }

    /** Set the audio buffer source node for this sound object. @param t The node. */
    public set track(t:AudioBufferSourceNode) { this.#bufferNode = t; }

    /** Get the gain value for this sound object. @returns the gain value. */
    public get gain() { return this.#gain.gain.value; }

    /** Set the gain value for this sound object (clamped between 0 and 1). @param g The gain value. */
    public set gain(g:number) { 
        if (g<0) g=0;
        else if (g>1) g=1;
        this.#gain.gain.value = g; 
    }
    /** Get the gain node for this sound object. @returns The gain node. */
    public get gainNode() {return this.#gain; }


    /** Get the gain value for this sound object. @returns the gain value. */
    public get gainListener() { return this.#gainListener.gain.value; }

    /** Set the gain value for this sound object (clamped between 0 and 1). @param g The gain value. */
    public set gainListener(g:number) { 
        if (g<0) g=0;
        else if (g>1) g=1;
        this.#gainListener.gain.value = g; 
    }
    /** Get the gain node for this sound object. @returns The gain node. */
    public get gainListenerNode() {return this.#gainListener; }



    // ===== TIMER =====



    /** Get the timer for this sound object. @returns The timer. */
    public get timer() { return this.#timer; }

    /** Get the timer ID for this sound object. @returns The timer ID. */
    public get timerID() { return this.#timerID; }

    /** Set the timer ID for this sound object. @param id The timer ID. */
    public set timerID(id:number) { this.#timerID = id; }

    /** 
     * Set the timer values for this sound object.
     * @param n The value to set (clamped 0-99 for hours, 0-59 for minutes & seconds).
     * @param hms Whether to set hours, minutes, or seconds.
     * */
    public setTimer(n:number, hms:TimerHMS) {
        if (hms == TimerHMS.Hours)   this.timer.setHours = n;
        if (hms == TimerHMS.Minutes) this.timer.setMinutes = n;
        if (hms == TimerHMS.Seconds) this.timer.setSeconds = n;
    }

    /**
     * Change the timer with the mouse wheel.
     * @param e The mouse wheel event.
     * @param hms Whether to set hours, minutes, or seconds.
     */
    public changeTimerWheel(e:WheelEvent, hms:TimerHMS) {
        let delta = e.deltaY;
        if (getUserSettings().invertVolumeScroll) delta *= -1;
        delta = delta < 0 ? -1 : 1;
        if (hms == TimerHMS.Hours) {
            this.#timer.setHours += delta;
            if (this.#timer.setHours < 0) this.#timer.setHours = 0;
            else if (this.#timer.setHours > 99) this.#timer.setHours = 99;
            this.#timer.hours = this.#timer.setHours;
        } else if (hms == TimerHMS.Minutes) {
            this.#timer.setMinutes += delta;
            if (this.#timer.setMinutes < 0) this.#timer.setMinutes = 0;
            else if (this.#timer.setMinutes > 59) this.#timer.setMinutes = 59;
            this.#timer.minutes = this.#timer.setMinutes;
        } else if (hms == TimerHMS.Seconds) {
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

    /** Start the timer. @returns The Timer ID. */
    public startTimer():number{
        this.#timer.hours   = this.#timer.setHours;
        this.#timer.minutes = this.#timer.setMinutes;
        this.#timer.seconds = this.#timer.setSeconds;
        this.#timer.active  = true;
        return setInterval(()=>this.runTimer(),1000);
    }

    /** Stop the timer. @param id The ID of the timer to stop. */
    public stopTimer(id:number){
        clearInterval(id);
        this.#timer.active  = false;
        this.#timer.hours   = this.#timer.setHours;
        this.#timer.minutes = this.#timer.setMinutes;
        this.#timer.seconds = this.#timer.setSeconds;
    }

    /** Run the timer. Called once every second when the timer is active. */
    private runTimer(){
        // If at 1s, count down to 0 and play the sound.
        if (this.timer.hours == 0 && this.timer.minutes == 0 && this.timer.seconds == 1) {
            this.timer.seconds--;
            this.pause();
            this.#pausePosition = 0
            this.play();

            // Stop the timer.
            this.stopTimer(this.timerID);

            // If looping is on, start the timer again!
            if (this.loop) this.timerID = this.startTimer();
            return;
        }
        // Seconds is over 0: decrement seconds.
        if (this.timer.seconds > 0) { 
            this.timer.seconds--;
            return;
        }
        // Roll over seconds.
        if (this.timer.seconds == 0) {
            if (this.timer.minutes > 0) {
                this.timer.minutes--;
                this.timer.seconds = 59;
                return;
            }
            // Roll over minutes.
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



    // ===== VOLUME CONTROLS =====



    /** Change the volume with the mouse wheel. @param e The mouse wheel event. */
    public changeVolumeWheel(e:WheelEvent) {
        let delta = e.deltaY;
        
        // invert based on user settings.
        if (getUserSettings().invertVolumeScroll) delta *= -1;
        
        delta = delta < 0 ? -0.01 : 0.01;
        delta *= getUserSettings().uiScrollSensitivity;

        // adjust and clamp volume.
        this.gainNode.gain.value += delta;
        if (this.gainNode.gain.value < 0) this.gainNode.gain.value = 0;
        else if (this.gainNode.gain.value > 1) this.gainNode.gain.value = 1;
        this.#volume = this.gainNode.gain.value;
    }

    /** Change the volume with a mouse click. @param e The mouse event. */
    public changeVolumeClick(e:MouseEvent) {
        if (e.currentTarget instanceof Element) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (rect.bottom - e.y) / (rect.bottom - rect.top);
            this.gainNode.gain.value = pct;
            if (this.gainNode.gain.value < 0) this.gainNode.gain.value = 0;
            else if (this.gainNode.gain.value > 1) this.gainNode.gain.value = 1;
            this.#volume = this.gainNode.gain.value;
            }
    }



    // ===== SOUND TYPES =====



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



    // ===== SOUND TRIGGERS =====



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
                if (!this.paused) this.pause(); 
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
                if (this.paused) this.play();
            } else if (this.triggerType == TriggerType.PlayInside) { 
                this.triggerType = TriggerType.RestartInside; 
                this.loop = true; 
                this.seekPercent(0);
                if (this.paused) this.play();
            } else if (this.triggerType == TriggerType.RestartInside) {
                this.triggerType = TriggerType.PlayOnTimer;
                if (!this.paused) this.pause();
                this.#bufferNode.loop = false; // Only unloop the node.
            } else if (this.triggerType == TriggerType.PlayOnTimer) { 
                this.triggerType = TriggerType.Manual; 
                this.#bufferNode.loop = this.#loop; // Reset the node to match the visible loop state.
            }
        } 

        // Local or Area sound, listener not colliding:
        // PlayOnLoad -> PlayOnEnter -> ReplayOnEnter -> PlayInside -> ReplayInside -> PlayOnTimer -> back
        else {
            if (this.triggerType == TriggerType.Manual) {
                this.triggerType = TriggerType.PlayOnEnter;
                if (!this.paused) this.pause();
            } else if (this.triggerType == TriggerType.PlayOnEnter) { 
                this.triggerType = TriggerType.RestartOnEnter; 
                if (!this.paused) this.pause();
            } else if (this.triggerType == TriggerType.RestartOnEnter) { 
                this.triggerType = TriggerType.PlayInside;
                this.loop = true; 
                if (!this.paused) this.pause();
            } else if (this.triggerType == TriggerType.PlayInside) { 
                this.triggerType = TriggerType.RestartInside;
                this.loop = true;
                if (!this.paused) this.pause();
            } else if (this.triggerType == TriggerType.RestartInside) { 
                this.triggerType = TriggerType.PlayOnTimer;
                if (!this.paused) this.pause();
                this.#bufferNode.loop = false; // Only unloop the node.
            } else if (this.triggerType == TriggerType.PlayOnTimer) { 
                this.triggerType = TriggerType.Manual; 
                this.#bufferNode.loop = this.#loop; // Reset the node to match the visible loop state.
            }
        }
    }
}
