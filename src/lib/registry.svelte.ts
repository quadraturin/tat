import { AppTheme } from "./classes/AppTheme.svelte";
import { getThemesList } from "./settings.theme";
import { InfiniteCanvas } from "./util.canvas.svelte";
import { CanvasObject } from "./classes/CanvasObject.svelte";
import { CanvasImage, type canvasImageOptions } from "./classes/CanvasImage.svelte";
import { CanvasSound, type CanvasSoundOptions } from "./classes/CanvasSound.svelte";
import { CanvasListener } from "./classes/CanvasListener.svelte";
import { CanvasShape, type CanvasShapeOptions } from './classes/CanvasShape.svelte';
import { Menu } from "@tauri-apps/api/menu";
import { help } from "./util.help";
import { t } from '$lib/util.localization';

/**
 *  1. MOUSE
 *      1.1 Mouse Position
 *      1.2 Mouse Clicked
 *  2. INFINITE CANVAS
 *      2.1 The Canvas
 *      2.2 Canvas Object Handling
 *      2.3 Dragging On The Canvas
 *      2.4 Panning On The Canvas
 *      2.5 Canvas Object Handles
 *  3. PROJECT OBJECTS
 *      3.1 Listener
 *      3.2 Images
 *      3.3 Shapes
 *      3.4 Sounds 
 *      3.5 Effects
 *  4. MEDIA CONTROLS
 *      4.1 Master Volume
 *      4.2 Master Opacity
 *  5. APPLICATION STATES
 *      5.1 Loading
 *      5.2 Saving
 *      5.3 Has Media
 *      5.4 Unsaved Changes
 *      5.5 Menu States
 *      5.6 Help Active
 *      5.7 Proportional Image Scaling
 *      5.8 Delete Mode
 *      5.9 Theme
 *      5.10 Images Hidden
 *      5.11 Sounds Hidden
 *  6. PROJECT INFORMATION
 *      6.1 Project Path
 *      6.2 Project Name
 */


export let ctxMenuCanvas:Menu;
export async function setupCtxMenu(e:MouseEvent) {
    ctxMenuCanvas = await Menu.new({
        items: [
            {
                id: 'canvas',
                text: 'Canvas',
                enabled: false,
            },
            {
                id: 'coords',
                text: 'Click: (' + Math.round(getCanvas().toWorldX(e.x))+ ", " + Math.round(getCanvas().toWorldY(e.y)) +")",
                enabled: false,
            }
        ]
    });
}

export let ctxMenuCanvasListener:Menu;
export async function setupCtxMenuCanvasListener() {
    ctxMenuCanvasListener = await Menu.new({
        items: [
            {
                id: 'listener',
                text: 'Listener',
                action: () => { getCanvas().flyToPoint(getListener().x, getListener().y)},
            },
            {
                id: 'coords',
                text: '(' + Math.round(getListener().x)+ ", " + Math.round(getListener().y) +")",
                enabled: false
            },
            {
                id: 'move_listener_to_origin',
                text: 'Move to (0, 0)',
                enabled: (getListener().x != 0 || getListener().y != 0),
                action: () => { 
                    getListener().x = 0; 
                    getListener().y = 0; 
                    getCanvas().flyToPoint(0, 0)},
            }
        ]
    });
}

export let ctxMenuCanvasObject:Menu;
export async function setupCtxMenuCanvasObject() {
    let objTypePrefix:string = "";
    let disableToFront:boolean = false;
    let disableToBack:boolean = false;
    const hovered = getHoveredCanvasObject();
    if (hovered instanceof CanvasObject) {
        if(hovered instanceof CanvasImage) {
            objTypePrefix = "Image: ";
            if (hovered == getImages()[0]) disableToFront = true;
            if (hovered == getImages()[getImages().length-1]) disableToBack = true;
        }
        else if(hovered instanceof CanvasSound){ 
            objTypePrefix = "Sound: ";
            if (hovered == getSounds()[0]) disableToFront = true;
            if (hovered == getSounds()[getSounds().length-1]) disableToBack = true;
        }
        ctxMenuCanvasObject = await Menu.new({
            items: [
                {
                    id: 'object_name',
                    text: 'Object name',
                    action: () => { hovered.selected = !hovered.selected}
                },
                {
                    id: 'bring_to_front',
                    text: 'Bring to front',
                    enabled: !disableToFront,
                    action: () => { moveObjectToFront(hovered) }
                },
                {
                    id: 'send_to_back',
                    text: 'Send to back',
                    enabled: !disableToBack,
                    action: () => { moveObjectToBack(hovered) }
                },
            ]
        });
        const menuObjectName = await ctxMenuCanvasObject.get('object_name');
        if (getHoveredCanvasObject() instanceof CanvasObject) {
            menuObjectName?.setText(objTypePrefix + getHoveredCanvasObject()!.niceName);
        }
    }
}


