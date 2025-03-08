/**
 * map image options.
 */
export type canvasSoundOptions = {
    src:string, 
    name:string,
    x:number,
    y:number,
    radius:number,
    //sound:H.Howl, 
    //emitter:L.Circle|L.Polygon|undefined, 
    soundType:string, 
    volume:number, 
    muted:boolean, 
    solo:boolean, 
    order:number,
    niceName:string
    editEnabled:boolean,
    selected:boolean,
    locked:boolean,
    lat?:number, // deprecated
    lng?:number  // deprecated
}

/**
 * canvas image class.
 */
export class CanvasSound {
    src:string;
    name:string;
    x:number = $state(0);
    y:number = $state(0);
    radius:number = $state(0);
    //sound:H.Howl|undefined = $state();
    //emitter:L.Circle|L.Polygon|undefined = $state();
    soundType:string = $state("");
    volume:number = $state(0);
    muted:boolean = $state(false);
    solo:boolean = $state(false);
    order:number = $state(1); 
    niceName:string = $state("");
    editEnabled:boolean = $state(true);
    selected:boolean = $state(false);
    locked:boolean = $state(false);

    constructor(options:canvasSoundOptions) {
        this.src = options.src;
        this.x = options.x;
        this.y = options.y;
        this.radius = options.radius;
        //this.sound = options.sound;
        //this.emitter = options.emitter;
        this.name = options.name;
        this.niceName = options.niceName;
        this.soundType = options.soundType;
        this.volume = options.volume;
        this.muted = options.muted;
        this.solo = options.solo;
        this.order = options.order;
        this.name = options.name;
        this.niceName = options.niceName;
        this.order = options.order;
        this.editEnabled = options.editEnabled;
        this.selected = options.selected;
        this.locked = options.locked;
    }
}
