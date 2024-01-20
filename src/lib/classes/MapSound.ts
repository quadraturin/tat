import type L from 'leaflet';
import type * as Tone from 'tone';

/**
 * type definition for map sound options
 */
type mapSoundOptions = {
    src:string, 
    name:string,
    sound:Tone.Player, 
    soundType:string, 
    emitter:L.Circle|L.Polygon|undefined, 
    startTime:number, 
    volume:number, 
    muted:boolean, 
    solo:boolean, 
    order:number
}

/**
 * map sound class.
 */
export class MapSound
{
    src:string;
    name:string;
    sound:Tone.Player;
    emitter:L.Circle|L.Polygon|undefined;
    soundType:string;
    volume:number;
    muted:boolean;
    solo:boolean;
    order:number; 
    startTime:number;
    
    constructor(options:mapSoundOptions)
    {
        this.src = options.src;
        this.sound = options.sound;
        this.soundType = options.soundType;
        this.emitter = options.emitter;
        this.volume = options.volume;
        this.muted = options.muted;
        this.solo = options.solo;
        this.order = options.order;
        this.startTime = options.startTime;
        this.name = options.name;
    }
}