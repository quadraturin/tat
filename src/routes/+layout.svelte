<script lang="ts">
	import type { appThemeItem } from '$lib/classes/AppTheme.svelte';
    import * as R from '$lib/registry.svelte';

    interface Props { children?: import('svelte').Snippet; }
    let { children }: Props = $props();

    let theme = "";

    /**
     * Assign theme values to a panel.
     * @param target String defining CSS prefix for the values.
     * @param values The values to assign.
     */
    function assignThemeValues(target:string, values:appThemeItem) {
        if(values.b)  theme += target + "-b:"  + values.b  + ";";
        if(values.bg) theme += target + "-bg:" + values.bg + ";";
        if(values.fg) theme += target + "-fg:" + values.fg + ";";
        if (values.hov) {
            if(values.hov.b)  theme += target + "-hov-b:"  + values.hov.b  + ";";
            if(values.hov.bg) theme += target + "-hov-bg:" + values.hov.bg + ";";
            if(values.hov.fg) theme += target + "-hov-fg:" + values.hov.fg + ";";
        }
        if (values.act) {
            if(values.act.b)  theme += target + "-act-b:"  + values.act.b  + ";";
            if(values.act.bg) theme += target + "-act-bg:" + values.act.bg + ";";
            if(values.act.fg) theme += target + "-act-fg:" + values.act.fg + ";";
        }
        if (values.lck) {
            if(values.lck.b)  theme += target + "-lck-b:"  + values.lck.b  + ";";
            if(values.lck.bg) theme += target + "-lck-bg:" + values.lck.bg + ";";
            if(values.lck.fg) theme += target + "-lck-fg:" + values.lck.fg + ";";
        }
    }


	$effect(() => {
        assignThemeValues("--itm",           R.activeTheme.itm           as appThemeItem);
        assignThemeValues("--vol",           R.activeTheme.vol           as appThemeItem);
        assignThemeValues("--trk",           R.activeTheme.trk           as appThemeItem);
        assignThemeValues("--anc",           R.activeTheme.anc           as appThemeItem);
        assignThemeValues("--cnv",           R.activeTheme.cnv           as appThemeItem);
        assignThemeValues("--obj",           R.activeTheme.anc           as appThemeItem);
        assignThemeValues("--lst",           R.activeTheme.lst           as appThemeItem);
        assignThemeValues("--wrn",           R.activeTheme.wrn           as appThemeItem);

        assignThemeValues("--pnl",           R.activeTheme.pnl           as appThemeItem);
        assignThemeValues("--pnl-tb",           R.activeTheme.pnl           as appThemeItem);
        assignThemeValues("--pnl-ctrl",           R.activeTheme.pnl           as appThemeItem);
        assignThemeValues("--pnl-media",           R.activeTheme.pnl           as appThemeItem);
        assignThemeValues("--pnl-help",           R.activeTheme.pnl           as appThemeItem);
        assignThemeValues("--pnl-menu",           R.activeTheme.pnl           as appThemeItem);
        assignThemeValues("--pnl-tb",        R.activeTheme.pnl_tb        as appThemeItem);
        assignThemeValues("--pnl-ctrl",      R.activeTheme.pnl_ctrl      as appThemeItem);
        assignThemeValues("--pnl-media",     R.activeTheme.pnl_media     as appThemeItem);
        assignThemeValues("--pnl-help",      R.activeTheme.pnl_help      as appThemeItem);
        assignThemeValues("--pnl-menu",      R.activeTheme.pnl_menu      as appThemeItem);

        assignThemeValues("--itm-media",     R.activeTheme.itm_media     as appThemeItem);

        assignThemeValues("--btn",           R.activeTheme.btn           as appThemeItem);
        assignThemeValues("--btn-tb",           R.activeTheme.btn           as appThemeItem);
        assignThemeValues("--btn-ctrl",           R.activeTheme.btn           as appThemeItem);
        assignThemeValues("--btn-media",           R.activeTheme.btn           as appThemeItem);
        assignThemeValues("--btn-help",           R.activeTheme.btn           as appThemeItem);
        assignThemeValues("--btn-menu",           R.activeTheme.btn           as appThemeItem);
        assignThemeValues("--btn-tb-min",           R.activeTheme.btn           as appThemeItem);
        assignThemeValues("--btn-tb-max",           R.activeTheme.btn           as appThemeItem);
        assignThemeValues("--btn-tb-quit",           R.activeTheme.btn           as appThemeItem);
        assignThemeValues("--btn-tb",        R.activeTheme.btn_tb        as appThemeItem);
        assignThemeValues("--btn-tb-min",        R.activeTheme.btn_tb        as appThemeItem);
        assignThemeValues("--btn-tb-max",        R.activeTheme.btn_tb        as appThemeItem);
        assignThemeValues("--btn-tb-quit",        R.activeTheme.btn_tb        as appThemeItem);
        assignThemeValues("--btn-ctrl",      R.activeTheme.btn_ctrl      as appThemeItem);
        assignThemeValues("--btn-media",     R.activeTheme.btn_media     as appThemeItem);
        assignThemeValues("--btn-help",      R.activeTheme.btn_help      as appThemeItem);
        assignThemeValues("--btn-menu",      R.activeTheme.btn_menu      as appThemeItem);
        assignThemeValues("--btn-tb-min",    R.activeTheme.btn_tb_min    as appThemeItem);
        assignThemeValues("--btn-tb-max",    R.activeTheme.btn_tb_max    as appThemeItem);
        assignThemeValues("--btn-tb-quit",   R.activeTheme.btn_tb_quit   as appThemeItem);

        assignThemeValues("--vol-media",     R.activeTheme.vol_media     as appThemeItem);
        assignThemeValues("--vol-itm-media", R.activeTheme.vol_itm_media as appThemeItem);

        assignThemeValues("--trk-itm-media", R.activeTheme.trk_itm_media as appThemeItem);

        assignThemeValues("--obj-img",       R.activeTheme.obj_img       as appThemeItem);
        assignThemeValues("--obj-snd",       R.activeTheme.obj_snd       as appThemeItem);

        document.getElementById('themeWrapper')?.setAttribute('style', theme);
    });
</script>

<div id="themeWrapper">
{@render children?.()}
</div>
