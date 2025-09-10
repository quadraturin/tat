import type { CanvasObject } from "./classes/CanvasObject.svelte";

/** Modal options. */
export type ModalOptions = {
    title:string,
    body?:string,
    actions?:ModalActions,
    objectList?:CanvasObject[]
}


/** Modal types. */
export enum ModalActions {
    Confirm         = "confirm",
    DeleteUnique    = "deleteunique"
}


/** Open the loading modal. @param o The modal options. */
export function openModal(o:ModalOptions) {
    // If no actions are passed, assume a confirm dialog.
    const modalActions = o.actions ? o.actions : ModalActions.Confirm;

    // Get the modal HTML elements.
    const bgElement      = document.getElementById("modal-background");
    const titleElement   = document.getElementById("modal-title");
    const bodyElement    = document.getElementById("modal-body");
    const actionsElement = document.getElementById("modal-actions");

    // Construct the modal.
    if (bgElement && titleElement) {
        // Show the modal and blurred background.
        bgElement.setAttribute("style", "display:block");
        // Title the modal.
        titleElement.innerHTML = o.title;
        // Populate the body text.
        if (bodyElement && o.body) bodyElement.innerHTML = o.body;
        // Populate the action buttons.
        if (actionsElement) {
            // Hide all buttons.
            for (const child of actionsElement.children){
                child.classList.add('hidden');
            }
            // If a Confirm dialog, show the Confirm button.
            if (modalActions == ModalActions.Confirm){
                document.getElementById("modal-confirm")?.classList.remove('hidden');
            } else if (modalActions == ModalActions.DeleteUnique) {
                document.getElementById("modal-deleteunique-confirm")?.classList.remove('hidden');
                document.getElementById("modal-cancel")?.classList.remove('hidden');
            }
        }
    } else {
        console.error("Modal window not found!");
    }
}


/** Display the path of a file being loaded. @param filePath path of a file being loaded. */
export function updateModal(filePath:string) {
    let element = document.getElementById("modal-text");
    if (element != null){
        element.insertAdjacentHTML("beforeend", "<li>" + filePath + "</li>");
    }
}


/** Close the modal. */
export function closeModal() {
    document.getElementById("modal-background")?.setAttribute("style", "display:none");
    const title = document.getElementById("modal-title");
    const body = document.getElementById("modal-body");
    if (title) title.innerHTML = "";
    if (body) body.innerHTML = "";
}


/** Open the saving modal. @param projectName the name of the project. */
export function openSavingModal(projectName:string) {
    let element = document.getElementById("modal-title");
    if (element != null) {
        element.innerHTML = `saving project "${projectName}"...`;
    }
    document.getElementById("modal-background")?.setAttribute("style", "display:block");
}
