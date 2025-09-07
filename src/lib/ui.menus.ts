import * as R from '$lib/registry.svelte';

/** Close all open menus. */
export async function closeAllMenus() {
    document.getElementById("about")?.setAttribute("style", "display:none");
    document.getElementById("settings")?.setAttribute("style", "display:none");
    R.setIsAboutMenuOpen(false);
    R.setIsSettingsMenuOpen(false);
}

/** Toggle visibilty of the about menu. */
export async function toggleAboutMenu() {
    if (R.getIsAboutMenuOpen()) closeAllMenus();
    else openAboutMenu();
}

/** Open the about menu. */
export async function openAboutMenu() {
    closeAllMenus();
    document.getElementById("about")?.setAttribute("style", "display:block");
    R.setIsAboutMenuOpen(true);
}

/** Toggle visibility of the settings menu. */
export async function toggleSettingsMenu() {
    if (R.getIsSettingsMenuOpen()) closeAllMenus();
    else openSettingsMenu();
}

/** Open the settings menu. */
export async function openSettingsMenu() {
    closeAllMenus();
    document.getElementById("settings")?.setAttribute("style", "display:block");
    R.setIsSettingsMenuOpen(true);
}
