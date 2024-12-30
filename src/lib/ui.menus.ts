import * as R from '$lib/registry.svelte';

/**
 * close all open menus.
 */
export async function closeAllMenus() {
    document.getElementById("about")?.setAttribute("style", "display:none");
    document.getElementById("settings")?.setAttribute("style", "display:none");
    R.setIsAboutMenuOpen(false);
    R.setIsSettingsMenuOpen(false);
}

/**
 * toggle visibilty of the about menu.
 */
export async function toggleAboutMenu() {
    if (R.getIsAboutMenuOpen()) {
        closeAllMenus();
    }
    else {
        closeAllMenus();
        document.getElementById("about")?.setAttribute("style", "display:block");
        R.setIsAboutMenuOpen(true);
    }
}

/**
 * toggle visibility of the settings menu.
 */
export async function toggleSettingsMenu() {
    if (R.getIsSettingsMenuOpen()) {
        closeAllMenus();
    }
    else {
        closeAllMenus();
        document.getElementById("settings")?.setAttribute("style", "display:block");
        R.setIsSettingsMenuOpen(true);
    }
}
