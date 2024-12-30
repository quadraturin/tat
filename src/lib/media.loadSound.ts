import * as R from '$lib/registry';
import { getRandomPointInViewport } from "./util.getRandomPointInViewport";
import L from "leaflet";
import 'leaflet-editable';
import 'leaflet.path.drag';
import { removeSoundbyEmitter } from './media.removeSound';
import { updateLoadingModal } from './ui.modals';
import type { MapSound } from './classes/MapSound.svelte';
import { SOUNDTYPE_AREA, SOUNDTYPE_GLOBAL, SOUNDTYPE_LOCAL } from './settings.appSettings';
import { help } from './util.help';
import { basename } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/core';
import { t, locales, locale } from '$lib/util.localization';

/**
 *  options definition for new sounds.
 */
type newSoundOptions = {
    src: string,
    soundType?: string,
    muted?: boolean,
    solo?: boolean,
    paused?: boolean,
    locked?: boolean,
    volume?: number,
    seek?: number,
    order?: number,
    lat?: number,
    lng?: number,
    radius?: number,
    points?: [number,number][]
}

/**
 * create a new sound.
 * @param filePath path to the new sound.
 * @param options new sound options.
 */
export async function newSound(options:newSoundOptions){
    try {
        // populate with defaults, overwrite with options
        let o = Object.assign({
            soundType: SOUNDTYPE_LOCAL,
            muted: false,
            solo: false,
            paused: false,
            locked: false,
            volume: 1,
            seek: 0,
            order: 1,
            lat: undefined,
            lng: undefined,
            radius: 100,
            points: undefined}, options);
        
        // display the file that is being loaded.
        updateLoadingModal(o.src);

        // create the sound emitter, if any.
        let emitter = await createEmitter({
            soundType: o.soundType,
            lat: o.lat,
            lng: o.lng,
            radius: o.radius,
            points: o.points,
            locked: o.locked
        });

        // create the sound.
        let sound = new Howl({
            src: convertFileSrc(o.src),
            loop: true,
            mute: o.muted
        });

        // nice name for the sound.
        let name = await basename(o.src)
        let niceName = name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim();

        // seek to seek position and play the sound.
        sound.seek(o.seek);
        sound.play();

        // pause the sound if it should start paused. this retains the seek position.
        if(o.paused) sound.stop();

        // add the sound to the sound list.
        R.addToSoundList({
            src: o.src, 
            sound: sound, 
            soundType: o.soundType, 
            emitter: emitter,
            volume: o.volume, 
            muted: o.muted, 
            solo: o.solo, 
            order: o.order,
            name:name,
            niceName:niceName
        });

        // tell the registry there are unsaved changes.
        R.setHasMedia(true);
        R.setProjectDirty();
    } 
    catch (err) {
        console.error(err);
    }
}

/**
 * duplicate a map sound.
 * @param sound the map sound to duplicate.
 */
export async function duplicateSound(sound:MapSound) {
    newSound({
        src: sound.src,
        soundType: sound.soundType,
        volume: sound.volume, 
        muted: sound.muted, 
        solo: sound.solo
    });
}

/**
 * cycle a map sound between the 3 types (area, global, local).
 * @param sound map sound to change.
 */
export async function cycleSoundType(sound:MapSound) {
    if (sound.sound) {
        if (sound.soundType == SOUNDTYPE_AREA) {
            sound.soundType = SOUNDTYPE_GLOBAL;
            await removeSoundbyEmitter(sound.emitter, false, true);
        } else if (sound.soundType == SOUNDTYPE_GLOBAL) {
            sound.soundType = SOUNDTYPE_LOCAL;
            await removeSoundbyEmitter(sound.emitter, false, true);
            sound.emitter = await createEmitter({soundType:sound.soundType});
        } else { 
            // assume local as default
            sound.soundType = SOUNDTYPE_AREA;
            await removeSoundbyEmitter(sound.emitter, false, true);
            sound.emitter = await createEmitter({soundType:sound.soundType});
        }
        sound.sound.play();
    }
}

/**
 * options definition for new emitters.
 */
type newEmitterOptions = {
    soundType:string,
    lat?:number,
    lng?:number,
    radius?:number,
    points?:[number,number][],
    locked?:boolean
}

/**
 * create a sound emitter on the map. local sounds use a circle , area sounds use a polygon. global sounds have no emitter.
 * @param soundType type of emitter to create.
 * @param options new emitter options.
 * @returns the emitter, if any.
 */
