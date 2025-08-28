export class Vector2D {
    x:number;
    y:number;
    constructor(x:number, y:number) {
        this.x = x;
        this.y = y;
    }
    magnitude(){
        return Math.sqrt(this.x**2 + this.y**2);
    }
}