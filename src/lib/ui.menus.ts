import * as R from '$lib/registry';

export async function closeAllMenus() {
    document.getElementById("about")?.setAttribute("style", "display:none");
    document.getElementById("settings")?.setAttribute("style", "display:none");
    R.setIsAboutMenuOpen(false);
}

export async function toggleAboutMenu() {
    if (R.getIsAboutMenuOpen()) {
        document.getElementById("about")?.setAttribute("style", "display:none");
        R.setIsAboutMenuOpen(false);
    }
    else {
        document.getElementById("about")?.setAttribute("style", "display:block");
        R.setIsAboutMenuOpen(true);
    }
}

export async function toggleSettingsMenu() {
    console.log("SETTINGS")
    if (R.getIsSettingsMenuOpen()) {
        document.getElementById("settings")?.setAttribute("style", "display:none");
        R.setIsSettingsMenuOpen(false);
    }
    else {
        document.getElementById("settings")?.setAttribute("style", "display:block");
        R.setIsSettingsMenuOpen(true);
    }
}
