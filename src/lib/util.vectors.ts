/** 2-dimensional vector with X, Y, and magnitude. */
export class Vector2D {
    x:number;
    y:number;
    constructor(x:number, y:number) {
        this.x = x;
        this.y = y;
    }
    /** Get the magnitude of the vector. @returns The magnitude of the vector. */
    get magnitude(){ return Math.sqrt(this.x**2 + this.y**2); }
}