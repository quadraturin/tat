import { open } from '@tauri-apps/plugin-dialog';
import { projectExt } from './settings.appSettings';
import { exists, readTextFile } from '@tauri-apps/plugin-fs';
import { basename, join, sep } from '@tauri-apps/api/path';
import * as R from '$lib/registry.svelte'
import { clearProject } from './project.clearProject';
import { closeModal, openModal } from './ui.modals';
import { newImage, newImageFromPath } from './media.loadImage';
import { loadFile } from './media.loadFile';
import { newSound } from './media.loadSound';

/** Load a project. */
export async function loadProject() 
{
    try 
    {
        const filePath = await open(
        {
            directory: true,
            recursive: true,
            multiple: false,
            filters: [{
                name: 'tat',
                extensions: [projectExt]
            }]
        });
        if (filePath === null) { return; } // user cancelled the selection 

        // try clearing the project. if it doesn't get cleared, back out.
        if (!await clearProject()) return;

        // if project.json exists in the folder, read it
        const jsonPath = await join(filePath as string, 'project.json');
        if (!await exists(jsonPath)) {
            console.error('No project.json found!');
            return;
        }

        // store project path
        R.setProjectPath(filePath as string);
        const project = JSON.parse(await readTextFile(jsonPath));

        //console.log(project);

        let projectName = await basename(R.getProjectPath() as string)
        R.setProjectName(projectName);

        let promises = new Array<Promise<any>>;

        let uniqueImages:string[] = [];
        let uniqueSounds:string[] = [];

        for (let i=0; i<project.maps.length; i++) {
            // find unique images
            for (let j=0; j<project.maps[i].images.length; j++) {
                const obj = project.maps[i].images[j];
                let src = R.getProjectPath() as string + sep() + "images" + sep() + obj.src;
                const options = {
                    src:            src,
                    height:         obj.height,
                    locked:         obj.locked,
                    name:           obj.name,
                    niceName:       obj.niceName,
                    opacity:        obj.opacity,
                    originalHeight: obj.originalHeight,
                    originalWidth:  obj.originalWidth,
                    selected:       obj.selected,
                    width:          obj.width,
                    x:              obj.x,
                    y:              obj.y,
                }
                // Take Lat, Lng from older versions of TAT and convert to X,Y.
                if (obj.lat) options.y = obj.lat;
                if (obj.lng) options.x = obj.lng;
                newImage(options);
            }

            // find unique sounds
            for (let j=0; j<project.maps[i].sounds.length; j++) {
                const obj = project.maps[i].sounds[j];
                let src = R.getProjectPath() as string + sep() + "sounds" + sep() + obj.src
                const options = {
                    src:                src,
                    areaCoords:         obj.areaCoords,
                    locked:             obj.locked,
                    localHandleAngle:   obj.localHandleAngle,
                    loop:               obj.loop,
                    muted:              obj.muted,
                    name:               obj.name,
                    niceName:           obj.niceName,
                    radius:             obj.radius,
                    selected:           obj.selected,
                    solo:               obj.solo,
                    soundType:          obj.soundType,
                    timer:              obj.timer,
                    triggerType:        obj.triggerType,
                    volume:             obj.volume,
                    x:                  obj.x,
                    y:                  obj.y,
                }
                // Take Lat, Lng from older versions of TAT and convert to X,Y.
                if (obj.lat) options.y = obj.lat;
                if (obj.lng) options.x = obj.lng;
                newSound(options);
            }

            // sort the images and sounds
            //R.sortImageList();
            //R.sortSoundList();
        }

        await Promise.allSettled(promises);
        R.setProjectClean();
        closeModal();
    }
    catch (err) 
    {
        console.error(err);
    }
};
