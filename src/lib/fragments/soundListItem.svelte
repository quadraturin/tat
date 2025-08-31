<script lang="ts">
    import { t } from '$lib/util.localization';
	import { solo } from '$lib/media.controlMedia';
	import { removeSound } from '$lib/media.removeSound';
	import { cycleSoundType, cycleTriggerType, duplicateSound } from '$lib/media.loadSound';
	import { changeBaseVolume, seekToByClick } from '$lib/media.controlMedia'; 
	import { help } from '$lib/util.help';

	import IconSoundGlobal from '$lib/icons/iconSoundGlobal.svelte';
	import IconSoundLocal from '$lib/icons/iconSoundLocal.svelte';
	import IconSoundArea from '$lib/icons/iconSoundArea.svelte';
	import IconSoundPause from '$lib/icons/iconSoundPause.svelte';
	import type { CanvasSound } from '$lib/classes/CanvasSound.svelte';
	import { SoundType, TriggerType } from '$lib/registry.svelte';
	import IconOnLoad from '$lib/icons/iconPlayOnLoad.svelte';
	import IconLoop from '$lib/icons/iconLoop.svelte';
	import IconTimer from '$lib/icons/iconPlayOnTimer.svelte';
	import IconPlayOnLoad from '$lib/icons/iconPlayOnLoad.svelte';
	import IconPlayOnEnter from '$lib/icons/iconPlayOnEnter.svelte';
	import IconPlayInside from '$lib/icons/iconPlayInside.svelte';
	import IconPlayOnTimer from '$lib/icons/iconPlayOnTimer.svelte';
	import IconReplayOnEnter from '$lib/icons/iconReplayOnEnter.svelte';
	import IconReplayInside from '$lib/icons/iconReplayInside.svelte';

    let {item, i} : {item:CanvasSound, i:number} = $props();
    let soundTrack:any = $state();
    let mousePos = $state({ x: 0, y: 0 });
    let currentTime = $state(0);
    let duration = $state(1)
    let seek = $derived((currentTime/duration * 100));
    let paused = $state(false);
    let looped = $state(true);
    let soloed = $state(false);
    let muted = $state(false);
    let soundType = $state(SoundType.Local);
    let triggerType = $state(TriggerType.PlayOnLoad);

    setInterval(() => {
        currentTime = item.sound.currentTime;
        duration = item.sound.duration == 0 ? 1 : item.sound.duration;
        paused = item.sound.paused;
        soloed = item.solo;
        muted = item.muted;
        looped = item.loop;
        soundType = item.soundType;
        triggerType = item.triggerType;
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
        {#if soundType == SoundType.Area}<IconSoundArea/>
        {:else if soundType == SoundType.Global}<IconSoundGlobal/>
        {:else if soundType == SoundType.Local}<IconSoundLocal/>{/if}
    </button>

    <!-- Sound Trigger Button -->
    <button class="item-button item-trigger button-l"
    onclick     = {()=>{cycleTriggerType(item);}}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        item.muted? help($t('help.map.soundMute')) : help($t('help.map.soundUnMute'))
    }}>
        {#if triggerType == TriggerType.PlayOnLoad}<IconPlayOnLoad/>
        {:else if triggerType == TriggerType.PlayOnEnter}<IconPlayOnEnter/>
        {:else if triggerType == TriggerType.ReplayOnEnter}<IconReplayOnEnter/>
        {:else if triggerType == TriggerType.PlayInside}<IconPlayInside/>
        {:else if triggerType == TriggerType.ReplayInside}<IconReplayInside/>
        {:else if triggerType == TriggerType.PlayOnTimer}<IconPlayOnTimer/>{/if}
    </button>

    <!-- Sound Pause Button -->
    <button class="item-button item-pause button-r" class:activated={paused} 
    onclick     = {()=>item.sound.paused ? item.sound.play() : item.sound.pause()}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        !paused ? help($t('help.map.soundPause')) : help($t('help.map.soundUnPause'))
    }}>
        <IconSoundPause/>
    </button>

    <!-- Sound Loop Button -->
    <button class="item-button item-loop" class:activated={looped} 
    onclick     = {()=>{item.loop = !item.loop;}}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        item.loop? help($t('help.map.soundMute')) : help($t('help.map.soundUnMute'))
    }}>
        <IconLoop/>
    </button>


    <!-- Sound Mute Button -->
    <button class="item-button item-mute button-l" class:activated={muted} 
    onclick     = {()=>{item.muted = !item.muted;}}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        item.muted? help($t('help.map.soundMute')) : help($t('help.map.soundUnMute'))
    }}>
        M
    </button>

    <!-- Sound Solo Button -->
    <button class="item-button item-solo button-r" class:activated={soloed} 
    onclick     = {()=>{solo(item);}}
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
</div>
