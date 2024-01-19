import * as R from '$lib/registry';
import { readBinaryFile } from "@tauri-apps/api/fs";
import { basename, extname } from "@tauri-apps/api/path";
import { getRandomPointInViewport } from "./util.getRandomPointInViewport";
import L from "leaflet";
import 'leaflet-editable';
import 'leaflet.path.drag';
import { setMapSoundVolumes } from './media.setMapSoundVolumes';
import { Howl } from "howler";
import { removeSoundbyEmitter } from './media.removeSound';
import { updateLoadingModal } from './ui.modals';
import type { MapSound } from './classes/MapSound';
import { SOUNDTYPE_AREA, SOUNDTYPE_GLOBAL, SOUNDTYPE_LOCAL } from './settings.appSettings';
import { help } from './util.help';

// load and return a sound file
export async function loadSoundFile(filePath:string):Promise<File|undefined> {
    try {
        updateLoadingModal(filePath);
        const ext = await extname(filePath);
        const content = await readBinaryFile(filePath);
        const fileName = await basename(filePath);
        return new File([content], fileName, { type: 'audio/' + ext });
    } 
    catch (err) {
        console.error(err);
    }
}

// create a sound on the map
export async function newSound(file:File, soundType?:string, volume?:number, muted?:boolean, solo?:boolean, lat?:number, lng?:number, rad?:number, points?:[number, number][], order?:number, seek?:number, locked?:boolean) {
    try {

        // create a data URL & pass to howler
        const mapSoundURL = URL.createObjectURL(file);
        const sound = new Howl({
            src: [mapSoundURL],
            format: [file.type.replace(/.*\//, "")],
            loop: true,
            volume: volume,
            mute: muted,
        });

        if (typeof seek != "undefined") sound.seek(seek);

        if (typeof soundType == "undefined") soundType = SOUNDTYPE_LOCAL;

        let emitter = await createEmitter(soundType, lat, lng, rad, points, locked);

        // add this sound to the sound list registry
        R.addToSoundList(file, sound, emitter, volume, muted, solo, soundType, order);

        // update volumes & play sound
        setMapSoundVolumes();
        sound.play();

        // set has media to true and project state to dirty
        R.setHasMedia(true);
        R.setProjectDirty();

        
    } catch(err) {
        console.error(err);
    }
}

export async function duplicateSound(sound:MapSound) {
    newSound(sound.data, sound.soundType, sound.volume, sound.muted, sound.solo);
}

export async function cycleSoundType(sound:MapSound) { // cycle: area -> global -> local
    if (sound.soundType == SOUNDTYPE_AREA) {
        sound.soundType = SOUNDTYPE_GLOBAL;
        await removeSoundbyEmitter(sound.emitter, false, true);
    } else if (sound.soundType == SOUNDTYPE_GLOBAL) {
        sound.soundType = SOUNDTYPE_LOCAL;
        await removeSoundbyEmitter(sound.emitter, false, true);
        sound.emitter = await createEmitter(sound.soundType);
    } else { // assume local as default
        sound.soundType = SOUNDTYPE_AREA;
        await removeSoundbyEmitter(sound.emitter, false, true);
        sound.emitter = await createEmitter(sound.soundType);
    }
    sound.sound.play();
    setMapSoundVolumes();
}

export async function createEmitter(soundType:string, lat?:number, lng?:number, rad?:number, points?:[number, number][], locked?:boolean):Promise<L.Polygon | L.Circle | undefined> {
    if (soundType == SOUNDTYPE_GLOBAL) { return; } // no emitter
    
    // create emitter based on sound type
    let emitter: L.Circle | L.Polygon;
    
    if (soundType == SOUNDTYPE_AREA) { // area emitter
        if(typeof points != "undefined") { 
            for (let i=0; i<points.length; i++) {
                points[i].reverse();
            }
        } else {
            let rand = getRandomPointInViewport(R.getMap());
            points = [[rand.lat, rand.lng], [rand.lat+200, rand.lng], [rand.lat+200, rand.lng+200], [rand.lat, rand.lng+200]];
        }
        emitter = L.polygon(points as [number,number][], {
            color: 'coral',
            fillColor: 'coral',
            fillOpacity: 0.2,
            pane: 'soundPane',
            weight: 1
        }).addTo(R.getMap());
    } else { // default to local
        let point:L.LatLng;
        if (typeof rad === 'undefined') rad = 100;
        if (typeof lng === 'undefined' || typeof lat === 'undefined') {
            point = getRandomPointInViewport(R.getMap())
        } else {
            point = L.latLng(lat as number,lng as number);
        }
        emitter = L.circle(point, {
            color: 'coral',
            fillColor: 'coral',
            fillOpacity: 0.2,
            radius: rad,
            pane: 'soundPane',
            weight: 1
        }).addTo(R.getMap());
    }
    
    // emitter settings
    emitter.enableEdit();
    emitter.on('dblclick', L.DomEvent.stop).on('dblclick', () => { toggleSoundEdit(emitter) });
    emitter.on('drag', setMapSoundVolumes); //could be optimized to only update *this* vol
    emitter.on('editable:editing', setMapSoundVolumes);
    emitter.on('drag', emitter.bringToFront);
    emitter.on('editable:editing', emitter.bringToFront);
    emitter.on('dragstart editable:editing', highlightEmitter);
    emitter.on('dragend', onClick);
    emitter.on('mouseup', onClick);
    emitter.on('mouseover', () => {
        if (soundType == SOUNDTYPE_AREA) { // area sound
            if (!emitter.editEnabled()) help(R.t.help.map.locked, R.t.help.map.soundTypeArea, R.t.help.map.itemLocked, R.t.help.map.itemLockedActions);
            else if(R.getIsSelected(emitter)) help(R.t.help.map.selected, R.t.help.map.soundTypeArea, R.t.help.map.soundAreaActions, R.t.help.map.itemSelectedActions);
            else help(R.t.help.map.soundTypeArea, R.t.help.map.soundAreaActions, R.t.help.map.itemUnselectedActions);
        } else { // local sound
            if (!emitter.editEnabled()) help(R.t.help.map.locked, R.t.help.map.soundTypeLocal, R.t.help.map.itemLocked, R.t.help.map.itemLockedActions);
            else if(R.getIsSelected(emitter)) help(R.t.help.map.selected, R.t.help.map.soundTypeLocal, R.t.help.map.soundLocalActions, R.t.help.map.itemSelectedActions);
            else help(R.t.help.map.soundTypeLocal, R.t.help.map.soundLocalActions, R.t.help.map.itemUnselectedActions);
        }
    });
    emitter.on('mouseout', () => {help()});
    //emitter.on('editable:vertex:dragend', deselectEmitter);
    //emitter.bindPopup("I am an audio emitter.");

    if (locked) toggleSoundEdit(emitter);

    function highlightEmitter() {
        if (typeof emitter != "undefined") emitter.setStyle({color:"white"});
    }

    function onClick() {
        if (typeof emitter == "undefined") return;
        if (!emitter.editEnabled()) return;
        if (R.getIsSelected(emitter)) R.removeFromSelection(emitter);
        else R.addToSelection(emitter);
        emitter.bringToFront();

        if (R.getIsInDeleteMode()) removeSoundbyEmitter(emitter);
    }

    return emitter;
}

export function toggleSoundEdit(emitter:L.Circle|L.Polygon|undefined) {
    if (typeof emitter == "undefined") return;
    if (emitter.editEnabled()) emitter.setStyle({opacity:0});
    else emitter.setStyle({opacity:1});
    emitter.toggleEdit();
    if (R.getIsSelected(emitter)) R.removeFromSelection(emitter);
}