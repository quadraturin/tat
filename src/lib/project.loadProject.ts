import { open } from '@tauri-apps/api/dialog';
import { projectExt } from './settings';
import { exists, readTextFile } from '@tauri-apps/api/fs';
import { basename, join } from '@tauri-apps/api/path';
import { loadImage } from './media.loadImage';
import { loadSound } from './media.loadSound';
import * as R from '$lib/registry'
import { clearProject } from './project.clearProject';
import { closeModal, openLoadingModal } from './menu.modals';

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

        console.log('hellooo');

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

        for (let i=0; i<project.maps.length; i++) {
            for (let j=0; j<project.maps[i].images.length; j++) {
                console.log(i,j);
                const obj = project.maps[i].images[j];
                //load sequentially so they stack correctly!
                await loadImage(await join(filePath as string, 'images', obj.src), obj.x, obj.y, obj.width, obj.height);
            }
            for (let j=0; j<project.maps[i].sounds.length; j++) {
                const obj = project.maps[i].sounds[j];
                promises.push(loadSound(await join(filePath as string, 'sounds', obj.src), obj.x, obj.y, obj.radius));
            }
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