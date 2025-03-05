<script lang="ts">
    import * as R from '$lib/registry.svelte';

    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

	$effect(() => {
        let theme = ""
        theme += "--c0:" + R.activeTheme.c0 + ";";
        theme += "--c1:" + R.activeTheme.c1 + ";";
        theme += "--c2:" + R.activeTheme.c2 + ";";
        theme += "--c3:" + R.activeTheme.c3 + ";";
        theme += "--c4:" + R.activeTheme.c4 + ";";
        theme += "--c5:" + R.activeTheme.c5 + ";";
        theme += "--c6:" + R.activeTheme.c6 + ";";
        theme += "--c7:" + R.activeTheme.c7 + ";";
        theme += "--c8:" + R.activeTheme.c8 + ";";
        theme += "--c9:" + R.activeTheme.c9 + ";";
        theme += "--cA:" + R.activeTheme.cA + ";";
        theme += "--cB:" + R.activeTheme.cB + ";";
        theme += "--cC:" + R.activeTheme.cC + ";";
        theme += "--cD:" + R.activeTheme.cD + ";";
        theme += "--cE:" + R.activeTheme.cE + ";";
        theme += "--cF:" + R.activeTheme.cF + ";";
        theme += "--f0:" + R.activeTheme.f0 + ";";

        document.getElementById('themeWrapper')?.setAttribute('style',theme);
    });
</script>

<div id="themeWrapper">
{@render children?.()}
</div>
