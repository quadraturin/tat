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
    R.setMouseDownX(c.toWorldX(e.x));
    R.setMouseDownY(c.toWorldY(e.y));

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
        // Cycle thru images from end to beginning of array (top to bottom visually)
        for (let i = R.getImages().length - 1; i >= 0; i--) {
            const img = R.getImages()[i];
            // Check if the image was clicked
            if (pointRectCollision(c.toWorldX(e.x), c.toWorldY(e.y), 
                                   img.getX(),      img.getY(), 
                                   img.getWidth(),  img.getHeight())) {
                // Only proceed if the image is editable
                if(img.getEditable()) {
                    R.setClickedOnCanvasObject(img);
                    R.setOriginalH(img.getHeight());
                    R.setOriginalW(img.getWidth());
                    R.setOriginalX(img.getX());
                    R.setOriginalY(img.getY());
                    // Check if the NW resize handle was clicked.
                    if (pointRectCollision( c.toWorldX(e.x), c.toWorldY(e.y), 
                                            img.getX(), 
                                            img.getY(),
                                            c.toWorldLength(R.getHandleSize()), 
                                            c.toWorldLength(R.getHandleSize()) )) {
                        R.setGrabbedCorner(R.Corner.NW);
                        img.setGrabbed(false, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
                    }
                    else if (pointRectCollision(c.toWorldX(e.x), c.toWorldY(e.y), 
                                                img.getX() + img.getWidth() - c.toWorldLength(R.getHandleSize()), 
                                                img.getY(),
                                                c.toWorldLength(R.getHandleSize()), 
                                                c.toWorldLength(R.getHandleSize()) )) {
                        console.log("grabbed NE handle of image");
                        R.setGrabbedCorner(R.Corner.NE);
                        img.setGrabbed(false, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
                    }
                    else if (pointRectCollision(c.toWorldX(e.x), c.toWorldY(e.y), 
                                                img.getX(), 
                                                img.getY() + img.getHeight() - c.toWorldLength(R.getHandleSize()),
                                                c.toWorldLength(R.getHandleSize()), 
                                                c.toWorldLength(R.getHandleSize()) )) {
                        console.log("grabbed SW handle of image");
                        R.setGrabbedCorner(R.Corner.SW);
                        img.setGrabbed(false, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
                    }
                    else if (pointRectCollision(c.toWorldX(e.x), c.toWorldY(e.y), 
                                                img.getX() + img.getWidth() - c.toWorldLength(R.getHandleSize()), 
                                                img.getY() + img.getHeight() - c.toWorldLength(R.getHandleSize()),
                                                c.toWorldLength(R.getHandleSize()), 
                                                c.toWorldLength(R.getHandleSize()) )) {
                        console.log("grabbed SE handle of image");
                        R.setGrabbedCorner(R.Corner.SE);
                        img.setGrabbed(false, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
                    }
                    // If no handle was clicked, grab the image.
                    else {
                        img.setGrabbed(true, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
                        R.getImages().push(R.getImages().splice(i, 1)[0]);
                    }
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
            // If an image corner was grabbed, resize the image.
            if (R.getGrabbedCorner() != R.Corner.None && obj instanceof CanvasImage) {
/*
                // Swap corners if going past image origin point or image width
                // SE corner crossing X -> SW corner
                if (c.toWorldX(e.x) < obj.getX() && R.getGrabbedCorner() == R.Corner.SE) {
                    R.setGrabbedCorner(R.Corner.SW);
                    R.setMouseDownX(c.toWorldX(e.x));
                    R.setMouseDownY(c.toWorldY(e.y));
                    R.setOriginalH(obj.getHeight());
                    R.setOriginalW(obj.getWidth());
                }
                // SE corner crossing Y -> NE corner
                else if (c.toWorldY(e.y) < obj.getY() && R.getGrabbedCorner() == R.Corner.SE) {
                    R.setGrabbedCorner(R.Corner.NE);
                    R.setMouseDownX(c.toWorldX(e.x));
                    R.setMouseDownY(c.toWorldY(e.y));
                    R.setOriginalH(obj.getHeight());
                    R.setOriginalW(obj.getWidth());
                }
                // NE or SW corner crossing X or Y -> NW corner
                else if (c.toWorldX(e.x) < obj.getX() && R.getGrabbedCorner() == R.Corner.NE || 
                         c.toWorldY(e.y) < obj.getY() && R.getGrabbedCorner() == R.Corner.SW) {
                    R.setGrabbedCorner(R.Corner.NW);
                    R.setMouseDownX(c.toWorldX(e.x));
                    R.setMouseDownY(c.toWorldY(e.y));
                    R.setOriginalH(obj.getHeight());
                    R.setOriginalW(obj.getWidth());
                }
                // NW corner crossing X+W -> NE corner
                else if (c.toWorldX(e.x) > obj.getX() + obj.getWidth() && R.getGrabbedCorner() == R.Corner.NW) {
                    R.setGrabbedCorner(R.Corner.NE);
                    R.setMouseDownX(c.toWorldX(e.x));
                    R.setMouseDownY(c.toWorldY(e.y));
                    R.setOriginalH(obj.getHeight());
                    R.setOriginalW(obj.getWidth());
                }
                // NW corner crossing Y+H -> SW corner
                else if (c.toWorldY(e.y) > obj.getY() + obj.getHeight() && R.getGrabbedCorner() == R.Corner.NW) {
                    R.setGrabbedCorner(R.Corner.SW);
                    R.setMouseDownX(c.toWorldX(e.x));
                    R.setMouseDownY(c.toWorldY(e.y));
                    R.setOriginalH(obj.getHeight());
                    R.setOriginalW(obj.getWidth());
                }
                // SW or NE corner crossing X+W or Y+H -> SE corner
                else if (c.toWorldX(e.x) > obj.getX() + obj.getWidth() && R.getGrabbedCorner() == R.Corner.SW || 
                         c.toWorldY(e.y) > obj.getY() + obj.getHeight() && R.getGrabbedCorner() == R.Corner.NE) {
                    R.setGrabbedCorner(R.Corner.SE);
                    R.setMouseDownX(c.toWorldX(e.x));
                    R.setMouseDownY(c.toWorldY(e.y));
                    R.setOriginalH(obj.getHeight());
                    R.setOriginalW(obj.getWidth());
                }
*/
                // Resize image with SE corner
                if (R.getGrabbedCorner() == R.Corner.SE) {
                    // Free scaling: Set size and position relative to mouse
                    obj.setWidth(c.toWorldX(e.clientX) - obj.getX() + R.getOriginalW() + obj.getGrabOffsetX());
                    obj.setHeight(c.toWorldY(e.clientY) - obj.getY() + R.getOriginalH() + obj.getGrabOffsetY());
                    console.log(obj.getGrabOffsetX());

                    // Proportional scaling: if on, correct image size with original aspect ratio
                    if(R.getIsProportionalScaleOn()) {
                        // Too wide
                         if(obj.getWidth()/obj.getHeight() > obj.getOriginalWidth()/obj.getOriginalHeight()){
                            obj.setWidth(obj.getHeight() * (obj.getOriginalWidth()/obj.getOriginalHeight()));
                         }
                         // Too tall
                         else if(obj.getWidth()/obj.getHeight() < obj.getOriginalWidth()/obj.getOriginalHeight()){
                            obj.setHeight(obj.getWidth() * (obj.getOriginalHeight()/obj.getOriginalWidth()));
                         }
                    }
                }
                // Resize image with NE corner
                else if (R.getGrabbedCorner() == R.Corner.NE) {
                    // Free scaling: Set size and position relative to mouse
                    obj.setY(c.toWorldY(e.clientY));
                    obj.setWidth(c.toWorldX(e.clientX) - obj.getX());
                    obj.setHeight(R.getOriginalH() - (c.toWorldY(e.clientY) - R.getMouseDownY()));

                    // Proportional scaling: if on, correct image size and position with original aspect ratio
                    if(R.getIsProportionalScaleOn()) {
                        // Too wide
                        if(obj.getWidth()/obj.getHeight() > obj.getOriginalWidth()/obj.getOriginalHeight()){
                            obj.setWidth(obj.getHeight() * (obj.getOriginalWidth()/obj.getOriginalHeight()));
                            obj.setY(R.getOriginalY() + R.getOriginalH() - obj.getHeight());
                        }
                        // Too tall
                        else if(obj.getWidth()/obj.getHeight() < obj.getOriginalWidth()/obj.getOriginalHeight()){
                            obj.setHeight(obj.getWidth() * (obj.getOriginalHeight()/obj.getOriginalWidth()));
                            obj.setY(R.getOriginalY() + R.getOriginalH() - obj.getHeight());
                        }
                    }
                }
                // Resize image with SW corner
                else if (R.getGrabbedCorner() == R.Corner.SW) {
                    // Free scaling: Set size and position relative to mouse
                    obj.setX(c.toWorldX(e.clientX) - obj.getGrabOffsetX());
                    obj.setHeight(c.toWorldY(e.clientY) - obj.getY());
                    obj.setWidth(R.getOriginalW() - c.toWorldX(e.clientX) + R.getMouseDownX());

                    // Proportional scaling: if on, correct image size and position with original aspect ratio
                    if(R.getIsProportionalScaleOn()) {
                        // Too wide
                        if(obj.getWidth()/obj.getHeight() > obj.getOriginalWidth()/obj.getOriginalHeight()){
                            obj.setWidth(obj.getHeight() * (obj.getOriginalWidth()/obj.getOriginalHeight()));
                            obj.setX(R.getOriginalX() + R.getOriginalW() - obj.getWidth());
                        }
                        // Too tall
                        else if(obj.getWidth()/obj.getHeight() < obj.getOriginalWidth()/obj.getOriginalHeight()){
                            obj.setHeight(obj.getWidth() * (obj.getOriginalHeight()/obj.getOriginalWidth()));
                            obj.setX(R.getOriginalX() + R.getOriginalW() - obj.getWidth());
                        }
                    }
                }
                // Resize image with NW corner
                else if (R.getGrabbedCorner() == R.Corner.NW) {
                    // Free scaling: Set size and position relative to mouse
                    obj.setX(c.toWorldX(e.clientX));
                    obj.setWidth(R.getOriginalW() - (c.toWorldX(e.clientX) - R.getMouseDownX()));
                    obj.setY(c.toWorldY(e.clientY));
                    obj.setHeight(R.getOriginalH() - (c.toWorldY(e.clientY) - R.getMouseDownY()));

                    // Proportional scaling: if on, correct image size and position with original aspect ratio
                    if(R.getIsProportionalScaleOn()) {
                        // Too wide
                        if(obj.getWidth()/obj.getHeight() > obj.getOriginalWidth()/obj.getOriginalHeight()){
                            obj.setWidth(obj.getHeight() * (obj.getOriginalWidth()/obj.getOriginalHeight()));
                            obj.setX(R.getOriginalX() + R.getOriginalW() - obj.getWidth());
                            obj.setY(R.getOriginalY() + R.getOriginalH() - obj.getHeight());
                        }
                        // Too tall
                        else if(obj.getWidth()/obj.getHeight() < obj.getOriginalWidth()/obj.getOriginalHeight()){
                            obj.setHeight(obj.getWidth() * (obj.getOriginalHeight()/obj.getOriginalWidth()));
                            obj.setX(R.getOriginalX() + R.getOriginalW() - obj.getWidth());
                            obj.setY(R.getOriginalY() + R.getOriginalH() - obj.getHeight());
                        }
                    }
                }
            }
            else {
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
    R.setGrabbedCorner(R.Corner.None);

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

        /*// Select image toggle
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
        } */
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
