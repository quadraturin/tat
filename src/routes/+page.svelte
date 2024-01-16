<script lang="ts">

    // styles
    import 'leaflet/dist/leaflet.css'
    import 'leaflet-contextmenu/dist/leaflet.contextmenu.css'
    import '../app.css'

    // modules
    import * as R from '$lib/registry';
    import { onMount } from 'svelte'
    import { appWindow } from '@tauri-apps/api/window'
    import L from "leaflet";
	import { setupMap } from '$lib/init.setupMap';
	import { setupListener } from '$lib/init.setupListener';
	import { saveProject } from '$lib/project.saveProject';
	import { readFiles } from '$lib/media.readFiles';
	import { loadProject } from '$lib/project.loadProject';
    import { removeSelected } from '$lib/media.removeSelected';
    import * as S from '$lib/settings';

    // icons
    import IconLoading from '$lib/icons/iconLoading.svelte';
	import IconSettings from '$lib/icons/iconSettings.svelte';
	import IconSave from '$lib/icons/iconSave.svelte';
    import IconLoad from '$lib/icons/iconLoad.svelte';
    import IconImageFile from '$lib/icons/iconImageFile.svelte';
    import IconSaveAs from '$lib/icons/iconSaveAs.svelte';
    import IconNew from '$lib/icons/iconNew.svelte'
	import { clearProject } from '$lib/project.clearProject';
	import { toggleAboutMenu } from '$lib/ui.menus';
	import IconAbout from '$lib/icons/iconAbout.svelte';
	import About from '$lib/menus/about.svelte';
	import Modal from '$lib/menus/loading.svelte';
	import Settings from '$lib/menus/settings.svelte';
	import { tryQuit } from '$lib/quit';
	import Loading from '$lib/menus/loading.svelte';
	import { toggleMute, toggleSolo } from '$lib/media.mixSound';
	import { removeImage } from '$lib/media.removeImage';
	import { removeSound } from '$lib/media.removeSound';
	import { duplicateImage } from '$lib/media.loadImage';
	import { duplicateSound } from '$lib/media.loadSound';
	import { changeBaseVolume, seekToByClick, togglePause } from '$lib/media.controlSound';
	import { changeOpacity } from '$lib/media.controlOpacity';
    //import IconAdd from '$lib/icons/iconAdd.svelte'
    //import IconPlay from '$lib/icons/iconPlay.svelte'
    //import IconLevels from '$lib/icons/iconLevels.svelte'
    //import IconAudioFile from '$lib/icons/iconAudioFile.svelte'

	//let files:FileList;
    //let fileSound:Howl;

    let isSaving = false;
    let isDirty = false;
    let hasMedia = false;
    let isAboutMenuOpen = false;
    let projectName:string;
    let titleTooltip:string;
    let imageList = R.getImageList();
    let soundList = R.getSoundList();

    // initialize
    onMount( () => 
    {
        // set up title bar window controls
        const titlebarMinimize = document.getElementById('titlebar-minimize') as HTMLElement;
        titlebarMinimize.addEventListener('click', () => appWindow.minimize());
        const titlebarMaximize = document.getElementById('titlebar-maximize') as HTMLElement;
        titlebarMaximize.addEventListener('click', () => appWindow.toggleMaximize());
        const titlebarClose = document.getElementById('titlebar-close') as HTMLElement;
        titlebarClose.addEventListener('click', () => tryQuit());
        
        // override so circle scaling doesn't break when using L.CRS.Simple map coords
        L.LatLng.prototype.distanceTo = function (currentPostion:L.LatLng) 
        {
            var dx = currentPostion.lng - this.lng;
            var dy = currentPostion.lat - this.lat;
            return Math.sqrt(dx*dx + dy*dy);
        }

        // default project name
        R.setProjectName(S.defaultProjectName);

        // set up map
        R.setMap(setupMap());

        // set up listener
        R.setListener(setupListener(R.getMap()));

    })

    // catch js file input (input element, drag-and-drop etc)
	/*$: if (files) 
    {
		console.log(files);
		for (const file of files) 
        {
			console.log(`${file.name}: ${file.type}, ${file.size} bytes`);
            let fileurl = URL.createObjectURL(file);
            fileSound = new Howl
            ({
                src: [fileurl], 
                format: [file.type.split("/")[1]], //only uses mime subtype
                loop: true
            });
            createMapSound(fileSound, map);
		}
	}*/

    //$: if(R.getIsSaving()) {
    //    isSaving = R.getIsSaving();
    //}
    //$: if(R.getisProjectDirty()) {
    //    isDirty = R.getisProjectDirty();
    //}

    $: isAboutMenuOpen = R.getIsAboutMenuOpen(), isAboutMenuOpen ? document.getElementById("about-button")?.setAttribute('class', 'toolbar-button selected') : document.getElementById("about-button")?.setAttribute('class', 'toolbar-button');

    $: isDirty = R.getisProjectDirty(), isDirty ? titleTooltip = "unsaved changes" : titleTooltip = "saved";

    $: imageList = R.getImageList();

    $: soundList = R.getSoundList();

    function onKeyDown(e:KeyboardEvent) { 
        console.log(e);
        if (e.key=="Shift") R.setIsProportionalScaleOn(true);
        else if (e.key == "Delete" || e.key == "Backspace") removeSelected();
        else if (e.key == "Alt") R.setIsInDeleteMode(true);
        else if (e.key == "s" && e.shiftKey && (e.metaKey || e.ctrlKey)) saveProject(true);
        else if (e.key == "s" && (e.metaKey || e.ctrlKey)) saveProject(false);
        else if (e.key == "o" && (e.metaKey || e.ctrlKey)) loadProject();
        else if (e.key == "n" && (e.metaKey || e.ctrlKey)) clearProject();
        else if (e.key == "m" && (e.metaKey || e.ctrlKey)) readFiles();
    };
    function onKeyUp(e:KeyboardEvent) {
        console.log(e); 
        if (e.key=="Shift") R.setIsProportionalScaleOn(false);
        else if (e.key == "Alt") R.setIsInDeleteMode(false);
    };
    function onDrag(e:any) {
        console.log(e);
    }
    
    setInterval(() => {
        isDirty = R.getisProjectDirty();
        projectName = R.getProjectName();
        isAboutMenuOpen = R.getIsAboutMenuOpen();
        imageList = R.getImageList();
        soundList = R.getSoundList();
    }, 15);

    let mousePos = { x: 0, y: 0 };

	function handleMousemove(event:MouseEvent) {
		mousePos.x = event.clientX;
		mousePos.y = event.clientY;
	}

    let soundTrack:HTMLButtonElement;

