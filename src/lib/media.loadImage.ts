import * as R from '$lib/registry.svelte'
import { readFile } from "@tauri-apps/plugin-fs";
import { basename, extname } from '@tauri-apps/api/path';
import { removeImageByRect } from './media.removeImage';
import { updateLoadingModal } from './ui.modals';
import type { MapImage } from './classes/MapImage.svelte';
import { getRandomPointInViewport } from './util.getRandomPointInViewport';
import { help } from './util.help';
import { convertFileSrc } from '@tauri-apps/api/core';
import { t } from '$lib/util.localization';
import type { canvasImageOptions } from './classes/CanvasImage.svelte';

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
            image: img,
            x: x? x : Math.random()*100,
            y: y? y : Math.random()*100,
            width: img.width,
            height: img.height,
            originalWidth: img.width,
            originalHeight: img.height,
            opacity: 1,
            order: 0,
            name: name,
            niceName: name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim(),
            editable: true,
            selected: false,
            grabbed: false,
            locked: false
        }
        R.addToImages(options);
        R.getCanvas().update();
    } catch (err) {
        console.error(err);
    }
}

/**
 * create a new image on the canvas.
 * @param options new image options.
 */
export async function newImage(options?:canvasImageOptions) {
    try {
        // Load defaults, overwrite with options.
        let o = Object.assign({
            opacity: 1,
            locked: false
        }, options);

        // Generate a nice name for the image based on the filename.
        let name = await basename(o.src);
        let niceName = name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim();

        // Make an image.
        let img = new Image();
        img.src = convertFileSrc(o.src);

        // When the image loads, do everything else.
        img.onload = function(){

            // Get the original image dimensions.
            let originalW:number = img.width;
            let originalH:number = img.height;

            // If the current display dimensions are undefined, set them to the originals.
            if (typeof o.width == "undefined") o.width = originalW;
            if (typeof o.height == "undefined") o.height = originalH;

            // Create image order based on current image list length.
            if (typeof o.order == "undefined") o.order = R.getImages().length;

            // Determine the image origin point coords if they haven't been provided.
            if (typeof o.x == "undefined"){
                //if (typeof o.lng != "undefined") o.x = o.lng;
                //else 
                o.x = 0; // todo: random location
            }
            if (typeof o.y == "undefined"){
                //if (typeof o.lat != "undefined") o.y = o.lat;
                //else 
                o.y = 0; // todo: random location
            }
            R.setHasMedia(true);
            R.setProjectDirty;
            R.addToImages(o);
        }
    } catch(err) {
        console.error(err);
    }
}

/**
 * duplicate an image on the map.
 * @param image the image to duplicate.
 */
export async function duplicateImage(image:MapImage) {
    //newImage({src:image.src, opacity:image.opacity});
}

/**
 * set/unset editability of an image rectangle. called when double-clicking.
 * @param imageRect the edit rectangle to toggle.
 */
export function toggleImageEdit(imageRect:L.Rectangle|undefined) {
    if (!imageRect) return;
    if (imageRect.editEnabled()) imageRect.setStyle({opacity:0});
    else imageRect.setStyle({opacity:1});
    imageRect.toggleEdit();
    if (R.getIsSelected(imageRect)) R.removeFromSelection(imageRect);
}
