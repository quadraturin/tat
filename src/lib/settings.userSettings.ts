export let proportionalScaleOnByDefault = false;
export let invertVolumeScroll = false;
export let movementSpeed = 5;
export let language = "en-us";

export let theme = {
    name: 'warped',
    color1: 'coral',
    accent1: 'brown',
    color2: 'black',
    accent2: 'gray',
    color3: 'white',
    accent3: 'teal'
}

export let helpOpen = true; // not in settings: app remembers last setting

let settings:any = {
    proportionalScaleOnByDefault: false,
    invertVolumeScroll: false,
    movementSpeed: 5,
    language: "en-us"
}
export function getUserSettings() {
    return settings;
}
export function setUserSetting(key:string, value:any) {
    settings[key] = value;
}
export function overwriteUserSettings(newSettings:any) {
    settings = newSettings;
}