/**
 * App theme options.
 */
type appThemeOptions = {
    name?:string;
    description?:string;
    author?:string;
    c0?:string;
	c1?:string;
	c2?:string;
	c3?:string;
    c4?:string;
    c5?:string;
    c6?:string;
    c7?:string;
    c8?:string;
    c9?:string;
    cA?:string;
    cB?:string;
    cC?:string;
    cD?:string;
    cE?:string;
    cF?:string;
    f0?:string;
}

/**
 * App Theme.
 */
export class AppTheme {
    name?:string = $state();
    description?:string = $state();
    author?:string = $state();
    c0?:string = $state();
	c1?:string = $state();
	c2?:string = $state();
	c3?:string = $state();
    c4?:string = $state();
    c5?:string = $state();
    c6?:string = $state();
    c7?:string = $state();
    c8?:string = $state();
    c9?:string = $state();
    cA?:string = $state();
    cB?:string = $state();
    cC?:string = $state();
    cD?:string = $state();
    cE?:string = $state();
    cF?:string = $state();
    f0?:string = $state();
    constructor(themeJSON?:appThemeOptions) {
        if (themeJSON){ 
            if (themeJSON.name)        this.name =        themeJSON.name;
            if (themeJSON.description) this.description = themeJSON.description;
            if (themeJSON.author)      this.author =      themeJSON.author;
            if (themeJSON.c0) this.c0 = themeJSON.c0;
            if (themeJSON.c1) this.c1 = themeJSON.c1;
            if (themeJSON.c2) this.c2 = themeJSON.c2;
            if (themeJSON.c3) this.c3 = themeJSON.c3;
            if (themeJSON.c4) this.c4 = themeJSON.c4;
            if (themeJSON.c5) this.c5 = themeJSON.c5;
            if (themeJSON.c6) this.c6 = themeJSON.c6;
            if (themeJSON.c7) this.c7 = themeJSON.c7;
            if (themeJSON.c8) this.c8 = themeJSON.c8;
            if (themeJSON.c9) this.c9 = themeJSON.c9;
            if (themeJSON.cA) this.cA = themeJSON.cA;
            if (themeJSON.cB) this.cB = themeJSON.cB;
            if (themeJSON.cC) this.cC = themeJSON.cC;
            if (themeJSON.cD) this.cD = themeJSON.cD;
            if (themeJSON.cE) this.cE = themeJSON.cE;
            if (themeJSON.cF) this.cF = themeJSON.cF;
            if (themeJSON.f0) this.f0 = themeJSON.f0;
        }
    }
    update(o:Object){
        if("name" in o)        this.name =        o.name as string;
        if("description" in o) this.description = o.description as string;
        if("author" in o)      this.author =      o.author as string;
        if("c0" in o) this.c0 = o.c0 as string;
        if("c1" in o) this.c1 = o.c1 as string;
        if("c2" in o) this.c2 = o.c2 as string;
        if("c3" in o) this.c3 = o.c3 as string;
        if("c4" in o) this.c4 = o.c4 as string;
        if("c5" in o) this.c5 = o.c5 as string;
        if("c6" in o) this.c6 = o.c6 as string;
        if("c7" in o) this.c7 = o.c7 as string;
        if("c8" in o) this.c8 = o.c8 as string;
        if("c9" in o) this.c9 = o.c9 as string;
        if("cA" in o) this.cA = o.cA as string;
        if("cB" in o) this.cB = o.cB as string;
        if("cC" in o) this.cC = o.cC as string;
        if("cD" in o) this.cD = o.cD as string;
        if("cE" in o) this.cE = o.cE as string;
        if("cF" in o) this.cF = o.cF as string;
        if("f0" in o) this.f0 = o.f0 as string;
    }
}