let soundsToDelete:CanvasSound[] = [];
export function getSoundsToDelete() { return soundsToDelete; }
export function setSoundsToDelete(sounds:CanvasSound[]) { soundsToDelete = sounds; }
let imagesToDelete:CanvasImage[] = [];
export function getImagesToDelete() { return imagesToDelete; }
export function setImagesToDelete(images:CanvasImage[]) { imagesToDelete = images; }


// ####################
// ##### 1. MOUSE #####
// ####################


// ===== 1.1 MOUSE POSITION =====

/** The mouse X position. */
let mouseX = $state(0);

/** The mouse Y position. */
let mouseY = $state(0);

/** Get the mouse position. @returns The mouse X and Y positions. */
export function getMouse() { return { x:mouseX, y:mouseY }; }

/** Set the mouse position. @param x The mouse X position. @param y The mouse Y position. */
export function setMouse(x:number, y:number) { mouseX = x; mouseY = y; }


// ===== 1.2 MOUSE CLICKED =====

/** Whether or not the mouse is clicked. */
let mouseDown = false;

/** Get if the mouse is clicked. @returns True: mouse is clicked. False: mouse is not clicked. */
export function getMouseDown() { return mouseDown; }

/** Set if the mouse is clicked. @param down True: mouse is clicked. False: mouse is not clicked. */
export function setMouseDown(down?:boolean) {
    if (typeof down =="undefined") mouseDown = !mouseDown;
    else mouseDown = down;
}



// ##############################
// ##### 2. INFINITE CANVAS #####
// ##############################


// ===== 2.1 THE CANVAS =====

/** The "infinite canvas" that all images, emitters, etc. get drawn to. */
let canvas:InfiniteCanvas;

/** Get the infinite canvas. @returns The infinite canvas. */
export function getCanvas() { return canvas; }

/** Set a new infinite canvas. @param gridSize The size of the grid to display on the canvas. */
export function setCanvas(gridSize?:number) { canvas = new InfiniteCanvas(gridSize); }


// ===== 2.2 CANVAS OBJECT HANDLING =====

let hoveredCanvasObject:CanvasObject|null = null;
export function getHoveredCanvasObject() { return hoveredCanvasObject; }
export async function setHoveredCanvasObject(obj:CanvasObject|null) { 
    hoveredCanvasObject = obj; 

    // If there's nothing or help is off, clear the help display and bail.
    if (obj == null || !helpActive) { 
        help();
        return;
    }
    
    // Otherwise, build the help text based on what's hovered and its state.
    let h:string[] = [];

    if (obj instanceof CanvasListener) {                    h.push(t.get('help.canvas.listener'), t.get('help.canvas.listenerKey')); 
    } else {
        if (obj instanceof CanvasImage) {                   h.push(t.get('help.canvas.image')); 

        } else if (obj instanceof CanvasSound) {
            if (obj.soundType == SoundType.Area) {          h.push(t.get('help.canvas.soundArea'));
                if (!obj.locked)                            h.push(t.get('help.canvas.soundAreaKey'));
            } else if (obj.soundType == SoundType.Local) {  h.push(t.get('help.canvas.soundLocal'));
                if (!obj.locked)                            h.push(t.get('help.canvas.soundLocalKey'));
            }
        }

        if (obj.selected)     h.push(t.get('help.objects.selected'), t.get('help.objects.deselectKey'));
        else if (!obj.locked) h.push(t.get('help.objects.selectKey'));

        if (obj.locked)       h.push(t.get('help.objects.locked'), t.get('help.objects.unlockKey'));
        else                  h.push(t.get('help.objects.lockKey'));
    }
    help(...h);
}

