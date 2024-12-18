import { ask } from "@tauri-apps/plugin-dialog";
import { getisProjectDirty } from "./registry";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import * as R from '$lib/registry';
const appWindow = getCurrentWebviewWindow()


/**
 * check if the project has unsaved changes. if so, ask the user if they really want to quit. if they do, quit.
 * @returns 
 */
export async function tryQuit() {
    if (getisProjectDirty()) {
        let discardChanges = await ask(R.t.dialog.quitUnsavedChanges);
        if (!discardChanges) return;
    }

    appWindow.close();
    
}