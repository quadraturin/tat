import { readDir } from "@tauri-apps/plugin-fs";
import tDefaultDark from "../assets/themes/default-dark.json";
import tDefaultLight from "../assets/themes/default-light.json";
import tMothershipDark from "../assets/themes/mothership-dark.json";
import tMothershipLight from "../assets/themes/mothership-light.json";
import tWarped from "../assets/themes/warped-beyond-recognition.json";
import { AppTheme } from "./classes/AppTheme.svelte";

export const themeDefault = new AppTheme(tDefaultDark);

export function getThemesList():AppTheme[] {
    let themesList:AppTheme[] = [];

    // first, project themes

    // second, user themes
    
    // third, built-in themes
    themesList.push(
        new AppTheme(tDefaultDark), 
        new AppTheme(tDefaultLight),
        //new AppTheme(tMothershipDark), 
        //new AppTheme(tMothershipLight), 
        //new AppTheme(tWarped)
        );
    return themesList;
}

