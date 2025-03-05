import L from "leaflet";
import { MapImage } from "./classes/MapImage.svelte";
import { MapSound } from "./classes/MapSound.svelte";
import type { MapInfo } from "./classes/MapInfo";
import type * as H from 'howler';
import { AppTheme } from "./classes/AppTheme.svelte";
import { getThemesList } from "./settings.theme";



/**
 * the map.
 */
let map:L.Map;
/**
 * get the map.
 * @returns the map.
 */
export function getMap():L.Map { return map; };
/**
 * change the map.
 * @param newMap the map to overwrite the old map with.
 */
export function setMap(newMap:L.Map) { map = newMap; };



/**
 * the listener.
 */
let listener:L.Marker;
/**
 * get the listener.
 * @returns the listener.
 */
export function getListener():L.Marker { return listener; };
/**
 * sets a new listener.
 * @param newListener the new listener to set.
 */
export function setListener(newListener:L.Marker) { listener = newListener; };



/**
 * the loading state.
 */
let isLoading = false;
/**
 * get whether or not anything is loading.
 * @returns whether or not the app is loading anything.
 */
export function getIsLoading():boolean { return isLoading; };
/**
 * set whether or not anything is loading.
 * @param value whether or not something is loading.
 */
export function setIsLoading(value:boolean) {isLoading = value; };



/**
 * the saving state.
 */
let isSaving  = false;
/**
 * get whether or not the app is saving.
 * @returns whether or not saving is in progress.
 */
export function getIsSaving():boolean { return isSaving; };
/**
 * set whether or not the app is saving.
 * @param value whether or not saving is in progress.
 */
export function setIsSaving(value:boolean) {isSaving = value; };



/**
 * the project path.
 */
let projectPath:string | undefined;
/**
 * set the path of the current project.
 * @param p the project path.
 */
export function setProjectPath(p:string) { projectPath = p; projectPath = projectPath || undefined };
/**
 * get the path of the current project.
 * @returns the project path.
 */
export function getProjectPath():string|undefined { return projectPath; };



/**
 * the project name.
 */
let projectName:string;
/**
 * set the name of the project.
 * @param p the name of the project.
 */
export function setProjectName(p:string) { projectName = p; };
/**
 * get the name of the project.
 * @returns the name of the project
 */
export function getProjectName():string { return projectName; };



/**
 * if the project has any media.
 */
let hasMedia = $state(false);
/**
 * get if the project has media.
 * @returns if the project has media in it.
 */
export function getHasMedia():boolean { return hasMedia; };
/**
 * set if the project has media.
 * @param b if the project has media.
 */
export function setHasMedia(b:boolean) { hasMedia = b; };



/**
 * if the project has unsaved changes.
 */
let isProjectDirty = false;
/**
 * get if the project has unsaved changes.
 * @returns if the project has unsaved changes.
 */
export function getisProjectDirty():boolean { return isProjectDirty; };
/**
 * set the project to have unsaved changes.
 */
export function setProjectDirty() { isProjectDirty = true; };
/**
 * set the project to have no unsaved changes.
 */
export function setProjectClean() { isProjectDirty = false; };



/**
 * the list of maps.
 */
let mapList = new Array<MapInfo>;
/**
 * get the map list.
 * @returns the map list.
 */
export function getMapList():Array<MapInfo> { return mapList; };
/**
 * set the map list.
 * @param newMapList the map list.
 */
export function setMapList(newMapList:Array<MapInfo>) { mapList = newMapList; };



/**
 * the list of images.
 */
let imageList = new Array<MapImage>;
/**
 * get the image list.
 * @returns the image list.
 */
export function getImageList():Array<MapImage> { return imageList; };
/**
 * set the image list.
 * @param newImageList the new image list.
 */
export function setImageList(newImageList:Array<MapImage>) { imageList = newImageList; };
/**
 * add an image to the image list.
 * @param data the image file.
 * @param overlay the image overlay.
 * @param rect the image rectangle
 * @param ow the original width of the image.
 * @param oh the origina height of the image.
 * @param opacity the opacity of the image.
 * @param order the stacking order of the image.
 */
