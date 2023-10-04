import * as R from '$lib/registry';
import { readBinaryFile } from "@tauri-apps/api/fs";
import { basename } from "@tauri-apps/api/path";
import { getRandomPointInViewport } from "./getRandomPointInViewport";
import L from "leaflet";
import { setMapSoundVolumes } from './setMapSoundVolumes';
import { Howl } from "howler";
import 'leaflet-editable';
import 'leaflet.path.drag';


export async function loadSound({ filePath, ext }: { filePath: string; ext: string; }): Promise<void> 
{
    try 
    {
        // read in the sound data
        const content = await readBinaryFile(filePath);

        // get the filename from the path
        const fileName = await basename(filePath);
        
        // return a File object to hold the data
        const file =  new File([content], fileName, { type: 'audio/' + ext });

        // create a data URL & pass to howler
        const mapSoundURL = URL.createObjectURL(file);
        const sound = new Howl(
        {
            src: [mapSoundURL],
            format: [ext],
            loop: true
        });

        // create emitter circle in leaflet
        const emitter: L.Circle = L.circle(getRandomPointInViewport(R.getMap()), 
        {
            color: 'coral',
            fillColor: 'coral',
            fillOpacity: 0.5,
            radius: 100,
        }).addTo(R.getMap());
        
        // emitter settings
        emitter.enableEdit();
        emitter.on('dblclick', L.DomEvent.stop).on('dblclick', emitter.toggleEdit);
        emitter.on('drag', setMapSoundVolumes); //could be optimized to only update *this* vol
        emitter.on('editable:editing', setMapSoundVolumes);
        //emitter.bindPopup("I am an audio emitter.");

        // add this sound to the sound list registry
        R.addToSoundList(file, sound, emitter);

        // update volumes & play sound
        setMapSoundVolumes();
        sound.play();
    } 
    catch (err) 
    {
        console.error(err);
    }
};
