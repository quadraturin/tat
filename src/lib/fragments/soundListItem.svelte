<script lang="ts">
    import { t } from '$lib/util.localization';
	import { solo } from '$lib/media.controlMedia';
	import { removeSound } from '$lib/media.removeSound';
	import { duplicateSound } from '$lib/media.loadSound';
	import { seekToByClick } from '$lib/media.controlMedia'; 
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
	import IconSoundPlay from '$lib/icons/IconSoundPlay.svelte';
	import IconNoLoop from '$lib/icons/IconNoLoop.svelte';
	import IconReset from '$lib/icons/iconReset.svelte';
	import { concat } from 'uint8-util';

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
    let timerH = $state(0);
    let timerM = $state(0);
    let timerS = $state(0);
    let timerActive = $state(false);

    setInterval(() => {
        currentTime = item.sound.currentTime;
        duration = item.sound.duration == 0 ? 1 : item.sound.duration;
        paused = item.sound.paused;
        soloed = item.solo;
        muted = item.muted;
        looped = item.loop;
        soundType = item.soundType;
        triggerType = item.triggerType;
        timerH = item.timer.hours;
        timerM = item.timer.minutes;
        timerS = item.timer.seconds;
        timerActive = item.timer.active;
    }, 15);
</script>

<!-- A Sound Item -->
<div class="item sound-item" id="sound-item-{i}" class:selected={item.selected} class:locked={!item.editable}>

    <!-- Volume Display -->
    <div class="volume-track" onwheel={(event) =>{ event.preventDefault(); item.changeVolume(event); }}>
        <div class="volume-bar" style={"height: "+(item.volume*100)+"%"}></div>
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

    <!-- Sound Add Button -->
    <button class="item-add l" 
    onclick     = {()=>duplicateSound(item)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{help($t('help.map.soundDuplicate'))}}>
        +
    </button>

    <!-- Sound Delete Button -->
    <button class="item-delete r" 
    onclick     = {()=>removeSound(i)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{help($t('help.map.soundDelete'))}}>
        ×
    </button>

    <!-- Sound Progress Track / Seek Button -->
    <button class="progress-track" aria-label="seek"
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
            <div class="progress-bar" 
            style={"width: " + seek.toString()+"%"}></div>
        {/if}
    </button>

    <!-- Sound Type Button -->
    <button class="item-type" 
    onclick     = {()=>{item.cycleSoundType()}} 
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
    <button class="item-trigger l"
    onclick     = {()=>{item.cycleTriggerType();}}
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

    {#if triggerType == TriggerType.PlayOnLoad}
    <!-- Sound Pause Button -->
    <button class="item-pause m" class:activated={!paused}
    onclick     = {()=>{item.sound.paused ? item.sound.play() : item.sound.pause()}}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        !paused ? help($t('help.map.soundPause')) : help($t('help.map.soundUnPause'))
    }}>
        <span>{#if paused}<IconSoundPause/> paused{:else}<IconSoundPlay/> playing{/if}</span>
    </button>
    {:else}
    <span class="item-pause m disabled">
        {#if triggerType == TriggerType.PlayOnTimer}
            <span class="timer" onwheel={(e)=>{e.preventDefault(); item.changeTimer(e,"h")}}>{timerH.toString().padStart(2,"0")}</span><!--
            --><span class="timer" onwheel={(e)=>{e.preventDefault(); item.changeTimer(e,"m")}}>:{timerM.toString().padStart(2,"0")}</span><!--
            --><span class="timer" onwheel={(e)=>{e.preventDefault(); item.changeTimer(e,"s")}}>:{timerS.toString().padStart(2,"0")}</span><!--
            --><button onclick={(e)=>{
                if (item.timer.active) { 
                    item.sound.pause();
                    item.stopTimer(item.timerID);
                } else {
                    item.timerID = item.startTimer();
                }
                }}>{#if timerActive}<IconSoundPause/>{:else}<IconSoundPlay/>{/if}</button>
            {:else if triggerType == TriggerType.PlayOnEnter}
                {#if paused}<IconSoundPlay/> on enter{:else}<IconSoundPlay/> playing{/if}
            {:else if triggerType == TriggerType.PlayInside}
                {#if paused}<IconSoundPlay/> inside{:else}<IconSoundPlay/> playing{/if}
            {:else if triggerType == TriggerType.ReplayOnEnter}
                {#if paused}<IconReset/> on enter{:else}<IconSoundPlay/> playing{/if}
            {:else if triggerType == TriggerType.ReplayInside}
                {#if paused}<IconReset/> inside{:else}<IconSoundPlay/> playing{/if}
            {/if}
    </span>
    {/if}

    <!-- Sound Loop Button -->
    <button class="item-loop r" class:disabled={triggerType == TriggerType.PlayInside || triggerType == TriggerType.ReplayInside}
    onclick     = {()=>{if (triggerType != TriggerType.PlayInside && triggerType != TriggerType.ReplayInside) item.loop = !item.loop;}}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        item.loop? help($t('help.map.soundMute')) : help($t('help.map.soundUnMute'))
    }}>
        {#if looped}<IconLoop/>{:else}<IconNoLoop/>{/if}
    </button>


    <!-- Sound Mute Button -->
    <button class="item-mute l" class:activated={muted} 
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
    <button class="item-solo r" class:activated={soloed} 
    onclick     = {()=>{solo(item);}}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        item.solo ? help($t('help.map.soundUnSolo')) : help($t('help.map.soundSolo'))
    }}>
        S
    </button>
</div>
