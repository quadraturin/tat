import * as R from '$lib/registry';
import { readBinaryFile } from "@tauri-apps/api/fs";
import { basename, extname } from "@tauri-apps/api/path";
import { getRandomPointInViewport } from "./getRandomPointInViewport";
import L from "leaflet";
import 'leaflet-editable';
import 'leaflet.path.drag';
import { setMapSoundVolumes } from './setMapSoundVolumes';
import { Howl } from "howler";


export async function loadSound(filePath:string, x?:number, y?:number, r?:number): Promise<void> 
{
    try 
    {
        var lat = y;
        var lng = x;
        var rad = r;
        const ext = await extname(filePath);
        var point:L.LatLng;

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

        if (typeof rad === 'undefined') rad = 100;
        if (typeof x === 'undefined' || typeof y === 'undefined')
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
            fillOpacity: 0.5,
            radius: rad,
            pane: 'soundPane'
        }).addTo(R.getMap());
        
        // emitter settings
        emitter.enableEdit();
        emitter.on('dblclick', L.DomEvent.stop).on('dblclick', toggleSoundEdit);
        emitter.on('drag', setMapSoundVolumes); //could be optimized to only update *this* vol
        emitter.on('editable:editing', setMapSoundVolumes);
        emitter.on('drag', emitter.bringToFront);
        emitter.on('editable:editing', emitter.bringToFront);
        emitter.on('dragstart editable:editing', selectEmitter);
        emitter.on('dragend', deselectEmitter);
        emitter.on('editable:vertex:dragend', deselectEmitter);
        emitter.on('click', onClick);
        //emitter.bindPopup("I am an audio emitter.");

        // add this sound to the sound list registry
        R.addToSoundList(file, sound, emitter);

        // update volumes & play sound
        setMapSoundVolumes();
        sound.play();

        // set project state to dirty
        R.setProjectDirty();

        function onClick() {
            emitter.bringToFront();
            
            if (!R.getIsInDeleteMode()) return;
            let soundList = R.getSoundList();
            for(let i = 0; i < soundList.length; i++) {
                if (soundList[i].circle === emitter) {
                    soundList[i].circle.remove();
                    soundList.splice(i, 1);
                    break;
                }
            }
        };

        function selectEmitter(){
            emitter.setStyle({color:"white"});
        };

        function deselectEmitter(){
            emitter.setStyle({color:"coral"});
        };

        function toggleSoundEdit(){
            if (emitter.editEnabled()) emitter.setStyle({opacity:0});
            else emitter.setStyle({opacity:1});
            emitter.toggleEdit();
        };
    } 
    catch (err) 
    {
        console.error(err);
    }
};
