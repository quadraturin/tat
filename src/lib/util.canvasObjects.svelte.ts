import * as R from "$lib/registry.svelte";
import { CanvasObject } from "./classes/CanvasObject.svelte";
import { CanvasImage } from "./classes/CanvasImage.svelte";
import { CanvasSound } from "./classes/CanvasSound.svelte";
import { Vector2D } from "./util.vectors";


/**
 * Handle a double click on the canvas.
 * Toggle the editablilty of an item under the cursor.
 * @param e Mouse double click event.
 */
export function canvasDblClick(e:MouseEvent) {
    const l = R.getListener();
    const c = R.getCanvas();

    if (pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), l.x, l.y, c.toWorldLength(R.getListenerRadius()))){
        l.editable = null;
    } 
    // Select image
    else {
        for (let i = R.getImages().length - 1; i >= 0; i--) {
            const img = R.getImages()[i];
            if (!img.locked &&
                pointRectCollision(c.toWorldX(e.x), c.toWorldY(e.y), img.x, img.y, img.width, img.height)) {
                img.editable = null;
                break;
            }
        }
    } 
}


/** Handle mouse wheel scrolling on the canvas. Zoom in and out. @param e Mouse wheel event. */
export function canvasWheel(e:WheelEvent) {
    if (e.deltaY < 0) R.getCanvas().zoom(1.01, e.clientX, e.clientY);
    else if (e.deltaY > 0) R.getCanvas().zoom(0.99, e.clientX, e.clientY);
}


