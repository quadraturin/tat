import { mkdir, exists, writeTextFile } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { getUserSettingsObject } from "./settings.userSettings.svelte";

/** Save the user settings to a file. */
export async function saveUserSettings() {
    try {
        // If the app data dir doesn't exist, make it.
        if(!await exists(await appDataDir())) mkdir(await appDataDir());

        // Write the user settings.
        const jsonPath = await join(await appDataDir(), 'settings.json');
        writeTextFile(jsonPath, JSON.stringify(getUserSettingsObject()));
        
    } catch (err) {
        console.error(err);
    }
}
