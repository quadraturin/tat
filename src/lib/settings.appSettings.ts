import { UserSettings } from "./classes/UserSettings.svelte";

/** Valid image file types. */
export const imageFileTypes = ['png', 'gif', 'jpg', 'jpeg', 'webp', 'avif'];

/** Valid sound file types. */
export const soundFileTypes = ['wav', 'm4a', 'mp3', 'ogg', 'flac'];

/** The project file extension. TODO: remove. */
export const projectExt = "tabletopaudio";

/** The default project name. TODO: move to localization. */
export const defaultProjectName = "new project";

/** The default user settings. */
export const defaultUserSettings = new UserSettings;

/** Whether to show debug widgets. */
export const debugWidgets = false;
