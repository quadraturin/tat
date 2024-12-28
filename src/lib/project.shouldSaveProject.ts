import * as R from '$lib/registry';
import { ask } from '@tauri-apps/plugin-dialog';
import { t } from './util.translations';


/**
 * check if the project has unsaved changes and, if so, ask the user if they want to save it.
 * @returns whether or not the project should be saved.
 */
export async function shouldSaveProject():Promise<boolean> {
    // if there is no media or there are no changes, no need to save
    if (!R.getHasMedia() || !R.getisProjectDirty()) return true;

    return ask(t.get('dialog.closeProjectUnsavedChanges'), {kind: "warning"});
}