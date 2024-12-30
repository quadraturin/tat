import { appLocalDataDir } from "@tauri-apps/api/path"

/**
 * get the data directory.
 * @returns the data directory.
 */
export async function getDataDir(): Promise<string | null> {
    try {
        const dataDirPath = await appLocalDataDir();
        return dataDirPath;
    } catch (err) {
        console.error(err);
        return null;
    }
}
