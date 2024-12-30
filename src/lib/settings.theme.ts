import { readDir } from "@tauri-apps/plugin-fs";
import tDefault from "../assets/themes/default.json";
import tWarped from "../assets/themes/warped.json";
import { AppTheme } from "./classes/AppTheme.svelte";

const themeDefault = new AppTheme(tDefault);

export function getThemesList():AppTheme[] {
    let themesList:AppTheme[] = [];

    // first, project themes

    // second, user themes
    
    // third, built-in themes
    themesList.push(tDefault, tWarped);

    return themesList;
}

