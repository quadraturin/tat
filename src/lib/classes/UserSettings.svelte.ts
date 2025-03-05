export const defaults = {
    "proportionalScaleOnByDefault": false,
    "invertVolumeScroll":           false,
    "listenerMoveSpeed":            5,
    "language":                     "en",
    "helpOpen":                     true,
    "hideWindowContentsFromStream": false,
    "uiScrollSensitivity":          1,
    "soundsHidden":                 false,
    "imagesHidden":                 false,
    "theme":                        "Dark",
}

/**
 * the user settings.
 */
export class UserSettings {
    proportionalScaleOnByDefault:boolean = $state({...defaults}.proportionalScaleOnByDefault);
    invertVolumeScroll:boolean =           $state({...defaults}.invertVolumeScroll);
    listenerMoveSpeed:number =             $state({...defaults}.listenerMoveSpeed);
    language:string =                      $state({...defaults}.language);
    helpOpen:boolean =                     $state({...defaults}.helpOpen);
    hideWindowContentsFromStream:boolean = $state({...defaults}.hideWindowContentsFromStream);
    uiScrollSensitivity:number =           $state({...defaults}.uiScrollSensitivity);
    soundsHidden:boolean =                 $state({...defaults}.soundsHidden);
    imagesHidden:boolean =                 $state({...defaults}.imagesHidden);
    theme:string =                         $state({...defaults}.theme);

    update = (o:Object) => {
        this.proportionalScaleOnByDefault = "proportionalScaleOnByDefault" in o ? o.proportionalScaleOnByDefault as boolean : defaults.proportionalScaleOnByDefault;
        this.invertVolumeScroll =           "invertVolumeScroll" in o ?           o.invertVolumeScroll as boolean :           defaults.invertVolumeScroll;
        this.listenerMoveSpeed =            "listenerMoveSpeed" in o ?            o.listenerMoveSpeed as number :             defaults.listenerMoveSpeed;
        this.language =                     "language" in o ?                     o.language as string :                      defaults.language;
        this.helpOpen =                     "helpOpen" in o ?                     o.helpOpen as boolean :                     defaults.helpOpen;
        this.hideWindowContentsFromStream = "hideWindowContentsFromStream" in o ? o.hideWindowContentsFromStream as boolean : defaults.hideWindowContentsFromStream;
        this.uiScrollSensitivity =          "uiScrollSensitivity" in o ?          o.uiScrollSensitivity as number :           defaults.uiScrollSensitivity;
        this.soundsHidden =                 "soundsHidden" in o ?                 o.soundsHidden as boolean :                 defaults.soundsHidden;
        this.imagesHidden =                 "imagesHidden" in o ?                 o.imagesHidden as boolean :                 defaults.imagesHidden;
        this.theme =                        "theme" in o ?                        o.theme as string :                         defaults.theme;
    }
}
