import * as R from '$lib/registry';
import { save } from "@tauri-apps/api/dialog";
import { createDir, writeTextFile, writeBinaryFile, exists } from "@tauri-apps/api/fs";
import { join} from "@tauri-apps/api/path";
import type { MapImage } from './classes/MapImage';
import type { MapSound } from './classes/MapSound';

export async function saveProject(): Promise<void> 
{
    const imageList = R.getImageList();
    const soundList = R.getSoundList();

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

    // prompt the user with a save dialog
    const filePath = await save();

    // cancel if they back out
    if (filePath === null) return;

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
            w: e.overlay.getBounds().getEast() - e.overlay.getBounds().getWest(),
            h: e.overlay.getBounds().getNorth() - e.overlay.getBounds().getSouth()
        }}, project.map_0.images);
        writeImageFile(e, filePath);
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
        writeSoundFile(e, filePath);
        i++;
    });

    // write the project JSON
    console.log(project);
    await writeTextFile(await join(filePath, 'project.json'), JSON.stringify(project));

    // leave saving state when done
    R.setIsSaving(false);
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