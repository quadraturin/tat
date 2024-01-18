import { readTextFile } from '@tauri-apps/api/fs';
import type { PageLoad } from './$types';

// pre-load strings
export const load:PageLoad = async ({params}) => {
    let t = JSON.parse(await readTextFile('lang/en-us.json'));	
    return t;
}