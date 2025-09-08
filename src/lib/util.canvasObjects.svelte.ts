import * as R from "$lib/registry.svelte";
import { CanvasObject } from "./classes/CanvasObject.svelte";
import { CanvasImage } from "./classes/CanvasImage.svelte";
import { CanvasSound } from "./classes/CanvasSound.svelte";
import { CanvasListener } from "./classes/CanvasListener.svelte";
import { pointCircleCollision, pointRectCollision, pointPolyCollision } from "./util.collision";


/**
 * Handle a double click on the canvas.
 * Toggle the editablilty of an item (other than the listener) under the cursor.
 * @param e Mouse double click event.
 */
export function canvasDblClick(e:MouseEvent) {
    const hov = R.getHoveredCanvasObject()
    if (hov && hov != R.getListener()) { 
        hov.locked = !R.getHoveredCanvasObject()?.locked;
        if (hov.locked) hov.selected = false;
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
    if (R.getHoveredCanvasObject() != null && !R.getHoveredCanvasObject()?.locked) {
        let obj = R.getHoveredCanvasObject();
        R.setClickedCanvasObject(obj);
        if (obj != null) {
            // No handle: grab the object
            if (obj.hoverHandle == R.Handle.None) {
                obj.grab(true, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
                obj.handle = obj.hoverHandle;
                if (obj instanceof CanvasSound && obj.soundType == R.SoundType.Area) {
                    R.setOriginalX(c.toWorldX(e.clientX));
                    R.setOriginalY(c.toWorldY(e.clientY));
                    obj.originalAreaCoords = [];
                    obj.areaCoords.forEach(val => obj.originalAreaCoords.push(Object.assign({}, val)));
                }
            } 
            // If handle
            else {
                // Canvas sound: if vert, grab it, if edge, create vert & grab it.
                if (obj instanceof CanvasSound) {
                    if (obj.hoverHandle == R.Handle.PolyVertex || obj.hoverHandle == R.Handle.Radius){ 
                        obj.handle = obj.hoverHandle;
                    }
                    else if (obj.hoverHandle == R.Handle.PolyEdge) {
                        const next = obj.areaHandleIndex == obj.areaCoords.length - 1 ? 0 : obj.areaHandleIndex + 1;
                        obj.addAreaVertex(c.toWorldX(e.x), c.toWorldY(e.y), next);
                        obj.hoverHandle = R.Handle.PolyVertex;
                        obj.handle = obj.hoverHandle;
                        obj.areaHandleIndex = next;
                        R.setDragging(true);   
                    }
                // Canvas image: grab corner handle.
                } else if (obj instanceof CanvasImage) {
                    R.setOriginalH(obj.height);
                    R.setOriginalW(obj.width);
                    R.setOriginalX(c.toWorldX(e.x));
                    R.setOriginalY(c.toWorldY(e.y));
                    obj.handle = obj.hoverHandle;
                }
            }
        }
    }
    
    /*// If object clicked was selected, grab all selected objects
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
        for (let i = R.getSounds().length - 1; i >= 0; i--) {
            const snd = R.getSounds()[i];
            if (snd.selected && snd.editable){ 
                snd.grab(true, c.toWorldX(e.clientX), c.toWorldY(e.clientY));
                if (snd.soundType == R.SoundType.Area) {
                    R.setOriginalX(c.toWorldX(e.clientX));
                    R.setOriginalY(c.toWorldY(e.clientY));
                    snd.originalAreaCoords = [];
                    snd.areaCoords.forEach(val => snd.originalAreaCoords.push(Object.assign({}, val)));
                }
            }
        }
    }*/
}

/** Handle a mouse move event on the canvas. @param e Mouse move event. */
export function canvasMouseMove(e:MouseEvent) {
    const l = R.getListener();
    const c = R.getCanvas();
    const wX = c.toWorldX(e.x);
    const wY = c.toWorldY(e.y);

    // Update hover states
    if (c.canvas && !R.getDragging()) {
        // Reset the hovered object
        R.setHoveredCanvasObject(null);

        // Get listener if under cursor
        if (!l.locked && pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), l.x, l.y, c.toWorldLength(R.getListenerRadius()))){
            R.setHoveredCanvasObject(l);
        }

        // If listener not under cursor, cycle thru sounds
        if (R.getHoveredCanvasObject() == null && !R.getSoundsHidden()) {
            for (let i = 0; i < R.getSounds().length; i++) {
                const snd = R.getSounds()[i];

                // Reset handle
                snd.hoverHandle = R.Handle.None;

                // Area sound: polygon with handles at verts and mid-segment.
                if (snd.soundType == R.SoundType.Area) {
                    // Check bounding box before proceeding.
                    if (wX >= snd.areaBounds[0].x && wY >= snd.areaBounds[0].y &&
                        wX <= snd.areaBounds[1].x && wY <= snd.areaBounds[1].y ) {
                        const coords = snd.areaCoords;
                        // Check handles.
                        for (let i = 0; i < coords.length; i++) {
                            const next = i + 1 == coords.length ? 0 : i + 1;
                            const midX = (coords[i].x + coords[next].x)/2;
                            const midY = (coords[i].y + coords[next].y)/2;
                            
                            if (pointCircleCollision(wX, wY, coords[i].x, coords[i].y, c.toWorldLength(R.getHandleSize()+R.getHandleSlop()))) {
                                R.setHoveredCanvasObject(snd);
                                snd.hoverHandle = R.Handle.PolyVertex;
                                snd.areaHandleIndex = i;
                                break;
                            } else if (pointCircleCollision(wX, wY, midX, midY, c.toWorldLength(R.getHandleSize()+R.getHandleSlop()))) {
                                R.setHoveredCanvasObject(snd);
                                snd.hoverHandle = R.Handle.PolyEdge;
                                snd.areaHandleIndex = i;
                                break;
                            }
                        }
                        // Check collision with the polygon.
                        if (snd.hoverHandle == R.Handle.None && pointPolyCollision(wX, wY, snd.areaCoords)) {
                            R.setHoveredCanvasObject(snd);
                            snd.hoverHandle = R.Handle.None;
                            break;
                        }
                    }
                }

                // Local sound: circular area with handle.
                else if (snd.soundType == R.SoundType.Local) {
                    // Radius handle
                    if (pointCircleCollision(
                            wX, 
                            wY, 
                            snd.x + Math.cos(snd.localHandleAngle) * snd.radius, 
                            snd.y + Math.sin(snd.localHandleAngle) * snd.radius,
                            c.toWorldLength(R.getHandleSize()+R.getHandleSlop()))) {
                        R.setHoveredCanvasObject(snd);
                        snd.hoverHandle = R.Handle.Radius;
                        break;
                    } 
                    // Emitter circle
                    else if (pointCircleCollision(wX, wY, snd.x, snd.y, snd.radius)) {
                        R.setHoveredCanvasObject(snd);
                        snd.hoverHandle = R.Handle.None;
                        break;
                    }
                }
            }
        }

        // If no listener or sounds under cursor, cycle thru images
        if (R.getHoveredCanvasObject() == null && !R.getImagesHidden()) {
            for (let i = 0; i < R.getImages().length; i++) {
                const img = R.getImages()[i];
                // NW handle
                if (pointCircleCollision(wX, wY, img.x, img.y, c.toWorldLength(R.getHandleSize()+R.getHandleSlop()))) {
                    R.setHoveredCanvasObject(img);
                    img.hoverHandle = R.Handle.NW;
                    break;
                }
                // NE handle
                else if (pointCircleCollision(wX, wY, img.x + img.width, img.y, c.toWorldLength(R.getHandleSize()+R.getHandleSlop()))) {
                    R.setHoveredCanvasObject(img);
                    img.hoverHandle = R.Handle.NE;
                    break;
                }
                // SW handle
                else if (pointCircleCollision(wX, wY, img.x, img.y+img.height, c.toWorldLength(R.getHandleSize()+R.getHandleSlop()))) {
                    R.setHoveredCanvasObject(img);
                    img.hoverHandle = R.Handle.SW;
                    break;
                }
                // SE handle
                else if (pointCircleCollision(wX, wY, img.x+img.width, img.y+img.height, c.toWorldLength(R.getHandleSize()+R.getHandleSlop()))) {
                    R.setHoveredCanvasObject(img);
                    img.hoverHandle = R.Handle.SE;
                    break;
                }
                // No handle hovered, check if the image is under the cursor
                else if (pointRectCollision(wX, wY, img.x, img.y, img.width, img.height)) {
                    R.setHoveredCanvasObject(img);
                    img.hoverHandle = R.Handle.None;
                    break;
                }
            }
        }

        // Set mouse cursor
        const hov = R.getHoveredCanvasObject();
        if (hov == null || hov?.locked) { 
            if (R.getMouseDown())                               c.canvas.style.cursor = "grabbing";
            else                                                c.canvas.style.cursor = "grab";
        } else if (!hov?.locked){
            if (hov?.hoverHandle == R.Handle.NW)                c.canvas.style.cursor = "default";
            else if (hov?.hoverHandle == R.Handle.SE)           c.canvas.style.cursor = "context-menu";
            else if (hov?.hoverHandle == R.Handle.NE)           c.canvas.style.cursor = "context-menu";
            else if (hov?.hoverHandle == R.Handle.SW)           c.canvas.style.cursor = "context-menu";
            else if (hov?.hoverHandle == R.Handle.Radius)       c.canvas.style.cursor = "context-menu";
            else if (hov?.hoverHandle == R.Handle.PolyVertex)   c.canvas.style.cursor = "context-menu";
            else if (hov?.hoverHandle == R.Handle.PolyEdge)     c.canvas.style.cursor = "copy"//"cell";
            else                                                c.canvas.style.cursor = "default";
        }
    }

    // Check if the mouse is already down when it is moved (dragging)
    if(R.getMouseDown()) {
        R.setDragging(true);
        const obj = R.getClickedCanvasObject();
        // Clicked on a valid object.
        if (obj != null) {

            // If sound handle grabbed.
            if (obj.handle != R.Handle.None && obj instanceof CanvasSound) {
                // If a local sound handle was grabbed, resize the local sound.
                if (obj.soundType == R.SoundType.Local && obj.handle == R.Handle.Radius) {
                    const vertical = obj.y - c.toWorldY(e.clientY);
                    const horizontal = obj.x - c.toWorldX(e.clientX)
                    obj.radius = Math.sqrt(horizontal**2 + vertical**2);
                    obj.localHandleAngle = Math.atan2(-vertical, -horizontal);
                } 
                // If an area sound handle was grabbed, move the handle & recalculate bounds.
                else if (obj.soundType == R.SoundType.Area && obj.handle == R.Handle.PolyVertex) {
                    if (obj.areaCoords.length > obj.areaHandleIndex) {
                        obj.areaCoords[obj.areaHandleIndex].x = c.toWorldX(e.x);
                        obj.areaCoords[obj.areaHandleIndex].y = c.toWorldY(e.y);
                        obj.setBounds();
                    }
                }
            }

            // If image handle grabbed.
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

            // No handles grabbed: object itself grabbed.
            else {
                // Drag object
                if (    obj instanceof CanvasListener || 
                        obj instanceof CanvasImage || 
                        (obj instanceof CanvasSound && obj.soundType == R.SoundType.Local)) {
                    obj.x = c.toWorldX(e.clientX) + obj.grabOffsetX;
                    obj.y = c.toWorldY(e.clientY) + obj.grabOffsetY;
                }
                // Drag area sound 
                else if (obj instanceof CanvasSound && obj.soundType == R.SoundType.Area) {
                    for (let i = 0; i < obj.areaCoords.length; i++) {
                        obj.areaCoords[i].x = obj.originalAreaCoords[i].x + c.toWorldX(e.clientX) - R.getOriginalX();
                        obj.areaCoords[i].y = obj.originalAreaCoords[i].y + c.toWorldY(e.clientY) - R.getOriginalY();
                        obj.setBounds();
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

    // If there was a clicked object but it was not dragged
    if(!R.getDragging()) {
        // Click on canvasSound
        if (o instanceof CanvasSound && 
            o.soundType == R.SoundType.Area && 
            o.areaCoords.length > 3 &&
            o.handle == R.Handle.PolyVertex) {
            o.removeAreaVertex(o.areaHandleIndex);
        }
        // Selection toggle: only select if editable and not listener.
        else if (o instanceof CanvasObject && !o.locked && o != l) o.selected = !o.selected; 
    }
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
    R.stopPanning();

    // Stop dragging
    R.setDragging(false);
}
