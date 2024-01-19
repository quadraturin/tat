import { defaultUserSettings } from "./settings.appSettings";
import { saveUserSettings } from "./settings.saveUserSettings";
import * as R from '$lib/registry'

export let theme = {
    name: 'warped',
    color1: 'coral',
    accent1: 'brown',
    color2: 'black',
    accent2: 'gray',
    color3: 'white',
    accent3: 'teal'
}

export let userSettings:any = defaultUserSettings;

export function getUserSettings() {
    return userSettings;
}
export function setUserSetting(key:string, value:any) {
    console.log('setting user setting', key, value)
    userSettings[key] = value;
    saveUserSettings();
}
export function overwriteUserSettings(newSettings:{}) {
    console.log('overwriting user settings', newSettings)
    userSettings = newSettings;
    R.setIsProportionalScaleOn(userSettings.proportionalScaleOnByDefault);
}
export function resetUserSettings() {
    userSettings = defaultUserSettings;
    saveUserSettings();
}