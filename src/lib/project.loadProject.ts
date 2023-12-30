import { open } from '@tauri-apps/api/dialog';
import { projectExt } from './settings';
import { exists, readTextFile } from '@tauri-apps/api/fs';
import { basename, join } from '@tauri-apps/api/path';
import { loadImage } from './media.loadImage';
import { loadSound } from './media.loadSound';
import * as R from '$lib/registry'
import { clearProject } from './project.clearProject';
import { closeAllMenus } from './menus';

export async function loadProject() 
{
    try 
    {
        await closeAllMenus();

        await clearProject();

        const filePath = await open(
        {
            directory: true,
            recursive: true,
            multiple: false,
            filters: [{
                name: 'TabletopAudio',
                extensions: [projectExt]
            }]
        });
        if (filePath === null) { return; } // user cancelled the selection 

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

        R.setProjectName("loading");

        for (const pMap in project) {
            for (const pImage in project[pMap].images) {
                const obj = project[pMap].images[pImage];
                loadImage(await join(filePath as string, 'images', obj.src), obj.x, obj.y, obj.width, obj.height);
            }
            for (const pSound in project[pMap].sounds) {
                const obj = project[pMap].sounds[pSound];
                loadSound(await join(filePath as string, 'sounds', obj.src), obj.x, obj.y, obj.radius);
            }
        }
        R.setProjectClean();
        R.setProjectName(await basename(R.getProjectPath() as string));
    }
    catch (err) 
    {
        console.error(err);
    }
};