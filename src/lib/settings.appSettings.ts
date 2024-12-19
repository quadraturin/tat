/**
 * valid image file types.
 */
export const imageFileTypes = ['png', 'gif', 'jpg', 'jpeg', 'webp'];

/**
 * valid sound file types.
 */
export const soundFileTypes = ['wav', 'm4a', 'mp3', 'ogg', 'flac'];

/**
 * the project file extension.
 * TODO: remove.
 */
export const projectExt = "tabletopaudio";

/**
 * the default project name.
 * TODO: move to localization.
 */
export const defaultProjectName = "new project";

/**
 * the local sound type.
 */
export const SOUNDTYPE_LOCAL = "local";

/**
 * the global sound type.
 */
export const SOUNDTYPE_GLOBAL = "global";

/**
 * the area sound type.
 */
export const SOUNDTYPE_AREA = "area";

/**
 * supported languages
 */
export enum SupportedLanguages {
    EnUs = "en-us",
}

/**
 * the default user settings.
 */
export class UserSettings {
    proportionalScaleOnByDefault: boolean;
    invertVolumeScroll: boolean;
    listenerMoveSpeed: number;
    language: SupportedLanguages;
    helpOpen: boolean;
    hideWindowContentsFromStream: boolean;
    uiScrollSensitivity: number;
    soundsHidden: boolean;
    imagesHidden: boolean;
    constructor(){
        this.proportionalScaleOnByDefault = false,
        this.invertVolumeScroll = false,
        this.listenerMoveSpeed = 5,
        this.language = SupportedLanguages.EnUs,
        this.helpOpen = true,
        this.hideWindowContentsFromStream = false,
        this.uiScrollSensitivity = 1,
        this.soundsHidden = false,
        this.imagesHidden = false
    }
}
export const defaultUserSettings = new UserSettings;