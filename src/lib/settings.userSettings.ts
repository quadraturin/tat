import { defaultUserSettings } from "./settings.appSettings";
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
export let userSettings:any = defaultUserSettings;

/**
 * get the user settings.
 * @returns the user settings.
 */
export function getUserSettings() {
    return userSettings;
}

/**
 * set a single user setting.
 * @param key user setting id to set.
 * @param value user setting value to set.
 */
export function setUserSetting(key:string, value:any) {
    console.log('setting user setting', key, value)
    userSettings[key] = value;
    saveUserSettings();
}

/**
 * overwrite the current user settings with new ones.
 * @param newSettings the new settings.
 */
export function overwriteUserSettings(newSettings:{}) {
    console.log('overwriting user settings', newSettings)
    userSettings = newSettings;
    R.setIsProportionalScaleOn(userSettings.proportionalScaleOnByDefault);
}

/**
 * reset the user settings to defaults.
 */
export function resetUserSettings() {
    userSettings = defaultUserSettings;
    saveUserSettings();
}