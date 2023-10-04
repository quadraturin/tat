import type { Howl } from 'howler';
import type L from 'leaflet';

// class that defines an audio emitter
export class MapSound
{
    data:File;
    circle:L.Circle;
    sound:Howl;
    
    constructor(data:File, sound:Howl, circle:L.Circle)
    {
        this.data = data;
        this.sound = sound;
        this.circle = circle;
    }
}