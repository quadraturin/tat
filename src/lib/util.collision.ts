import type { Vector2D } from "./util.vectors";

/** 
 * Determine if a point is colliding with a circle.
 * @param pX Point X position.
 * @param pY Point Y position.
 * @param cX Circle X position.
 * @param cY Circle Y position.
 * @param cR Circle radius.
 * @returns True: collision. False: no collision.
 */
export function pointCircleCollision(pX:number, pY:number, cX:number, cY:number, cR:number):boolean {
    if (Math.sqrt((pX-cX)**2 + (pY-cY)**2) <= cR) return true; 
    else return false;
}

/** 
 * Determine if a point is colliding with a rectangle.
 * @param pX Point X position.
 * @param pY Point Y position.
 * @param rX Rectangle X position.
 * @param rY Rectangle Y position.
 * @param rW Rectangle width.
 * @param rH Rectangle height.
 * @returns True: collision. False: no collision.
 */
export function pointRectCollision(pX:number, pY:number, rX:number, rY:number, rW:number, rH:number):boolean {
    if (pX >= rX && pY >= rY && pX <= rX + rW && pY <= rY + rH) return true; 
    else return false;
}

/**
 * Determine if a point is colliding with a polygon.
 * @param pX Point X position.
 * @param pY Point Y position.
 * @param c List of Vector2D coordinates.
 * @returns True: collision. False: no collision.
 */
export function pointPolyCollision(pX:number, pY:number, c:Vector2D[]):boolean {
    let collision = false;
    for (let i = 0; i < c.length; i++) {
        let next = i + 1;
        if (next == c.length) next = 0;
        
        const vC = c[i];
        const vN = c[next];

        if (((vC.y > pY) != (vN.y > pY)) // (point is below the vertex) != (point is above the next vertex) -> only true if between
            && 
            (pX < (vN.x - vC.x) * (pY - vC.y) / (vN.y - vC.y) + vC.x) ) { // Jordan curve theorem: horizontal ray
            collision = !collision;
        }
    }
    return collision;
}
