import { writeTextFile } from "@tauri-apps/api/fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { getUserSettings } from "./settings.userSettings";

export async function saveUserSettings() {
    try {
        const jsonPath = await join(await appDataDir(), 'settings.json');
        writeTextFile(jsonPath, JSON.stringify(getUserSettings()));
    } catch (err) {
        console.error(err);
    }
}