export async function createEmitter(options:newEmitterOptions):Promise<L.Polygon | L.Circle | undefined> {
    try {
        // set default options, overwrite with parameter.
        let o = Object.assign({
            locked: false
        }, options)

        // if a global sound, there is no emitter. return.
        if (o.soundType == SOUNDTYPE_GLOBAL) { return; }
        
        // create emitter based on sound type.
        let emitter: L.Circle | L.Polygon;

        if (o.soundType == SOUNDTYPE_AREA) { 
            // create an area emitter.
            if(typeof o.points != "undefined") { 
                // reverse the order of the [x,y] points to use as [lat,lng] points
                for (let i=0; i<o.points.length; i++) {
                    o.points[i].reverse();
                }
            } else {
                // generate a polygon at a random visible location.
                let rand = getRandomPointInViewport(R.getMap());
                o.points = [[rand.lat-100, rand.lng-100], [rand.lat-100, rand.lng+100], [rand.lat+100, rand.lng+100], [rand.lat+100, rand.lng-100]];
            }
            emitter = L.polygon(o.points as [number,number][], {
                color: 'coral',
                fillColor: 'coral',
                fillOpacity: 0.2,
                pane: 'soundPane',
                weight: 1
            }).addTo(R.getMap());

        } else { 
            // default to a local emitter.
            let point:L.LatLng;
            if (typeof o.radius == 'undefined') 
                // default radius size.
                o.radius = 100;
            if (typeof o.lng == 'undefined' || typeof o.lat == 'undefined') 
                // pick random visible location to place emitter.
                point = getRandomPointInViewport(R.getMap())
            else
                // assign specified lat and lng to point.
                point = L.latLng(o.lat as number, o.lng as number);

            // create the emitter.
            emitter = L.circle(point, {
                color: 'coral',
                fillColor: 'coral',
                fillOpacity: 0.2,
                radius: o.radius,
                pane: 'soundPane',
                weight: 1
            }).addTo(R.getMap());
        }
        
        // bind emitter handlers.
        emitter.enableEdit();
        emitter.on('dblclick', L.DomEvent.stop).on('dblclick', () => { toggleSoundEdit(emitter) });
        emitter.on('drag', emitter.bringToFront);
        emitter.on('editable:editing', emitter.bringToFront);
        emitter.on('dragstart editable:editing', () => { highlightSoundEmitter(emitter) });
        emitter.on('dragend', () => { soundEmitterOnClick(emitter) });
        emitter.on('mouseup', () => { soundEmitterOnClick(emitter) });
        emitter.on('mouseover', () => {
            if (o.soundType == SOUNDTYPE_AREA) { 
                // area sound.
                if (!emitter.editEnabled()) help(t.get('help.map.locked'), t.get('help.map.soundTypeArea'), t.get('help.map.itemLocked'), t.get('help.map.itemLockedActions'));
                else if(R.getIsSelected(emitter)) help(t.get('help.map.selected'), t.get('help.map.soundTypeArea'), t.get('help.map.soundAreaActions'), t.get('help.map.itemSelectedActions'));
                else help(t.get('help.map.soundTypeArea'), t.get('help.map.soundAreaActions'), t.get('help.map.itemUnselectedActions'));
            } else { 
                // local sound.
                if (!emitter.editEnabled()) help(t.get('help.map.locked'), t.get('help.map.soundTypeLocal'), t.get('help.map.itemLocked'), t.get('help.map.itemLockedActions'));
                else if(R.getIsSelected(emitter)) help(t.get('help.map.selected'), t.get('help.map.soundTypeLocal'), t.get('help.map.soundLocalActions'), t.get('help.map.itemSelectedActions'));
                else help(t.get('help.map.soundTypeLocal'), t.get('help.map.soundLocalActions'), t.get('help.map.itemUnselectedActions'));
            }
        });
        emitter.on('mouseout', () => {help()});
        //emitter.on('editable:vertex:dragend', deselectEmitter);

        // lock the emitter if it's supposed to be.
        if (o.locked) toggleSoundEdit(emitter);

        return emitter;

    } catch(err) {
        console.error(err);
        return;
    }
}

/**
 * toggle the emitter's editable state and corresponding visuals.
 * @param emitter the emitter to toggle.
 */
export function toggleSoundEdit(emitter:L.Circle|L.Polygon|undefined) {
    // return if there is no emitter.
    if (typeof emitter == "undefined") return;

    // set emitter visuals.
    if (emitter.editEnabled()) emitter.setStyle({opacity:0});
    else emitter.setStyle({opacity:1});

    // toggle emitter's edit state.
    emitter.toggleEdit();

    // deselect if selected.
    if (R.getIsSelected(emitter)) R.removeFromSelection(emitter);
}

/**
 * visually highlight an emitter.
 * @param emitter the emitter to highlight.
 */
function highlightSoundEmitter(emitter:L.Circle|L.Polygon|undefined) {
    if (typeof emitter != "undefined") 
        emitter.setStyle({color:"white"});
}

/**
 * fires when an emitter is clicked.
 * @param emitter emitter to react to click.
 */
function soundEmitterOnClick(emitter:L.Circle|L.Polygon|undefined) {
    // return if there is no emitter or if it is not editable.
    if (typeof emitter == "undefined" || !emitter.editEnabled()) return;

    if (R.getIsSelected(emitter)) 
        // deselect emitter.
        R.removeFromSelection(emitter);
    else
        // select emitter 
        R.addToSelection(emitter);

    // bring emitter to front.
    emitter.bringToFront();

    // delete sound if in delete mode.
    if (R.getIsInDeleteMode()) removeSoundbyEmitter(emitter);
}