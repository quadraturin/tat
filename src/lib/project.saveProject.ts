import * as R from '$lib/registry';
import { message, save } from "@tauri-apps/api/dialog";
import { createDir, writeTextFile, writeBinaryFile, exists } from "@tauri-apps/api/fs";
import { join, basename } from "@tauri-apps/api/path";
import type { MapImage } from './classes/MapImage';
import type { MapSound } from './classes/MapSound';
import { closeAllMenus } from './menu.menus';

export async function saveProject(saveAs=false): Promise<boolean> 
{
    await closeAllMenus();

    const imageList = R.getImageList();
    const soundList = R.getSoundList();
    let filePath: string | null = "";

    // objects for storing map data that will be JSONified
    var images: { [key: string]: string | number } = {};
    var sounds: { [key: string]: string | number } = {};

    // main project object
    let project = { 
        map_0: {
            images,
            sounds
        }
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

    // make a project directory with 'sounds' and 'images' directories inside
    await createDir(filePath, { recursive: true });
    await createDir(await join(filePath, 'sounds'), { recursive: true });
    await createDir(await join(filePath, 'images'), { recursive: true });

    // cycle through loaded images, adding each to the project object
    let i = 0;
    imageList.forEach(e => {
        const imageID = "image_" + i.toString();
        project.map_0.images = Object.assign ({[imageID]: // only supporting 1 map for now
        {
            src: e.data.name,
            x: e.overlay.getBounds().getWest(),
            y: e.overlay.getBounds().getSouth(),
            width: e.overlay.getBounds().getEast() - e.overlay.getBounds().getWest(),
            height: e.overlay.getBounds().getNorth() - e.overlay.getBounds().getSouth(),
            originalWidth: e.originalWidth,
            originalHeight: e.originalHeight
        }}, project.map_0.images);
        writeImageFile(e, filePath as string);
        i++;
    });

    // cycle through loaded sounds, adding each to the project object
    i = 0;
    soundList.forEach(e => {
        const soundID = "sound_" + i.toString();
        project.map_0.sounds = Object.assign({[soundID]: // only supporting 1 map for now
        {
            src: e.data.name,
            x: e.circle.getLatLng().lng,
            y: e.circle.getLatLng().lat,
            radius: e.circle.getRadius()
        }}, project.map_0.sounds);
        writeSoundFile(e, filePath as string);
        i++;
    });

    // write the project JSON
    console.log(project);
    await writeTextFile(await join(filePath, 'project.json'), JSON.stringify(project));

    // set the project path & set project state to clean
    R.setProjectPath(filePath);
    R.setProjectName(await basename(R.getProjectPath() as string));
    R.setProjectClean();

    // leave saving state when done
    R.setIsSaving(false);

    await message('project saved!');

    return true;
}

// writes image file to images folder if the specified image doesn't already exist there
async function writeImageFile(e:MapImage, filePath:string) {
    const fullPath = await join(filePath, 'images', e.data.name);

    if (await exists(fullPath)) console.log(`${fullPath} already exists. skipping write.`);
    else writeBinaryFile(fullPath, await e.data.arrayBuffer());
}

// writes sound file to images folder if the specified sound doesn't already exist there
async function writeSoundFile(e:MapSound, filePath:string) {
    const fullPath = await join(filePath, 'sounds', e.data.name);

    if (await exists(fullPath)) console.log(`${fullPath} already exists. skipping write.`);
    else writeBinaryFile(fullPath, await e.data.arrayBuffer());
}