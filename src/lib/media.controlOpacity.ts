import type { CanvasImage } from "./classes/CanvasImage.svelte";
import { getUserSettings } from "./settings.userSettings.svelte";

/**
 * change the opacity of an image based on scrolling the mouse wheel.
 * @param image the image to change opacity on.
 * @param event a mousewheel event.
 */
export async function changeOpacity(image:CanvasImage, event:WheelEvent) {
    try {
        let delta = event.deltaY;
        // invert based on user settings.
        if (getUserSettings().invertVolumeScroll) delta *= -1;
        image.opacity += delta * 0.01 * getUserSettings().uiScrollSensitivity;
        if (image.opacity < 0) image.opacity = 0;
        else if (image.opacity > 1) image.opacity = 1;
        //image.overlay?.setOpacity(image.opacity);
    } catch(err) {
        console.error(err);
    }
}
