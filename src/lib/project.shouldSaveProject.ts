import * as R from '$lib/registry';
import { ask } from '@tauri-apps/api/dialog';

export async function shouldSaveProject():Promise<boolean> {
    // if there is no media or there are no changes, no need to save
    if (!R.getHasMedia() || !R.getisProjectDirty()) return false;

    return ask("do you want to save the changes you made to this project? your changes will be lost if you don't save them.", {title: "tabletopaudio", type: "warning"});
}