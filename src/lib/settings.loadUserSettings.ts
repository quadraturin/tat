import { exists, readTextFile } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { getUserSettings } from "./settings.userSettings.svelte";
import { saveUserSettings } from "./settings.saveUserSettings";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { locale } from "./util.localization";
const appWindow = getCurrentWebviewWindow()

/**
 * load the user settings from file. if it doesn't exist, load and save the defaults.
 */
export async function loadUserSettings() {
    try {
        // try to get settings.json from the app data folder
        const jsonPath = await join(await appDataDir(), 'settings.json');

        // if it exists, read it and load the settings
        if (await exists(jsonPath)){
            console.log(JSON.parse(await readTextFile(jsonPath)));
            getUserSettings().update(JSON.parse(await readTextFile(jsonPath)));
            locale.set(getUserSettings().language);
        // if it doesn't, create it with the default settings
        } else {
            saveUserSettings(); // saves default settings
        }
        appWindow.setContentProtected(getUserSettings().hideWindowContentsFromStream);
    } catch (err) {
        console.error(err);
    }
}