</script>

<svelte:window
    on:keydown={onKeyDown}
    on:keyup={onKeyUp}
    on:drag={onDrag}
/>

<div data-tauri-drag-region class="titlebar" on:wheel|preventDefault={()=>{}}>
    <h1 data-tauri-drag-region title="{titleTooltip}">
        <span data-tauri-drag-region class="project-name">{projectName}</span>
        <span data-tauri-drag-region>{#if isDirty}*{/if}</span>
    </h1>
    
    <button class="toolbar-button" title="add media" on:click={readFiles}>
        {#if R.getIsLoading()}<IconLoading />{:else}<IconImageFile />{/if}
        <span class="button-title-short"><span>m</span>ed</span>
        <span class="button-title-full">add <span>m</span>edia</span>
    </button>
    
    <button class="toolbar-button" title="save" on:click={() => saveProject(false)}>
        {#if R.getIsSaving()}<IconLoading />{:else}<IconSave />{/if}
        <span class="button-title-short"><span>s</span>av</span>
        <span class="button-title-full"><span>s</span>ave</span>
    </button>
    
    <button class="toolbar-button"  title="save as" on:click={() => saveProject(true)}>
        {#if R.getIsSaving()}<IconLoading />{:else}<IconSaveAs />{/if}
        <span class="button-title-short"><span>S</span>va</span>
        <span class="button-title-full"><span>S</span>ave as</span>
    </button>
    
    <span data-tauri-drag-region class="toolbar-spacer"></span>
    
    <button class="toolbar-button"  title="open project" on:click={loadProject}>
        {#if R.getIsLoading()}<IconLoading />{:else}<IconLoad />{/if}
        <span class="button-title-short"><span>o</span>pn</span>
        <span class="button-title-full"><span>o</span>pen</span>
    </button>
    
    <button class="toolbar-button"  title="new project" on:click={clearProject}>
        <IconNew />
        <span class="button-title-short"><span>n</span>ew</span>
        <span class="button-title-full"><span>n</span>ew</span>
    </button>
    
    <span data-tauri-drag-region class="toolbar-spacer"></span>
    
    <!---<button class="toolbar-button"  title="settings">
        <IconSettings />
        <span class="button-title-short">s<span>e</span>t</span>
        <span class="button-title-full">s<span>e</span>ttings</span>
    </button>-->

    <button class="toolbar-button" id="about-button"  title="about" on:click={toggleAboutMenu}>
        <IconAbout />
        <span class="button-title-short">a<span>b</span>t</span>
        <span class="button-title-full">a<span>b</span>out</span>
    </button>
    
    <!--<input accept="audio/wav, audio/mpeg" bind:files id="audioInput" name="audioInput" type="file" />-->

    <div data-tauri-drag-region class="titlebar-drag"></div>
    
    <div class="titlebar-button" id="titlebar-minimize">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g transform="rotate(-90 12 12)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M10 12L13 9M10 12L13 15"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="6;0"/></path></g></g></svg>
    </div>
    <div class="titlebar-button" id="titlebar-maximize">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g transform="rotate(-90 12 12) translate(24 0) scale(-1 1)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M10 12L13 9M10 12L13 15"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="6;0"/></path></g></g></svg>
    </div>
    <div class="titlebar-button" id="titlebar-close">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="8" stroke-dashoffset="8" d="M12 12L16 16M12 12L8 8M12 12L8 16M12 12L16 8"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="8;0"/></path></g></svg>
    </div>
</div>

<div id="map-wrapper">
    <div id="map"></div>
</div>

<!--<div
    id="drag"
    style="
    position: fixed;
    top: env(titlebar-area-y);
    left: env(titlebar-area-x);
    height: env(titlebar-area-height);
    width: env(titlebar-area-width);
    -webkit-app-region: drag;">
</div>-->

<div id="browser">
    {#if soundList.length>0}
        <div id="browser-sounds">
            {#each soundList as item, i }
                <div class="item sound-item" class:selected={R.getIsSelected(item.circle)} id="sound-item-{i}" on:wheel|preventDefault={(event) => changeBaseVolume(item, event)}>
                    <div class="volume" style={"height: "+(item.volume*100)+"%"}></div>
                    <button class="item-name" on:click={() => {R.toggleSelected(item.circle)}}>{item.data.name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim()}</button>
                    <button class="item-button item-pause" class:activated={!item.sound.playing()} title="play/pause sound" on:click={() => togglePause(item)}>{#if item.sound.playing()}⏸{:else}⏵{/if}</button>
                    <button class="item-button item-mute" class:activated={item.muted} title="mute sound" on:click={() => toggleMute(i)}>M</button>
                    <button class="item-button item-solo" class:activated={item.solo} title="solo sound" on:click={() => toggleSolo(i)}>S</button>
                    <button class="item-button item-add" title="duplicate sound" on:click={() => duplicateSound(item)}>+</button>
                    <button class="item-button item-delete" title="delete sound" on:click={() => removeSound(i)}>×</button>
                    <button class="sound-item-progress-track" bind:this={soundTrack} on:mousemove={handleMousemove} on:click={() => seekToByClick(item, soundTrack, mousePos.x)}>
                        <div style={"width: "+((item.sound.seek()/item.sound.duration())*100).toString()+"%"} class="sound-item-progress-bar"></div>
                    </button>
                </div>
            {/each}
            <div>sounds</div>
        </div>
    {/if}
    {#if imageList.length > 0}
        <div id="browser-images">
            {#each imageList as item, i}
                <div class="item image-item" id="image-item-{i}" class:selected={R.getIsSelected(item.rect)} on:wheel|preventDefault={(event) => changeOpacity(item, event)}>
                    <div class="volume" style={"height: "+(item.opacity*100)+"%"}></div>
                    <button class="item-name" on:click={() => {R.toggleSelected(item.rect)}}>{item.data.name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim()}</button>
                    <button class="item-button item-add" title="duplicate image" on:click={() => duplicateImage(item)}>+</button>
                    <button class="item-button item-delete" title="delete image" on:click={() => removeImage(i)}>×</button>
                </div>
            {/each}
            <div>images</div>
        </div>
    {/if}
</div>

<Settings />

<About />

<Loading />

<div id="toolbar">
</div>
