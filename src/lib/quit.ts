import { ask } from "@tauri-apps/api/dialog";
import { getisProjectDirty } from "./registry";
import { appWindow } from "@tauri-apps/api/window";
import * as R from '$lib/registry';

export async function tryQuit() {
    if (getisProjectDirty()) {
        let discardChanges = await ask(R.t.dialog.quitUnsavedChanges);
        if (!discardChanges) return;
    }

    appWindow.close();
    
}