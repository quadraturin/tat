import * as R from '$lib/registry';
import { readBinaryFile } from "@tauri-apps/api/fs";
import { basename, extname } from "@tauri-apps/api/path";
import { getRandomPointInViewport } from "./util.getRandomPointInViewport";
import L from "leaflet";
import 'leaflet-editable';
import 'leaflet.path.drag';
import { setMapSoundVolumes } from './media.setMapSoundVolumes';
import { Howl } from "howler";
import { removeSound, removeSoundbyEmitter } from './media.removeSound';
import { updateLoadingModal } from './ui.modals';
import type { MapSound } from './classes/MapSound';
import { SOUNDTYPE_AREA, SOUNDTYPE_GLOBAL, SOUNDTYPE_LOCAL } from './settings';


export async function loadSound(filePath:string, soundType?:string, volume?:number, muted?:boolean, solo?:boolean, x?:number, y?:number, r?:number, points?:[number, number][]): Promise<void> {
    try {
        updateLoadingModal(filePath);
        const ext = await extname(filePath);

        // read in the sound data
        const content = await readBinaryFile(filePath);

        // get the filename from the path
        const fileName = await basename(filePath);
        
        // return a File object to hold the data
        const file =  new File([content], fileName, { type: 'audio/' + ext });

        newSound(file, soundType, volume, muted, solo, y, x, r, points);
    } 
    catch (err) {
        console.error(err);
    }
}

export async function newSound(file:File, soundType?:string, volume?:number, muted?:boolean, solo?:boolean, lat?:number, lng?:number, rad?:number, points?:[number, number][]) {
    try {

        // create a data URL & pass to howler
        const mapSoundURL = URL.createObjectURL(file);
        const sound = new Howl({
            src: [mapSoundURL],
            format: [file.type.replace(/.*\//, "")],
            loop: true,
            volume: volume,
            mute: muted
        });

        if (typeof soundType == "undefined") soundType = SOUNDTYPE_LOCAL;

        let emitter = await createEmitter(soundType, lat, lng, rad, points);

        // add this sound to the sound list registry
        R.addToSoundList(file, sound, emitter, volume, muted, solo, soundType);

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

export async function createEmitter(soundType:string, lat?:number, lng?:number, rad?:number, points?:[number, number][]):Promise<L.Polygon | L.Circle> {
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
    emitter.on('dblclick', L.DomEvent.stop).on('dblclick', toggleSoundEdit);
    emitter.on('drag', setMapSoundVolumes); //could be optimized to only update *this* vol
    emitter.on('editable:editing', setMapSoundVolumes);
    emitter.on('drag', emitter.bringToFront);
    emitter.on('editable:editing', emitter.bringToFront);
    emitter.on('dragstart editable:editing', highlightEmitter);
    emitter.on('dragend', onClick);
    emitter.on('mouseup', onClick);
    //emitter.on('editable:vertex:dragend', deselectEmitter);
    //emitter.bindPopup("I am an audio emitter.");

    function highlightEmitter() {
        emitter.setStyle({color:"white"});
    }

    function onClick() {
        if (!emitter.editEnabled()) return;
        if (R.getIsSelected(emitter)) R.removeFromSelection(emitter);
        else R.addToSelection(emitter);
        emitter.bringToFront();

        if (R.getIsInDeleteMode()) removeSoundbyEmitter(emitter);
    }

    function toggleSoundEdit() {
        if (emitter.editEnabled()) emitter.setStyle({opacity:0});
        else emitter.setStyle({opacity:1});
        emitter.toggleEdit();
        if (R.getIsSelected(emitter)) R.removeFromSelection(emitter);
    }

    return emitter;
}