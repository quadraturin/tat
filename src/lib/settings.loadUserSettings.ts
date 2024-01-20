import { exists, readTextFile } from "@tauri-apps/api/fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { overwriteUserSettings } from "./settings.userSettings";
import { saveUserSettings } from "./settings.saveUserSettings";

/**
 * load the user settings from file. if it doesn't exist, load and save the defaults.
 */
export async function loadUserSettings() {
    try {
        // if settings.json exists in the folder, read it
        const jsonPath = await join(await appDataDir(), 'settings.json');
        if (await exists(jsonPath)){
            console.log("loading user settings", await appDataDir());
            overwriteUserSettings(JSON.parse(await readTextFile(jsonPath)));
        } else {
            console.log('No settings.json found in directory', await appDataDir());
            saveUserSettings(); // saves default settings
        }
    } catch (err) {
        console.error(err);
    }
}