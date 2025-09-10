<script lang="ts">
    import { t } from '$lib/util.localization';
	import { solo } from '$lib/media.controlMedia';
	import { duplicateSound } from '$lib/media.loadSound';
	import { seekToByClick } from '$lib/media.controlMedia'; 
	import { help } from '$lib/util.help';

	import IconSoundGlobal from '$lib/icons/iconSoundGlobal.svelte';
	import IconSoundLocal from '$lib/icons/iconSoundLocal.svelte';
	import IconSoundArea from '$lib/icons/iconSoundArea.svelte';
	import IconSoundPause from '$lib/icons/iconSoundPause.svelte';
	import type { CanvasSound } from '$lib/classes/CanvasSound.svelte';
	import { getHoveredCanvasObject, getSoundsHidden, setHoveredCanvasObject, SoundType, TriggerType } from '$lib/registry.svelte';
	import IconLoop from '$lib/icons/iconLoop.svelte';
	import IconPlayOnLoad from '$lib/icons/iconPlayOnLoad.svelte';
	import IconPlayOnEnter from '$lib/icons/iconPlayOnEnter.svelte';
	import IconPlayInside from '$lib/icons/iconPlayInside.svelte';
	import IconPlayOnTimer from '$lib/icons/iconPlayOnTimer.svelte';
	import IconRestartOnEnter from '$lib/icons/iconReplayOnEnter.svelte';
	import IconRestartInside from '$lib/icons/iconReplayInside.svelte';
	import IconSoundPlay from '$lib/icons/IconSoundPlay.svelte';
	import IconNoLoop from '$lib/icons/IconNoLoop.svelte';
	import IconReset from '$lib/icons/iconReset.svelte';
	import { tryRemoveObject } from '$lib/media.remove';

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
    let triggerType = $state(TriggerType.Manual);
    let timerH = $state(0);
    let timerM = $state(0);
    let timerS = $state(0);
    let timerActive = $state(false);
    let isHovered = $state(false);

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
        isHovered = (item == getHoveredCanvasObject());
    }, 15);
</script>

