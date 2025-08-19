import * as R from "$lib/registry.svelte";

export function canvasClick(e:MouseEvent) {
    const l = R.getListener();
    const c = R.getCanvas();
    if (pointCircleCollision(c.toWorldX(e.x), c.toWorldY(e.y), l.getX(), l.getY(), c.toWorldLength(R.getListenerRadius()))){
        dragListener();
    } else if (false) {
        // placeholder for audio emitters
    } else if (false) {
        // placeholder for images
        
    } else {
        R.startPanning(e.clientX, e.clientY);
    }
}

function pointCircleCollision(pX:number, pY:number, cX:number, cY:number, cR:number):boolean {
    console.log(pX, pY, cX, cY, cR);
    console.log(Math.sqrt((pX-cX)**2 + (pY-cY)**2));
    if (Math.sqrt((pX-cX)**2 + (pY-cY)**2) <= cR) return true;
    else return false;
}

function dragListener() {
    const l = R.getListener();
    l.setGrabbed(true);
    R.setDragging(true);
}