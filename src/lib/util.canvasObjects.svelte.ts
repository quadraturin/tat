import * as R from "$lib/registry.svelte";
import type { CanvasImage } from "./classes/CanvasImage.svelte";

export function canvasClick(e:MouseEvent) {
    const l = R.getListener();
    const c = R.getCanvas();

    if (pointCircleCollision(c.toWorldX(e.x), 
                             c.toWorldY(e.y), 
                             l.getX(), 
                             l.getY(), 
                             c.toWorldLength(R.getListenerRadius()))){
        l.setSelected();
    } 
    // Select image
    else {
        for (let i = 0; i < R.getImages().length; i++) {
            const img = R.getImages()[i];
            if (!img.getLocked() &&
                pointRectCollision(c.toWorldX(e.x), 
                                   c.toWorldY(e.y), 
                                   img.getX(), 
                                   img.getY(), 
                                   img.getWidth(), 
                                   img.getHeight())) {
                img.setSelected();
            }
        }
    } 
}


export function canvasDblClick(e:MouseEvent) {
    const l = R.getListener();
    const c = R.getCanvas();

    if (pointCircleCollision(c.toWorldX(e.x), 
                             c.toWorldY(e.y), 
                             l.getX(), 
                             l.getY(), 
                             c.toWorldLength(R.getListenerRadius()))){
        l.setEditable();
    } 
    // Select image
    else {
        for (let i = 0; i < R.getImages().length; i++) {
            const img = R.getImages()[i];
            if (!img.getLocked() &&
                pointRectCollision(c.toWorldX(e.x), 
                                   c.toWorldY(e.y), 
                                   img.getX(), 
                                   img.getY(), 
                                   img.getWidth(), 
                                   img.getHeight())) {
                img.setEditable();
            }
        }
    } 
}

export function canvasMouseDown(e:MouseEvent) {
    const l = R.getListener();
    const c = R.getCanvas();

    // Drag Listener
    if (l.getEditable() &&
        pointCircleCollision(c.toWorldX(e.x), 
                             c.toWorldY(e.y), 
                             l.getX(), 
                             l.getY(), 
                             c.toWorldLength(R.getListenerRadius()))){
        dragListener();
    } 
    // Drag image(s)
    else {
        for (let i = 0; i < R.getImages().length; i++) {
            const img = R.getImages()[i];
            if (img.getEditable() &&
                !img.getLocked() &&
                pointRectCollision(c.toWorldX(e.x), 
                                   c.toWorldY(e.y), 
                                   img.getX(), 
                                   img.getY(), 
                                   img.getWidth(), 
                                   img.getHeight())) {
                dragImage(img, e);
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
        pY >= rY && 
        pX <= rX + rW && 
        pY <= rY + rH) { 
        return true; 
    } else return false;
}

function dragListener() {
    R.getListener().setGrabbed(true);
    R.setDragging(true);
}

function dragImage(img:CanvasImage, e:MouseEvent) {
    const c = R.getCanvas();
    img.setGrabbed(true, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
    R.setDragging(true);
}