let clickedCanvasObject:CanvasObject|null;
export function getClickedCanvasObject() { return clickedCanvasObject; }
export function setClickedCanvasObject(obj:CanvasObject|null) { clickedCanvasObject = obj; }


// ===== 2.3 DRAGGING ON THE CANVAS =====

/** Whether or not the user is currently dragging something(s). */
let dragging = false;
export function getDragging() { return dragging; }
export function setDragging(d?:boolean) {
    if (typeof d == "undefined") dragging = !dragging;
    else dragging = d;
}


// ===== 2.4 PANNING THE CANVAS =====

/** Whether or not the user is currently panning. */
let panning = false;

/** The last X position of the cursor while panning. */
let panLastX = 0

/** The last Y position of the cursor while panning. */
let panLastY = 0;

/** Friction for panning. */
let friction = 0.94;

/** Get the canvas friction. @returns The friction. */
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


// ===== 2.5 CANVAS OBJECT HANDLES =====

let handleSize = 4;
let handleSlop = 4;
export function getHandleSize() { return handleSize; }
export function getHandleSlop() { return handleSlop; }

export enum Handle { None="none", NW="nw", NE="ne", SW="sw", SE="se", Radius="radius", PolyVertex="polyvertex", PolyEdge="polyedge"};

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


// ##############################
// ##### 3. PROJECT OBJECTS #####
// ##############################


// ===== 3.1 LISTENER =====

/** The listener. */
let listener:CanvasListener;

/** Get the listener. @returns The listener. */
export function getListener():CanvasListener { return listener; }

/** Set a new listener. @param newListener The new listener to set. */
export function setListener() { 
    listener = new CanvasListener({ x: 0, y: 0 }); 
}

/** The size of the listener's radius. */
let listenerRadius = 10;

/** Get the listener radius. @returns The radius. */
export function getListenerRadius() { return listenerRadius; }

/** Set the listener radius. @param newRadius The new radius. */
export function setListenerRadius(newRadius:number) { listenerRadius = newRadius; }


// ===== 3.2 IMAGES =====

/** The list of images. */
let images = new Array<CanvasImage>;

/** Get the list of images. @returns The list of images. */
export function getImages():Array<CanvasImage> { return images; }

/** Set the list of images to a new list. @param newImages The new list of images. */
export function setImages(newImages:Array<CanvasImage>) { images = newImages; }

/** Add an image to the image list. @param options The new image information. */
export function addToImages(options:canvasImageOptions) { 
    images.push(new CanvasImage(options)); 
}

export function moveObjectToFront(obj:CanvasObject){
    if (obj instanceof CanvasImage) {
        for (let i = 0; i < getImages().length; i++) {
            if (getImages()[i] == obj){
                getImages().splice(i,1);
                break;
            }
        }
        getImages().splice(0, 0, obj);
    } else if (obj instanceof CanvasSound) {
        for (let i = 0; i < getSounds().length; i++) {
            if (getSounds()[i] == obj){
                getSounds().splice(i,1);
                break;
            }
        }
        getSounds().splice(0, 0, obj);
    }
}
export function moveObjectToBack(obj:CanvasObject){
    if (obj instanceof CanvasImage) {
        for (let i = 0; i < getImages().length; i++) {
            if (getImages()[i] == obj){
                getImages().splice(i,1);
                break;
            }
        }
        getImages().push(obj);
    } else if (obj instanceof CanvasSound) {
        for (let i = 0; i < getSounds().length; i++) {
            if (getSounds()[i] == obj){
                getSounds().splice(i,1);
                break;
            }
        }
        getSounds().push(obj);
    }
}


// ===== 3.3 SHAPES =====

/** The list of shapes. */
let shapes = new Array<CanvasShape>;

/** Get the list of images. @returns The list of images. */
export function getShapes():Array<CanvasShape> { return shapes; }

/** Set the list of images to a new list. @param newImages The new list of images. */
export function setShapes(newShapes:Array<CanvasShape>) { shapes = newShapes; }

/** Add an image to the image list. @param options The new image information. */
export function addToShapes(options:CanvasShapeOptions) { 
    shapes.push(new CanvasShape(options)); 
}

