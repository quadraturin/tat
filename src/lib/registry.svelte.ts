import type * as H from 'howler';
import { AppTheme } from "./classes/AppTheme.svelte";
import { getThemesList } from "./settings.theme";
import { InfiniteCanvas } from "./util.infiniteCanvas.svelte";
import type { CanvasObject } from "./classes/CanvasObject.svelte";
import { CanvasImage, type canvasImageOptions } from "./classes/CanvasImage.svelte";
import { CanvasSound, type canvasSoundOptions } from "./classes/CanvasSound.svelte";
import { CanvasListener } from "./classes/CanvasListener.svelte";


// ###########################
// ##### INFINITE CANVAS #####
// ###########################


// ===== THE CANVAS =====

/** The "infinite canvas" that all images, emitters, etc. get drawn to. */
let canvas:InfiniteCanvas;

/** Get the infinite canvas. @returns The infinite canvas. */
export function getCanvas() { return canvas; }

/** Set a new infinite canvas. @param gridSize The size of the grid to display on the canvas. */
export function setCanvas(gridSize?:number) { canvas = new InfiniteCanvas(gridSize); }


// ===== CANVAS OBJECT HANDLING =====

let hoveredCanvasObject:CanvasObject|null = null;
export function getHoveredCanvasObject() { return hoveredCanvasObject; }
export function setHoveredCanvasObject(obj:CanvasObject|null) { hoveredCanvasObject = obj; }

let clickedCanvasObject:CanvasObject|null;
export function getClickedCanvasObject() { return clickedCanvasObject; }
export function setClickedCanvasObject(obj:CanvasObject|null) { clickedCanvasObject = obj; }


// ===== DRAGGING ON THE CANVAS =====

/** Whether or not the user is currently dragging something(s). */
let dragging = false;
export function getDragging() { return dragging; }
export function setDragging(d?:boolean) {
    if (typeof d == "undefined") dragging = !dragging;
    else dragging = d;
}


// ===== PANNING THE CANVAS =====

let mouseDown = false;
export function getMouseDown() { return mouseDown; }
export function setMouseDown(down?:boolean) {
    if (typeof down =="undefined") mouseDown = !mouseDown;
    else mouseDown = down;
}

/** Whether or not the user is currently panning. */
let panning = false;

/** The last X position of the cursor while panning. */
let panLastX = 0

/** The last Y position of the cursor while panning. */
let panLastY = 0;

/** Friction for panning. */
let friction = 0.94;

export function getFriction() { return friction; }

/** Start panning the canvas. @param x X position of cursor. @param y Y position of cursor. */
export function startPanning(x:number, y:number) {
    panLastX = x;
    panLastY = y;
    panning = true;
}

/** Stop panning the canvas. */
export function stopPanning() { 
    panning = false;
}

/** Get whether or not the user is currently panning. @returns If the user is currently panning. */
export function getPanning():boolean { return panning; }

/** Get the last cursor X position for panning the canvas. @returns The X position. */
export function getPanLastX():number { return panLastX; }

/** Get the last cursor Y position for panning the canvas. @returns The Y position. */
export function getPanLastY():number { return panLastY; }

/** Set the last cursor X position for panning the canvas. @param n The cursor X position. */
export function setPanLastX(n:number) { panLastX = n; }

/** Set the last cursor Y position for panning the canvas. @param n The cursor Y position. */
export function setPanLastY(n:number) { panLastY = n; }


// ===== HANDLES =====

let handleSize = 4;
let handleSlop = 4;
export function getHandleSize() { return handleSize; }
export function getHandleSlop() { return handleSlop; }

export enum Handle { None="NONE", NW="NW", NE="NE", SW="SW", SE="SE", Radius="RADIUS", PolyVertex="POLYVERTEX", PolyEdge="POLYEDGE"};

let mouseDownX = 0;
export function getMouseDownX() { return mouseDownX; }
export function setMouseDownX(x:number) { mouseDownX = x; }

let mouseDownY = 0;
export function getMouseDownY() { return mouseDownY; }
export function setMouseDownY(y:number) { mouseDownY = y; }

