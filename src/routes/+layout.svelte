<script lang="ts">
	import { getThemesList } from "$lib/settings.theme";
	
    let cUI = "lightblue";
	let cUIAccent = "darkturquoise";
	let cText = "black";
	let cHighlight = "pink";
    let cMap = "darkgrey";
    let cMapGrid = "lightgrey";
    let cMenu = "white";
    let cMenuText = "forestgreen";
    let cMenuHighlight = "hotpink";
    let cMapListener = "yellow";
    let cMapListenerAccent = "red";
    let cMapShape = "blue";
    let fUI = "monospace";

	let rootElement:any;

	$: rootElement && rootElement.style.setProperty('--c-ui', cUI);
    $: rootElement && rootElement.style.setProperty('--c-ui-accent', cUIAccent);
    $: rootElement && rootElement.style.setProperty('--c-text', cText);
    $: rootElement && rootElement.style.setProperty('--c-highlight', cHighlight);
    $: rootElement && rootElement.style.setProperty('--c-map', cMap);
    $: rootElement && rootElement.style.setProperty('--c-map-grid', cMapGrid);
    $: rootElement && rootElement.style.setProperty('--c-menu', cMenu);
    $: rootElement && rootElement.style.setProperty('--c-menu-text', cMenuText);
    $: rootElement && rootElement.style.setProperty('--c-menu-highlight', cMenuHighlight);
    $: rootElement && rootElement.style.setProperty('--c-map-listener', cMapListener);
    $: rootElement && rootElement.style.setProperty('--c-map-listener-accent', cMapListenerAccent);
    $: rootElement && rootElement.style.setProperty('--c-map-shape', cMapShape);
    $: rootElement && rootElement.style.setProperty('--f-ui', fUI);

    const themes = getThemesList();
    console.log(themes);
</script>

<div bind:this={rootElement}>
<slot />
</div>