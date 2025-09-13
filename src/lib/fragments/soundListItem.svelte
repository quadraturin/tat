<script lang="ts">
    import { t } from '$lib/util.localization';
	import { solo } from '$lib/media.controlMedia';
	import { duplicateSound } from '$lib/media.loadSound';
	import { seekToByClick } from '$lib/media.controlMedia'; 
	import { help } from '$lib/util.help';
    import { getHoveredCanvasObject, getSoundsHidden, setHoveredCanvasObject, SoundType, TriggerType } from '$lib/registry.svelte';
	import type { CanvasSound } from '$lib/classes/CanvasSound.svelte';
	import { tryRemoveObject } from '$lib/media.remove';

    // Import Icons
	import IconSoundGlobal from '$lib/icons/item/soundGlobal.svelte';
	import IconSoundLocal  from '$lib/icons/item/soundLocal.svelte';
	import IconSoundArea   from '$lib/icons/item/soundArea.svelte';

    import IconPlay   from '$lib/icons/item/playbackPlay.svelte';
	import IconPause  from '$lib/icons/item/playbackPause.svelte';
	import IconLoop   from '$lib/icons/item/playbackLoop.svelte';
	import IconNoLoop from '$lib/icons/item/playbackNoLoop.svelte';

    import IconPlayOnLoad     from '$lib/icons/item/triggerManual.svelte';
	import IconPlayOnEnter    from '$lib/icons/item/triggerPlayOnEnter.svelte';
	import IconPlayInside     from '$lib/icons/item/triggerPlayInside.svelte';
	import IconPlayOnTimer    from '$lib/icons/item/triggerPlayOnTimer.svelte';
	import IconRestartOnEnter from '$lib/icons/item/triggerReplayOnEnter.svelte';
	import IconRestartInside  from '$lib/icons/item/triggerReplayInside.svelte';

	import IconReset from '$lib/icons/menu/reset.svelte';

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
    class:active={item.selected} class:locked={item.locked}  class:hidden={getSoundsHidden()}
    onfocus     = {() => {}} 
    onblur      = {() => {}}
    onmouseout  = {() => { setHoveredCanvasObject(null); help(); }}
    onmouseover = {() => { setHoveredCanvasObject(item, false); }}>

    <!-- Volume Display -->
    <button class="volume-track" aria-label="Volume"
        onwheel     = {(e) =>{ e.preventDefault(); item.changeVolumeWheel(e); }}
        onfocus     = {()  => {}} 
        onblur      = {()  => {}}
        onmousedown = {(e) => { item.changeVolumeClick(e); }}
        onmouseout  = {()  => { help(); }}
        onmouseover = {()  => { help($t('help.mediaPanel.sound.volume')); }}>
        <div class="volume-bar" style={"height: "+(item.volume*100)+"%"}></div>
    </button>

    <!-- Sound Name -->
    <button class="item-name" title="{item.niceName}"
    onclick     = {() => { item.selected = !item.selected; }}
    ondblclick  = {() => { 
        if (item.soundType != SoundType.Global) {
            item.locked = !item.locked;
            item.selected = false;
        }
    }}
    onfocus     = {() => {}} 
    onblur      = {() => {}}
    onmouseout  = {() => { help(); }}
    onmouseover = {() => {
        if (item.soundType == SoundType.Global) {
            help(       $t('help.mediaPanel.sound.type.global'));
        } else if (item.selected) {
            if (item.soundType == SoundType.Area) 
                help(   $t('help.mediaPanel.sound.type.area'), 
                        $t('help.mediaPanel.sound.titleKey'), 
                        $t('help.objects.selected'), 
                        $t('help.objects.deselectKey'),
                        $t('help.objects.lockKey'));
            else if (item.soundType == SoundType.Local)
                help(   $t('help.mediaPanel.sound.type.local'),  
                        $t('help.mediaPanel.soundTitleKey'),
                        $t('help.objects.selected'), 
                        $t('help.objects.deselectKey'),
                        $t('help.objects.lockKey'));
        } else if (item.locked) {
            if (item.soundType == SoundType.Area) 
                help(   $t('help.mediaPanel.sound.type.area'),  
                        $t('help.mediaPanel.sound.titleKey'),
                        $t('help.objects.locked'), 
                        $t('help.objects.unlockKey'));
            else if (item.soundType == SoundType.Local)
                help(   $t('help.mediaPanel.sound.type.local'), 
                        $t('help.mediaPanel.sound.titleKey'), 
                        $t('help.objects.locked'), 
                        $t('help.objects.unlockKey'));
        } else {
            if (item.soundType == SoundType.Area) 
                help(   $t('help.mediaPanel.sound.type.area'), 
                        $t('help.mediaPanel.sound.titleKey'), 
                        $t('help.objects.selectKey'),
                        $t('help.objects.lockKey'));
            else if (item.soundType == SoundType.Local)
                help(   $t('help.mediaPanel.sound.type.local'),  
                        $t('help.mediaPanel.sound.titleKey'),
                        $t('help.objects.selectKey'),
                        $t('help.objects.lockKey'));
        }
    }}>{item.niceName}</button>

    <!-- Sound Add Button -->
    <button class="item-add l" 
    onclick     = {() => { duplicateSound(item); }}
    onfocus     = {() => {}} 
    onblur      = {() => {}}
    onmouseout  = {() => { help(); }}
    onmouseover = {() => { help($t('help.mediaPanel.sound.duplicate')); }}>
        +
    </button>

    <!-- Sound Delete Button -->
    <button class="item-delete r" 
    onclick     = {() => {tryRemoveObject(item); }}
    onfocus     = {() => {}} 
    onblur      = {() => {}}
    onmouseout  = {() => { help(); }}
    onmouseover = {() => { help($t('help.mediaPanel.sound.delete')); }}>
        ×
    </button>

    <!-- Sound Progress Track / Seek Button -->
    <button class="progress-track" aria-label="seek" class:active={!paused}
    bind:this   = {soundTrack} 
    onmousedown = {(e) => { seekToByClick(item, e.x); }}
    onfocus     = {() => {}} 
    onblur      = {() => {}}
    onmouseout  = {() => { help(); }}
    onmouseover = {() => { help($t('help.mediaPanel.sound.seek')); }}>

        <!-- Sound Progress Bar -->
        {#if item.sound}
            <div class="progress-bar" 
            style={"width: " + seek.toString()+"%"}></div>
        {/if}
    </button>

    <!-- Sound Type Button -->
    <button class="item-type" 
    onclick     = {() => { item.cycleSoundType(); }} 
    onfocus     = {() => {}} 
    onblur      = {() => {}}
    onmouseout  = {() => { help(); }}
    onmouseover = {() => {
        if (item.soundType == SoundType.Area) 
            help(   $t('help.mediaPanel.sound.type.area'), 
                    $t('help.mediaPanel.sound.type.areaKey') );
        else if (item.soundType == SoundType.Global) 
            help(   $t('help.mediaPanel.sound.type.global'), 
                    $t('help.mediaPanel.sound.type.globalKey') );
        else 
            help(   $t('help.mediaPanel.sound.type.local'), 
                    $t('help.mediaPanel.sound.type.localKey') );
    }}>
        {#if soundType == SoundType.Area}<IconSoundArea/>
        {:else if soundType == SoundType.Global}<IconSoundGlobal/>
        {:else if soundType == SoundType.Local}<IconSoundLocal/>{/if}
    </button>

    <!-- Sound Trigger Button -->
    <button class="item-trigger l"
    onclick     = {() => { item.cycleTriggerType(); }}
    onfocus     = {() => {}} 
    onblur      = {() => {}}
    onmouseout  = {() => { help(); }}
    onmouseover = {() => {
        if      (item.triggerType == TriggerType.Manual) help($t('help.mediaPanel.sound.trigger.manual'));
        else if (item.triggerType == TriggerType.PlayOnEnter) help($t('help.mediaPanel.sound.trigger.playOnEnter'));
        else if (item.triggerType == TriggerType.RestartOnEnter) help($t('help.mediaPanel.sound.trigger.restartOnEnter'));
        else if (item.triggerType == TriggerType.PlayInside) help($t('help.mediaPanel.sound.trigger.playInside'));
        else if (item.triggerType == TriggerType.RestartInside) help($t('help.mediaPanel.sound.trigger.restartInside'));
        else if (item.triggerType == TriggerType.PlayOnTimer) help($t('help.mediaPanel.sound.trigger.playOnTimer'));
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
        <button class="item-pause m" class:active={!paused}
        onclick     = {() => { item.sound.paused ? item.sound.play() : item.sound.pause(); }}
        onfocus     = {() => {}} 
        onblur      = {() => {}}
        onmouseout  = {() => { help(); }}
        onmouseover = {() => {
            !paused ? help($t('help.mediaPanel.sound.pause')) : help($t('help.mediaPanel.sound.play'))
        }}>
            <span>{#if paused}<IconPause/> {$t('ui.mediaPanel.item.paused')}{:else}<IconPlay/> {$t('ui.mediaPanel.item.playing')}{/if}</span>
        </button>
    {:else}
        <span class="item-pause m disabled" class:active={!paused}>
            {#if triggerType == TriggerType.PlayOnTimer}
                <span class="timer" role="timer"
                    onwheel     = {(e) => { e.preventDefault(); item.changeTimer(e,"h"); }}
                    onfocus     = {()  => {}} 
                    onblur      = {()  => {}}
                    onmouseout  = {()  => { help(); }}
                    onmouseover = {()  => { help($t('help.mediaPanel.sound.timer.hours')); }}>{timerH.toString().padStart(2,"0")}</span><!--
                --><span class="timer" role="timer"
                    onwheel     = {(e) => { e.preventDefault(); item.changeTimer(e,"m"); }}
                    onfocus     = {()  => {}} 
                    onblur      = {()  => {}}
                    onmouseout  = {()  => { help(); }}
                    onmouseover = {()  => { help($t('help.mediaPanel.sound.timer.minutes')); }}><span class="timer-divider" class:blink={timerActive && timerS % 2 == 1} >:</span>{timerM.toString().padStart(2,"0")}</span><!--
                --><span class="timer" role="timer"
                    onwheel     = {(e) => { e.preventDefault(); item.changeTimer(e,"s"); }}
                    onfocus     = {()  => {}} 
                    onblur      = {()  => {}}
                    onmouseout  = {()  => { help(); }}
                    onmouseover = {()  => { help($t('help.mediaPanel.sound.timer.seconds')); }}><span class="timer-divider" class:blink={timerActive && timerS % 2 == 1}>:</span>{timerS.toString().padStart(2,"0")}</span><!--
                --><button 
                    onfocus     = {() => {}} 
                    onblur      = {() => {}}
                    onmouseout  = {() => { help(); }}
                    onmouseover = {() => {
                        if (item.timer.active) help($t('help.mediaPanel.sound.timer.stop'))
                        else help($t('help.mediaPanel.sound.timer.start'))}}
                    onclick     = {() => {
                        if (item.timer.active) { 
                            item.sound.pause();
                            item.stopTimer(item.timerID);
                        } else {
                            item.timerID = item.startTimer();
                        }}}>{#if timerActive}<IconPause/>{:else}<IconPlay/>{/if}</button>
            {:else if triggerType == TriggerType.PlayOnEnter}
                {#if paused}<IconPlay/> {$t('ui.mediaPanel.item.onEnter')}{:else}<IconPlay/> {$t('ui.mediaPanel.item.playing')}{/if}
            {:else if triggerType == TriggerType.PlayInside}
                {#if paused}<IconPlay/> {$t('ui.mediaPanel.item.inside')}{:else}<IconPlay/> {$t('ui.mediaPanel.item.playing')}{/if}
            {:else if triggerType == TriggerType.RestartOnEnter}
                {#if paused}<IconReset/> {$t('ui.mediaPanel.item.onEnter')}{:else}<IconPlay/> {$t('ui.mediaPanel.item.playing')}{/if}
            {:else if triggerType == TriggerType.RestartInside}
                {#if paused}<IconReset/> {$t('ui.mediaPanel.item.inside')}{:else}<IconPlay/> {$t('ui.mediaPanel.item.playing')}{/if}
            {/if}
        </span>
    {/if}

    <!-- Sound Loop Button -->
    <button class="item-loop r" class:disabled={triggerType == TriggerType.PlayInside || triggerType == TriggerType.RestartInside}
    onclick     = {() => { if (triggerType != TriggerType.PlayInside && triggerType != TriggerType.RestartInside) item.loop = !item.loop; }}
    onfocus     = {() => {}} 
    onblur      = {() => {}}
    onmouseout  = {() => { help(); }}
    onmouseover = {() => {
        if (item.triggerType == TriggerType.PlayOnTimer)
            item.loop? help($t('help.mediaPanel.sound.loopTimer')) : help($t('help.mediaPanel.sound.noLoopTimer'))
        else
            item.loop? help($t('help.mediaPanel.sound.loop')) : help($t('help.mediaPanel.sound.noLoop'))
    }}>
        {#if looped}<IconLoop/>{:else}<IconNoLoop/>{/if}
    </button>


    <!-- Sound Mute Button -->
    <button class="item-mute l" class:active={muted} 
    onclick     = {() => { item.muted = !item.muted; }}
    onfocus     = {() => {}} 
    onblur      = {() => {}}
    onmouseout  = {() => { help(); }}
    onmouseover = {() => {
        item.muted? help($t('help.mediaPanel.sound.mute')) : help($t('help.mediaPanel.sound.unmute'))
    }}>M</button>

    <!-- Sound Solo Button -->
    <button class="item-solo r" class:active={soloed} 
    onclick     = {() => { solo(item); }}
    onfocus     = {() => {}} 
    onblur      = {() => {}}
    onmouseout  = {() => { help(); }}
    onmouseover = {() => {
        item.solo ? help($t('help.mediaPanel.sound.unsolo')) : help($t('help.mediaPanel.sound.solo'))
    }}>S</button>
</div>
