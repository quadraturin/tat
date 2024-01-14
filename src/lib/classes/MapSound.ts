import type { Howl } from 'howler';
import type L from 'leaflet';

// class that defines an audio emitter
export class MapSound
{
    data:File;
    circle:L.Circle;
    sound:Howl;
    muted:boolean;
    solo:boolean;
    volume:number;
    
    constructor(data:File, sound:Howl, circle:L.Circle, muted?:boolean, solo?:boolean, volume?:number)
    {
        this.data = data;
        this.sound = sound;
        this.circle = circle;
        if (typeof muted == "undefined") {
            this.muted = false;
        } else {
            this.muted = muted;
        }
        if (typeof solo == "undefined") {
            this.solo = false;
        } else {
            this.solo = solo;
        }
        if (typeof volume == "undefined") {
            this.volume = 1;
        } else {
            this.volume = volume;
        }
    }
}