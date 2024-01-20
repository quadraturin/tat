import type L from 'leaflet';
import type * as Tone from 'tone';

// class that defines an audio emitter
export class MapSound
{
    src:string;
    sound:Tone.Player;
    emitter:L.Circle|L.Polygon|undefined;
    soundType:string;
    volume:number;
    muted:boolean;
    solo:boolean;
    order:number; 
    startTime:number;   
    
    constructor(src:string, sound:Tone.Player, soundType:string, emitter:L.Circle|L.Polygon|undefined, startTime:number, volume:number, muted:boolean, solo:boolean, order:number)
    {
        this.src = src;
        this.sound = sound;
        this.soundType = soundType;
        this.emitter = emitter;
        this.volume = volume;
        this.muted = muted;
        this.solo = solo;
        this.order = order;
        this.startTime = startTime;
    }
}