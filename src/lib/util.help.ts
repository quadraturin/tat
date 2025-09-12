import { marked } from "marked";

/**
 * display one or more help text strings.
 * @param ids the help text string ids.
 */
export async function help(...ids:string[]) {
    let textArea = document.getElementById("help-text");
    if (textArea != null) {
        if (typeof ids == "undefined") textArea.innerHTML = ""; 
        else textArea.innerHTML = await marked.parse(ids.join(" "));
    }
}
