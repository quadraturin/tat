import * as R from '$lib/registry'
import { readBinaryFile } from "@tauri-apps/api/fs";
import { basename } from '@tauri-apps/api/path';
import L from 'leaflet';

export async function loadImage({ filePath, ext }: { filePath: string; ext: string; }): Promise<void> {
    try {
        // read in the image data
        const content = await readBinaryFile(filePath);

        // get the image dimensions
        const bmp = await createImageBitmap(new Blob([content]));
        const { width, height } = bmp;
        bmp.close(); // free memory

        // get the filename from the path
        const fileName = await basename(filePath);

        // return a File object to hold the data
        const file =  new File([content], fileName, { type: 'image/' + ext });

        // create a data URL & pass into Leaflet
        const mapImageURL = URL.createObjectURL(file);
//        const overlay = loadImageToMap(mapImageURL, width, height, R.getMap());

        // grab the map
        const map = R.getMap();

        // create image overlay
        let bounds = [[0,0], [height,width]] as L.LatLngBoundsExpression;
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