let originalH = 0;
export function getOriginalH() { return originalH; }
export function setOriginalH(h:number) { originalH = h; }

let originalW = 0;
export function getOriginalW() { return originalW; }
export function setOriginalW(w:number) { originalW = w; }

let originalX = 0;
export function getOriginalX() { return originalX; }
export function setOriginalX(x:number) { originalX = x; }

let originalY = 0;
export function getOriginalY() { return originalY; }
export function setOriginalY(y:number) { originalY = y; }


// #######################################
// ##### PROJECT CONTENTS MANAGEMENT #####
// #######################################


// ===== LISTENER =====

/** The listener. */
let listener:CanvasListener;

/** Get the listener. @returns The listener. */
export function getListener():CanvasListener { return listener; }

/** Set a new listener. @param newListener The new listener to set. */
export function setListener() { 
    listener = new CanvasListener({
        x: 0,
        y: 0,
        order: 0,
        name: "Listener",
        niceName: "Listener",
        editable: true,
        selected: false,
        grabbed: false,
        locked: false,
        handle: Handle.None
    }); 
}

/** The size of the listener's radius. */
let listenerRadius = 10;

/** Get the listener radius. @returns The radius. */
export function getListenerRadius() { return listenerRadius; }

/** Set the listener radius. @param newRadius The new radius. */
export function setListenerRadius(newRadius:number) { listenerRadius = newRadius; }


// ===== IMAGES =====

/** The list of images. */
let images = new Array<CanvasImage>;

/** Get the list of images. @returns The list of images. */
export function getImages():Array<CanvasImage> { return images; }

/** Set the list of images to a new list. @param newImages The new list of images. */
export function setImages(newImages:Array<CanvasImage>) { images = newImages; }

/** Add an image to the image list. @param options The new image information. */
export function addToImages(options:canvasImageOptions) { 
    images.push(new CanvasImage(options)); 
    console.log(images);
}


// ===== SOUNDS =====

/** The sound list. */
let sounds = new Array<CanvasSound>;

/** Get the sound list. @returns The sound list. */
export function getSounds():Array<CanvasSound> { return sounds; }

/** Set the sound list to a new sound list. @param newSounds The new sound list. */
export function setSounds(newSounds:Array<CanvasSound>) { sounds = newSounds; }

/** Add a sound to the sound list. @param options The new sound information. */
export function addToSounds(options:canvasSoundOptions) { 
    sounds.push(new CanvasSound(options)); 
    console.log(sounds);
}

export enum SoundType {Local="LOCAL", Global="GLOBAL", Area="AREA"};


// ##########################
// ##### MEDIA CONTROLS #####
// ##########################

/** The master volume. */
let masterVolume = 1;
export function getMasterVolume() { return masterVolume; }
export function setMasterVolume(vol:number) {
    if (vol < 0) vol = 0;
    else if (vol > 1) vol = 1;
    masterVolume = vol;
}

/** The master opacity. */
let masterOpacity = 1;
export function getMasterOpacity() { return masterOpacity; }
export function setMasterOpacity(opacity:number) {
    if (opacity < 0) opacity = 0;
    else if (opacity > 1) opacity = 1;
    masterOpacity = opacity;
}


// ########################################
// ##### APPLICATION STATE MANAGEMENT #####
// ########################################


// ===== LOADING =====

/** The loading state. */
let isLoading = false;

/** Get whether or not anything is loading. @returns If the app is loading anything. */
export function getIsLoading():boolean { return isLoading; };

/** Set whether or not anything is loading. @param value If something is loading. */
export function setIsLoading(value:boolean) { isLoading = value; };


// ===== SAVING =====

/** The saving state. */
let isSaving = false;

/** Get whether or not the app is saving. @returns If saving is in progress. */
export function getIsSaving():boolean { return isSaving; };

/** Set whether or not the app is saving. @param value If saving is in progress. */
export function setIsSaving(value:boolean) {isSaving = value; };


// ===== HAS MEDIA =====

/** Whether or not the project has any media. */
let hasMedia = $state(false);

