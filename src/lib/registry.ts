import L, { ImageOverlay } from "leaflet";
import { MapImage } from "./classes/MapImage";
import { MapSound } from "./classes/MapSound";
import type { MapInfo } from "./classes/MapInfo";

// the map
let map:L.Map;
export function getMap():L.Map { return map; };
export function setMap(newMap:L.Map) { map = newMap; };

// the audio listener
let listener:L.Marker;
export function getListener():L.Marker { return listener; };
export function setListener(newListener:L.Marker) { listener = newListener; };

// loading state
let isLoading = false;
export function getIsLoading():boolean { return isLoading; };
export function setIsLoading(value:boolean) {isLoading = value; };

// saving state
let isSaving  = false;
export function getIsSaving():boolean { return isSaving; };
export function setIsSaving(value:boolean) {isSaving = value; };

// loaded project path
let projectPath:string | undefined;
export function setProjectPath(p:string) { projectPath = p; projectPath = projectPath || undefined };
export function getProjectPath():string|undefined { return projectPath; };

// loaded project path
let projectName:string;
export function setProjectName(p:string) { projectName = p; };
export function getProjectName():string { return projectName; };

// track if there is any media in the project
let hasMedia = false;
export function getHasMedia():boolean { return hasMedia; };
export function setHasMedia(b:boolean) { hasMedia = b; };

// track if there are unsaved changes
let isProjectDirty = false;
export function getisProjectDirty():boolean { return isProjectDirty; };
export function setProjectDirty() { isProjectDirty = true; };
export function setProjectClean() { isProjectDirty = false; };

// list of maps
let mapList   = new Array<MapInfo>;
export function getMapList():Array<MapInfo> { return mapList; };
export function setMapList(newMapList:Array<MapInfo>) { mapList = newMapList; };

// list of images
let imageList = new Array<MapImage>;
export function getImageList():Array<MapImage> { return imageList; };
export function setImageList(newImageList:Array<MapImage>) { imageList = newImageList; };
export function addToImageList(data:File, overlay:L.ImageOverlay, rect:L.Rectangle, ow:number, oh:number, opacity?:number, order?:number) {
    imageList.push(new MapImage(data, overlay, rect, ow, oh, opacity, order));
}
export function moveImageToEndOfList(overlay:ImageOverlay) {
    // moves image to end of list -- required for save/load as order determines stacking
    for (let i=0; i < imageList.length; i++) {
        if (imageList[i].overlay == overlay) {
            imageList.push(imageList.splice(i,1)[0]);
            break;
        }
    }
}
export function moveImageToStartOfList(i:number) {
    // moves image to start of list -- required for save/load as order determines stacking
    imageList.splice(0,0,imageList.splice(i,1)[0]);
}
//sorts and stacks the images
export function sortImageList() {
    imageList.sort(function(a,b){
        return a.order-b.order;
    });
    for(let image of imageList) {
        image.overlay.bringToFront();
        image.rect.bringToFront();
    }
}

// list of sounds
let soundList = new Array<MapSound>;
export function getSoundList():Array<MapSound> { return soundList; };
export function setSoundList(newSoundList:Array<MapSound>) { soundList = newSoundList; };
export function addToSoundList(data:File, sound:Howl, emitter:L.Circle|L.Polygon|undefined, volume:number|undefined, muted:boolean|undefined, solo:boolean|undefined, soundType:string|undefined, order:number|undefined) {
    soundList.push(new MapSound(data, sound, emitter, volume, muted, solo, soundType, order));
}
//sorts and stacks the images
export function sortSoundList() {
    soundList.sort(function(a,b){
        return a.order-b.order;
    });
    for(let sound of soundList) {
        if(typeof sound.emitter != "undefined") {
            sound.emitter.bringToFront();
            sound.emitter.bringToFront();
        }
    }
}

// control modifiers
let isProportionalScaleOn = false;
export function getIsProportionalScaleOn():boolean { return isProportionalScaleOn; };
export function setIsProportionalScaleOn(b:boolean) { isProportionalScaleOn = b; };
export function toggleProportionalScale(){ isProportionalScaleOn = !isProportionalScaleOn };
let isInDeleteMode = false;
export function getIsInDeleteMode():boolean { return isInDeleteMode; };
export function setIsInDeleteMode(b:boolean) {isInDeleteMode = b; };


// image drag offset
let dragOffset = L.latLng(0,0);
export function addToDragOffset(x:number, y:number):L.LatLng {
    dragOffset.lat += y;
    dragOffset.lng += x;
    return dragOffset;
}
export function resetDragOffset() {
    dragOffset.lat = 0;
    dragOffset.lng = 0;
}

// image offset from origin
let imageOffsetFromOrigin = L.latLng(0,0);
export function setImageOffset(imageLatLng:L.LatLng):void {
    imageOffsetFromOrigin = imageLatLng;
    //console.log("offset", imageOffsetFromOrigin);
}
export function getImageOffset():L.LatLng {
    return imageOffsetFromOrigin;
}

// map object selection
let selected = new Array<L.Rectangle|L.Circle|L.Polygon>;
export function addToSelection(item:L.Rectangle|L.Circle|L.Polygon) {
    selected.push(item);
    item.setStyle({color:"white"});
}
export function removeFromSelection(item:L.Rectangle|L.Circle|L.Polygon) {
    for (let i=0;i<selected.length;i++) {
        if (item === selected[i]) {
            selected.splice(i,1);
            break;
        }
    }
    item.setStyle({color:"coral"});
}
export function getIsSelected(item:L.Rectangle|L.Circle|L.Polygon|undefined):boolean {
    if (typeof item == "undefined") return false;
    for (let i=0;i<selected.length;i++) {
        if (item === selected[i]) {
            return true;
        }
    }
    return false;
}
export function getSelectedList():Array<L.Rectangle|L.Circle|L.Polygon> {
    return selected;
}
export function toggleSelected(item:L.Rectangle|L.Circle|L.Polygon|undefined) {
    if (typeof item == "undefined") return;
    if (getIsSelected(item)) {
        removeFromSelection(item);
    } else {
        addToSelection(item);
    }
}

export function getIsLocked (item:L.Rectangle|L.Circle|L.Polygon|undefined):boolean {
    if (typeof item == "undefined") return true;
    return !item.editEnabled();
}

// menu state
let aboutMenuOpen = false;
let settingsMenuOpen = false;
export function getIsAboutMenuOpen():boolean {
    return aboutMenuOpen;
}
export function setIsAboutMenuOpen(val:boolean) {
    aboutMenuOpen = val;
}
export function getIsSettingsMenuOpen():boolean {
    return settingsMenuOpen;
}
export function setIsSettingsMenuOpen(val:boolean) {
    settingsMenuOpen = val;
}

// text
export let t:any;
export async function setText(data:any) {
    t = data;
}

// help state
let helpActive = true;
export function toggleHelpActive() {
    helpActive = !helpActive;
}
export function getIsHelpActive():boolean {
    return helpActive;
}