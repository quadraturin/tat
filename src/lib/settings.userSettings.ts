import { defaultUserSettings, UserSettings } from "./settings.appSettings";
import { saveUserSettings } from "./settings.saveUserSettings";
import * as R from '$lib/registry'
import { t, locales, locale } from '$lib/util.translations';

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
 * get the default user settings.
 * @returns the user settings.
 */
export function getDefaultUserSettings() {
    return new UserSettings;
}

/**
 * overwrite the current user settings with new ones.
 * @param newSettings the new settings.
 */
export function overwriteUserSettings(newSettings:UserSettings) {
    console.log('overwriting user settings', newSettings)
    userSettings = newSettings;
    locale.set(userSettings.language);
    R.setIsProportionalScaleOn(userSettings.proportionalScaleOnByDefault);
}

/**
 * reset the user settings to defaults.
 */
export function resetUserSettings() {
    overwriteUserSettings(new UserSettings);
    saveUserSettings();
}