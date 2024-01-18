import * as R from '$lib/registry';
import { ask } from '@tauri-apps/api/dialog';

export async function shouldSaveProject():Promise<boolean> {
    // if there is no media or there are no changes, no need to save
    if (!R.getHasMedia() || !R.getisProjectDirty()) return true;

    return ask(R.t.dialog.closeProjectUnsavedChanges, {type: "warning"});
}