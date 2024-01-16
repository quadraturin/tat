import type { MapImage } from "./classes/MapImage";


export async function changeOpacity(image:MapImage, event:WheelEvent) {
    image.opacity += event.deltaY*0.01;
    if (image.opacity < 0) image.opacity = 0;
    else if (image.opacity > 1) image.opacity = 1;
    image.overlay.setOpacity(image.opacity);
    //console.log(image.opacity);
}