import * as R from '$lib/registry';
import { readBinaryFile } from "@tauri-apps/api/fs";
import { basename, extname } from "@tauri-apps/api/path";
import { getRandomPointInViewport } from "./util.getRandomPointInViewport";
import L from "leaflet";
import 'leaflet-editable';
import 'leaflet.path.drag';
import { setMapSoundVolumes } from './project.setMapSoundVolumes';
import { Howl } from "howler";
import { removeSoundbyCircle } from './media.removeSound';
import { updateLoadingModal } from './ui.modals';
import type { MapSound } from './classes/MapSound';


export async function loadSound(filePath:string, x?:number, y?:number, r?:number): Promise<void> 
{
    try 
    {
        updateLoadingModal(filePath);
        let lat = y;
        let lng = x;
        let rad = r;
        const ext = await extname(filePath);

        // read in the sound data
        const content = await readBinaryFile(filePath);

        // get the filename from the path
        const fileName = await basename(filePath);
        
        // return a File object to hold the data
        const file =  new File([content], fileName, { type: 'audio/' + ext });

        newSound(file);
    } 
    catch (err) 
    {
        console.error(err);
    }
}

export async function newSound(file:File, lat?:number, lng?:number, rad?:number) {
    try {
        let point:L.LatLng;

        console.log('sound file type: ' + file.type.replace(/.*\//, ""));

        // create a data URL & pass to howler
        const mapSoundURL = URL.createObjectURL(file);
        const sound = new Howl(
        {
            src: [mapSoundURL],
            format: [file.type.replace(/.*\//, "")],
            loop: true
        });

        if (typeof rad === 'undefined') rad = 100;
        if (typeof lng === 'undefined' || typeof lat === 'undefined')
        {
            point = getRandomPointInViewport(R.getMap())
        }
        else
        {
            point = L.latLng(lat as number,lng as number);
        }
        // create emitter circle in leaflet

        const emitter: L.Circle = L.circle(point, 
        {
            color: 'coral',
            fillColor: 'coral',
            fillOpacity: 0.2,
            radius: rad,
            pane: 'soundPane',
            weight: 1
        }).addTo(R.getMap());
        
        // emitter settings
        emitter.enableEdit();
        emitter.on('dblclick', L.DomEvent.stop).on('dblclick', toggleSoundEdit);
        emitter.on('drag', setMapSoundVolumes); //could be optimized to only update *this* vol
        emitter.on('editable:editing', setMapSoundVolumes);
        emitter.on('drag', emitter.bringToFront);
        emitter.on('editable:editing', emitter.bringToFront);
        emitter.on('dragstart editable:editing', highlightEmitter);
        emitter.on('dragend', onClick);
        //emitter.on('editable:vertex:dragend', deselectEmitter);
        emitter.on('mousedown', onClick);
        //emitter.bindPopup("I am an audio emitter.");

        // add this sound to the sound list registry
        R.addToSoundList(file, sound, emitter);

        // update volumes & play sound
        setMapSoundVolumes();
        sound.play();

        // set has media to true and project state to dirty
        R.setHasMedia(true);
        R.setProjectDirty();

        function highlightEmitter() {
            emitter.setStyle({color:"white"});
        }

        function onClick() {
            if (!emitter.editEnabled()) return;
            if (R.getIsSelected(emitter)) R.removeFromSelection(emitter);
            else R.addToSelection(emitter);
            emitter.bringToFront();

            if (R.getIsInDeleteMode()) removeSoundbyCircle(emitter);
        };

        function toggleSoundEdit(){
            if (emitter.editEnabled()) emitter.setStyle({opacity:0});
            else emitter.setStyle({opacity:1});
            emitter.toggleEdit();
        };
    } catch(err) {
        console.error(err);
    }
}

export async function duplicateSound(sound:MapSound) {
    newSound(sound.data);
}
