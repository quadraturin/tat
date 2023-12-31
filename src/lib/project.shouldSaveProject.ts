import * as R from '$lib/registry';
import { ask } from '@tauri-apps/api/dialog';

export async function shouldSaveProject():Promise<boolean> {
    // if there is no media or there are no changes, no need to save
    if (!R.getHasMedia() || !R.getisProjectDirty()) return false;

    return ask("your project has unsaved changes. are you sure you want to close this project and lose all unsaved changes?", {type: "warning"});
}