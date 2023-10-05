import * as R from '$lib/registry'
import { readBinaryFile } from "@tauri-apps/api/fs";
import { basename, extname } from '@tauri-apps/api/path';
import L from 'leaflet';

export async function loadImage(filePath:string, x?:number, y?:number, w?:number, h?:number): Promise<void> {
    try {
        // read in the image data
        const content = await readBinaryFile(filePath);

        let lat = y;
        let lng = x;
        let width = w;
        let height = h;
        let ext = await extname(filePath);

        if (typeof lat === 'undefined') lat = 0;
        if (typeof lng === 'undefined') lng = 0;
        // if no width/height is set, get it from image data
        if (typeof width === 'undefined' || typeof height === 'undefined')
        {
            // get the image dimensions
            const bmp = await createImageBitmap(new Blob([content]));
            width = bmp.width;
            height = bmp.height;
            bmp.close(); // free memory
        }

        // get the filename from the path
        const fileName = await basename(filePath);

        // return a File object to hold the data
        const file =  new File([content], fileName, { type: 'image/' + ext });

        // create a data URL & pass into Leaflet
        const mapImageURL = URL.createObjectURL(file);

        // grab the map
        const map = R.getMap();

        // create image overlay
        let bounds = [[lat,lng], [height,width]] as L.LatLngBoundsExpression;
        let overlay = L.imageOverlay(mapImageURL, bounds, 
        {
            interactive: true
        }).addTo(map);

        // center and frame the image
        map.setView([height/2, width/2], 1);
        map.fitBounds(bounds);
        
        // add image data to registry
        R.addToImageList(file, overlay);
    }
    catch (err) {
        console.error(err);
    }
}