<!-- A Sound Item -->
<div class="item sound-item" id="item-{item.uuid}"
    draggable="true"  role="listitem" class:hovered={isHovered}
    class:selected={item.selected} class:locked={item.locked}  class:hidden={getSoundsHidden()}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{setHoveredCanvasObject(null)}}
    onmouseover = {()=>{setHoveredCanvasObject(item)}}>

    <!-- Volume Display -->
    <div class="volume-track" role="heading" aria-level="4" 
        onwheel={(event) =>{ event.preventDefault(); item.changeVolume(event); }}
        onfocus     = {()=>{}} 
        onblur      = {()=>{}}
        onmouseout  = {()=>{help()}}
        onmouseover = {()=>{help($t('help.mediaPanel.soundVolume'))}}>
        <div class="volume-bar" style={"height: "+(item.volume*100)+"%"}></div>
    </div>

    <!-- Sound Name -->
    <button class="item-name" title="{item.niceName}"
    onclick     = {()=>{ item.selected = !item.selected; }}
    ondblclick  = {()=>{ if (item.soundType != SoundType.Global) {
        item.locked = !item.locked;
        item.selected = false;
    }}}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        if (item.soundType == SoundType.Global) {
            help(   $t('help.mediaPanel.soundTypeGlobal'));
        } else if (item.selected) {
            if (item.soundType == SoundType.Area) 
                help(   $t('help.mediaPanel.soundTypeArea'), 
                        $t('help.mediaPanel.soundTitleKey'), 
                        $t('help.objects.selected'), 
                        $t('help.objects.deselectKey'),
                        $t('help.objects.lockKey'));
            else if (item.soundType == SoundType.Local)
                help(   $t('help.mediaPanel.soundTypeLocal'),  
                        $t('help.mediaPanel.soundTitleKey'),
                        $t('help.objects.selected'), 
                        $t('help.objects.deselectKey'),
                        $t('help.objects.lockKey'));
        } else if (item.locked) {
            if (item.soundType == SoundType.Area) 
                help(   $t('help.mediaPanel.soundTypeArea'),  
                        $t('help.mediaPanel.soundTitleKey'),
                        $t('help.objects.locked'), 
                        $t('help.objects.unlockKey'));
            else if (item.soundType == SoundType.Local)
                help(   $t('help.mediaPanel.soundTypeLocal'), 
                        $t('help.mediaPanel.soundTitleKey'), 
                        $t('help.objects.locked'), 
                        $t('help.objects.unlockKey'));
        } else {
            if (item.soundType == SoundType.Area) 
                help(   $t('help.mediaPanel.soundTypeArea'), 
                        $t('help.mediaPanel.soundTitleKey'), 
                        $t('help.objects.selectKey'),
                        $t('help.objects.lockKey'));
            else if (item.soundType == SoundType.Local)
                help(   $t('help.mediaPanel.soundTypeLocal'),  
                        $t('help.mediaPanel.soundTitleKey'),
                        $t('help.objects.selectKey'),
                        $t('help.objects.lockKey'));
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
    onmouseover = {()=>{help($t('help.mediaPanel.soundDuplicate'))}}>
        +
    </button>

    <!-- Sound Delete Button -->
    <button class="item-delete r" 
    onclick     = {()=>tryRemoveObject(item)}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{help($t('help.mediaPanel.soundDelete'))}}>
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
    onmouseover = {()=>{help($t('help.mediaPanel.soundSeek'))}}>

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
            help(   $t('help.mediaPanel.soundTypeArea'), 
                    $t('help.mediaPanel.soundTypeAreaKey') );
        else if (item.soundType == SoundType.Global) 
            help(   $t('help.mediaPanel.soundTypeGlobal'), 
                    $t('help.mediaPanel.soundTypeGlobalKey') );
        else 
            help(   $t('help.mediaPanel.soundTypeLocal'), 
                    $t('help.mediaPanel.soundTypeLocalKey') );
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
        if      (item.triggerType == TriggerType.Manual) help($t('help.mediaPanel.soundTriggerManual'));
        else if (item.triggerType == TriggerType.PlayOnEnter) help($t('help.mediaPanel.soundTriggerPlayOnEnter'));
        else if (item.triggerType == TriggerType.RestartOnEnter) help($t('help.mediaPanel.soundTriggerRestartOnEnter'));
        else if (item.triggerType == TriggerType.PlayInside) help($t('help.mediaPanel.soundTriggerPlayInside'));
        else if (item.triggerType == TriggerType.RestartInside) help($t('help.mediaPanel.soundTriggerRestartInside'));
        else if (item.triggerType == TriggerType.PlayOnTimer) help($t('help.mediaPanel.soundTriggerPlayOnTimer'));
    }}>
        {#if triggerType == TriggerType.Manual}<IconPlayOnLoad/>
        {:else if triggerType == TriggerType.PlayOnEnter}<IconPlayOnEnter/>
        {:else if triggerType == TriggerType.RestartOnEnter}<IconRestartOnEnter/>
        {:else if triggerType == TriggerType.PlayInside}<IconPlayInside/>
        {:else if triggerType == TriggerType.RestartInside}<IconRestartInside/>
        {:else if triggerType == TriggerType.PlayOnTimer}<IconPlayOnTimer/>{/if}
    </button>

    {#if triggerType == TriggerType.Manual}
        <!-- Sound Pause Button -->
        <button class="item-pause m" class:activated={!paused}
        onclick     = {()=>{item.sound.paused ? item.sound.play() : item.sound.pause()}}
        onfocus     = {()=>{}} 
        onblur      = {()=>{}}
        onmouseout  = {()=>{help()}}
        onmouseover = {()=>{
            !paused ? help($t('help.mediaPanel.soundPause')) : help($t('help.mediaPanel.soundUnPause'))
        }}>
            <span>{#if paused}<IconSoundPause/> paused{:else}<IconSoundPlay/> playing{/if}</span>
        </button>
    {:else}
        <span class="item-pause m disabled" class:activated={!paused}>
            {#if triggerType == TriggerType.PlayOnTimer}
                <span class="timer" role="timer"
                    onwheel={(e)=>{e.preventDefault(); item.changeTimer(e,"h")}}
                    onfocus     = {()=>{}} 
                    onblur      = {()=>{}}
                    onmouseout  = {()=>{help()}}
                    onmouseover = {()=>{help($t('help.mediaPanel.timerHours'))}}>{timerH.toString().padStart(2,"0")}</span><!--
                --><span class="timer" role="timer"
                    onwheel={(e)=>{e.preventDefault(); item.changeTimer(e,"m")}}
                    onfocus     = {()=>{}} 
                    onblur      = {()=>{}}
                    onmouseout  = {()=>{help()}}
                    onmouseover = {()=>{help($t('help.mediaPanel.timerMinutes'))}}><span class="timer-divider" class:blink={timerActive && timerS % 2 == 1} >:</span>{timerM.toString().padStart(2,"0")}</span><!--
                --><span class="timer" role="timer"
                    onwheel={(e)=>{e.preventDefault(); item.changeTimer(e,"s")}}
                    onfocus     = {()=>{}} 
                    onblur      = {()=>{}}
                    onmouseout  = {()=>{help()}}
                    onmouseover = {()=>{help($t('help.mediaPanel.timerSeconds'))}}><span class="timer-divider" class:blink={timerActive && timerS % 2 == 1}>:</span>{timerS.toString().padStart(2,"0")}</span><!--
                --><button 
                    onfocus     = {()=>{}} 
                    onblur      = {()=>{}}
                    onmouseout  = {()=>{help()}}
                    onmouseover = {()=>{
                        if (item.timer.active) help($t('help.mediaPanel.timerStop'))
                        else help($t('help.mediaPanel.timerStart'))}}
                    onclick={()=>{
                        if (item.timer.active) { 
                            item.sound.pause();
                            item.stopTimer(item.timerID);
                        } else {
                            item.timerID = item.startTimer();
                        }}}>{#if timerActive}<IconSoundPause/>{:else}<IconSoundPlay/>{/if}</button>
            {:else if triggerType == TriggerType.PlayOnEnter}
                {#if paused}<IconSoundPlay/> on enter{:else}<IconSoundPlay/> playing{/if}
            {:else if triggerType == TriggerType.PlayInside}
                {#if paused}<IconSoundPlay/> inside{:else}<IconSoundPlay/> playing{/if}
            {:else if triggerType == TriggerType.RestartOnEnter}
                {#if paused}<IconReset/> on enter{:else}<IconSoundPlay/> playing{/if}
            {:else if triggerType == TriggerType.RestartInside}
                {#if paused}<IconReset/> inside{:else}<IconSoundPlay/> playing{/if}
            {/if}
        </span>
    {/if}

    <!-- Sound Loop Button -->
    <button class="item-loop r" class:disabled={triggerType == TriggerType.PlayInside || triggerType == TriggerType.RestartInside}
    onclick     = {()=>{if (triggerType != TriggerType.PlayInside && triggerType != TriggerType.RestartInside) item.loop = !item.loop;}}
    onfocus     = {()=>{}} 
    onblur      = {()=>{}}
    onmouseout  = {()=>{help()}}
    onmouseover = {()=>{
        if (item.triggerType == TriggerType.PlayOnTimer)
            item.loop? help($t('help.mediaPanel.soundLoopTimer')) : help($t('help.mediaPanel.soundNoLoopTimer'))
        else
            item.loop? help($t('help.mediaPanel.soundLoop')) : help($t('help.mediaPanel.soundNoLoop'))
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
        item.muted? help($t('help.mediaPanel.soundMute')) : help($t('help.mediaPanel.soundUnMute'))
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
        item.solo ? help($t('help.mediaPanel.soundUnSolo')) : help($t('help.mediaPanel.soundSolo'))
    }}>
        S
    </button>
</div>
