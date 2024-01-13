import * as R from '$lib/registry';
import { message, save } from "@tauri-apps/api/dialog";
import { createDir, writeTextFile, writeBinaryFile, exists } from "@tauri-apps/api/fs";
import { join, basename } from "@tauri-apps/api/path";
import type { MapImage } from './classes/MapImage';
import type { MapSound } from './classes/MapSound';
import { closeAllMenus } from './ui.menus';
import { closeModal, openSavingModal } from './ui.modals';

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
    await createDir(filePath, { recursive: true });
    await createDir(await join(filePath, 'sounds'), { recursive: true });
    await createDir(await join(filePath, 'images'), { recursive: true });

    // cycle through loaded images, adding each to the project object
    let i = 0;
    imageList.forEach(e => {
        project.maps[0].images[i] = {
            src: e.data.name,
            x: e.overlay.getBounds().getWest(),
            y: e.overlay.getBounds().getSouth(),
            width: e.overlay.getBounds().getEast() - e.overlay.getBounds().getWest(),
            height: e.overlay.getBounds().getNorth() - e.overlay.getBounds().getSouth(),
            originalWidth: e.originalWidth,
            originalHeight: e.originalHeight
        }
        promises.push(writeImageFile(e, filePath as string));
        i++;
    });

    // cycle through loaded sounds, adding each to the project object
    i = 0;
    soundList.forEach(e => {
        project.maps[0].sounds[i] = 
        {
            src: e.data.name,
            x: e.circle.getLatLng().lng,
            y: e.circle.getLatLng().lat,
            radius: e.circle.getRadius()
        }
        promises.push(writeSoundFile(e, filePath as string));
        i++;
    });

    // write the project JSON
    console.log(project);
    promises.push(writeTextFile(await join(filePath, 'project.json'), JSON.stringify(project)));

    // set the project path & set project state to clean
    R.setProjectPath(filePath);
    R.setProjectName(newProjectName);
    R.setProjectClean();

    // leave saving state when done
    await Promise.allSettled(promises);
    R.setIsSaving(false);

    await message('project saved!');
    closeModal();

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