export enum ShapeType {
    Area   = "area",
    Grid   = "grid",
    Circle = "circle",
    Rect   = "rect",
    Symbol = "symbol",
    Text   = "text"
};


// ===== 3.4 SOUNDS =====

const audioContext = new AudioContext();//{ sampleRate: 48000, latencyHint: 'interactive' });
export function getAudioContext() { return audioContext; }

const masterGain = audioContext.createGain();
export function getMasterGain() { return masterGain; }

const compressor = audioContext.createDynamicsCompressor();

const lowpass    = audioContext.createBiquadFilter();
lowpass.type = 'lowpass';
lowpass.frequency.setValueAtTime(2000, audioContext.currentTime);
//lowpass.Q.setValueAtTime(20, audioContext.currentTime);

const highpass    = audioContext.createBiquadFilter();
highpass.type = 'highpass';
highpass.frequency.setValueAtTime(2000, audioContext.currentTime);
//highpass.Q.setValueAtTime(20, audioContext.currentTime);

const bandpass    = audioContext.createBiquadFilter();
bandpass.type = 'bandpass';
bandpass.frequency.setValueAtTime(2000, audioContext.currentTime);
bandpass.Q.setValueAtTime(20, audioContext.currentTime);

const waveShaper = audioContext.createWaveShaper();
const distortionCurve = new Float32Array(1024);
for (let i = 0; i < 1024; ++i) {
    const x = (i * 2) / 1024 - 1; // Normalize to -1 to 1
    distortionCurve[i] = (x < 0) ? Math.pow(x, 2) : Math.pow(x, 0.5); // Distortion effect
}
waveShaper.curve = distortionCurve;
waveShaper.oversample = '4x';

// Sound processing chain
masterGain//.connect(waveShaper)
    .connect(compressor)
    .connect(audioContext.destination);

/** The sound list. */
let sounds = new Array<CanvasSound>;

/** Get the sound list. @returns The sound list. */
export function getSounds():Array<CanvasSound> { return sounds; }

/** Set the sound list to a new sound list. @param newSounds The new sound list. */
export function setSounds(newSounds:Array<CanvasSound>) { sounds = newSounds; }

/** Add a sound to the sound list. @param options The new sound information. */
export function addToSounds(options:CanvasSoundOptions) { sounds.push(new CanvasSound(options)); }

/** Canvas sound types. Local (circle falloff), Area (polygon), Global. */
export enum SoundType {
    Local  = "local", 
    Global = "global", 
    Area   = "area"
};

/** Canvas sound types. Local (circle falloff), Area (polygon), Global. */
export enum TriggerType {
    Manual        = "manual", 
    PlayOnEnter   = "playonenter",
    RestartOnEnter = "replayonenter",
    PlayInside    = "playinside", 
    RestartInside  = "replayinside", 
    PlayOnTimer   = "playontimer"
};

// ===== 3.5 EFFECTS =====

/** Canvas effect types. */
export enum EffectType {
    Lowpass         = "lowpass",        // BiquadFilterNode
    Highpass        = "highpass",       // BiquadFilterNode
    Reverb          = "reverb",         // ConvolverNode
    Compressor      = "compressor",     // DynamicsCompressorNode
    Distortion      = "distortion",     // WaveShaperNode
    Panner          = "panner",         // PannerNode
    StereoPanner    = "stereopanner"    // StereoPannerNode

}

// #############################
// ##### 4. MEDIA CONTROLS #####
// #############################


// ===== 4.1 MASTER VOLUME =====

/** The master volume. */
let masterVolume = 1;

/** Get the master volume. @returns The master volume. */
export function getMasterVolume() { return masterVolume; }

/** Set the master volume. @param vol The volume to set, between 0 and 1. */
export function setMasterVolume(vol:number) {
    if (vol < 0) vol = 0;
    else if (vol > 1) vol = 1;
    masterVolume = vol;
}


// ===== 4.2 MASTER OPACITY =====

/** The master opacity. */
let masterOpacity = 1;

/** Get the master opacity. @returns The master opacity. */
export function getMasterOpacity() { return masterOpacity; }

