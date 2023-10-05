import { open } from '@tauri-apps/api/dialog';
import { projectExt } from './settings';
import { exists, readTextFile } from '@tauri-apps/api/fs';
import { join } from '@tauri-apps/api/path';

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
                name: 'TabletopAudio',
                extensions: [projectExt]
            }]
        });
        if (filePath === null) { return; } // user cancelled the selection 

        // if project.json exists in the folder, read it
        const jsonPath = await join(filePath as string, 'project.json')
        if (!await exists(jsonPath))
        {
            console.error('No project.json found!');
            return;
        }
        const project = JSON.parse(await readTextFile(jsonPath));

        console.log(project);

        for (const pMap in project) {
            for (const pImage in project[pMap].images) {
                console.log(project[pMap].images[pImage]);
            }
            for (const pSound in project[pMap].sounds) {
                console.log(project[pMap].sounds[pSound]);
            }
        }
    }
    catch (err) 
    {
        console.error(err);
    }
};