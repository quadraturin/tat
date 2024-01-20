import type L from 'leaflet';
import type * as H from 'howler';

/**
 * type definition for map sound options
 */
type mapSoundOptions = {
    src:string, 
    name:string,
    sound:H.Howl, 
    soundType:string, 
    emitter:L.Circle|L.Polygon|undefined, 
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
    sound:H.Howl;
    emitter:L.Circle|L.Polygon|undefined;
    soundType:string;
    volume:number;
    muted:boolean;
    solo:boolean;
    order:number; 
    
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
        this.name = options.name;
    }
}