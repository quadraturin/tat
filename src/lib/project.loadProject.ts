import { open } from '@tauri-apps/plugin-dialog';
import { projectExt } from './settings.appSettings';
import { exists, readTextFile } from '@tauri-apps/plugin-fs';
import { basename, join, sep } from '@tauri-apps/api/path';
import { newImage } from './media.loadImage';
import { newSound } from './media.loadSound';
import * as R from '$lib/registry.svelte'
import { clearProject } from './project.clearProject';
import { closeModal, openLoadingModal } from './ui.modals';

/**
 * load a project.
 */
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

        console.log(project);

        let projectName = await basename(R.getProjectPath() as string)
        R.setProjectName(projectName);
        openLoadingModal(projectName);

        let promises = new Array<Promise<any>>;

        let uniqueImages:string[] = [];
        let uniqueSounds:string[] = [];

        for (let i=0; i<project.maps.length; i++) {
            // find unique images
            for (let j=0; j<project.maps[i].images.length; j++) {
                const obj = project.maps[i].images[j];
                let src = R.getProjectPath() as string + sep() + "images" + sep() + obj.src
                console.log(src);
                newImage({
                    src: src, 
                    height: obj.height, 
                    width: obj.width, 
                    lat: obj.y, 
                    lng: obj.x, 
                    opacity: obj.opacity, 
                    order: obj.order, 
                    locked: obj.locked
                });
            }

            // find unique sounds
            for (let j=0; j<project.maps[i].sounds.length; j++) {
                const obj = project.maps[i].sounds[j];
                let src = R.getProjectPath() as string + sep() + "sounds" + sep() + obj.src
                console.log(src);
                newSound({
                    src: src,
                    soundType: obj.soundType,
                    volume: obj.volume,
                    muted: obj.muted,
                    solo: obj.solo,
                    lat: obj.y,
                    lng: obj.x,
                    radius: obj.radius,
                    points: obj.points,
                    order: obj.order,
                    seek: obj.seek,
                    locked: obj.locked
                });
            }

            // sort the images and sounds
            R.sortImageList();
            R.sortSoundList();
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
