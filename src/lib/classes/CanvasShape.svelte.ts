import { CanvasObject } from "./CanvasObject.svelte";
import { getCanvas, getHandleSize, getHandleSlop, ShapeType } from "$lib/registry.svelte";
import { Vector2D } from "$lib/util.vectors";

export type Timer = {
    setHours: number;
    setMinutes: number;
    setSeconds: number;
    hours: number;
    minutes: number;
    seconds: number;
    active: boolean;
}

/** Canvas Sound options. */
export type CanvasShapeOptions = {
    locked:           boolean,
    name:               string,
    niceName:           string,
    selected:           boolean,
    shapeType:          ShapeType,

    areaCoords:         Vector2D[],

    circleX:            number,
    circleY:            number,
    circleRadius:       number,

    rectX:              number,
    rectY:              number,
    rectWidth:          number,
    rectHeight:         number,

    lineCoords:         Vector2D[],

    textX:              number,
    textY:              number,
    text:               string
}

/**
 * The Canvas Shape class.
 * @extends CanvasObject
 */
export class CanvasShape extends CanvasObject{
    #areaBounds:            [Vector2D,Vector2D];
    #areaCoords:            Vector2D[];
    #areaHandleIndex:       number;
    #originalAreaCoords:    Vector2D[];
    #shapeType:             ShapeType;

    constructor(options:CanvasShapeOptions) {
        super({ 
            x:options.circleX, 
            y:options.circleY, 
            name:options.name,
            niceName:options.niceName,
            locked:options.locked,
            selected:options.selected,
        });
        this.#areaCoords = options.areaCoords;
        this.#areaBounds = this.setBounds();
        this.#areaHandleIndex = 0;
        this.#originalAreaCoords = options.areaCoords;
        this.#shapeType = options.shapeType;
    }

    /** Get the coordinates of the area sound. @returns The coords. */
    public get areaCoords() { return this.#areaCoords; }

    /** Set the coordinates of the area sound. @param c The coords. */
    public set areaCoords(c:Vector2D[]) { this.areaCoords = c; }

    /** Get the area shape bounding box. @returns The bounding box min and max coordinates. */
    public get areaBounds() { return this.#areaBounds; }

    /** Set the bounding box for the area shape. @returns The bounding box min and max coordinates. */
    public setBounds() {
        const c = this.#areaCoords;
        let min:Vector2D = new Vector2D(c[0].x, c[0].y);
        let max:Vector2D = new Vector2D(c[0].x, c[0].y);
        
        for (let i = 1; i < c.length; i++) {
            if (min.x > c[i].x) min.x = c[i].x;
            if (min.y > c[i].y) min.y = c[i].y;
            if (max.x < c[i].x) max.x = c[i].x;
            if (max.y < c[i].y) max.y = c[i].y;
        }
        min.x -= getCanvas().toWorldLength(getHandleSize()*2 + getHandleSlop());
        min.y -= getCanvas().toWorldLength(getHandleSize()*2 + getHandleSlop());
        max.x += getCanvas().toWorldLength(getHandleSize()*2 + getHandleSlop());
        max.y += getCanvas().toWorldLength(getHandleSize()*2 + getHandleSlop());
        return this.#areaBounds = [min, max];
    }

    /** Get the index of the current area handle. @returns The index. */
    public get areaHandleIndex() { return this.#areaHandleIndex; }

    /** Set the index of the current area handle. @param i The index. */
    public set areaHandleIndex(i:number) { this.#areaHandleIndex = i; }

    /** 
     * Add a vertex to the area shape.
     * @param x The X position of the vertex.
     * @param y The Y position of the vertex.
     * @param i The index to insert the vertex.
     */
    public addAreaVertex(x:number, y:number, i:number) {
        if (this.#areaCoords.length > i) {
            this.#areaCoords.splice(i, 0, new Vector2D(x,y));
        }
    }

    /** Remove a vertex from the area shape. @param i The index of the vertex to remove. */
    public removeAreaVertex(i:number) {
        if (this.#areaCoords.length > i) {
            this.#areaCoords.splice(i, 1);
        }
    }

    /** Get the original area coordinates list. @returns The coordinate list. */
    public get originalAreaCoords() { return this.#originalAreaCoords; }

    /** Set the original area coordinates list. @param coords The coordinate list. */
    public set originalAreaCoords(coords:Vector2D[]) { this.#originalAreaCoords = coords; }

    /** Get the shape type. @returns The shape type. */
    public get shapeType() { return this.#shapeType; }

    /** Set the shape type. @param t The shape type. */
    public set shapeType(t:ShapeType) { this.#shapeType = t; }
}
