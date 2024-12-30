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
    order:number,
    niceName:string
}

/**
 * map sound class.
 */
export class MapSound
{
    src:string;
    name:string;
    sound:H.Howl|undefined = $state();
    emitter:L.Circle|L.Polygon|undefined = $state();
    soundType:string = $state("");
    volume:number = $state(0);
    muted:boolean = $state(false);
    solo:boolean = $state(false);
    order:number = $state(1); 
    niceName:string = $state("");
    
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
        this.niceName = options.niceName;
    }
}