/** Set the master opacity. @param opacity The opacity to set, between 0 and 1. */
export function setMasterOpacity(opacity:number) {
    if (opacity < 0) opacity = 0;
    else if (opacity > 1) opacity = 1;
    masterOpacity = opacity;
}


// #################################
// ##### 5. APPLICATION STATES #####
// #################################


// ===== 5.1 LOADING =====

/** The loading state. */
let isLoading = false;

/** Get whether or not anything is loading. @returns If the app is loading anything. */
export function getIsLoading():boolean { return isLoading; };

/** Set whether or not anything is loading. @param value If something is loading. */
export function setIsLoading(value:boolean) { isLoading = value; };


// ===== 5.2 SAVING =====

/** The saving state. */
let isSaving = false;

/** Get whether or not the app is saving. @returns If saving is in progress. */
export function getIsSaving():boolean { return isSaving; };

/** Set whether or not the app is saving. @param value If saving is in progress. */
export function setIsSaving(value:boolean) {isSaving = value; };


// ===== 5.3 HAS MEDIA =====

/** Whether or not the project has any media. */
let hasMedia = $state(false);

/** Get if the project has media. @returns If the project has media in it. */
export function getHasMedia():boolean { return hasMedia; };

/** Set if the project has media. @param b If the project has media. */
export function setHasMedia(b:boolean) { hasMedia = b; };


// ===== 5.4 UNSAVED CHANGES =====

/** Whether or not the project has unsaved changes. */
let isProjectDirty = false;

/** Get if the project has unsaved changes. @returns If the project has unsaved changes. */
export function getisProjectDirty():boolean { return isProjectDirty; };

/** Set the project to have unsaved changes. */
export function setProjectDirty() { isProjectDirty = true; };

/** Set the project to have no unsaved changes. */
export function setProjectClean() { isProjectDirty = false; };


// ===== 5.5 MENU STATES =====

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


// ===== 5.6 HELP ACTIVE =====

/** Whether or not help is active. */
let helpActive = true;

/** Toggle whether or not help is active. */
export function toggleHelpActive() { helpActive = !helpActive; }

/** Get whether or not help is active. @returns whether or not help is active. */
export function getIsHelpActive():boolean { return helpActive; }


// ===== 5.7 PROPORTIONAL IMAGE SCALING =====

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


// ===== 5.8 DELETE MODE =====

/** Whether or not delete mode is active. */
let isInDeleteMode = false;
export function getIsInDeleteMode():boolean { return isInDeleteMode; };
export function setIsInDeleteMode(b:boolean) {isInDeleteMode = b; };


// ===== 5.9 THEME =====

/** The theme. */
export let activeTheme:AppTheme = $state(new AppTheme());

/** Set the theme. @param themeName The name of the theme to set. */
export function setTheme(themeName:string) {
    const themesList = getThemesList();
    let foundTheme = false;
    for (let i = 0; i < themesList.length; i++) {
        if(themeName == themesList[i].info?.name){
            activeTheme.update(themesList[i]);
            foundTheme = true;
            break;
        }
    }
    if (!foundTheme){
        activeTheme.update(themesList[0]);
    }
}


// ===== 5.10 IMAGES HIDDEN =====

let imagesHidden = $state(false);
export function getImagesHidden() { return imagesHidden; }
export function toggleImagesHidden() { imagesHidden = !imagesHidden; }


// ===== 5.11 SOUNDS HIDDEN =====

let soundsHidden = $state(false);
export function getSoundsHidden() { return soundsHidden; }
export function toggleSoundsHidden() { soundsHidden = !soundsHidden; }



// ####################################
// ###### 6. PROJECT INFORMATION ######
// ####################################


// ===== 6.1 PROJECT PATH =====

/** The project path. */
let projectPath:string | undefined;

/** Set the path of the current project. @param p The project path. */
export function setProjectPath(p:string) { projectPath = p; projectPath = projectPath || undefined };

/** Get the path of the current project. @returns the project path. */
export function getProjectPath():string|undefined { return projectPath; };


// ===== 6.2 PROJECT NAME =====

/** The project name. */
let projectName:string;

/**  Set the name of the project.  @param p The name of the project. */
export function setProjectName(p:string) { projectName = p; };

/**  Get the name of the project. @returns the name of the project */
export function getProjectName():string { return projectName; };
