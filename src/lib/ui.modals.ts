/**
 * open the loading modal.
 * @param projectName the name of theproject.
 */
export function openLoadingModal(projectName?:string) {
    let element = document.getElementById("modal-title");
    if (element != null) {
        if (projectName !== undefined) {
            element.innerHTML = `loading project "${projectName}"...`;
        } else {
            element.innerHTML = 'loading files...'
        }
    }
    document.getElementById("modal-background")?.setAttribute("style", "display:block");
}

/**
 * display the path of a file being loaded.
 * @param filePath path of a file being loaded.
 */
export function updateLoadingModal(filePath:string) {
    let element = document.getElementById("modal-text");
    if (element != null){
        element.insertAdjacentHTML("beforeend", "<li>" + filePath + "</li>");
    }
}

/**
 * close the modal.
 */
export function closeModal() {
    document.getElementById("modal-background")?.setAttribute("style", "display:none");
    let element = document.getElementById("modal-text");
    if (element != null){
        element.innerHTML = "";
    }
}

/**
 * open the saving modal
 * @param projectName the name of the project.
 */
export function openSavingModal(projectName:string) {
    let element = document.getElementById("modal-title");
    if (element != null) {
        element.innerHTML = `saving project "${projectName}"...`;
    }
    document.getElementById("modal-background")?.setAttribute("style", "display:block");
}