/** Handle mouse down events on the canvas. @param e Mouse down event. */
export function canvasMouseDown(e:MouseEvent) {
    const l = R.getListener();
    const c = R.getCanvas();

    R.setMouseDown(true);
    R.setMouseDownX(c.toWorldX(e.x));
    R.setMouseDownY(c.toWorldY(e.y));

    // Reset clicked on draggable state
    R.setClickedCanvasObject(null);

    // Grab the hovered object if any (if it's editable)
    if (R.getHoveredCanvasObject() != null && R.getHoveredCanvasObject()?.editable) {
        let obj = R.getHoveredCanvasObject();
        R.setClickedCanvasObject(obj);
        if (obj != null) {
            if (obj.hoverHandle == R.Handle.None) {
                obj.grab(true, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
                obj.handle = null;
            } else {
                if (obj instanceof CanvasSound) {
                    obj.handle = null;
                } else if (obj instanceof CanvasImage) {
                    R.setOriginalH(obj.height);
                    R.setOriginalW(obj.width);
                    R.setOriginalX(c.toWorldX(e.x));
                    R.setOriginalY(c.toWorldY(e.y));
                    obj.handle = null;
                }
            }
        }
    }
    // If object clicked was selected, grab all selected objects
    const clicked = R.getClickedCanvasObject();
    if (clicked instanceof CanvasObject && clicked.selected) {
        if (l.selected && l.editable) {
            l.grab(true, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
        }
        for (let i = R.getImages().length - 1; i >= 0; i--) {
            const img = R.getImages()[i];
            if (img.selected && img.editable){ 
                img.grab(true, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
            }
        }
    }
}

/** Handle a mouse move event on the canvas. @param e Mouse move event. */
export function canvasMouseMove(e:MouseEvent) {
    const l = R.getListener();
    const c = R.getCanvas();

    // Update hover states
    if (c.canvas) {
        // Reset the hovered object
        R.setHoveredCanvasObject(null);

        // Get listener if under cursor
        if (l.editable && pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), l.x, l.y, c.toWorldLength(R.getListenerRadius()))){
            R.setHoveredCanvasObject(l);
        }

        // If no selection, cycle thru sounds
        if (R.getHoveredCanvasObject() == null) {
            for (let i = R.getSounds().length - 1; i >= 0; i--) {
                const snd = R.getSounds()[i];
                const wX = c.toWorldX(e.x);
                const wY = c.toWorldY(e.y);

                // Area sound: polygon with handles at verts and mid-segment.
                if (snd.soundType == R.SoundType.Area) {
                    if (    wX >= snd.areaBounds[0].x && wY >= snd.areaBounds[0].y &&
                            wX <= snd.areaBounds[1].x && wY <= snd.areaBounds[1].y ) {
                        if (pointPolyCollision(wX, wY, snd.areaCoords)) {
                            console.log("in poly")
                            break;
                        }
                    }
                }

                // Local sound: circular area with handle.
                else if (snd.soundType == R.SoundType.Local) {
                    // Radius handle
                    if (pointCircleCollision(
                            c.toWorldX(e.x), 
                            c.toWorldY(e.y), 
                            snd.x + Math.cos(snd.localHandleAngle) * snd.radius, 
                            snd.y + Math.sin(snd.localHandleAngle) * snd.radius,
                            c.toWorldLength(R.getHandleSize()))) {
                        R.setHoveredCanvasObject(snd);
                        snd.hoverHandle = R.Handle.Radius;
                        break;
                    } 
                    // Emitter circle
                    else if (pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), snd.x, snd.y, snd.radius)) {
                        R.setHoveredCanvasObject(snd);
                        snd.hoverHandle = R.Handle.None;
                        break;
                    }
                }
            }
        }

        // If no selection, cycle thru images
        if (R.getHoveredCanvasObject() == null) {
            for (let i = R.getImages().length - 1; i >= 0; i--) {
                const img = R.getImages()[i];
                // NW handle
                if (pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), img.x, img.y, c.toWorldLength(R.getHandleSize()))) {
                    R.setHoveredCanvasObject(img);
                    img.hoverHandle = R.Handle.NW;
                    break;
                }
                // NE handle
                else if (pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), img.x + img.width, img.y, c.toWorldLength(R.getHandleSize()))) {
                    R.setHoveredCanvasObject(img);
                    img.hoverHandle = R.Handle.NE;
                    break;
                }
                // SW handle
                else if (pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), img.x, img.y+img.height, c.toWorldLength(R.getHandleSize()))) {
                    R.setHoveredCanvasObject(img);
                    img.hoverHandle = R.Handle.SW;
                    break;
                }
                // SE handle
                else if (pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), img.x+img.width, img.y+img.height, c.toWorldLength(R.getHandleSize()))) {
                    R.setHoveredCanvasObject(img);
                    img.hoverHandle = R.Handle.SE;
                    break;
                }
                // No handle hovered, check if the image is under the cursor
                else if (pointRectCollision( c.toWorldX(e.x), c.toWorldY(e.y), img.x, img.y, img.width, img.height)) {
                    R.setHoveredCanvasObject(img);
                    img.hoverHandle = R.Handle.None;
                    break;
                }
            }
        }

        // Set mouse cursor
        const hov = R.getHoveredCanvasObject();
        if (hov == null || !hov?.editable) { 
            if (R.getMouseDown())                           c.canvas.style.cursor = "grabbing";
            else                                            c.canvas.style.cursor = "grab";
        } else if (hov?.editable){
            if (hov?.hoverHandle == R.Handle.NW)            c.canvas.style.cursor = "nwse-resize";
            else if (hov?.hoverHandle == R.Handle.SE)       c.canvas.style.cursor = "nwse-resize";
            else if (hov?.hoverHandle == R.Handle.NE)       c.canvas.style.cursor = "nesw-resize";
            else if (hov?.hoverHandle == R.Handle.SW)       c.canvas.style.cursor = "nesw-resize";
            else if (hov?.hoverHandle == R.Handle.Radius)   c.canvas.style.cursor = "context-menu";
            else                                            c.canvas.style.cursor = "move";
        }
    }

    // Check if the mouse is already down when it is moved (dragging)
    if(R.getMouseDown()) {
        const obj = R.getClickedCanvasObject();
        // Clicked on a valid object.
        if (obj != null) {
            // If a sound handle was grabbed, resize the sound emitter.
            if (obj.handle == R.Handle.Radius && obj instanceof CanvasSound) {
                const vertical = obj.y - c.toWorldY(e.clientY);
                const horizontal = obj.x - c.toWorldX(e.clientX)
                obj.radius = Math.sqrt(horizontal**2 + vertical**2);
                obj.localHandleAngle = Math.atan2(-vertical, -horizontal);
                console.log(obj.localHandleAngle);
            }
            // If an image handle was grabbed, resize the image.
            else if (obj.handle != R.Handle.None && obj instanceof CanvasImage) {
                // Resize image with SE corner
                if (obj.handle == R.Handle.SE) {
                    // Free scaling: Set size and position relative to mouse
                    obj.width = c.toWorldX(e.clientX) - obj.x;
                    obj.height = c.toWorldY(e.clientY) - obj.y;

                    // Proportional scaling: if on, correct image size with original aspect ratio
                    if(R.getIsProportionalScaleOn()) {
                        // Too wide
                         if(obj.width/obj.height > obj.originalWidth/obj.originalHeight){
                            obj.width = obj.height * (obj.originalWidth/obj.originalHeight);
                         }
                         // Too tall
                         else if(obj.width/obj.height < obj.originalWidth/obj.originalHeight){
                            obj.height = obj.width * (obj.originalHeight/obj.originalWidth);
                         }
                    }
                }
                // Resize image with NE corner
                else if (obj.handle == R.Handle.NE) {
                    // Free scaling: Set size and position relative to mouse
                    obj.y = c.toWorldY(e.clientY);
                    obj.width = c.toWorldX(e.clientX) - obj.x;
                    obj.height = R.getOriginalH() - c.toWorldY(e.clientY) + R.getMouseDownY();

                    // Proportional scaling: if on, correct image size and position with original aspect ratio
                    if(R.getIsProportionalScaleOn()) {
                        // Too wide
                        if(obj.width/obj.height > obj.originalWidth/obj.originalHeight) {
                            obj.width = obj.height * (obj.originalWidth/obj.originalHeight);
                            obj.y = R.getOriginalY() + R.getOriginalH() - obj.height;
                        }
                        // Too tall
                        else if(obj.width/obj.height < obj.originalWidth/obj.originalHeight) {
                            obj.height = obj.width * (obj.originalHeight/obj.originalWidth);
                            obj.y = R.getOriginalY() + R.getOriginalH() - obj.height;
                        }
                    }
                }
                // Resize image with SW corner
                else if (obj.handle == R.Handle.SW) {
                    // Free scaling: Set size and position relative to mouse
                    obj.x = c.toWorldX(e.clientX) + obj.grabOffsetX;
                    obj.height = c.toWorldY(e.clientY) - obj.y;
                    obj.width = R.getOriginalW() - c.toWorldX(e.clientX) + R.getMouseDownX();

                    // Proportional scaling: if on, correct image size and position with original aspect ratio
                    if(R.getIsProportionalScaleOn()) {
                        // Too wide
                        if(obj.width/obj.height > obj.originalWidth/obj.originalHeight) {
                            obj.width = obj.height * (obj.originalWidth/obj.originalHeight);
                            obj.x = R.getOriginalX() + R.getOriginalW() - obj.width;
                        }
                        // Too tall
                        else if(obj.width/obj.height < obj.originalWidth/obj.originalHeight) {
                            obj.height = obj.width * (obj.originalHeight/obj.originalWidth);
                            obj.x = R.getOriginalX() + R.getOriginalW() - obj.width;
                        }
                    }
                }
                // Resize image with NW corner
                else if (obj.handle == R.Handle.NW) {
                    // Free scaling: Set size and position relative to mouse
                    obj.x = c.toWorldX(e.clientX) + obj.grabOffsetX;
                    obj.width = R.getOriginalW() - (c.toWorldX(e.clientX) - R.getMouseDownX());
                    obj.y = c.toWorldY(e.clientY) + obj.grabOffsetY;
                    obj.height = R.getOriginalH() - (c.toWorldY(e.clientY) - R.getMouseDownY());

                    // Proportional scaling: if on, correct image size and position with original aspect ratio
                    if(R.getIsProportionalScaleOn()) {
                        // Too wide
                        if(obj.width/obj.height > obj.originalWidth/obj.originalHeight){
                            obj.width = obj.height * (obj.originalWidth/obj.originalHeight);
                            obj.x = R.getOriginalX() + R.getOriginalW() - obj.width;
                            obj.y = R.getOriginalY() + R.getOriginalH() - obj.height;
                        }
                        // Too tall
                        else if(obj.width/obj.height < obj.originalWidth/obj.originalHeight){
                            obj.height = obj.width * (obj.originalHeight/obj.originalWidth);
                            obj.x = R.getOriginalX() + R.getOriginalW() - obj.width;
                            obj.y = R.getOriginalY() + R.getOriginalH() - obj.height;
                        }
                    }
                }
            }
            else {
                // Drag listener
                if (l.grabbed){
                    l.x = c.toWorldX(e.clientX) + l.grabOffsetX;
                    l.y = c.toWorldY(e.clientY) + l.grabOffsetY;
                    R.setDragging(true);
                }
                // Drag image(s)
                for (let i = 0; i < R.getImages().length; i++) {
                    const img = R.getImages()[i];
                    if (img.grabbed) {
                        img.x = c.toWorldX(e.clientX) + img.grabOffsetX;
                        img.y = c.toWorldY(e.clientY) + img.grabOffsetY;
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

/** Handle a mouse up event on the canvas. @param e Mouse up event. */
export function canvasMouseUp(e:MouseEvent) {
    const l = R.getListener();
    const c = R.getCanvas();
    const o = R.getClickedCanvasObject();

    R.setMouseDown(false);
    if (o != null) o.handle = R.Handle.None;

    // Release the listener
    if (l.grabbed) {
        l.grab(false);
    }

    // Release any images
    for (let i = 0; i < R.getImages().length; i++) {
        const img = R.getImages()[i];
        if (img.grabbed) img.grab(false);
    }

    // Unset clicked on canvas object
    R.setClickedCanvasObject(null);

    // Stop panning
    if (R.getPanning()) R.stopPanning();

    // If there was a clicked object but it was not dragged, toggle selection 
    if(!R.getDragging()) {
        // Select listener toggle
        if (l.editable &&
            pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), l.x, l.y, c.toWorldLength(R.getListenerRadius()))){
            l.selected = null;
        }

        // Select image toggle
        else {
            for (let i = R.getImages().length - 1; i >= 0; i--) {
                const img = R.getImages()[i];
                if (!img.locked &&
                    pointRectCollision(c.toWorldX(e.x), c.toWorldY(e.y), img.x, img.y, img.width, img.height)) {
                    img.selected = null;
                    break;
                }
            }
        }
    }
    R.setDragging(false);
}

/** 
 * Determine if a point is colliding with a circle.
 * @param pX Point X position.
 * @param pY Point Y position.
 * @param cX Circle X position.
 * @param cY Circle Y position.
 * @param cR Circle radius.
 * @returns True: collision. False: no collision.
 */
function pointCircleCollision(pX:number, pY:number, cX:number, cY:number, cR:number):boolean {
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
function pointRectCollision(pX:number, pY:number, rX:number, rY:number, rW:number, rH:number):boolean {
    if (pX >= rX && pY >= rY && pX <= rX + rW && pY <= rY + rH) return true; 
    else return false;
}


function pointPolyCollision(pX:number, pY:number, c:Vector2D[]):boolean {
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
