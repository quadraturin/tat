import * as R from '$lib/registry.svelte'
import { CanvasImage } from './classes/CanvasImage.svelte';
import type { CanvasObject } from './classes/CanvasObject.svelte';
import { CanvasSound } from './classes/CanvasSound.svelte';
import { ModalActions, openModal, type ModalOptions } from './ui.modals';
import { t } from './util.localization';


/** Try to remove a CanvasObject from the project.  @param obj The CanvasObject to remove. */
export async function tryRemoveObject(obj:CanvasObject) {
    if      (obj instanceof CanvasImage) tryRemoveObjects(null, [obj]);
    else if (obj instanceof CanvasSound) tryRemoveObjects([obj], null);
    else console.error('Object to delete is not a valid CanvasImage or CanvasSound!')
}


/** Try to remove all currently selected objects from the project. */
export async function tryRemoveSelected() {
    // Get all selected sounds.
    let soundsToRemove:CanvasSound[] = [];
    for (let i = 0; i < R.getSounds().length; i++) {
        if (R.getSounds()[i].selected) soundsToRemove.push(R.getSounds()[i]);
    }
    // Get all selected images.
    let imagesToRemove:CanvasImage[] = [];
    for (let i = 0; i < R.getImages().length; i++) {
        if (R.getImages()[i].selected) imagesToRemove.push(R.getImages()[i]);
    }
    // Check for uniqueness.
    tryRemoveObjects(soundsToRemove, imagesToRemove);
}


/** 
 * Check if any objects to be removed are unique. If any are, a modal dialog is opened.
 * @param imagesToRemove List of images to remove. 
 * @param soundsToRemove List of sounds to remove.
 * */
export async function tryRemoveObjects(soundsToRemove?:CanvasSound[]|null, imagesToRemove?:CanvasImage[]|null) {
    // Build the list of objects, marking the unique ones.
    let anyUnique = false;
    let listToRemove = "<ul>";


    // Find sounds.
    soundsToRemove?.forEach(obj => {
        let unique = true;
        for (let i=0; i<R.getSounds().length; i++) {
            if (R.getSounds()[i].src == obj.src && !soundsToRemove.includes(R.getSounds()[i])) {
                unique = false;
                break;
            }
        }
        if (unique) {
            listToRemove += "<li class='unique'>" + obj.niceName + "<br /><em>(" + obj.src + ")</em></li>";
            anyUnique = true;
        }
        else listToRemove += "<li>" + obj.niceName + "<br /><em>(" + obj.src + ")</em></li>"; 
    });
    
    // Find images.
    imagesToRemove?.forEach(obj => {
        let unique = true;
        for (let i=0; i<R.getImages().length; i++) {
            if (R.getImages()[i].src == obj.src && !imagesToRemove.includes(R.getImages()[i])) {
                unique = false;
                break;
            }
        }
        if (unique) {
            listToRemove += "<li class='unique'>" + obj.niceName + "<br /><em>(" + obj.src + ")</em></li>"; 
            anyUnique = true;
        }
        else listToRemove += "<li>" + obj.niceName + "<br /><em>(" + obj.src + ")</em></li>"; 
    });

    // Finish building the list.
    listToRemove += "</ul>"

    if(soundsToRemove) R.setSoundsToDelete(soundsToRemove);
    if(imagesToRemove) R.setImagesToDelete(imagesToRemove);

    // If any are unique, populate and call the modal confirmation dialog.
    if (anyUnique) {
        let o:ModalOptions = {
            title: t.get('ui.menu.modal.deleteUnique.title'), 
            body: "<p>" + t.get('ui.menu.modal.deleteUnique.body') + "</p><h3>"+ t.get('ui.menu.modal.deleteUnique.listTitle') + "</h3>" + listToRemove,
            actions: ModalActions.DeleteUnique
        }
        openModal(o);
    } else {
        R.getSoundsToDelete().forEach(obj => { removeObject(obj) });
        R.getImagesToDelete().forEach(obj => { removeObject(obj) });
        R.setImagesToDelete([]);
        R.setSoundsToDelete([]);
    }
}


/** Remove a CanvasObject from the project. @param obj The CanvasObject to remove. */
export async function removeObject(obj:CanvasObject) {
    // Set up the list to remove from.
    let objList:CanvasObject[];
    if (obj instanceof CanvasSound) objList = R.getSounds();
    else if (obj instanceof CanvasImage) objList = R.getImages();
    else return;

    // Find the object index in the list.
    let index:number|null = null;
    for (let i=0; i<objList.length; i++) {
        if (obj == objList[i]) {
            index = i;
            break;
        }
    }
    // If the object is a sound, stop and unload the sound.
    if (obj instanceof CanvasSound) {
        obj.sound.pause();
        obj.sound.removeAttribute("src");
        obj.sound.load();
    }
    // Remove the object from the list & mark the project as changed.
    if (index != null) {
        objList.splice(index, 1);
        R.setProjectDirty();
    } else {
        console.error("Object to delete not found!");
    }
}