type addToImageListOptions = {
    src:string,
    overlay:L.ImageOverlay,
    rect:L.Rectangle,
    originalWidth:number,
    originalHeight:number,
    opacity:number,
    order:number,
    name:string,
    niceName:string
}
export function addToImageList(options:addToImageListOptions) {
    imageList.push(new MapImage({
        src:options.src, 
        overlay:options.overlay, 
        rect:options.rect, 
        originalWidth:options.originalWidth, 
        originalHeight:options.originalHeight, 
        opacity:options.opacity,
        order:options.order,
        name:options.name,
        niceName:options.niceName
    }));
}
/**
 * move an image to the end of the image list, using its overlay as an identifier.
 * @param overlay the image overlay to move.
 */
export function moveImageToEndOfList(overlay:L.ImageOverlay) {
    // moves image to end of list -- required for save/load as order determines stacking
    for (let i=0; i < imageList.length; i++) {
        if (imageList[i].overlay == overlay) {
            imageList.push(imageList.splice(i,1)[0]);
            break;
        }
    }
}
/**
 * move an image to the start of the image list, using its index as an identifier.
 * @param i index of the image.
 */
export function moveImageToStartOfList(i:number) {
    // moves image to start of list -- required for save/load as order determines stacking
    imageList.splice(0,0,imageList.splice(i,1)[0]);
}
/**
 * sort the image list and stack the images.
 */
export function sortImageList() {
    imageList.sort(function(a,b){
        return a.order-b.order;
    });
    for(let image of imageList) {
        if (image.overlay) image.overlay.bringToFront();
        if (image.rect) image.rect.bringToFront();
    }
}



/**
 * the list of sounds.
 */
let soundList = new Array<MapSound>;
/**
 * get the sound list.
 * @returns the sound list.
 */
export function getSoundList():Array<MapSound> {
    return soundList;
};
/**
 * set the sound list.
 * @param newSoundList the new sound list.
 */
export function setSoundList(newSoundList:Array<MapSound>) { 
    soundList = newSoundList; 
};
/**
 * the options for adding to the sound list.
 */
type addToSoundListOptions = {
    src:string, 
    sound:H.Howl, 
    soundType:string, 
    emitter:L.Circle|L.Polygon|undefined, 
    volume:number, 
    muted:boolean, 
    solo:boolean, 
    order:number,
    name:string,
    niceName:string
}
/**
 * add a new map sound to the sound list.
 * @param options the sound list options to set.
 */
export function addToSoundList(options:addToSoundListOptions) {
    soundList.push(new MapSound({
        src: options.src, 
        sound:options.sound, 
        soundType:options.soundType, 
        emitter:options.emitter, 
        volume:options.volume, 
        muted:options.muted, 
        solo: options.solo, 
        order: options.order,
        name: options.name,
        niceName: options.niceName
    }));
}
/**
 * sort the sound list and stack the sounds.
 */
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



/**
 * whether or not proportional image scaling is currently on.
 */
let isProportionalScaleOn = false;
/**
 * get if proportional image scaling is active.
 * @returns whether or not proportional image scaling is currently on.
 */
export function getIsProportionalScaleOn():boolean { return isProportionalScaleOn; };
/**
 * set proportional image scaling to on or off.
 * @param b whether or not proportional image scaling is on.
 */
export function setIsProportionalScaleOn(b:boolean) { isProportionalScaleOn = b; };
/**
 * toggle proportional image scaling.
 */
export function toggleProportionalScale(){ isProportionalScaleOn = !isProportionalScaleOn };



/**
 * whether or not delete mode is active.
 */
let isInDeleteMode = false;
export function getIsInDeleteMode():boolean { return isInDeleteMode; };
export function setIsInDeleteMode(b:boolean) {isInDeleteMode = b; };



/**
 * the image drag offset.
 */
let dragOffset = L.latLng(0,0);
/**
 * add to the image drag offset.
 * @param x the longitude to add to the image drag offset.
 * @param y the latitude to add to the image drag offset.
 * @returns the offset.
 */
export function addToDragOffset(x:number, y:number):L.LatLng {
    dragOffset.lat += y;
    dragOffset.lng += x;
    return dragOffset;
}
/**
 * reset the image drag offset.
 */
export function resetDragOffset() {
    dragOffset.lat = 0;
    dragOffset.lng = 0;
}



