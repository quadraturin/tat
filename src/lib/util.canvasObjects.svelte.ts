import * as R from "$lib/registry.svelte";
import { CanvasImage } from "./classes/CanvasImage.svelte";
import { CanvasListener } from "./classes/CanvasListener.svelte";
import { CanvasObject } from "./classes/CanvasObject.svelte";

/**
 * Handle a double click on the canvas.
 * Toggle the editablilty of an item under the cursor.
 * @param e Mouse double click event.
 */
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
        for (let i = R.getImages().length - 1; i >= 0; i--) {
            const img = R.getImages()[i];
            if (!img.getLocked() &&
                pointRectCollision(c.toWorldX(e.x), 
                                   c.toWorldY(e.y), 
                                   img.getX(), 
                                   img.getY(), 
                                   img.getWidth(), 
                                   img.getHeight())) {
                img.setEditable();
                break;
            }
        }
    } 
}

/**
 * Handle mouse wheel scrolling on the canvas.
 * Zoom in and out.
 * @param e Mouse wheel event.
 */
export function canvasWheel(e:WheelEvent) {
    if (e.deltaY < 0){
        R.getCanvas().zoom(1.01, e.clientX, e.clientY);
    } else if (e.deltaY > 0) {
        R.getCanvas().zoom(0.99, e.clientX, e.clientY);
    }
}

/**
 * Handle a mouse down event on the canvas. 
 * If an editable draggable object under the mouse, set clicked on canvas object, & start panning if not.
 * @param e Mouse down event.
 */
export function canvasMouseDown(e:MouseEvent) {
    const l = R.getListener();
    const c = R.getCanvas();

    R.setMouseDown(true);

    // Reset clicked on draggable state
    R.setClickedOnCanvasObject(false);

    // Get listener if under cursor
    if (l.getEditable() &&
        pointCircleCollision(c.toWorldX(e.x), 
                             c.toWorldY(e.y), 
                             l.getX(), 
                             l.getY(), 
                             c.toWorldLength(R.getListenerRadius()))){
        R.setClickedOnCanvasObject(l);
        l.setGrabbed(true, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
    } 
    // Get first image under cursor (last in list)
    else {
        for (let i = R.getImages().length - 1; i >= 0; i--) {
            const img = R.getImages()[i];
            if (pointRectCollision(c.toWorldX(e.x), 
                                   c.toWorldY(e.y), 
                                   img.getX(), 
                                   img.getY(), 
                                   img.getWidth(), 
                                   img.getHeight())) {
                if(img.getEditable()) {
                    R.setClickedOnCanvasObject(img);
                    img.setGrabbed(true, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
                    R.getImages().push(R.getImages().splice(i, 1)[0]);
                }
                break;
            }
        }
    }
    // If object clicked was selected, grab all selected objects
    const clicked = R.getClickedOnCanvasObject();
    if (clicked instanceof CanvasObject && clicked.getSelected()) {
        if (l.getSelected() && l.getEditable()) {
            l.setGrabbed(true, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
        }
        for (let i = R.getImages().length - 1; i >= 0; i--) {
            const img = R.getImages()[i];
            if (img.getSelected() && img.getEditable()){ 
                img.setGrabbed(true, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
            }
        }
    }
}

/**
 * Handle a mouse move event on the canvas.
 * Pan or drag or do nothing.
 * @param e Mouse move event.
 */
export function canvasMouseMove(e:MouseEvent) {
    const l = R.getListener();
    const c = R.getCanvas();

    if(R.getMouseDown()) {
        const obj = R.getClickedOnCanvasObject();
        // Clicked on a valid object.
        if (obj instanceof CanvasObject) {
            // Drag listener
            if (l.getGrabbed()){
                l.setX(c.toWorldX(e.clientX) + l.getGrabOffsetX());
                l.setY(c.toWorldY(e.clientY) + l.getGrabOffsetY());
                R.setDragging(true);
            }
            // Drag image(s)
            for (let i = 0; i < R.getImages().length; i++) {
                const img = R.getImages()[i];
                if (img.getGrabbed()) {
                    img.setX(c.toWorldX(e.clientX) + img.getGrabOffsetX());
                    img.setY(c.toWorldY(e.clientY) + img.getGrabOffsetY());
                    R.setDragging(true);
                }
            }
        }
        // If not valid object clicked and not already panning, start panning.
        else if (!R.getPanning()){ 
            R.startPanning(e.clientX, e.clientY);
        }

        // Pan
        if (R.getPanning()) {
            c.pan(R.getPanLastX(), R.getPanLastY(), e.clientX, e.clientY);
            R.setPanLastX(e.clientX);
            R.setPanLastY(e.clientY);
        } 
    }
}

/**
 * Handle a mouse up event on the canvas.
 * Unset clicked on canvas object, toggle selection.
 * @param e Mouse up event.
 */
export function canvasMouseUp(e:MouseEvent) {
    const l = R.getListener();
    const c = R.getCanvas();

    R.setMouseDown(false);

    // Release the listener
    if (l.getGrabbed()) {
        l.setGrabbed(false);
    }

    // Release any images
    for (let i = 0; i < R.getImages().length; i++) {
        const img = R.getImages()[i];
        if (img.getGrabbed()) img.setGrabbed(false);
    }

    // Unset clicked on canvas object
    R.setClickedOnCanvasObject(false);

    // Stop panning
    if (R.getPanning()) R.stopPanning();

    // If there was a clicked object but it was not dragged, toggle selection 
    if(!R.getDragging()) {
        // Select listener toggle
        if (l.getEditable() &&
            pointCircleCollision(c.toWorldX(e.x), 
                                c.toWorldY(e.y), 
                                l.getX(), 
                                l.getY(), 
                                c.toWorldLength(R.getListenerRadius()))){
            l.setSelected();
        }

        // Select image toggle
        else {
            for (let i = R.getImages().length - 1; i >= 0; i--) {
                const img = R.getImages()[i];
                if (!img.getLocked() &&
                    pointRectCollision(c.toWorldX(e.x), 
                                    c.toWorldY(e.y), 
                                    img.getX(), 
                                    img.getY(), 
                                    img.getWidth(), 
                                    img.getHeight())) {
                    img.setSelected();
                    break;
                }
            }
        } 
    }
    R.setDragging(false);
}

function pointCircleCollision(pX:number, pY:number, cX:number, cY:number, cR:number):boolean {
    if (Math.sqrt((pX-cX)**2 + (pY-cY)**2) <= cR) return true; 
    else return false;
}

function pointRectCollision(pX:number, pY:number, rX:number, rY:number, rW:number, rH:number):boolean {
    if (pX >= rX && 
        pY >= rY && 
        pX <= rX + rW && 
        pY <= rY + rH) { 
        return true; 
    } else return false;
}
