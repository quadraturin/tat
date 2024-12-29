import { readDir } from "@tauri-apps/plugin-fs";
import tDefault from "../assets/themes/default.json";
import tWarped from "../assets/themes/warped.json";

export function getThemesList():{}[] {
    let themesList:{}[] = [];

    // first, project themes

    // second, user themes
    
    // third, built-in themes
    themesList.push(tDefault, tWarped);

    return themesList;
}