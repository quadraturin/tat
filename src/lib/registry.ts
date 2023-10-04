import type L from "leaflet";
import { MapImage } from "./classes/MapImage";
import { MapSound } from "./classes/MapSound";
import type { MapInfo } from "./classes/MapInfo";

let map:L.Map;
let listener:L.Marker;

let isLoading = false;
let isSaving  = false;

let mapList   = new Array<MapInfo>;
let imageList = new Array<MapImage>;
let soundList = new Array<MapSound>;

export function getMap():L.Map { return map; };
export function setMap(newMap:L.Map) { map = newMap; };

export function getListener():L.Marker { return listener; };
export function setListener(newListener:L.Marker) { listener = newListener; };

export function getIsLoading():boolean { return isLoading; };
export function setIsLoading(value:boolean) {isLoading = value; };

export function getIsSaving():boolean { return isSaving; };
export function setIsSaving(value:boolean) {isSaving = value; };

export function getMapList():Array<MapInfo> { return mapList; };
export function setMapList(newMapList:Array<MapInfo>) { mapList = newMapList; };

export function getImageList():Array<MapImage> { return imageList; };
export function setImageList(newImageList:Array<MapImage>) { imageList = newImageList; };
export function addToImageList(data:File, overlay:L.ImageOverlay) {
    imageList.push(new MapImage(data, overlay))
}
export function getSoundList():Array<MapSound> { return soundList; };
export function setSoundList(newSoundList:Array<MapSound>) { soundList = newSoundList; };
export function addToSoundList(data:File, sound:Howl, circle:L.Circle) {
    soundList.push(new MapSound(data, sound, circle))
}