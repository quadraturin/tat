import type L from "leaflet";
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

// list of maps
let mapList   = new Array<MapInfo>;
export function getMapList():Array<MapInfo> { return mapList; };
export function setMapList(newMapList:Array<MapInfo>) { mapList = newMapList; };

// list of images
let imageList = new Array<MapImage>;
export function getImageList():Array<MapImage> { return imageList; };
export function setImageList(newImageList:Array<MapImage>) { imageList = newImageList; };
export function addToImageList(data:File, overlay:L.ImageOverlay) {
    imageList.push(new MapImage(data, overlay))
}

// list of sounds
let soundList = new Array<MapSound>;
export function getSoundList():Array<MapSound> { return soundList; };
export function setSoundList(newSoundList:Array<MapSound>) { soundList = newSoundList; };
export function addToSoundList(data:File, sound:Howl, circle:L.Circle) {
    soundList.push(new MapSound(data, sound, circle))
}