import * as R from '$lib/registry.svelte'
import { readFile } from "@tauri-apps/plugin-fs";
import { basename, extname } from '@tauri-apps/api/path';
import { updateLoadingModal } from './ui.modals';
import { help } from './util.help';
import { convertFileSrc } from '@tauri-apps/api/core';
import { t } from '$lib/util.localization';
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
            editable: true,
            grabbed: false,
            height: img.height,
            image: img,
            name: name,
            niceName: name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim(),
            opacity: 1,
            originalHeight: img.height,
            originalWidth: img.width,
            selected: false,
            src: src,
            width: img.width,
            x: x? x : Math.random()*100,
            y: y? y : Math.random()*100,
            
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
export async function duplicateImage(image:CanvasImage) {
    newImage({
        editable:image.editable,
        grabbed:image.grabbed,
        height:image.height,
        image:image.image,
        name:image.name,
        niceName:image.niceName,
        opacity:image.opacity,
        originalHeight:image.originalHeight,
        originalWidth:image.originalWidth,
        selected:image.selected,
        src:image.src, 
        width:image.width,
        x:image.x + 20,
        y:image.y + 20,
    });
}
