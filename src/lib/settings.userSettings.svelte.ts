import { defaultUserSettings } from "./settings.appSettings";
import { saveUserSettings } from "./settings.saveUserSettings";
import { defaults, UserSettings } from "./classes/UserSettings.svelte";
import { locale } from "./util.localization";
import * as R from "$lib/registry.svelte"

/**
 * the user settings.
 */
export let userSettings:UserSettings = $state(new UserSettings);

/**
 * get the user settings.
 * @returns the user settings.
 */
export function getUserSettings() {
    return userSettings;
}

/**
 * get the user settings as an object.
 * @returns An object with the user settings.
 */
export function getUserSettingsObject() {
    var settingsObj = {...defaults};
    settingsObj.proportionalScaleOnByDefault = userSettings.proportionalScaleOnByDefault;
    settingsObj.invertVolumeScroll = userSettings.invertVolumeScroll;
    settingsObj.listenerMoveSpeed = userSettings.listenerMoveSpeed;
    settingsObj.language = userSettings.language;
    settingsObj.helpOpen = userSettings.helpOpen;
    settingsObj.hideWindowContentsFromStream = userSettings.hideWindowContentsFromStream;
    settingsObj.uiScrollSensitivity = userSettings.uiScrollSensitivity;
    settingsObj.soundsHidden = userSettings.soundsHidden;
    settingsObj.imagesHidden = userSettings.imagesHidden;
    settingsObj.theme = userSettings.theme;
    return settingsObj;
}

/**
 * get the default user settings.
 * @returns the user settings.
 */
export function getDefaultUserSettings() {
    return defaultUserSettings;
}

/**
 * reset the user settings to defaults.
 */
export function resetUserSettings() {
    const def = {...defaults};
    console.log('RESETTING', def)
    userSettings.update(def);
    locale.set(userSettings.language);
    R.setTheme(userSettings.theme);
    saveUserSettings();
}
