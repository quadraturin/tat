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
    R.setClickedCanvasObject(null);

    // Grab the hovered object if any (if it's editable)
    if (R.getHoveredCanvasObject() != null && R.getHoveredCanvasObject()?.getEditable()) {
        let obj = R.getHoveredCanvasObject();
        R.setClickedCanvasObject(obj);
        if (obj != null) {
            if (obj.getHoverHandle() == R.Handle.None) {
                obj.setGrabbed(true, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
                obj.setHandle();
            } else {
                if (obj instanceof CanvasImage) {
                    R.setOriginalH(obj.getHeight());
                    R.setOriginalW(obj.getWidth());
                    R.setOriginalX(c.toWorldX(e.x));
                    R.setOriginalY(c.toWorldY(e.y));
                    obj.setHandle();
                }
            }
        }
    }
    // If object clicked was selected, grab all selected objects
    const clicked = R.getClickedCanvasObject();
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

    // Update hover states
    if (c.canvas) {
        R.setHoveredCanvasObject(null);
        // Get listener if under cursor
        if (l.getEditable() &&
            pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), l.getX(), l.getY(), c.toWorldLength(R.getListenerRadius()))){
            R.setHoveredCanvasObject(l);
        }
        // Get first image under cursor (last in list)
        else {
            // Cycle thru images from end to beginning of array (top to bottom visually)
            for (let i = R.getImages().length - 1; i >= 0; i--) {
                const img = R.getImages()[i];
                // If the image is editable, check for an image handle
                if (img.getEditable()) {
                    // NW handle
                    if (pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), img.getX(), img.getY(), c.toWorldLength(R.getHandleSize()))) {
                        R.setHoveredCanvasObject(img);
                        img.setHoverHandle(R.Handle.NW);
                        break;
                    }
                    // NE handle
                    else if (pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), img.getX()+img.getWidth(), img.getY(), c.toWorldLength(R.getHandleSize()))) {
                        R.setHoveredCanvasObject(img);
                        img.setHoverHandle(R.Handle.NE);
                        break;
                    }
                    // SW handle
                    else if (pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), img.getX(), img.getY()+img.getHeight(), c.toWorldLength(R.getHandleSize()))) {
                        R.setHoveredCanvasObject(img);
                        img.setHoverHandle(R.Handle.SW);
                        break;
                    }
                    // SE handle
                    else if (pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), img.getX()+img.getWidth(), img.getY()+img.getHeight(), c.toWorldLength(R.getHandleSize()))) {
                        R.setHoveredCanvasObject(img);
                        img.setHoverHandle(R.Handle.SE);
                        break;
                    }
                    // No handle hovered, check if the image is under the cursor
                    else if (pointRectCollision( c.toWorldX(e.x), c.toWorldY(e.y), img.getX(), img.getY(), img.getWidth(), img.getHeight())) {
                        R.setHoveredCanvasObject(img);
                        img.setHoverHandle(R.Handle.None);
                        break;
                    }
                } 
                // Image is not editable
                else if ((pointRectCollision( c.toWorldX(e.x), c.toWorldY(e.y), img.getX(), img.getY(), img.getWidth(), img.getHeight()))) {
                    R.setHoveredCanvasObject(img);
                    img.setHoverHandle(R.Handle.None);
                    break;  
                }
            }
        }

        // Set mouse cursor
        const hov = R.getHoveredCanvasObject();
        if (hov == null || !hov?.getEditable()) { 
            if (R.getMouseDown())                            c.canvas.style.cursor = "grabbing";
            else                                             c.canvas.style.cursor = "grab";
        } else if (hov?.getEditable()){
            if (hov?.getHoverHandle() == R.Handle.NW)        c.canvas.style.cursor = "nwse-resize";
            else if (hov?.getHoverHandle() == R.Handle.SE)   c.canvas.style.cursor = "nwse-resize";
            else if (hov?.getHoverHandle() == R.Handle.NE)   c.canvas.style.cursor = "nesw-resize";
            else if (hov?.getHoverHandle() == R.Handle.SW)   c.canvas.style.cursor = "nesw-resize";
            else                                             c.canvas.style.cursor = "move";
        }
    }

    // Check if the mouse is already down when it is moved (dragging)
    if(R.getMouseDown()) {
        const obj = R.getClickedCanvasObject();
        // Clicked on a valid object.
        if (obj != null) {
            // If an image handle was grabbed, resize the image.
            if (obj.getHandle() != R.Handle.None && obj instanceof CanvasImage) {
                // Resize image with SE corner
                if (obj.getHandle() == R.Handle.SE) {
                    // Free scaling: Set size and position relative to mouse
                    obj.setWidth(c.toWorldX(e.clientX) - obj.getX());
                    obj.setHeight(c.toWorldY(e.clientY) - obj.getY());

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
                else if (obj.getHandle() == R.Handle.NE) {
                    // Free scaling: Set size and position relative to mouse
                    obj.setY(c.toWorldY(e.clientY));
                    obj.setWidth(c.toWorldX(e.clientX) - obj.getX());
                    obj.setHeight(R.getOriginalH() - c.toWorldY(e.clientY) + R.getMouseDownY());

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
                else if (obj.getHandle() == R.Handle.SW) {
                    // Free scaling: Set size and position relative to mouse
                    obj.setX(c.toWorldX(e.clientX) + obj.getGrabOffsetX());
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
                else if (obj.getHandle() == R.Handle.NW) {
                    // Free scaling: Set size and position relative to mouse
                    obj.setX(c.toWorldX(e.clientX) + obj.getGrabOffsetX());
                    obj.setWidth(R.getOriginalW() - (c.toWorldX(e.clientX) - R.getMouseDownX()));
                    obj.setY(c.toWorldY(e.clientY) + obj.getGrabOffsetY());
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
    R.getClickedCanvasObject()?.setHandle(R.Handle.None);

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
    R.setClickedCanvasObject(null);

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
