export type appThemeInfo = { name:string, description: string, author:string, url:string };
export type appThemeItem = { b:string, bg:string, fg:string,
                     hov?: { b:string, bg:string, fg:string },
                     act?: { b:string, bg:string, fg:string },
                     lck?: { b:string, bg:string, fg:string } };

/** App theme options. */
type appThemeOptions = {
    // Theme metadata
    info?:          appThemeInfo;

    // Defaults, apply across theme
    pnl?:           appThemeItem;
    itm?:           appThemeItem;
    btn?:           appThemeItem;
    vol?:           appThemeItem;
    trk?:           appThemeItem;
    anc?:           appThemeItem;
    cnv?:           appThemeItem;
    obj?:           appThemeItem;
    lst?:           appThemeItem;
    wrn?:           appThemeItem;

    // Individual panel overrides
    pnl_tb?:        appThemeItem;
    pnl_ctrl?:      appThemeItem;
    pnl_media?:     appThemeItem;
    pnl_help?:      appThemeItem;
    pnl_menu?:      appThemeItem;

    // Individual panel item overrides
    itm_media?:     appThemeItem;
    
    // Individual button overrides
    btn_tb?:        appThemeItem;
    btn_ctrl?:      appThemeItem;
    btn_media?:     appThemeItem;
    btn_help?:      appThemeItem;
    btn_menu?:      appThemeItem;
    btn_tb_min?:    appThemeItem;
    btn_tb_max?:    appThemeItem;
    btn_tb_quit?:   appThemeItem;

    // Individual volume overrides
    vol_media?:     appThemeItem;
    vol_itm_media?: appThemeItem;

    // Individual track overrides
    trk_itm_media?: appThemeItem;

    // Individual object overrides
    obj_img?:       appThemeItem;
    obj_snd?:       appThemeItem;
}

/** App Theme. */
export class AppTheme {
    info:          appThemeInfo|null = $state(null);

    pnl:           appThemeItem|null = $state(null);
    itm:           appThemeItem|null = $state(null);
    btn:           appThemeItem|null = $state(null);
    vol:           appThemeItem|null = $state(null);
    trk:           appThemeItem|null = $state(null);
    anc:           appThemeItem|null = $state(null);
    cnv:           appThemeItem|null = $state(null);
    obj:           appThemeItem|null = $state(null);
    lst:           appThemeItem|null = $state(null);
    wrn:           appThemeItem|null = $state(null);

    pnl_tb:        appThemeItem|null = $state(null);
    pnl_ctrl:      appThemeItem|null = $state(null);
    pnl_media:     appThemeItem|null = $state(null);
    pnl_help:      appThemeItem|null = $state(null);
    pnl_menu:      appThemeItem|null = $state(null);

    itm_media:     appThemeItem|null = $state(null);
    
    btn_tb:        appThemeItem|null = $state(null);
    btn_ctrl:      appThemeItem|null = $state(null);
    btn_media:     appThemeItem|null = $state(null);
    btn_help:      appThemeItem|null = $state(null);
    btn_menu:      appThemeItem|null = $state(null);
    btn_tb_min:    appThemeItem|null = $state(null);
    btn_tb_max:    appThemeItem|null = $state(null);
    btn_tb_quit:   appThemeItem|null = $state(null);

    vol_media:     appThemeItem|null = $state(null);
    vol_itm_media: appThemeItem|null = $state(null);

    trk_itm_media: appThemeItem|null = $state(null);

    obj_img:       appThemeItem|null = $state(null);
    obj_snd:       appThemeItem|null = $state(null);

    constructor(themeJSON?:appThemeOptions) {
        if (!themeJSON) this.update();
        else this.update(themeJSON);
    }
    update(o?:Object){
        if (!o) o = {};
        
        this.info = "info" in o ? o.info as appThemeInfo : { name:"", description:"", author:"", url:"" };

        this.pnl = "pnl" in o ? o.pnl as appThemeItem : { b:"", bg:"", fg:"" };
        this.itm = "itm" in o ? o.itm as appThemeItem : { b:"", bg:"", fg:"" };
        this.btn = "btn" in o ? o.btn as appThemeItem : { b:"", bg:"", fg:"" };
        this.vol = "vol" in o ? o.vol as appThemeItem : { b:"", bg:"", fg:"" };
        this.trk = "trk" in o ? o.trk as appThemeItem : { b:"", bg:"", fg:"" };
        this.anc = "anc" in o ? o.anc as appThemeItem : { b:"", bg:"", fg:"" };
        this.cnv = "cnv" in o ? o.cnv as appThemeItem : { b:"", bg:"", fg:"" };
        this.obj = "obj" in o ? o.obj as appThemeItem : { b:"", bg:"", fg:"" };
        this.lst = "lst" in o ? o.lst as appThemeItem : { b:"", bg:"", fg:"" };
        this.wrn = "wrn" in o ? o.wrn as appThemeItem : { b:"", bg:"", fg:"" };

        this.pnl_tb     = "pnl_tb"    in o ? o.pnl_tb    as appThemeItem : this.pnl;
        this.pnl_ctrl   = "pnl_ctrl"  in o ? o.pnl_ctrl  as appThemeItem : this.pnl;
        this.pnl_media  = "pnl_media" in o ? o.pnl_media as appThemeItem : this.pnl;
        this.pnl_help   = "pnl_help"  in o ? o.pnl_help  as appThemeItem : this.pnl;
        this.pnl_menu   = "pnl_menu"  in o ? o.pnl_menu  as appThemeItem : this.pnl;
        
        this.itm_media  = "itm_media" in o ? o.itm_media as appThemeItem : this.itm;
        
        this.btn_tb     = "btn_tb"    in o ? o.btn_tb    as appThemeItem : this.btn;
        this.btn_ctrl   = "btn_ctrl"  in o ? o.btn_ctrl  as appThemeItem : this.btn;
        this.btn_media  = "btn_media" in o ? o.btn_media as appThemeItem : this.btn;
        this.btn_help   = "btn_help"  in o ? o.btn_help  as appThemeItem : this.btn;
        this.btn_menu   = "btn_menu"  in o ? o.btn_menu  as appThemeItem : this.btn;
        
        this.btn_tb_min  = "btn_tb_min"  in o ? o.btn_tb_min  as appThemeItem : this.btn;
        this.btn_tb_max  = "btn_tb_max"  in o ? o.btn_tb_max  as appThemeItem : this.btn;
        this.btn_tb_quit = "btn_tb_quit" in o ? o.btn_tb_quit as appThemeItem : this.btn;
        
        this.vol_media     = "vol_media"     in o ? o.vol_media     as appThemeItem : this.vol;
        this.vol_itm_media = "vol_itm_media" in o ? o.vol_itm_media as appThemeItem : this.vol;

        this.trk_itm_media = "trk_itm_media" in o ? o.trk_itm_media as appThemeItem : this.trk;

        this.obj_img = "obj_img" in o ? o.obj_img as appThemeItem : this.obj;
        this.obj_snd = "obj_snd" in o ? o.obj_snd as appThemeItem : this.obj;
    }
}
