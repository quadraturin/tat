/**
 * App theme options.
 */
type appThemeOptions = {
    name?:string;
    description?:string;
    author?:string;
    cUI?:string;
	cUIAccent?:string;
	cText?:string;
	cHighlight?:string;
    cMap?:string;
    cMapGrid?:string;
    cMenu?:string;
    cMenuText?:string;
    cMenuHighlight?:string;
    cMapListener?:string;
    cMapListenerAccent?:string;
    cMapShape?:string;
    fUI?:string;
}

/**
 * App Theme.
 */
export class AppTheme {
    name?:string;
    description?:string;
    author?:string;
    cUI?:string;
	cUIAccent?:string;
	cText?:string;
	cHighlight?:string;
    cMap?:string;
    cMapGrid?:string;
    cMenu?:string;
    cMenuText?:string;
    cMenuHighlight?:string;
    cMapListener?:string;
    cMapListenerAccent?:string;
    cMapShape?:string;
    fUI?:string;
    constructor(themeJSON?:appThemeOptions) {
        if (themeJSON){ 
            if (themeJSON.name) this.name = themeJSON.name;
            if (themeJSON.description) this.description = themeJSON.description;
            if (themeJSON.author) this.author = themeJSON.author;
            if (themeJSON.cUI) this.cUI = themeJSON.cUI;
            if (themeJSON.cUIAccent) this.cUIAccent = themeJSON.cUIAccent;
            if (themeJSON.cText) this.cText = themeJSON.cText;
            if (themeJSON.cHighlight) this.cHighlight = themeJSON.cHighlight;
            if (themeJSON.cMap) this.cMap = themeJSON.cMap;
            if (themeJSON.cMapGrid) this.cMapGrid = themeJSON.cMapGrid;
            if (themeJSON.cMenu) this.cMenu = themeJSON.cMenu;
            if (themeJSON.cMenuText) this.cMenuText = themeJSON.cMenuText;
            if (themeJSON.cMenuHighlight) this.cMenuHighlight = themeJSON.cMenuHighlight;
            if (themeJSON.cMapListener) this.cMapListener = themeJSON.cMapListener;
            if (themeJSON.cMapListenerAccent) this.cMapListenerAccent = themeJSON.cMapListenerAccent;
            if (themeJSON.cMapShape) this.cMapShape = themeJSON.cMapShape;
            if (themeJSON.fUI) this.fUI = themeJSON.fUI;
    }
    }
}
