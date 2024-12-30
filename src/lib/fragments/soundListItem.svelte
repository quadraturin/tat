<script lang="ts">
    import * as R from '$lib/registry';
    import * as S from '$lib/settings.appSettings';
    import { t } from '$lib/util.localization';
	import { toggleMute, toggleSolo } from '$lib/media.mixSound';
	import { removeSound } from '$lib/media.removeSound';
	import { cycleSoundType, duplicateSound, toggleSoundEdit } from '$lib/media.loadSound';
	import { changeBaseVolume, seekToByClick, togglePause } from '$lib/media.controlSound';
	import { help } from '$lib/util.help';

	import IconSoundGlobal from '$lib/icons/iconSoundGlobal.svelte';
	import IconSoundLocal from '$lib/icons/iconSoundLocal.svelte';
	import IconSoundArea from '$lib/icons/iconSoundArea.svelte';
	import IconSoundPause from '$lib/icons/iconSoundPause.svelte';
	import type { MapSound } from '$lib/classes/MapSound.svelte';

    let {item, i} : {item:MapSound, i:number} = $props();
    let soundTrack:any = $state();
    let mousePos = $state({ x: 0, y: 0 });
    let playing = $state(true);
    let seek = $state(0)

    setInterval(() => {
        if (item.sound) {
            playing = item.sound.playing() ? true : false;
            seek = ((item.sound.seek()/item.sound.duration())*100)
        }
    }, 15);
</script>

<!-- A Sound Item -->
<div class="item sound-item" id="sound-item-{i}"
class:selected={R.getIsSelected(item.emitter)}  
class:locked={R.getIsLocked(item.emitter)}
onwheel={(event) =>{ event.preventDefault(); changeBaseVolume(item, event)}}>

    <!-- Volume Display -->
    <div class="volume" style={"height: "+(item.volume*100)+"%"}></div>

    <!-- Sound Name -->
    <button class="item-name" 
    onclick     = {()=>{R.toggleSelected(item.emitter)}}
    ondblclick  = {()=>{if(item.soundType != S.SOUNDTYPE_GLOBAL) toggleSoundEdit(item.emitter);}}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        if (item.soundType == S.SOUNDTYPE_GLOBAL) {
            help(   $t('help.map.soundTypeGlobal'), 
                    $t('help.map.soundItemActions') );
        } else if (R.getIsSelected(item.emitter)) {
            if (item.soundType == S.SOUNDTYPE_AREA) 
                help(   $t('help.map.selected'), 
                        $t('help.map.soundTypeArea'), 
                        $t('help.map.soundItemActions'), 
                        $t('help.map.itemSelectedActions') );
            else 
                help(   $t('help.map.selected'), 
                        $t('help.map.soundTypeLocal'), 
                        $t('help.map.soundItemActions'), 
                        $t('help.map.itemSelectedActions') );
        } else if (R.getIsLocked(item.emitter)){
            if (item.soundType == S.SOUNDTYPE_AREA) 
                help(   $t('help.map.locked'), 
                        $t('help.map.soundTypeArea'), 
                        $t('help.map.itemLocked'), 
                        $t('help.map.soundItemActions'), 
                        $t('help.map.itemLockedActions') );
            else 
                help(   $t('help.map.locked'), 
                        $t('help.map.soundTypeLocal'), 
                        $t('help.map.itemLocked'), 
                        $t('help.map.soundItemActions'), 
                        $t('help.map.itemLockedActions') );
        } else {
            if (item.soundType == S.SOUNDTYPE_AREA) 
                help(   $t('help.map.soundTypeArea'), 
                        $t('help.map.soundItemActions'), 
                        $t('help.map.itemUnselectedActions') );
            else 
                help(   $t('help.map.soundTypeLocal'), 
                        $t('help.map.soundItemActions'), 
                        $t('help.map.itemUnselectedActions') );
        }
    }}>
        {item.niceName}
    </button>

    <!-- Sound Type Button -->
    <button class="item-button item-type" 
    onclick     = {()=>{cycleSoundType(item)}} 
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        if (item.soundType == S.SOUNDTYPE_AREA) 
            help(   $t('help.map.soundTypeArea'), 
                    $t('help.map.soundTypeAreaActions') );
        else if (item.soundType == S.SOUNDTYPE_GLOBAL) 
            help(   $t('help.map.soundTypeGlobal'), 
                    $t('help.map.soundTypeGlobalActions') );
        else 
            help(   $t('help.map.soundTypeLocal'), 
                    $t('help.map.soundTypeLocalActions') );
    }}>
        {#if item.soundType == S.SOUNDTYPE_AREA}<IconSoundArea/>
        {:else if item.soundType == S.SOUNDTYPE_GLOBAL}<IconSoundGlobal/>
        {:else}<IconSoundLocal/>{/if}
    </button>

    <!-- Sound Pause Button -->
    <button class={["item-button item-pause", !playing && "activated"]}  
    onclick     = {()=>togglePause(item)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        if(item.sound) item.sound.playing() ? help($t('help.map.soundPause')) : help($t('help.map.soundUnPause'))
    }}>
        <IconSoundPause/>
    </button>

    <!-- Sound Mute Button -->
    <button class="item-button item-mute" class:activated={item.muted} 
    onclick     = {()=>toggleMute(i)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        item.muted? help($t('help.map.soundMute')) : help($t('help.map.soundUnMute'))
    }}>
        M
    </button>

    <!-- Sound Solo Button -->
    <button class="item-button item-solo" class:activated={item.solo} 
    onclick     = {()=>toggleSolo(i)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        item.solo ? help($t('help.map.soundUnSolo')) : help($t('help.map.soundSolo'))
    }}>
        S
    </button>

    <!-- Sound Add Button -->
    <button class="item-button item-add" 
    onclick     = {()=>duplicateSound(item)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{help($t('help.map.soundDuplicate'))}}>
        +
    </button>

    <!-- Sound Delete Button -->
    <button class="item-button item-delete" 
    onclick     = {()=>removeSound(i)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{help($t('help.map.soundDelete'))}}>
        ×
    </button>

    <!-- Sound Progress Track / Seek Button -->
    <button class="sound-item-progress-track" aria-label="seek"
    bind:this   = {soundTrack} 
    onmousemove = {(event:MouseEvent)=> {
		mousePos.x = event.clientX;
		mousePos.y = event.clientY; }} 
    onclick     = {()=>seekToByClick(item, mousePos.x)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{help($t('help.map.soundSeek'))}}>

        <!-- Sound Progress Bar -->
        {#if item.sound}
            <div class="sound-item-progress-bar" 
            style={"width: "+seek.toString()+"%"}></div>
        {/if}
    </button>
</div>
