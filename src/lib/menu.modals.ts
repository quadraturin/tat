export function openLoadingModal(projectName?:string) {
    let element = document.getElementById("modal-loading-title");
    if (element != null) {
        if (projectName !== undefined) {
            element.innerHTML = 'loading project "' + projectName + '"...';
        } else {
            element.innerHTML = 'loading files...'
        }
    }
    document.getElementById("modal-background")?.setAttribute("style", "display:block");
}

export function updateLoadingModal(filePath:string) {
    let element = document.getElementById("modal-loading-filepath");
    if (element != null){
        element.innerHTML = element.innerText + "<br />" + filePath;
    }
}

export function closeLoadingModal() {
    document.getElementById("modal-background")?.setAttribute("style", "display:none");
    let element = document.getElementById("modal-loading-filepath");
    if (element != null){
        element.innerHTML = "";
    }
}