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

/**
 * load an image file.
 * @param filePath path to image file.
 * @returns the image file.
 */
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

/**
 * create an image on the map.
 * @param file the image file.
 * @param height the image's height.
 * @param width the image's width.
 * @param lat the image's latitude.
 * @param lng the image's longitude.
 * @param opacity the image's opacity.
 * @param order the image's stacking order.
 * @param locked whether the image is locked or not.
 */
export async function newImage(file:File, height?:number, width?:number, lat?:number, lng?:number, opacity?:number, order?:number, locked?:boolean) {
    try {
        // get the image dimensions
        const bmp = await createImageBitmap(new Blob([file]));

        let originalWidth = bmp.width;
        let originalHeight = bmp.height;

        if (typeof width == "undefined") width = bmp.width;
        if (typeof height == "undefined") height = bmp.height;

        bmp.close(); // free memory
        

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

        bindEventsToImageRect(imageRect, overlay, width, height, originalWidth, originalHeight);
        R.setHasMedia(true);
        overlay.setBounds(imageRect.getBounds());
        bringImageToFront(imageRect, overlay);
        R.setProjectDirty;

        // add image data to registry
        R.addToImageList(file, overlay, imageRect, originalWidth, originalHeight, opacity, order);
        
        if(locked) toggleImageEdit(imageRect);

        // center and frame the image
        //map.flyToBounds(bounds);
        
    } catch(err) {
        console.error(err);
    }
}

/**
 * duplicate an image on the map.
 * @param image the image to duplicate.
 */
export async function duplicateImage(image:MapImage) {
    newImage(image.data, image.originalHeight, image.originalWidth);
}

/**
 * set/unset editability of an image rectangle. called when double-clicking.
 * @param imageRect the edit rectangle to toggle.
 */
export function toggleImageEdit(imageRect:L.Rectangle) {
    if (imageRect.editEnabled()) imageRect.setStyle({opacity:0});
    else imageRect.setStyle({opacity:1});
    imageRect.toggleEdit();
    if (R.getIsSelected(imageRect)) R.removeFromSelection(imageRect);
}

/**
 * scale an image on the map.
 * @param e a vertex event from the image rectangle.
 * @param imageRect the image rectangle.
 * @param overlay the image overlay.
 * @param originalWidth the original width of the image.
 * @param originalHeight the original height of the image.
 */
function editImage(e:L.VertexEvent, imageRect:L.Rectangle, overlay:L.ImageOverlay, originalWidth:number, originalHeight:number) {
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
        
        let scale = Math.min(availableWidth/originalWidth, availableHeight/originalHeight);
        //console.log("scale", scale)

        if (n&&w) { // NW
            p1 = new L.LatLng(imageRect.getBounds().getSouth(), imageRect.getBounds().getEast()); // SE corner
            p2 = new L.LatLng(p1.lat + originalHeight*scale, p1.lng - originalWidth*scale);
        } else if (n) { // NE
            p1 = new L.LatLng(imageRect.getBounds().getSouth(), imageRect.getBounds().getWest()); // SW corner
            p2 = new L.LatLng(p1.lat + originalHeight*scale, p1.lng + originalWidth*scale);
        } else if (!n&&w) { // SW
            p1 = new L.LatLng(imageRect.getBounds().getNorth(), imageRect.getBounds().getEast()); // NE corner
            p2 = new L.LatLng(p1.lat - originalHeight*scale, p1.lng - originalWidth*scale);
        } else { // SE
            p1 = new L.LatLng(imageRect.getBounds().getNorth(), imageRect.getBounds().getWest()); // NW corner
            p2 = new L.LatLng(p1.lat - originalHeight*scale, p1.lng + originalWidth*scale);
        }
        //console.log(new L.LatLngBounds(p1,p2));
        overlay.setBounds(new L.LatLngBounds(p1,p2));
    } else { // free scale
        overlay.setBounds(imageRect.getBounds());
    }
    bringImageToFront(imageRect,overlay);
    R.setProjectDirty();
}

/**
 * align the image rectangle with the overlay.
 * @param imageRect the image rectangle to stop editing.
 * @param overlay the image overlay.
 */
function stopEditImage(imageRect:L.Rectangle, overlay:L.ImageOverlay) {
    imageRect.setBounds(overlay.getBounds()); // set control rect to image bounds
    imageRect.disableEdit(); // needed to put the edit handles in the right place
    imageRect.enableEdit();
}

/**
 * align the overlay with the image rectangle when the user stops moving the image.
 * @param imageRect the image rect to stop moving.
 * @param overlay the image overlay.
 */
function stopMoveImage(imageRect:L.Rectangle, overlay:L.ImageOverlay) {
    overlay.setBounds(imageRect.getBounds());
}

/**
 * prepare the image rectangle and overlay to be moved.
 * @param imageRect the image rectangle being moved.
 * @param overlay the image overlay.
 */
function startMoveImage(imageRect:L.Rectangle, overlay:L.ImageOverlay) {
    overlay.setBounds(imageRect.getBounds());
    R.setImageOffset(overlay.getBounds().getSouthWest() as L.LatLng);
    bringImageToFront(imageRect, overlay);
    R.setProjectDirty();
}

/**
 * move an image on the map by dragging.
 * @param e the leaflet drag event.
 * @param imageRect the image rectangle being dragged.
 * @param overlay the image overlay.
 */
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

/**
 * select/deselect and bring an image rectangle and overlay to the front of their respective layers on click.
 * @param imageRect the image rectangle being clicked.
 * @param overlay the image overlay.
 * @returns 
 */
function onClick(imageRect:L.Rectangle, overlay:L.ImageOverlay)
{
    if (!imageRect.editEnabled()) return;
    if (R.getIsSelected(imageRect)) R.removeFromSelection(imageRect);
    else R.addToSelection(imageRect);
    bringImageToFront(imageRect, overlay);
    if (R.getIsInDeleteMode()) removeImageByRect(imageRect);
}

/**
 * bring an image rectangle and overlay to the front of their respective layers.
 * @param imageRect the image rectangle to bring to the front.
 * @param overlay the image overlay.
 */
function bringImageToFront(imageRect:L.Rectangle, overlay:L.ImageOverlay) {
    overlay.bringToFront();
    imageRect.bringToFront();
    R.moveImageToEndOfList(overlay);
}

/**
 * set interactive event handlers for an image rectangle.
 * @param imageRect the image rectangle to set handlers for.
 * @param overlay the image overlay.
 * @param width the width of the image.
 * @param height the height of the image.
 * @param originalWidth the original width of the image.
 * @param originalHeight the original height of the image.
 */
function bindEventsToImageRect(imageRect:L.Rectangle, overlay:L.ImageOverlay, width:number, height:number, originalWidth:number, originalHeight:number)
{
    imageRect.on('editable:vertex:drag', (e) => editImage(e, imageRect, overlay, originalWidth, originalHeight));
    imageRect.on('editable:vertex:mousedown', (e) => editImage(e, imageRect, overlay, width, height));
    imageRect.on('editable:vertex:dragend', () => stopEditImage(imageRect, overlay));
    imageRect.on('dragstart', () => startMoveImage(imageRect, overlay));
    imageRect.on('drag', (e) => moveImage(e, imageRect, overlay));
    imageRect.on('dragend', () => stopMoveImage(imageRect, overlay));
    imageRect.on('dragend', () => onClick(imageRect, overlay));
    imageRect.on('mouseup', () => onClick(imageRect, overlay));
}

