<script lang="ts">
    import * as R from '$lib/registry.svelte';
	import { removeImage } from '$lib/media.removeImage';
	import { duplicateImage } from '$lib/media.loadImage';
    import { t } from '$lib/util.localization';
	import { help } from '$lib/util.help';
	import type { CanvasImage } from '$lib/classes/CanvasImage.svelte';

    let {item, i} : {item:CanvasImage, i:number} = $props();
</script>

<!-- An Image Item -->
<div id="item-{item.uuid}" role="listitem" draggable="true"
class={["item image-item", item.selected && "selected", item.locked && "locked"]}>

    <!-- Opacity Display -->
    <div class="volume-track" role="heading" aria-level="4"
        onwheel = {(event) => { event.preventDefault(); item.changeOpacity(event)}}
        onfocus     = {()=>{}} 
        onblur      = {()=>{}}
        onmouseover = {()=>{help($t('help.mediaPanel.imageOpacity'))}}
        onmouseout  = {()=>{help()}}>
        <div class="volume-bar" style={"height: "+ item.opacity*100 +"%"}></div>
    </div>

    <!-- Image Name -->
    <button class="item-name"  title="{item.niceName}"
    onclick     = {()=>{
        item.selected = !item.selected; }}
    ondblclick  = {()=>{
        item.locked = !item.locked; }}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        if (item.selected) 
            help(
                $t('help.mediaPanel.imageTitle'),
                $t('help.objects.selected'), 
                $t('help.objects.deselectKey'));
        else if (item.locked) 
            help(
                $t('help.mediaPanel.imageTitle'),
                $t('help.objects.locked'), 
                $t('help.objects.unlockKey'));
        else 
            help(
                $t('help.mediaPanel.imageTitle'),
                $t('help.objects.selectKey'))
    }}>
        {item.niceName}
    </button>

    <!--<input type="text" class="item-name" value="{item.niceName}"/>-->

    <!-- Image Add Button -->
    <button class="item-add l" title="duplicate image" 
    onclick     = {()=>duplicateImage(item)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseover = {()=>{help($t('help.mediaPanel.imageDuplicate'))}}
    onmouseout  = {()=>{help()}}>
        +
    </button>

    <!-- Image Delete Button -->
    <button class="item-delete r" title="delete image" 
    onclick     = {()=>removeImage(i)}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.mediaPanel.imageDelete'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        ×
    </button>
</div>
