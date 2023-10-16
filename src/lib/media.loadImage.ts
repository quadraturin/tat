import * as R from '$lib/registry'
import { readBinaryFile } from "@tauri-apps/api/fs";
import { basename, extname } from '@tauri-apps/api/path';
import L from 'leaflet';
import 'leaflet-editable';
import { removeImage } from './media.removeImage';

export async function loadImage(filePath:string, x?:number, y?:number, w?:number, h?:number, ow?:number, oh?:number): Promise<void> {
    try {
        // read in the image data
        const content = await readBinaryFile(filePath);

        let lat = y;
        let lng = x;
        let width = w;
        let height = h;
        let originalWidth = ow;
        let originalHeight = oh;
        let ext = await extname(filePath);

        // if no lat/lng is set, set them to 0
        if (typeof lat === 'undefined') lat = 0;
        if (typeof lng === 'undefined') lng = 0;

        // if no width/height is set, get it from image data
        if (typeof width === 'undefined' || typeof height === 'undefined' ||
            typeof originalWidth === 'undefined' || typeof originalHeight === 'undefined')
        {
            // get the image dimensions
            const bmp = await createImageBitmap(new Blob([content]));
            width = bmp.width;
            height = bmp.height;
            originalWidth = width;
            originalHeight = height;
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
            interactive:true
        }).addTo(map);
        

        // create rectangle over image
        let imageRect = L.rectangle([[lat,lng],[lat+height,lng],[lat+height,lng+width],[lat,lng+width]], {
            color: 'coral',
            fillColor: 'coral',
            opacity: 1,
            fillOpacity: 0
        }).addTo(map);
        imageRect.enableEdit();
        imageRect.on('dblclick', L.DomEvent.stop).on('dblclick', toggleImageEdit);
        bindEventsToImageRect();
        editImage();

        // add image data to registry
        R.addToImageList(file, overlay, imageRect, width, height);

        // center and frame the image
        map.flyToBounds(bounds);
        
        // functions

        // called repeatedly while editing the image and when loaded
        function editImage() {
            console.log('editing!');
            /*if (R.getIsProportionalScaleOn())
            {
                const maxHeight = imageRect.getBounds().getNorth() - imageRect.getBounds().getSouth();
                const maxWidth = imageRect.getBounds().getEast() - imageRect.getBounds().getWest();
                const ratio = Math.min(maxHeight / (originalHeight as number), 
                                       maxWidth / (originalWidth as number));
                const newH = (originalHeight as number) * ratio;
                const newW = (originalWidth as number) * ratio;
                imageRect.setBounds([[imageRect.getBounds().getSouth(), imageRect.getBounds().getWest()], 
                                     [imageRect.getBounds().getSouth() + newH, imageRect.getBounds().getWest() + newW]]);
            }*/
            overlay.setBounds(imageRect.getBounds());
            bringImageToFront();
            R.setProjectDirty();
        }

        // called when we stop moving the image
        function stopMoveImage() {
            overlay.setBounds(imageRect.getBounds());
            overlay.setStyle({opacity:1});
            imageRect.setStyle({color:'coral'})
        }

        // called when double-clicking the image (sets/unsets editability)
        function toggleImageEdit() {
            if(imageRect.editEnabled()) imageRect.setStyle({opacity:0});
            else {
                imageRect.setStyle({opacity:1});
                bindEventsToImageRect();
            }
            imageRect.toggleEdit();
        }

        // called when starting to move the image
        function startMoveImage() {
            R.setImageOffset(overlay.getBounds().getSouthWest() as L.LatLng);
            bringImageToFront();
            R.setProjectDirty();
        }

        // called repeatedly while moving the image
        function moveImage(e:L.LeafletEvent) {
            console.log('moving!');
            
            // raise to front and set drag style
            imageRect.bringToFront().setStyle({color:'white'})
            
            // update image location while dragging
            let newPos = e.target.dragging._draggable._newPos;
            let sw = L.CRS.Simple.pointToLatLng(L.point(newPos.x, newPos.y), R.getMap().getZoom());
            let h = overlay.getBounds().getNorth() - overlay.getBounds().getSouth();
            let w = overlay.getBounds().getEast() - overlay.getBounds().getWest();
            let ne = L.latLng(sw.lat + h, sw.lng + w);
            sw.lat += R.getImageOffset().lat;
            sw.lng += R.getImageOffset().lng;
            ne.lat += R.getImageOffset().lat;
            ne.lng += R.getImageOffset().lng;
            let bounds = L.latLngBounds(sw,ne);
            overlay.setBounds(bounds);
        }

        // brings image and rect to front of respective layers
        function onClick()
        {
            bringImageToFront();
            if (R.getIsInDeleteMode()) removeImage(imageRect);
        }

        function bringImageToFront() {
            overlay.bringToFront();
            imageRect.bringToFront();
        }

        // sets interactive event handlers for the image
        function bindEventsToImageRect()
        {
            imageRect.on('editable:vertex:drag', editImage);
            imageRect.on('dragstart', startMoveImage);
            imageRect.on('drag', (e) => moveImage(e));
            imageRect.on('dragend', stopMoveImage);
            imageRect.on('click', onClick);
        }
        
    }
    catch (err) {
        console.error(err);
    }
}




