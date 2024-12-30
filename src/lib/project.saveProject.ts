import * as R from '$lib/registry.svelte';
import L from 'leaflet';
import { message, save } from "@tauri-apps/plugin-dialog";
import { mkdir, writeTextFile, exists, readDir, remove, copyFile } from "@tauri-apps/plugin-fs";
import { join, basename, sep } from "@tauri-apps/api/path";
import type { MapImage } from './classes/MapImage.svelte';
import type { MapSound } from './classes/MapSound.svelte';
import { closeAllMenus } from './ui.menus';
import { closeModal, openSavingModal } from './ui.modals';
import { t } from './util.localization';


/**
 * save a project in its current location or save as to a new location.
 * @param saveAs whether or not to save the project to a new location.
 * @returns whether or not the project was saved.
 */
export async function saveProject(saveAs=false): Promise<boolean> 
{
    await closeAllMenus();

    const imageList = R.getImageList();
    const soundList = R.getSoundList();
    let filePath: string | null = "";

    // main project object
    let project = { 
        maps: [
            {
            images: new Array<any>,
            sounds: new Array<any>
            }
        ]
    }

    // if saving over the current project...
    if (!saveAs) { 
        // ...check if the project path exists. if not, save as instead...
        if (typeof R.getProjectPath() === 'undefined') saveAs = true;
        // ... if it does exist, save to project path.
        else filePath = R.getProjectPath() as string;
    }

    // if saving as (to a new dir)...
    if (saveAs) {
        // ...prompt the user with a save dialog...
        filePath = await save();
        // ...cancel if they back out.
        if (filePath === null) return false;
    }
    
    // if they didn't back out, we are now in saving state
    R.setIsSaving(true);
    let newProjectName = await basename(filePath as string);
    openSavingModal(newProjectName);
    let promises = new Array<Promise<any>>;

    // make a project directory with 'sounds' and 'images' directories inside
    await mkdir(filePath, { recursive: true });
    await mkdir(await join(filePath, 'sounds'), { recursive: true });
    await mkdir(await join(filePath, 'images'), { recursive: true });

    // cycle through loaded images, adding each to the project object
    let i = 0;
    imageList.forEach(e => {
        project.maps[0].images[i] = {
            src: e.name,
            x: e.overlay.getBounds().getWest(),
            y: e.overlay.getBounds().getSouth(),
            width: e.overlay.getBounds().getEast() - e.overlay.getBounds().getWest(),
            height: e.overlay.getBounds().getNorth() - e.overlay.getBounds().getSouth(),
            opacity: e.opacity,
            order: i,
            locked: !e.rect.editEnabled(),
            originalWidth: e.originalWidth,
            originalHeight: e.originalHeight
        }
        promises.push(writeImageFile(e, filePath as string));
        i++;
    });

    // cycle through loaded sounds, adding each to the project object
    i = 0;
    soundList.forEach(e => {
        if (e.sound) project.maps[0].sounds[i] = {
            src: e.name,
            soundType: e.soundType,
            volume: e.volume,
            solo: e.solo,
            muted: e.muted,
            order: i,
            seek: e.sound.seek(),
            locked: !e.emitter?.editEnabled()
        }
        if (e.emitter instanceof L.Circle) {
            project.maps[0].sounds[i].x = e.emitter.getLatLng().lng;
            project.maps[0].sounds[i].y = e.emitter.getLatLng().lat;
            project.maps[0].sounds[i].radius = e.emitter.getRadius();
        } else if (e.emitter instanceof L.Polygon) {
            project.maps[0].sounds[i].points = [];
            for (let j=0; j<(e.emitter.getLatLngs()[0]as L.LatLng[]).length; j++) {
                project.maps[0].sounds[i].points.push([(e.emitter.getLatLngs()[0] as L.LatLng[])[j].lng, (e.emitter.getLatLngs()[0] as L.LatLng[])[j].lat]);
            }
            console.log(e.emitter.getLatLngs());
        }

        promises.push(writeSoundFile(e, filePath as string));
        i++;
    });

    // write the project JSON
    promises.push(writeTextFile(await join(filePath, 'project.json'), JSON.stringify(project)));

    // delete unused files
    deleteUnused("images");
    deleteUnused("sounds");

    // set the project path & set project state to clean
    R.setProjectPath(filePath);
    R.setProjectName(newProjectName);
    R.setProjectClean();

    // leave saving state when done
    await Promise.allSettled(promises);
    R.setIsSaving(false);

    await message(t.get("dialog.projectSaved"));
    closeModal();

    return true;
}

/**
 * write image file to images folder if the specified image doesn't already exist there
 * @param e the map image to write.
 * @param filePath the project folder.
 */
async function writeImageFile(e:MapImage, filePath:string) {
    const fullPath = await join(filePath, 'images', await basename(e.src));
    if (!await exists(fullPath)) copyFile(e.src, fullPath);
}

/**
 * write sound file to images folder if the specified sound doesn't already exist there
 * @param e the map sound to write.
 * @param filePath the project folder.
 */
async function writeSoundFile(e:MapSound, filePath:string) {
    const fullPath = await join(filePath, 'sounds', await basename(e.src));
    if (!await exists(fullPath)) copyFile(e.src, fullPath);
}

/**
 * delete files in the project folder that are no longer used in the project.
 * @param fileType type of file to remove. can be "images" or "sounds".
 * @returns 
 */
async function deleteUnused(fileType:string) {
    let itemList: MapImage[] | MapSound[] = [];
    
    if (fileType == "images") {
        itemList = R.getImageList();
    } else if (fileType == "sounds") {
        itemList = R.getSoundList();
    }

    let path = R.getProjectPath();
    if (typeof path == "undefined") return;

    let fileList = await readDir(path + sep() + fileType);

    for (let i=0; i<fileList.length; i++) {
        let notInUse = true;
        for (let j=0; j<itemList.length; j++) {
            //console.log("checking " + fileList[i].name + " vs. " + itemList[j].data.name);
            if (fileList[i].name == await basename(itemList[j].src)) {
                notInUse = false;
                //console.log(fileList[i].name + " is in use.")
                break;
            }
        }
        if (notInUse) {
            //console.log(fileList[i].name as string + " is not in use. deleting...")
            remove(path + sep() + fileType + sep() + fileList[i].name as string);
        }
    }
}
