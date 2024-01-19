import { createDir, exists, writeTextFile } from "@tauri-apps/api/fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { getUserSettings } from "./settings.userSettings";

export async function saveUserSettings() {
    try {
        console.log('saving user settings', getUserSettings());
        const jsonPath = await join(await appDataDir(), 'settings.json');
        if(!await exists(await appDataDir())) {
            createDir(await appDataDir());
        }
        writeTextFile(jsonPath, JSON.stringify(getUserSettings()));
    } catch (err) {
        console.error(err);
    }
}