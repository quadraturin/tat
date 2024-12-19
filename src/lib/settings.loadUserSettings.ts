import { exists, readTextFile } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { getUserSettings, overwriteUserSettings } from "./settings.userSettings";
import { saveUserSettings } from "./settings.saveUserSettings";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
const appWindow = getCurrentWebviewWindow()

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
        appWindow.setContentProtected(getUserSettings().hideWindowContentsFromStream);
    } catch (err) {
        console.error(err);
    }
}