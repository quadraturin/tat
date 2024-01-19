export const prerender = true
export const ssr = false
import { readTextFile } from '@tauri-apps/api/fs';
import type { PageLoad } from './$types';

// pre-load strings
export const load:PageLoad = async ({}) => {
    let t = JSON.parse(await readTextFile('lang/en-us.json'));	
    return t;
}