<script lang="ts">
	import { getThemesList } from "$lib/settings.theme";

    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
	
    let theme:string = "";

	$effect(() => {
        document.getElementById('themeWrapper')?.setAttribute('style',theme);
    });

    const themes = getThemesList();
    console.log(themes);
</script>

<div id="themeWrapper">
{@render children?.()}
</div>
