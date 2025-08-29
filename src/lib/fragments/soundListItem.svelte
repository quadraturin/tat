<script lang="ts">
    import { t } from '$lib/util.localization';
	import { toggleMute, toggleSolo } from '$lib/media.mixSound';
	import { removeSound } from '$lib/media.removeSound';
	import { cycleSoundType, duplicateSound, toggleSoundEdit } from '$lib/media.loadSound';
	import { changeBaseVolume, seekToByClick, togglePause } from '$lib/media.controlMedia';
	import { help } from '$lib/util.help';

	import IconSoundGlobal from '$lib/icons/iconSoundGlobal.svelte';
	import IconSoundLocal from '$lib/icons/iconSoundLocal.svelte';
	import IconSoundArea from '$lib/icons/iconSoundArea.svelte';
	import IconSoundPause from '$lib/icons/iconSoundPause.svelte';
	import type { CanvasSound } from '$lib/classes/CanvasSound.svelte';
	import { SoundType } from '$lib/registry.svelte';

    let {item, i} : {item:CanvasSound, i:number} = $props();
    let soundTrack:any = $state();
    let mousePos = $state({ x: 0, y: 0 });
    let currentTime = $state(0);
    let duration = $state(1)
    let seek = $derived((currentTime/duration * 100));

    setInterval(() => {
        currentTime = item.sound.currentTime;
        duration = item.sound.duration == 0 ? 1 : item.sound.duration;
    }, 15);
</script>

<!-- A Sound Item -->
<div class="item sound-item" id="sound-item-{i}" class:selected={item.selected} class:locked={!item.editable}>

    <!-- Volume Display -->
    <div class="item-volume" onwheel={(event) =>{ event.preventDefault(); changeBaseVolume(item, event)}}>
        <div class="volume" style={"height: "+(item.volume*100)+"%"}></div>
    </div>

    <!-- Sound Name -->
    <button class="item-name" title="{item.niceName}"
    onclick     = {()=>{item.selected = !item.selected;}}
    ondblclick  = {()=>{if(item.soundType != SoundType.Global) item.editable = !item.editable;}}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        if (item.soundType == SoundType.Global) {
            help(   $t('help.map.soundTypeGlobal'), 
                    $t('help.map.soundItemActions') );
        } else if (item.selected) {
            if (item.soundType == SoundType.Area) 
                help(   $t('help.map.selected'), 
                        $t('help.map.soundTypeArea'), 
                        $t('help.map.soundItemActions'), 
                        $t('help.map.itemSelectedActions') );
            else if (item.soundType == SoundType.Local)
                help(   $t('help.map.selected'), 
                        $t('help.map.soundTypeLocal'), 
                        $t('help.map.soundItemActions'), 
                        $t('help.map.itemSelectedActions') );
        } else if (!item.editable) {
            if (item.soundType == SoundType.Area) 
                help(   $t('help.map.locked'), 
                        $t('help.map.soundTypeArea'), 
                        $t('help.map.itemLocked'), 
                        $t('help.map.soundItemActions'), 
                        $t('help.map.itemLockedActions') );
            else if (item.soundType == SoundType.Local)
                help(   $t('help.map.locked'), 
                        $t('help.map.soundTypeLocal'), 
                        $t('help.map.itemLocked'), 
                        $t('help.map.soundItemActions'), 
                        $t('help.map.itemLockedActions') );
        } else {
            if (item.soundType == SoundType.Area) 
                help(   $t('help.map.soundTypeArea'), 
                        $t('help.map.soundItemActions'), 
                        $t('help.map.itemUnselectedActions') );
            else if (item.soundType == SoundType.Local)
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
        if (item.soundType == SoundType.Area) 
            help(   $t('help.map.soundTypeArea'), 
                    $t('help.map.soundTypeAreaActions') );
        else if (item.soundType == SoundType.Global) 
            help(   $t('help.map.soundTypeGlobal'), 
                    $t('help.map.soundTypeGlobalActions') );
        else 
            help(   $t('help.map.soundTypeLocal'), 
                    $t('help.map.soundTypeLocalActions') );
    }}>
        {#if item.soundType == SoundType.Area}<IconSoundArea/>
        {:else if item.soundType == SoundType.Global}<IconSoundGlobal/>
        {:else}<IconSoundLocal/>{/if}
    </button>

    <!-- Sound Pause Button -->
    <button class={["item-button item-pause button-l", !item.sound.paused && "activated"]}  
    onclick     = {()=>togglePause(item)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        //if(item.sound) item.sound.playing() ? help($t('help.map.soundPause')) : help($t('help.map.soundUnPause'))
    }}>
        <IconSoundPause/>
    </button>

    <!-- Sound Mute Button -->
    <button class="item-button item-mute button-m" class:activated={item.muted} 
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
    <button class="item-button item-solo button-r" class:activated={item.solo} 
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
    <button class="item-button item-add button-l" 
    onclick     = {()=>duplicateSound(item)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{help($t('help.map.soundDuplicate'))}}>
        +
    </button>

    <!-- Sound Delete Button -->
    <button class="item-button item-delete button-r" 
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
            style={"width: " + seek.toString()+"%"}></div>
        {/if}
    </button>
</div>
