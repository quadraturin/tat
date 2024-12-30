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
    name?:string = $state();
    description?:string = $state();
    author?:string = $state();
    cUI?:string = $state();
	cUIAccent?:string = $state();
	cText?:string = $state();
	cHighlight?:string = $state();
    cMap?:string = $state();
    cMapGrid?:string = $state();
    cMenu?:string = $state();
    cMenuText?:string = $state();
    cMenuHighlight?:string = $state();
    cMapListener?:string = $state();
    cMapListenerAccent?:string = $state();
    cMapShape?:string = $state();
    fUI?:string = $state();
    constructor(themeJSON?:appThemeOptions) {
        if (themeJSON){ 
            if (themeJSON.name)               this.name =               themeJSON.name;
            if (themeJSON.description)        this.description =        themeJSON.description;
            if (themeJSON.author)             this.author =             themeJSON.author;
            if (themeJSON.cUI)                this.cUI =                themeJSON.cUI;
            if (themeJSON.cUIAccent)          this.cUIAccent =          themeJSON.cUIAccent;
            if (themeJSON.cText)              this.cText =              themeJSON.cText;
            if (themeJSON.cHighlight)         this.cHighlight =         themeJSON.cHighlight;
            if (themeJSON.cMap)               this.cMap =               themeJSON.cMap;
            if (themeJSON.cMapGrid)           this.cMapGrid =           themeJSON.cMapGrid;
            if (themeJSON.cMenu)              this.cMenu =              themeJSON.cMenu;
            if (themeJSON.cMenuText)          this.cMenuText =          themeJSON.cMenuText;
            if (themeJSON.cMenuHighlight)     this.cMenuHighlight =     themeJSON.cMenuHighlight;
            if (themeJSON.cMapListener)       this.cMapListener =       themeJSON.cMapListener;
            if (themeJSON.cMapListenerAccent) this.cMapListenerAccent = themeJSON.cMapListenerAccent;
            if (themeJSON.cMapShape)          this.cMapShape =          themeJSON.cMapShape;
            if (themeJSON.fUI)                this.fUI =                themeJSON.fUI;
        }
    }
    update(o:Object){
        if("name" in o)               this.name =               o.name as string;
        if("description" in o)        this.description =        o.description as string;
        if("author" in o)             this.author =             o.author as string;
        if("cUI" in o)                this.cUI =                o.cUI as string;
        if("cUIAccent" in o)          this.cUIAccent =          o.cUIAccent as string;
        if("cText" in o)              this.cText =              o.cText as string;
        if("cHighlight" in o)         this.cHighlight =         o.cHighlight as string;
        if("cMap" in o)               this.cMap =               o.cMap as string;
        if("cMapGrid" in o)           this.cMapGrid =           o.cMapGrid as string;
        if("cMenu" in o)              this.cMenu =              o.cMenu as string;
        if("cMenuText" in o)          this.cMenuText =          o.cMenuText as string;
        if("cMenuHighlight" in o)     this.cMenuHighlight =     o.cMenuHighlight as string;
        if("cMapListener" in o)       this.cMapListener =       o.cMapListener as string;
        if("cMapListenerAccent" in o) this.cMapListenerAccent = o.cMapListenerAccent as string;
        if("cMapShape" in o)          this.cMapShape =          o.cMapShape as string;
        if("fUI" in o)                this.fUI =                o.fUI as string;
    }
}
