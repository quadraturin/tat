// class that defines a particular map 
export class MapInfo 
{
    name = "untitled";
    data:Uint8Array;
    width:number;
    height:number;

    constructor(data:Uint8Array, width:number, height:number)
    {
        this.data = data;
        this.width = width;
        this.height = height;
    }
}