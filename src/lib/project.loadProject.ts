import { open } from '@tauri-apps/api/dialog';
import { projectExt } from './settings.appSettings';
import { exists, readTextFile } from '@tauri-apps/api/fs';
import { basename, join } from '@tauri-apps/api/path';
import { loadImageFile, newImage } from './media.loadImage';
import { loadSoundFile, newSound } from './media.loadSound';
import * as R from '$lib/registry'
import { clearProject } from './project.clearProject';
import { closeModal, openLoadingModal } from './ui.modals';

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
        if (!await exists(jsonPath))
        {
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
                let alreadyLoaded = false;

                // check that the image is not already loaded
                for(let k=0; k<j; k++) {
                    if(obj.src == project.maps[i].images[k].src) {
                        console.log("duplicate image!", obj.src);
                        alreadyLoaded = true;
                        break;
                    }
                }
                if (!alreadyLoaded) uniqueImages.push(obj.src as string);
            }

            // find unique sounds
            for (let j=0; j<project.maps[i].sounds.length; j++) {
                const obj = project.maps[i].sounds[j];
                let alreadyLoaded = false;

                // check that the sound is not already loaded
                for(let k=0; k<j; k++) {
                    if(obj.src == project.maps[i].sounds[k].src) {
                        console.log("duplicate sound!", obj.src);
                        alreadyLoaded = true;
                        break;
                    }
                }
                if (!alreadyLoaded) uniqueSounds.push(obj.src as string);
            }

            // load the images and place them
            for (let j=0; j<uniqueImages.length; j++) {
                // load the unique image
                let file = await loadImageFile(await join(filePath as string, 'images', uniqueImages[j]));
                if (typeof file != "undefined") {
                    // create all project images with the unique image
                    for (let k=0; k<project.maps[i].images.length; k++) {
                        if (project.maps[i].images[k].src == uniqueImages[j]){
                            let obj = project.maps[i].images[k];
                            newImage(file, obj.height, obj.width, obj.y, obj.x, obj.opacity, obj.order, obj.locked);
                        }
                    }
                }
            } 

            // load the sounds and place them
            for (let j=0; j<uniqueSounds.length; j++) {
                // load the unique sound
                let file = await loadSoundFile(await join(filePath as string, 'sounds', uniqueSounds[j]));
                if (typeof file != "undefined") {
                    // create all project sounds with the unique sound
                    for (let k=0; k<project.maps[i].sounds.length; k++) {
                        if (project.maps[i].sounds[k].src == uniqueSounds[j]){
                            let obj = project.maps[i].sounds[k];
                            newSound(file, obj.soundType, obj.volume, obj.muted, obj.solo, obj.y, obj.x, obj.radius, obj.points, obj.order, obj.seek, obj.locked);
                        }
                    }
                }
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