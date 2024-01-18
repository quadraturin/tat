import * as R from '$lib/registry'

export function help(...ids:string[]) {
    let textArea = document.getElementById("help-text");
    if (textArea != null) {
        if (typeof ids == "undefined") textArea.innerHTML = ""; 
        else textArea.innerHTML = ids.join(" ");
    }
}