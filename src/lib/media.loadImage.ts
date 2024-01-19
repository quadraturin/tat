import * as R from '$lib/registry'
import { readBinaryFile } from "@tauri-apps/api/fs";
import { basename, extname } from '@tauri-apps/api/path';
import L from 'leaflet';
import 'leaflet-editable';
import { removeImageByRect } from './media.removeImage';
import { updateLoadingModal } from './ui.modals';
import type { MapImage } from './classes/MapImage';
import { getRandomPointInViewport } from './util.getRandomPointInViewport';
import { help } from './util.help';

// load and return an image file
export async function loadImageFile(filePath:string):Promise<File|undefined> {
    try {
        updateLoadingModal(filePath);
        const content = await readBinaryFile(filePath);
        const fileName = await basename(filePath);
        const ext = await extname(filePath);
        return new File([content], fileName, {type: 'image/' + ext});
    } catch(err) {
        console.error(err);
        return;
    }
}

// create an image on the map
export async function newImage(file:File, height?:number, width?:number, lat?:number, lng?:number, opacity?:number, order?:number) {
    try {
        // if no width/height is set, get it from image data
        if (typeof width === 'undefined' || typeof height === 'undefined')
        {
            // get the image dimensions
            const bmp = await createImageBitmap(new Blob([file]));
            width = bmp.width;
            height = bmp.height;
            bmp.close(); // free memory
        }

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
            className: "id-" + id,
            opacity: opacity
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
        imageRect.on('dblclick', L.DomEvent.stop).on('dblclick', () => {toggleImageEdit(imageRect)});
        imageRect.on('mouseover', () => {
            if (!imageRect.editEnabled()) help(R.t.help.map.locked, R.t.help.map.image, R.t.help.map.itemLocked, R.t.help.map.itemLockedActions);
            else if(R.getIsSelected(imageRect)) help(R.t.help.map.selected, R.t.help.map.image, R.t.help.map.imageActions, R.t.help.map.itemSelectedActions);
            else help(R.t.help.map.image, R.t.help.map.imageActions, R.t.help.map.itemUnselectedActions);
        });
        imageRect.on('mouseout', () => {help()});

        bindEventsToImageRect(imageRect, overlay, width, height);
        R.setHasMedia(true);
        overlay.setBounds(imageRect.getBounds());
        bringImageToFront(imageRect, overlay);
        R.setProjectDirty;

        // add image data to registry
        R.addToImageList(file, overlay, imageRect, width, height, opacity, order);

        // center and frame the image
        //map.flyToBounds(bounds);
        
    } catch(err) {
        console.error(err);
    }
}

export async function duplicateImage(image:MapImage) {
    newImage(image.data, image.originalHeight, image.originalWidth);
}


// called when double-clicking the image (sets/unsets editability)
export function toggleImageEdit(imageRect:L.Rectangle) {
    if (imageRect.editEnabled()) imageRect.setStyle({opacity:0});
    else imageRect.setStyle({opacity:1});
    imageRect.toggleEdit();
    if (R.getIsSelected(imageRect)) R.removeFromSelection(imageRect);
}

function editImage(e:L.VertexEvent, imageRect:L.Rectangle, overlay:L.ImageOverlay, width:number, height:number) {
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
        //console.log("scale", scale)

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
        //console.log(new L.LatLngBounds(p1,p2));
        overlay.setBounds(new L.LatLngBounds(p1,p2));
    } else { // free scale
        overlay.setBounds(imageRect.getBounds());
    }
    bringImageToFront(imageRect,overlay);
    R.setProjectDirty();
}

function stopEditImage(imageRect:L.Rectangle, overlay:L.ImageOverlay) {
    imageRect.setBounds(overlay.getBounds()); // set control rect to image bounds
    imageRect.disableEdit(); // needed to put the edit handles in the right place
    imageRect.enableEdit();
}

// called when we stop moving the image
function stopMoveImage(imageRect:L.Rectangle, overlay:L.ImageOverlay) {
    overlay.setBounds(imageRect.getBounds());
}

// called when starting to move the image
function startMoveImage(imageRect:L.Rectangle, overlay:L.ImageOverlay) {
    overlay.setBounds(imageRect.getBounds());
    R.setImageOffset(overlay.getBounds().getSouthWest() as L.LatLng);
    bringImageToFront(imageRect, overlay);
    R.setProjectDirty();
}

// called repeatedly while moving the image
function moveImage(e:L.LeafletEvent, imageRect:L.Rectangle, overlay:L.ImageOverlay) {
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
function onClick(imageRect:L.Rectangle, overlay:L.ImageOverlay)
{
    if (!imageRect.editEnabled()) return;
    if (R.getIsSelected(imageRect)) R.removeFromSelection(imageRect);
    else R.addToSelection(imageRect);
    bringImageToFront(imageRect, overlay);
    if (R.getIsInDeleteMode()) removeImageByRect(imageRect);
}

function bringImageToFront(imageRect:L.Rectangle, overlay:L.ImageOverlay) {
    overlay.bringToFront();
    imageRect.bringToFront();
    R.moveImageToEndOfList(overlay);
}

// sets interactive event handlers for the image
function bindEventsToImageRect(imageRect:L.Rectangle, overlay:L.ImageOverlay, width:number, height:number)
{
    imageRect.on('editable:vertex:drag', (e) => editImage(e, imageRect, overlay, width, height));
    imageRect.on('editable:vertex:mousedown', (e) => editImage(e, imageRect, overlay, width, height));
    imageRect.on('editable:vertex:dragend', () => stopEditImage(imageRect, overlay));
    imageRect.on('dragstart', () => startMoveImage(imageRect, overlay));
    imageRect.on('drag', (e) => moveImage(e, imageRect, overlay));
    imageRect.on('dragend', () => stopMoveImage(imageRect, overlay));
    imageRect.on('dragend', () => onClick(imageRect, overlay));
    imageRect.on('mouseup', () => onClick(imageRect, overlay));
}

