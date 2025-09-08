import * as R from '$lib/registry.svelte'
import { basename } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/core';
import type { CanvasImage, canvasImageOptions } from './classes/CanvasImage.svelte';

/**
 * Create a new image in the project.
 * @param src File path to the image.
 * @param x X position of the image.
 * @param y Y position of the image.
 */
export async function newImageFromPath(src:string, x?:number, y?:number) {
    try {
        // Construct canvas image options.
        const img = new Image();
        img.src = convertFileSrc(src);
        const name = await basename(src);

        let options:canvasImageOptions = {
            src: src,
            name: name,
            x: x,
            y: y           
        }
        newImage(options);
    } catch (err) {
        console.error(err);
    }
}

/**
 * create a new image on the canvas.
 * @param options new image options.
 */
export async function newImage(options:canvasImageOptions) {
    try {
        let o = Object.assign({}, options);
        o.name = options.name ? options.name : await basename(options.src);
        R.setHasMedia(true);
        R.setProjectDirty;
        R.addToImages(o);
        R.getCanvas().update();
    } catch(err) {
        console.error(err);
    }
}

/**
 * duplicate an image on the map.
 * @param image the image to duplicate.
 */
export async function duplicateImage(image:CanvasImage) {
    newImage({
        locked:image.locked,
        height:image.height,
        name:image.name,
        niceName:image.niceName,
        opacity:image.opacity,
        selected:image.selected,
        src:image.src, 
        width:image.width,
        x:image.x + 20,
        y:image.y + 20,
    });
}