/** Get if the project has media. @returns If the project has media in it. */
export function getHasMedia():boolean { return hasMedia; };

/** Set if the project has media. @param b If the project has media. */
export function setHasMedia(b:boolean) { hasMedia = b; };


// ===== UNSAVED CHANGES =====

/** Whether or not the project has unsaved changes. */
let isProjectDirty = false;

/** Get if the project has unsaved changes. @returns If the project has unsaved changes. */
export function getisProjectDirty():boolean { return isProjectDirty; };

/** Set the project to have unsaved changes. */
export function setProjectDirty() { isProjectDirty = true; };

/** Set the project to have no unsaved changes. */
export function setProjectClean() { isProjectDirty = false; };


// ===== MENUS =====

/** Whether or not the about menu is open. */
let aboutMenuOpen = false;

/** Whether or not the settings menu is open. */
let settingsMenuOpen = false;

/** Get if the about menu is open. @returns whether or not the about menu is open. */
export function getIsAboutMenuOpen():boolean { return aboutMenuOpen; }

/** Set whether or not the about menu is open. @param val whether or not the about menu is open. */
export function setIsAboutMenuOpen(val:boolean) { aboutMenuOpen = val; }

/** Get whether or not the settings menu is open. @returns whether or not the settings menu is open. */
export function getIsSettingsMenuOpen():boolean { return settingsMenuOpen; }

/** Set whether or not the settings menu is open. @param val whether or not the settings menu is open. */
export function setIsSettingsMenuOpen(val:boolean) { settingsMenuOpen = val; }


// ===== HELP =====

/** Whether or not help is active. */
let helpActive = true;

/** Toggle whether or not help is active. */
export function toggleHelpActive() { helpActive = !helpActive; }

/** Get whether or not help is active. @returns whether or not help is active. */
export function getIsHelpActive():boolean { return helpActive; }


// ===== PROPORTIONAL IMAGE SCALING =====

/** Whether or not proportional image scaling is currently on. */
let isProportionalScaleOn = false;

/**
 * Get if proportional image scaling is active.
 * @returns Whether or not proportional image scaling is currently on.
 */
export function getIsProportionalScaleOn():boolean { return isProportionalScaleOn; };

/**
 * Set proportional image scaling to on or off.
 * @param b whether or not proportional image scaling is on.
 */
export function setIsProportionalScaleOn(b:boolean) { isProportionalScaleOn = b; };

/** Toggle proportional image scaling. */
export function toggleProportionalScale(){ isProportionalScaleOn = !isProportionalScaleOn };


// ===== DELETE MODE =====

/** Whether or not delete mode is active. */
let isInDeleteMode = false;
export function getIsInDeleteMode():boolean { return isInDeleteMode; };
export function setIsInDeleteMode(b:boolean) {isInDeleteMode = b; };


// ===== THEME =====

/** The theme. */
export let activeTheme = $state(new AppTheme());

/** Set the theme. @param themeName The name of the theme to set. */
export function setTheme(themeName:string) {
    const themesList = getThemesList();
    for (let i = 0; i < themesList.length; i++) {
        if(themeName == themesList[i].name){
            activeTheme.update(themesList[i]);
        }
    }
}


// ===== IMAGES HIDDEN =====

let imagesHidden = $state(false);
export function getImagesHidden() { return imagesHidden; }
export function toggleImagesHidden() { imagesHidden = !imagesHidden; }



// #################################
// ###### PROJECT INFORMATION ######
// #################################


// ===== PROJECT PATH =====

/** The project path. */
let projectPath:string | undefined;

/** Set the path of the current project. @param p The project path. */
export function setProjectPath(p:string) { projectPath = p; projectPath = projectPath || undefined };

/** Get the path of the current project. @returns the project path. */
export function getProjectPath():string|undefined { return projectPath; };


// ===== PROJECT NAME =====

/** The project name. */
let projectName:string;

/**  Set the name of the project.  @param p The name of the project. */
export function setProjectName(p:string) { projectName = p; };

/**  Get the name of the project. @returns the name of the project */
export function getProjectName():string { return projectName; };
