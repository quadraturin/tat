<script lang="ts">
    import * as R from '$lib/registry.svelte';
	import { removeImage } from '$lib/media.removeImage';
	import { duplicateImage, toggleImageEdit } from '$lib/media.loadImage';
	import { changeOpacity } from '$lib/media.controlOpacity';
    import { t } from '$lib/util.localization';
	import { help } from '$lib/util.help';
	import type { MapImage } from '$lib/classes/MapImage.svelte';

    let {item, i} : {item:MapImage, i:number} = $props();
</script>

<!-- An Image Item -->
<div  id="image-item-{i}" role="listitem"
class={["item image-item", (R.getIsSelected(item.rect)) && "selected", (!item.rect.editEnabled()) && "locked"]}
onwheel = {(event) => { event.preventDefault(); changeOpacity(item, event)}}>

    <!-- Opacity Display -->
    <div class="volume" style={"height: "+ item.opacity*100 +"%"}></div>

    <!-- Image Name -->
    <button class="item-name" 
    onclick     = {()=>{R.toggleSelected(item.rect)}}
    ondblclick  = {()=>{toggleImageEdit(item.rect)}}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        if (R.getIsSelected(item.rect)) 
            help($t('help.map.selected'), 
            $t('help.map.image'), 
            $t('help.map.imageItemActions'), 
            $t('help.map.itemSelectedActions'));
        else if (!item.rect.editEnabled()) 
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
    <button class="item-button item-add" title="duplicate image" 
    onclick     = {()=>duplicateImage(item)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseover = {()=>{help($t('help.map.imageDuplicate'))}}
    onmouseout  = {()=>{help()}}>
        +
    </button>

    <!-- Image Delete Button -->
    <button class="item-button item-delete" title="delete image" 
    onclick     = {() => removeImage(i)}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.map.imageDelete'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        ×
    </button>
</div>
