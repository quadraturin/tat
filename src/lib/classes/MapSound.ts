import { SOUNDTYPE_LOCAL } from '$lib/settings';
import type { Howl } from 'howler';
import type L from 'leaflet';

// class that defines an audio emitter
export class MapSound
{
    data:File;
    emitter:L.Circle|L.Polygon|undefined;
    sound:Howl;
    muted:boolean;
    solo:boolean;
    volume:number;
    soundType:string;
    order:number;
    
    constructor(data:File, sound:Howl, emitter:L.Circle|L.Polygon|undefined, volume?:number, muted?:boolean, solo?:boolean, soundType?:string, order?:number)
    {
        this.data = data;
        this.sound = sound;
        this.emitter = emitter;

        if (typeof muted == "undefined")this.muted = false;
        else this.muted = muted;

        if (typeof solo == "undefined") this.solo = false;
        else this.solo = solo;

        if (typeof volume == "undefined") this.volume = 1;
        else this.volume = volume;

        if (typeof soundType == "undefined") this.soundType = SOUNDTYPE_LOCAL;
        else this.soundType = soundType;

        if (typeof order == "undefined")this.order = 1;
        else this.order = order;
    }
}