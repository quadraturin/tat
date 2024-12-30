<script lang="ts">
	import { getThemesList } from "$lib/settings.theme";
    import * as R from '$lib/registry.svelte';

    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

	$effect(() => {
        let theme = ""
        theme += "--c-ui:" +                  R.activeTheme.cUI +                ";";
        theme += "--c-ui-accent:" +           R.activeTheme.cUIAccent +          ";";
        theme += "--c-text:" +                R.activeTheme.cText +              ";";
        theme += "--c-highlight:" +           R.activeTheme.cHighlight +         ";";
        theme += "--c-map:" +                 R.activeTheme.cMap +               ";";
        theme += "--c-map-grid:" +            R.activeTheme.cMapGrid +           ";";
        theme += "--c-menu:" +                R.activeTheme.cMenu +              ";";
        theme += "--c-menu-text:" +           R.activeTheme.cMenuText +          ";";
        theme += "--c-menu-highlight:" +      R.activeTheme.cMenuHighlight +     ";";
        theme += "--c-map-listener:" +        R.activeTheme.cMapListener +       ";";
        theme += "--c-map-listener-accent:" + R.activeTheme.cMapListenerAccent + ";";
        theme += "--c-map-shape:" +           R.activeTheme.cMapShape +          ";";
        theme += "--f-ui:" +                  R.activeTheme.fUI +                ";";

        console.log("THEME:", R.activeTheme);
        document.getElementById('themeWrapper')?.setAttribute('style',theme);
    });

    const themes = getThemesList();
    console.log(themes);
</script>

<div id="themeWrapper">
{@render children?.()}
</div>
