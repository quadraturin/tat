import * as R from '$lib/registry';
import { save } from "@tauri-apps/api/dialog";
import { createDir, writeTextFile, writeBinaryFile } from "@tauri-apps/api/fs";
import { join} from "@tauri-apps/api/path";
import type { MapImage } from './classes/MapImage';
import type { MapSound } from './classes/MapSound';
import { projectExt } from './settings';

export async function saveProject() 
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
    const filePathExt:string = `${filePath}.${projectExt}`;
    await createDir(filePathExt, { recursive: true });
    await createDir(await join(filePathExt, 'sounds'), { recursive: true });
    await createDir(await join(filePathExt, 'images'), { recursive: true });

    // cycle through loaded images, adding each to the project object
    var i = 0;
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
        writeImageFile(e, filePathExt);
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
        writeSoundFile(e, filePathExt);
        i++;
    });

    // write the project JSON
    console.log(project);
    await writeTextFile(await join(filePathExt, 'project.json'), JSON.stringify(project));

    // leave saving state when done
    R.setIsSaving(false);
}

async function writeImageFile(e:MapImage, filePath:string) {
    writeBinaryFile(await join(filePath, 'images', e.data.name), await e.data.arrayBuffer())
}
async function writeSoundFile(e:MapSound, filePath:string) {
    writeBinaryFile(await join(filePath, 'sounds', e.data.name), await e.data.arrayBuffer())
}