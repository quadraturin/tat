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
<div  id="image-item-{i}" role="listitem"
class={["item image-item", item.selected && "selected", !item.editable && "locked"]}>

    <!-- Opacity Display -->
    <div class="item-volume" onwheel = {(event) => { event.preventDefault(); item.changeOpacity(event)}}>
        <div class="volume" style={"height: "+ item.opacity*100 +"%"}></div>
    </div>

    <!-- Image Name -->

    <button class="item-name" 
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
    <button class="item-button item-add button-l" title="duplicate image" 
    onclick     = {()=>duplicateImage(item)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseover = {()=>{help($t('help.map.imageDuplicate'))}}
    onmouseout  = {()=>{help()}}>
        +
    </button>

    <!-- Image Delete Button -->
    <button class="item-button item-delete button-r" title="delete image" 
    onclick     = {()=>removeImage(i)}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.map.imageDelete'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        ×
    </button>
</div>
