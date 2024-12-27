import { mkdir, exists, writeTextFile } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { getUserSettings } from "./settings.userSettings";

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
        writeTextFile(jsonPath, JSON.stringify(getUserSettings()));
    } catch (err) {
        console.error(err);
    }
}