/**
 * the image offset from origin.
 */
let imageOffsetFromOrigin = L.latLng(0,0);
/**
 * set the image offset from origin.
 * @param imageLatLng the image offset from origin.
 */
export function setImageOffset(imageLatLng:L.LatLng):void {
    imageOffsetFromOrigin = imageLatLng;
    //console.log("offset", imageOffsetFromOrigin);
}
/**
 * get the image offset from origin.
 * @returns the image offset from origin.
 */
export function getImageOffset():L.LatLng {
    return imageOffsetFromOrigin;
}



/**
 * the list of selected map objects.
 */
let selected = new Array<L.Rectangle|L.Circle|L.Polygon>;
/**
 * add a map object to the selection.
 * @param item the map object to add to the selection.
 */
export function addToSelection(item:L.Rectangle|L.Circle|L.Polygon) {
    selected.push(item);
    item.getElement()?.classList.toggle("selected");
}
/**
 * remove a map object from the selection.
 * @param item the map object to remove from the selection.
 */
export function removeFromSelection(item:L.Rectangle|L.Circle|L.Polygon) {
    for (let i=0;i<selected.length;i++) {
        if (item === selected[i]) {
            selected.splice(i,1);
            break;
        }
    }
    item.getElement()?.classList.toggle("selected");
}
/**
 * check if a map object is selected.
 * @param item the map object to check.
 * @returns whether or not the map object is selected.
 */
export function getIsSelected(item:L.Rectangle|L.Circle|L.Polygon|undefined):boolean {
    if (typeof item == "undefined") return false;
    for (let i=0;i<selected.length;i++) {
        if (item === selected[i]) {
            return true;
        }
    }
    return false;
}
/**
 * get the list of selected map objects.
 * @returns the list of selected map objects.
 */
export function getSelectedList():Array<L.Rectangle|L.Circle|L.Polygon> {
    return selected;
}
/**
 * toggle if a map object is selected.
 * @param item the map object to toggle.
 * @returns 
 */
export function toggleSelected(item:L.Rectangle|L.Circle|L.Polygon|undefined) {
    if (typeof item == "undefined") return;
    if (!item.editEnabled()) return;
    if (getIsSelected(item)) {
        removeFromSelection(item);
    } else {
        addToSelection(item);
    }
}



/**
 * get whether or not a map object is locked.
 * @param item the map object to check.
 * @returns whether or not the map object is locked.
 */
export function getIsLocked (item:L.Rectangle|L.Circle|L.Polygon|undefined):boolean {
    if (typeof item == "undefined") return true;
    return !item.editEnabled();
}



/**
 * whether or not the about menu is open.
 */
let aboutMenuOpen = false;
/**
 * whether or not the settings menu is open.
 */
let settingsMenuOpen = false;
/**
 * get if the about menu is open.
 * @returns whether or not the about menu is open.
 */
export function getIsAboutMenuOpen():boolean {
    return aboutMenuOpen;
}
/**
 * set whether or not the about menu is open.
 * @param val whether or not the about menu is open.
 */
export function setIsAboutMenuOpen(val:boolean) {
    aboutMenuOpen = val;
}
/**
 * get whether or not the settings menu is open.
 * @returns whether or not the settings menu is open.
 */
export function getIsSettingsMenuOpen():boolean {
    return settingsMenuOpen;
}
/**
 * set whether or not the settings menu is open.
 * @param val whether or not the settings menu is open.
 */
export function setIsSettingsMenuOpen(val:boolean) {
    settingsMenuOpen = val;
}



/**
 * whether or not help is active.
 */
let helpActive = true;
/**
 * toggle whether or not help is active.
 */
export function toggleHelpActive() {
    helpActive = !helpActive;
}
/**
 * get whether or not help is active.
 * @returns whether or not help is active.
 */
export function getIsHelpActive():boolean {
    return helpActive;
}



/**
 * The theme.
 */
export let activeTheme = $state(new AppTheme());

export function setTheme(themeName:string) {
    //console.log('set theme:', themeName);
    const themesList = getThemesList();
    for (let i = 0; i < themesList.length; i++) {
        //console.log(themesList[i].name);
        if(themeName == themesList[i].name){
            activeTheme.update(themesList[i]);
        }
    }
}
