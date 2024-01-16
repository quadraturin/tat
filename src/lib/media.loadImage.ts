import * as R from '$lib/registry'
import { readBinaryFile } from "@tauri-apps/api/fs";
import { basename, extname } from '@tauri-apps/api/path';
import L, { LatLng, control, type VertexEvent, Bounds, Point, LatLngBounds } from 'leaflet';
import 'leaflet-editable';
import { removeImageByRect } from './media.removeImage';
import { updateLoadingModal } from './ui.modals';
import type { MapImage } from './classes/MapImage';
import { getRandomPointInViewport } from './util.getRandomPointInViewport';
import type { event } from '@tauri-apps/api';

export async function loadImage(filePath:string, x?:number, y?:number, w?:number, h?:number, ow?:number, oh?:number): Promise<void> {
    try {
        updateLoadingModal(filePath);
        // read in the image data
        const content = await readBinaryFile(filePath);

        let lat = y;
        let lng = x;
        let width = w;
        let height = h;
        let originalWidth = ow;
        let originalHeight = oh;
        let ext = await extname(filePath);

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
        
        newImage(file, height, width, lat, lng);

    }
    catch (err) {
        console.error(err);
    }
}

export async function newImage(file:File, height:number, width:number, lat?:number, lng?:number) {
    try {
        // create a data URL & pass into Leaflet
        const mapImageURL = URL.createObjectURL(file);

        // grab the map
        const map = R.getMap();

        // create image id #
        let id = R.getImageList().length;

        let point:L.LatLng;

        if (typeof lng === 'undefined' || typeof lat === 'undefined')
        {
            point = getRandomPointInViewport(R.getMap())
        }
        else
        {
            point = L.latLng(lat as number,lng as number);
        }
        lat = point.lat;
        lng = point.lng;

        // create image overlay
        let bounds = [[lat,lng], [height,width]] as L.LatLngBoundsExpression;
        
        let overlay = L.imageOverlay(mapImageURL, bounds,
        {
            interactive: true,
            className: "id-" + id
        }).addTo(map);
        overlay.bringToFront();
        

        // create rectangle over image
        let imageRect = L.rectangle([[lat,lng],[lat+height,lng],[lat+height,lng+width],[lat,lng+width]], {
            color: 'coral',
            fillColor: 'coral',
            opacity: 1,
            fillOpacity: 0,
            weight: 1
        }).addTo(map);
        imageRect.enableEdit();
        imageRect.on('dblclick', L.DomEvent.stop).on('dblclick', toggleImageEdit);
        bindEventsToImageRect();
        R.setHasMedia(true);
        overlay.setBounds(imageRect.getBounds());
        bringImageToFront();
        R.setProjectDirty;

        // add image data to registry
        R.addToImageList(file, overlay, imageRect, width, height, id);

        // center and frame the image
        //map.flyToBounds(bounds);
        
        // functions

        // called repeatedly while editing the image and when loaded
        function editImage(e:VertexEvent) {
            let w:boolean;
            let n:boolean;
            let availableWidth:number;
            let availableHeight:number;
            let p1:L.LatLng;
            let p2:L.LatLng;

            if (R.getIsProportionalScaleOn()) { // proportional scale
                // determine which corner is being dragged
                if (e.vertex.getLatLng().lat <= imageRect.getCenter().lat) n = false;
                else n = true;
                if (e.vertex.getLatLng().lng <= imageRect.getCenter().lng) w = true;
                else w = false;
                
                if (n) availableHeight = Math.abs(imageRect.getBounds().getSouth() - e.vertex.getLatLng().lat);
                else   availableHeight = Math.abs(e.vertex.getLatLng().lat - imageRect.getBounds().getNorth());

                if (w) availableWidth = Math.abs(imageRect.getBounds().getEast() - e.vertex.getLatLng().lng);
                else   availableWidth = Math.abs(e.vertex.getLatLng().lng - imageRect.getBounds().getWest());
                
                let scale = Math.min(availableWidth/width, availableHeight/height);
                console.log("scale", scale)

                if (n&&w) { // NW
                    p1 = new L.LatLng(imageRect.getBounds().getSouth(), imageRect.getBounds().getEast()); // SE corner
                    p2 = new L.LatLng(p1.lat + height*scale, p1.lng - width*scale);
                } else if (n) { // NE
                    p1 = new L.LatLng(imageRect.getBounds().getSouth(), imageRect.getBounds().getWest()); // SW corner
                    p2 = new L.LatLng(p1.lat + height*scale, p1.lng + width*scale);
                } else if (!n&&w) { // SW
                    p1 = new L.LatLng(imageRect.getBounds().getNorth(), imageRect.getBounds().getEast()); // NE corner
                    p2 = new L.LatLng(p1.lat - height*scale, p1.lng - width*scale);
                } else { // SE
                    p1 = new L.LatLng(imageRect.getBounds().getNorth(), imageRect.getBounds().getWest()); // NW corner
                    p2 = new L.LatLng(p1.lat - height*scale, p1.lng + width*scale);
                }
                console.log(new L.LatLngBounds(p1,p2));
                overlay.setBounds(new L.LatLngBounds(p1,p2));
            } else { // free scale
                overlay.setBounds(imageRect.getBounds());
            }
            bringImageToFront();
            R.setProjectDirty();
        }

        function stopEditImage() {
            imageRect.setBounds(overlay.getBounds()); // set control rect to image bounds
            imageRect.disableEdit(); // needed to put the edit handles in the right place
            imageRect.enableEdit();
        }

        // called when we stop moving the image
        function stopMoveImage() {
            overlay.setBounds(imageRect.getBounds());
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
            overlay.setBounds(imageRect.getBounds());
            R.setImageOffset(overlay.getBounds().getSouthWest() as L.LatLng);
            bringImageToFront();
            R.setProjectDirty();
        }

        // called repeatedly while moving the image
        function moveImage(e:L.LeafletEvent) {
            //console.log('moving!');
            
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
            if (!imageRect.editEnabled()) return;
            if (R.getIsSelected(imageRect)) R.removeFromSelection(imageRect);
            else R.addToSelection(imageRect);
            bringImageToFront();
            if (R.getIsInDeleteMode()) removeImageByRect(imageRect);
        }

        function bringImageToFront() {
            overlay.bringToFront();
            imageRect.bringToFront();
            R.moveImageToEndOfList(overlay);
        }

        // sets interactive event handlers for the image
        function bindEventsToImageRect()
        {
            imageRect.on('editable:vertex:drag', (e) => editImage(e));
            imageRect.on('editable:vertex:dragend', stopEditImage);
            imageRect.on('dragstart', startMoveImage);
            imageRect.on('drag', (e) => moveImage(e));
            imageRect.on('dragend', stopMoveImage);
            imageRect.on('dragend', onClick);
            imageRect.on('mousedown', onClick);
        }
    } catch(err) {
        console.error(err);
    }
}

export async function duplicateImage(image:MapImage) {
    newImage(image.data, image.originalHeight, image.originalWidth);
}



