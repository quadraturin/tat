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
class={["item image-item", item.selected && "selected", !item.editable && "locked"]}>

    <!-- Opacity Display -->
    <div class="volume-track" onwheel = {(event) => { event.preventDefault(); item.changeOpacity(event)}}>
        <div class="volume-bar" style={"height: "+ item.opacity*100 +"%"}></div>
    </div>

    <!-- Image Name -->

    <button class="item-name"  title="{item.niceName}"
    onclick     = {()=>{
        item.selected = !item.selected; }}
    ondblclick  = {()=>{
        item.editable = !item.editable; }}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        if (item.selected) 
            help($t('help.map.selected'), 
            $t('help.map.image'), 
            $t('help.map.imageItemActions'), 
            $t('help.map.itemSelectedActions'));
        else if (!item.editable) 
            help($t('help.map.locked'), 
            $t('help.map.image'), 
            $t('help.map.imageItemActions'), 
            $t('help.map.itemLockedActions'));
        else 
            help($t('help.map.image'), 
            $t('help.map.imageItemActions'), 
            $t('help.map.itemUnselectedActions'))
    }}>
        {item.niceName}
    </button>


    <!-- Image Add Button -->
    <button class="item-add l" title="duplicate image" 
    onclick     = {()=>duplicateImage(item)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseover = {()=>{help($t('help.map.imageDuplicate'))}}
    onmouseout  = {()=>{help()}}>
        +
    </button>

    <!-- Image Delete Button -->
    <button class="item-delete r" title="delete image" 
    onclick     = {()=>removeImage(i)}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.map.imageDelete'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        ×
    </button>
</div>
