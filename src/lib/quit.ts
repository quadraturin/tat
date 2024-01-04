import { ask, message } from "@tauri-apps/plugin-dialog";
import { getisProjectDirty } from "./registry";
import { appWindow } from "@tauri-apps/api/window";

export async function tryQuit() {
    if (getisProjectDirty()) {
        let discardChanges = await ask("you have unsaved changes! are you sure you want to quit?");
        if (!discardChanges) return;
    }

    appWindow.close();
    
}