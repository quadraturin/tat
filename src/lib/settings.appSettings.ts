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
 * the default user settings.
 */
export const defaultUserSettings = {
    proportionalScaleOnByDefault: false,
    invertVolumeScroll: false,
    listenerMoveSpeed: 5,
    language: "en-us",
    helpOpen: true,
    hideWindowContentsFromStream: false
}