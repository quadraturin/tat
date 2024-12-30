import { mkdir, exists, writeTextFile } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { getUserSettings, getUserSettingsObject } from "./settings.userSettings.svelte";

/**
 * save the user settings to a file.
 */
export async function saveUserSettings() {
    try {
        console.log('saving user settings', getUserSettings());
        const jsonPath = await join(await appDataDir(), 'settings.json');

        console.log(await appDataDir());
        if(!await exists(await appDataDir())) {
            mkdir(await appDataDir());
        }
        
        console.log(JSON.stringify(getUserSettingsObject()));
        writeTextFile(jsonPath, JSON.stringify(getUserSettingsObject()));
    } catch (err) {
        console.error(err);
    }
}
