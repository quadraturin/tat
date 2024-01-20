import type L from 'leaflet';
import type * as P from 'pizzicato';

// class that defines an audio emitter
export class MapSound
{
    src:string;
    sound:P.Sound;
    emitter:L.Circle|L.Polygon|undefined;
    soundType:string;
    volume:number;
    muted:boolean;
    solo:boolean;
    order:number;    
    
    constructor(src:string, sound:P.Sound, soundType:string, emitter:L.Circle|L.Polygon|undefined, volume:number, muted:boolean, solo:boolean, order:number)
    {
        this.src = src;
        this.sound = sound;
        this.soundType = soundType;
        this.emitter = emitter;
        this.volume = volume;
        this.muted = muted;
        this.solo = solo;
        this.order = order;
    }
}