<script lang="ts">
	import { duplicateImage } from '$lib/media.loadImage';
    import { t } from '$lib/util.localization';
	import { help } from '$lib/util.help';
	import type { CanvasImage } from '$lib/classes/CanvasImage.svelte';
	import { getHoveredCanvasObject, getImagesHidden, setHoveredCanvasObject } from '$lib/registry.svelte';
	import { tryRemoveObject } from '$lib/media.remove';

    let {item, i} : {item:CanvasImage, i:number} = $props();

    let isHovered = $state(false);

    setInterval(() => {
        isHovered = (item == getHoveredCanvasObject());
    }, 15);
</script>

<!-- An Image Item -->
<div id="item-{item.uuid}" role="listitem" draggable="true" 
class:hidden={getImagesHidden()} class:hovered={isHovered}
class={["item image-item", item.selected && "active", item.locked && "locked"]}
    onfocus     = {() => {}} 
    onblur      = {() => {}}
    onmouseout  = {() => { setHoveredCanvasObject(null); help(); }}
    onmouseover = {() => { setHoveredCanvasObject(item, false);}}>

    <!-- Opacity Display -->
    <button class="volume-track" aria-label="Opacity"
        onwheel     = {(e) => { e.preventDefault(); item.changeOpacityWheel(e); }}
        onfocus     = {()  => {}} 
        onblur      = {()  => {}}
        onmousedown = {(e) => { item.changeOpacityClick(e); }}
        onmouseover = {()  => { help($t('help.mediaPanel.image.opacity')); }}
        onmouseout  = {()  => { help(); }}>
        <div class="volume-bar" style={"height: "+ item.opacity*100 +"%"}></div>
    </button>

    <!-- Image Name -->
    <button class="item-name"  title="{item.niceName}"
    onclick     = {() => { item.selected = !item.selected; }}
    ondblclick  = {() => { item.locked = !item.locked; item.selected = false; }}
    onfocus     = {() => {}} 
    onblur      = {() => {}}
    onmouseout  = {() => { help(); }}
    onmouseover = {() => {
        if (item.selected) 
            help(
                $t('help.mediaPanel.image.title'),
                $t('help.objects.selected'), 
                $t('help.objects.deselectKey'));
        else if (item.locked) 
            help(
                $t('help.mediaPanel.image.title'),
                $t('help.objects.locked'), 
                $t('help.objects.unlockKey'));
        else 
            help(
                $t('help.mediaPanel.image.title'),
                $t('help.objects.selectKey'))
    }}>
        {item.niceName}
    </button>

    <!--<input type="text" class="item-name" value="{item.niceName}"/>-->

    <!-- Image Add Button -->
    <button class="item-add l" title="duplicate image" 
    onclick     = {() => { duplicateImage(item); }}
    onfocus     = {() => {}} 
    onblur      = {() => {}}
    onmouseover = {() => { help($t('help.mediaPanel.image.duplicate')); }}
    onmouseout  = {() => { help(); }}>
        +
    </button>

    <!-- Image Delete Button -->
    <button class="item-delete r" title="delete image" 
    onclick     = {() => { tryRemoveObject(item); }}
    onfocus     = {() => {}} 
    onmouseover = {() => { help($t('help.mediaPanel.image.delete')); }}
    onmouseout  = {() => { help(); }}
    onblur      = {() => {}}>
        ×
    </button>
</div>
