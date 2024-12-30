import type { MapImage } from "./classes/MapImage.svelte";
import { getUserSettings } from "./settings.userSettings.svelte";

/**
 * change the opacity of an image based on scrolling the mouse wheel.
 * @param image the image to change opacity on.
 * @param event a mousewheel event.
 */
export async function changeOpacity(image:MapImage, event:WheelEvent) {
    try {
        image.opacity += event.deltaY * 0.01 * getUserSettings().uiScrollSensitivity;
        if (image.opacity < 0) image.opacity = 0;
        else if (image.opacity > 1) image.opacity = 1;
        image.overlay.setOpacity(image.opacity);
    } catch(err) {
        console.error(err);
    }
}
