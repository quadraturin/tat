<script lang="ts">
    // styles
    import 'leaflet/dist/leaflet.css'
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
    //import IconAdd from '$lib/icons/iconAdd.svelte'
    //import IconPlay from '$lib/icons/iconPlay.svelte'
    //import IconLevels from '$lib/icons/iconLevels.svelte'
    //import IconAudioFile from '$lib/icons/iconAudioFile.svelte'

	//let files:FileList;
    //let fileSound:Howl;

    let isSaving = false;
    let isDirty = false;
    let hasMedia = false;
    let projectName:string;
    let titleTooltip:string;

    // initialize
    onMount( () => 
    {
        // set up title bar window controls
        const titlebarMinimize = document.getElementById('titlebar-minimize') as HTMLElement
        titlebarMinimize.addEventListener('click', () => appWindow.minimize())
        const titlebarMaximize = document.getElementById('titlebar-maximize') as HTMLElement
        titlebarMaximize.addEventListener('click', () => appWindow.toggleMaximize())
        const titlebarClose = document.getElementById('titlebar-close') as HTMLElement
        titlebarClose.addEventListener('click', () => appWindow.close()) 
        
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

    $: isDirty = R.getisProjectDirty(), isDirty ? titleTooltip = "unsaved changes" : titleTooltip = "saved";

    function onKeyDown(e:KeyboardEvent) { 
        console.log(e);
        if (e.key=="Shift") R.setIsProportionalScaleOn(false);
        else if (e.key == "Alt") R.setIsInDeleteMode(true);
    };
    function onKeyUp(e:KeyboardEvent) {
        console.log(e); 
        if (e.key=="Shift") R.setIsProportionalScaleOn(true);
        else if (e.key == "Alt") R.setIsInDeleteMode(false);
    };
    function onDrag(e:any) {
        console.log(e);
    }
    
    setInterval(() => {
        isDirty = R.getisProjectDirty();
        projectName = R.getProjectName();
    }, 15);

</script>

<svelte:window
    on:keydown={onKeyDown}
    on:keyup={onKeyUp}
    on:drag={onDrag}
/>

<div data-tauri-drag-region class="titlebar">
    <h1 data-tauri-drag-region title="{titleTooltip}">
        <span data-tauri-drag-region class="project-name">{projectName}</span>
        <span data-tauri-drag-region>{#if isDirty}*{/if}</span>
    </h1>
    
    <button class="toolbar-button" title="add media" on:click={readFiles}>
        {#if R.getIsLoading()}<IconLoading />{:else}<IconImageFile />{/if}
        <span class="button-title-short">add</span>
        <span class="button-title-full">add media</span>
    </button>
    
    <button class="toolbar-button" title="save" on:click={() => saveProject(false)}>
        {#if isSaving}<IconLoading />{:else}<IconSave />{/if}
        <span class="button-title-short">sav</span>
        <span class="button-title-full">save</span>
    </button>
    
    <button class="toolbar-button"  title="save as" on:click={() => saveProject(true)}>
        {#if isSaving}<IconLoading />{:else}<IconSaveAs />{/if}
        <span class="button-title-short">sva</span>
        <span class="button-title-full">save as</span>
    </button>
    
    <span data-tauri-drag-region class="toolbar-spacer"></span>
    
    <button class="toolbar-button"  title="open project" on:click={loadProject}>
        {#if R.getIsLoading()}<IconLoading />{:else}<IconLoad />{/if}
        <span class="button-title-short">opn</span>
        <span class="button-title-full">open</span>
    </button>
    
    <button class="toolbar-button"  title="new project" on:click={clearProject}>
        <IconNew />
        <span class="button-title-short">new</span>
        <span class="button-title-full">new</span>
    </button>
    
    <span data-tauri-drag-region class="toolbar-spacer"></span>
    
    <button class="toolbar-button"  title="settings">
        <IconSettings />
        <span class="button-title-short">stg</span>
        <span class="button-title-full">settings</span>
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
    <div id="map">
    </div>
</div>

<div
    id="drag"
    style="
    position: fixed;
    top: env(titlebar-area-y);
    left: env(titlebar-area-x);
    height: env(titlebar-area-height);
    width: env(titlebar-area-width);
    -webkit-app-region: drag;">
</div>

<div id="toolbar">
</div>
