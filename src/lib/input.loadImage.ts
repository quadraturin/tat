import * as R from '$lib/registry'
import { readBinaryFile } from "@tauri-apps/api/fs";
import { basename, extname } from '@tauri-apps/api/path';
import L from 'leaflet';
import 'leaflet-editable';
import 'leaflet.path.drag';

export async function loadImage(filePath:string, x?:number, y?:number, w?:number, h?:number): Promise<void> {
    try {
        // read in the image data
        const content = await readBinaryFile(filePath);

        let lat = y;
        let lng = x;
        let width = w;
        let height = h;
        let ext = await extname(filePath);

        // if no lat/lng is set, set them to 0
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
        }).addTo(map);
        
        // add image data to registry
        R.addToImageList(file, overlay);
        
        //let proportionalScale = true;

        function editImage() {
            overlay.setBounds(imageRect.getBounds());
            overlay.bringToFront();
        }

        function moveImage() {
            overlay.setBounds(imageRect.getBounds());
            overlay.bringToFront();
            overlay.setStyle({opacity:0.5});
            imageRect.redraw();
        }

        function stopMoveImage() {
            overlay.setBounds(imageRect.getBounds());
            overlay.setStyle({opacity:1});
        }

        function toggleImageEdit() {
            if(imageRect.editEnabled()) imageRect.setStyle({opacity:0});
            else imageRect.setStyle({opacity:0.5});
            imageRect.toggleEdit();
        }

        // create rectangle over image
        let imageRect = L.rectangle([[lat,lng],[lat+height,lng],[lat+height,lng+width],[lat,lng+width]], {
            color: 'coral',
            fillColor: 'coral',
            opacity: 0.5,
            fillOpacity: 0
        }).addTo(map);
        imageRect.enableEdit();
        imageRect.on('dblclick', L.DomEvent.stop).on('dblclick', toggleImageEdit);
        imageRect.on('editable:editing', editImage);
        imageRect.on('dragstart drag', moveImage); // drag doesn't seem to work -- image pos doesn't update while dragging
        imageRect.on('dragend', stopMoveImage);
        imageRect.on('click', overlay.bringToFront);
        //imageRect.on('editable:vertex:shiftclick', )
        
        editImage();

        // center and frame the image
        map.flyToBounds(bounds);
        
    }
    catch (err) {
        console.error(err);
    }
}
