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
        theme += target + "-b:"  + values.b  + ";";
        theme += target + "-bg:" + values.bg + ";";
        theme += target + "-fg:" + values.fg + ";";
        if (values.hov) {
            theme += target + "-hov-b:"  + values.hov.b  + ";";
            theme += target + "-hov-bg:" + values.hov.bg + ";";
            theme += target + "-hov-fg:" + values.hov.fg + ";";
        }
        if (values.act) {
            theme += target + "-act-b:"  + values.act.b  + ";";
            theme += target + "-act-bg:" + values.act.bg + ";";
            theme += target + "-act-fg:" + values.act.fg + ";";
        }
        if (values.lck) {
            theme += target + "-lck-b:"  + values.lck.b  + ";";
            theme += target + "-lck-bg:" + values.lck.bg + ";";
            theme += target + "-lck-fg:" + values.lck.fg + ";";
        }
    }

	$effect(() => {
        assignThemeValues("--anc",           R.activeTheme.anc           as appThemeItem);
        assignThemeValues("--cnv",           R.activeTheme.cnv           as appThemeItem);
        assignThemeValues("--lst",           R.activeTheme.lst           as appThemeItem);
        assignThemeValues("--wrn",           R.activeTheme.wrn           as appThemeItem);

        assignThemeValues("--pnl-tb",        R.activeTheme.pnl_tb        as appThemeItem);
        assignThemeValues("--pnl-ctrl",      R.activeTheme.pnl_ctrl      as appThemeItem);
        assignThemeValues("--pnl-media",     R.activeTheme.pnl_media     as appThemeItem);
        assignThemeValues("--pnl-help",      R.activeTheme.pnl_help      as appThemeItem);
        assignThemeValues("--pnl-menu",      R.activeTheme.pnl_menu      as appThemeItem);

        assignThemeValues("--itm-media",     R.activeTheme.itm_media     as appThemeItem);

        assignThemeValues("--btn-tb",        R.activeTheme.btn_tb        as appThemeItem);
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
