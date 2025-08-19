import * as R from "$lib/registry.svelte";
import type { CanvasImage } from "./classes/CanvasImage.svelte";

export function canvasClick(e:MouseEvent) {
    const l = R.getListener();
    const c = R.getCanvas();

    // Drag Listener
    if (pointCircleCollision(c.toWorldX(e.x), 
                             c.toWorldY(e.y), 
                             l.getX(), 
                             l.getY(), 
                             c.toWorldLength(R.getListenerRadius()))){
        dragListener();
    } else if (false) {
        // placeholder for audio emitters
    } else {
        for (let i = 0; i < R.getImages().length; i++) {
            const img = R.getImages()[i];
            if (!img.getLocked() &&
                pointRectCollision(c.toWorldX(e.x), 
                                   c.toWorldY(e.y), 
                                   img.getX(), 
                                   img.getY(), 
                                   img.getWidth(), 
                                   img.getHeight())) {
                dragImage(img);
            }
        }
    } 
    
    if (!R.getDragging()){
        R.startPanning(e.clientX, e.clientY);
    }
}

function pointCircleCollision(pX:number, pY:number, cX:number, cY:number, cR:number):boolean {
    if (Math.sqrt((pX-cX)**2 + (pY-cY)**2) <= cR) return true; 
    else return false;
}

function pointRectCollision(pX:number, pY:number, rX:number, rY:number, rW:number, rH:number):boolean {
    console.log("px", pX, "py", pY, "rx", rX, "ry", rY, "rw", rW, "rh", rH);
    if (pX >= rX && 
        pY >=rY && 
        pX <= rX + rW && 
        pY <= rY + rH) { 
        return true; 
    } else return false;
}

function dragListener() {
    R.getListener().setGrabbed(true);
    R.setDragging(true);
}

function dragImage(img:CanvasImage) {
    img.setGrabbed(true);
    R.setDragging(true);
}