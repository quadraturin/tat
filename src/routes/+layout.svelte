<script lang="ts">
	import type { appThemeItem } from '$lib/classes/AppTheme.svelte';
    import * as R from '$lib/registry.svelte';
	import { userSettings } from '$lib/settings.userSettings.svelte';

    interface Props { children?: import('svelte').Snippet; }
    let { children }: Props = $props();

    let theme = "";


    /**
     * Assign theme values to a panel.
     * @param target String defining CSS prefix for the values.
     * @param values The values to assign.
     */
    function assignThemeValues(target:string, values:appThemeItem) {
        if(values.b)  theme += `--${target}-b: ${values.b};`;
        if(values.bg) theme += `--${target}-bg: ${values.bg};`;
        if(values.fg) theme += `--${target}-fg: ${values.fg};`;
        if (values.hov) {
            if(values.hov.b)  theme += `--${target}-hov-b: ${values.hov.b};`;
            if(values.hov.bg) theme += `--${target}-hov-bg: ${values.hov.bg};`;
            if(values.hov.fg) theme += `--${target}-hov-fg: ${values.hov.fg};`;
        }
        if (values.act) {
            if(values.act.b)  theme += `--${target}-act-b: ${values.act.b};`;
            if(values.act.bg) theme += `--${target}-act-bg: ${values.act.bg};`;
            if(values.act.fg) theme += `--${target}-act-fg: ${values.act.fg};`;
        }
        if (values.lck) {
            if(values.lck.b)  theme += `--${target}-lck-b: ${values.lck.b};`;
            if(values.lck.bg) theme += `--${target}-lck-bg: ${values.lck.bg};`;
            if(values.lck.fg) theme += `--${target}-lck-fg: ${values.lck.fg};`;
        }
    }


    /**
     * Assign blank values to theme entries.
     * @param target
     */
    function assignBlankThemeValues(target:string) {

        const blank = "black";

        theme += `--${target}-b: ${blank};`;
        theme += `--${target}-bg: ${blank};`;
        theme += `--${target}-fg: ${blank};`;
        theme += `--${target}-hov-b: ${blank};`;
        theme += `--${target}-hov-bg: ${blank};`;
        theme += `--${target}-hov-fg: ${blank};`;

        theme += `--${target}-act-b: ${blank};`;
        theme += `--${target}-act-bg: ${blank};`;
        theme += `--${target}-act-fg: ${blank};`;

        theme += `--${target}-lck-b: ${blank};`;
        theme += `--${target}-lck-bg: ${blank};`;
        theme += `--${target}-lck-fg: ${blank};`;
    }
    

	$effect(() => {
        const themeTagList= [
            { value: R.activeTheme.pnl as appThemeItem,             tags: ["pnl", "pnl-tb", "pnl-ctrl", "pnl-media", "pnl-help", "pnl-menu"] },
            { value: R.activeTheme.pnl_tb as appThemeItem,          tags: [       "pnl-tb"                                                 ] },
            { value: R.activeTheme.pnl_ctrl as appThemeItem,        tags: [                 "pnl-ctrl"                                     ] },
            { value: R.activeTheme.pnl_media as appThemeItem,       tags: [                             "pnl-media"                        ] },
            { value: R.activeTheme.pnl_help as appThemeItem,        tags: [                                          "pnl-help"            ] },
            { value: R.activeTheme.pnl_menu as appThemeItem,        tags: [                                                      "pnl-menu"] },

            { value: R.activeTheme.btn as appThemeItem,             tags: ["btn", "btn-tb", "btn-tb-min", "btn-tb-max", "btn-tb-quit", "btn-ctrl", "btn-media", "btn-help", "btn-menu"] },
            { value: R.activeTheme.btn_tb as appThemeItem,          tags: [       "btn-tb", "btn-tb-min", "btn-tb-max", "btn-tb-quit"                                                 ] },
            { value: R.activeTheme.btn_tb_min as appThemeItem,      tags: [                 "btn-tb-min"                                                                              ] },
            { value: R.activeTheme.btn_tb_max as appThemeItem,      tags: [                               "btn-tb-max"                                                                ] },
            { value: R.activeTheme.btn_tb_quit as appThemeItem,     tags: [                                             "btn-tb-quit"                                                 ] },
            { value: R.activeTheme.btn_ctrl as appThemeItem,        tags: [                                                            "btn-ctrl"                                     ] },
            { value: R.activeTheme.btn_media as appThemeItem,       tags: [                                                                        "btn-media"                        ] },
            { value: R.activeTheme.btn_help as appThemeItem,        tags: [                                                                                     "btn-help"            ] },
            { value: R.activeTheme.btn_menu as appThemeItem,        tags: [                                                                                                 "btn-menu"] },

            { value: R.activeTheme.cnv as appThemeItem,             tags: ["cnv"] },

            { value: R.activeTheme.obj as appThemeItem,             tags: ["obj", "obj-img", "obj-snd"] },
            { value: R.activeTheme.obj_img as appThemeItem,         tags: [       "obj-img"           ] },
            { value: R.activeTheme.obj_snd as appThemeItem,         tags: [                  "obj-snd"] },

            { value: R.activeTheme.itm as appThemeItem,             tags: ["itm", "itm-media"] },
            { value: R.activeTheme.itm_media as appThemeItem,       tags: [       "itm-media"] },

            { value: R.activeTheme.vol as appThemeItem,             tags: ["vol", "vol-media", "vol-itm-media"] },
            { value: R.activeTheme.vol_media as appThemeItem,       tags: [       "vol-media", "vol-itm-media"] },
            { value: R.activeTheme.vol_itm_media as appThemeItem,   tags: [                    "vol-itm-media"] },

            { value: R.activeTheme.trk as appThemeItem,             tags: ["trk", "trk-itm-media"] },
            { value: R.activeTheme.trk_itm_media as appThemeItem,   tags: [       "trk-itm-media"] },

            { value: R.activeTheme.tmr as appThemeItem,             tags: ["tmr", "tmr-itm-media"] },
            { value: R.activeTheme.tmr_itm_media as appThemeItem,   tags: [       "tmr-itm-media"] },
            
            { value: R.activeTheme.anc as appThemeItem,             tags: ["anc"] },

            { value: R.activeTheme.lst as appThemeItem,             tags: ["lst"] },

            { value: R.activeTheme.wrn as appThemeItem,             tags: ["wrn"] },

            { value: R.activeTheme.sel as appThemeItem,             tags: ["sel"] },
        ];

        // Blank out theme.
        themeTagList.forEach(i => {
            i.tags.forEach(tag => {
                assignBlankThemeValues(tag);
            });
        });

        // Populate theme.
        themeTagList.forEach(i => {
            i.tags.forEach(tag => {
                assignThemeValues(tag, i.value);
            });
        });

        document.getElementById('themeWrapper')?.setAttribute('style', theme);
    });
</script>

<div id="themeWrapper" class="{userSettings.language}">
{@render children?.()}
</div>
