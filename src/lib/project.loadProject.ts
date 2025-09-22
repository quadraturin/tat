import { message, open } from '@tauri-apps/plugin-dialog';
import { projectExt } from './settings.appSettings';
import { exists, readTextFile } from '@tauri-apps/plugin-fs';
import { basename, join, sep } from '@tauri-apps/api/path';
import * as R from '$lib/registry.svelte'
import { clearProject } from './project.clearProject';
import { closeModal } from './ui.modals';
import { newImage } from './media.loadImage';
import { newSound } from './media.loadSound';
import { t } from './util.localization';

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

        let projectName = await basename(R.getProjectPath() as string)
        R.setProjectName(projectName);

        let promises = new Array<Promise<any>>;

        let oldVersion = false;

        if (!project.info?.version) {
            console.log('Project made with an older version of tat!')
            oldVersion = true;
            await message(t.get('ui.menu.dialog.openOldProjectCoords'));
        }

        let uniqueImages:string[] = [];
        let uniqueSounds:string[] = [];

        for (let i=0; i<project.maps.length; i++) {
        
            // Position the listener.
            if ('listeners' in project.maps[i]) {
                for (let j=0; j<project.maps[i].listeners.length; j++) {
                    R.getListener().x = project.maps[i].listeners[j].x;
                    R.getListener().y = project.maps[i].listeners[j].y;
                }
            }

            // Position the viewport & set object visibility.
            if ('view' in project.maps[i]) {
                R.getCanvas().setZoom(project.maps[i].view.z);
                R.getCanvas().flyToPoint(project.maps[i].view.x, project.maps[i].view.y);
                console.log(project.maps[i].view.hideImages);
                R.setImagesHidden(project.maps[i].view.hideImages);
                R.setSoundsHidden(project.maps[i].view.hideSounds);
            }

            // Find unique images.
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
                if (oldVersion) {
                    options.y = -options.y - options.height;
                    // Take Lat, Lng and convert to X,Y.
                    if (obj.lat || obj.lng){
                        try {
                            if (obj.lat) options.y = -obj.lat - options.height;
                            if (obj.lng) options.x = obj.lng;
                        } catch (err) {
                            console.error("Could not import legacy lat/lng coordinates!", err)
                        }
                    }
                }
                newImage(options);
            }

            // Find unique sounds
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
                    paused:             obj.paused,
                    playbackPosition:   obj.playbackPosition,
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

                // If the project was made in an old (pre-0.5) version of TAT, we need to do a few things.
                if (oldVersion) {
                    options.y *= -1;
                    // Take Lat, Lng and convert to X,Y.
                    if (obj.lat || obj.lng){
                        try {
                            if (obj.lat) options.y = -obj.lat;
                            if (obj.lng) options.x = obj.lng;
                        } catch (err) {
                            console.error("Could not import legacy lat/lng coordinates!", err)
                        }
                    }
                    // Take Points and convert to AreaCoords.
                    if (obj.points) {
                        try {
                            let coords = new Array;
                            obj.points.forEach((point: [number, number]) => {
                                coords.push({x:point[0], y:-point[1]});
                            });
                            options.areaCoords = coords;
                        } catch (err) {
                            console.error("Could not import legacy area points!", err)
                        }
                    }
                }
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
