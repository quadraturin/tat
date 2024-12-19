import { defaultUserSettings, UserSettings } from "./settings.appSettings";
import { saveUserSettings } from "./settings.saveUserSettings";
import * as R from '$lib/registry'

/**
 * application visual theme.
 */
export let theme = {
    name: 'warped',
    color1: 'coral',
    accent1: 'brown',
    color2: 'black',
    accent2: 'gray',
    color3: 'white',
    accent3: 'teal'
}

/**
 * the user settings.
 */
export let userSettings:UserSettings = defaultUserSettings;

/**
 * get the user settings.
 * @returns the user settings.
 */
export function getUserSettings() {
    return userSettings;
}

/**
 * overwrite the current user settings with new ones.
 * @param newSettings the new settings.
 */
export function overwriteUserSettings(newSettings:UserSettings) {
    console.log('overwriting user settings', newSettings)
    userSettings = newSettings;
    R.setIsProportionalScaleOn(userSettings.proportionalScaleOnByDefault);
}

/**
 * reset the user settings to defaults.
 */
export function resetUserSettings() {
    overwriteUserSettings(new UserSettings);
    saveUserSettings();
}