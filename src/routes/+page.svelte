<script lang="ts">

    // styles
    import 'leaflet/dist/leaflet.css'
    import 'leaflet-contextmenu/dist/leaflet.contextmenu.css'
    import '../app.css'

    // modules
    import * as R from '$lib/registry';
    import { onMount } from 'svelte'
    import { LogicalSize, appWindow } from '@tauri-apps/api/window'
    import L from "leaflet";
	import { setupMap } from '$lib/init.setupMap';
	import { setupListener } from '$lib/init.setupListener';
	import { saveProject } from '$lib/project.saveProject';
	import { readFiles } from '$lib/media.readFiles';
	import { loadProject } from '$lib/project.loadProject';
    import { removeSelected } from '$lib/media.removeSelected';
    import * as S from '$lib/settings.appSettings';
    import { getUserSettings } from '$lib/settings.userSettings'
    import type { PageData } from './$types';
    export let data:PageData;

    // icons
    import IconLoading from '$lib/icons/iconLoading.svelte';
	import IconSettings from '$lib/icons/iconSettings.svelte';
	import IconSave from '$lib/icons/iconSave.svelte';
    import IconLoad from '$lib/icons/iconLoad.svelte';
    import IconImageFile from '$lib/icons/iconImageFile.svelte';
    import IconSaveAs from '$lib/icons/iconSaveAs.svelte';
    import IconNew from '$lib/icons/iconNew.svelte'
	import { clearProject } from '$lib/project.clearProject';
	import { toggleAboutMenu, toggleSettingsMenu } from '$lib/ui.menus';
	import IconAbout from '$lib/icons/iconAbout.svelte';
	import About from '$lib/menus/about.svelte';
	import Settings from '$lib/menus/settings.svelte';
	import { tryQuit } from '$lib/quit';
	import Loading from '$lib/menus/loading.svelte';
	import { toggleMute, toggleSolo } from '$lib/media.mixSound';
	import { removeImage } from '$lib/media.removeImage';
	import { removeSound } from '$lib/media.removeSound';
	import { duplicateImage, toggleImageEdit } from '$lib/media.loadImage';
	import { cycleSoundType, duplicateSound, toggleSoundEdit } from '$lib/media.loadSound';
	import { changeBaseVolume, seekToByClick, togglePause } from '$lib/media.controlSound';
	import { changeOpacity } from '$lib/media.controlOpacity';
	import IconSoundGlobal from '$lib/icons/iconSoundGlobal.svelte';
	import IconSoundLocal from '$lib/icons/iconSoundLocal.svelte';
	import IconSoundArea from '$lib/icons/iconSoundArea.svelte';
	import IconSoundPause from '$lib/icons/iconSoundPause.svelte';
	import { help } from '$lib/util.help';
	import IconZoomIn from '$lib/icons/iconZoomIn.svelte';
	import IconZoomOut from '$lib/icons/iconZoomOut.svelte';
	import IconRecenter from '$lib/icons/iconRecenter.svelte';
	import IconCollapse from '$lib/icons/iconCollapse.svelte';
	import IconExpand from '$lib/icons/iconExpand.svelte';
	import { loadUserSettings } from '$lib/settings.loadUserSettings';
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
    let isSettingsMenuOpen = false;
    let isHelpActive = false;
    let projectName:string;
    let imageList = R.getImageList();
    let soundList = R.getSoundList();
    
    // initialize
    onMount( () => 
    {
        appWindow.setMinSize(new LogicalSize(480,320));

        loadUserSettings();
        
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

        // set up text
        R.setText(data);

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

    /*$: if(R.getIsSaving()) {
        isSaving = R.getIsSaving();
    }
    $: if(R.getisProjectDirty()) {
        isDirty = R.getisProjectDirty();
    }*/

    $: isAboutMenuOpen = R.getIsAboutMenuOpen(), isAboutMenuOpen ? document.getElementById("about-button")?.setAttribute('class', 'toolbar-button selected') : document.getElementById("about-button")?.setAttribute('class', 'toolbar-button');
    
    $: isSettingsMenuOpen = R.getIsSettingsMenuOpen(), isSettingsMenuOpen ? document.getElementById("settings-button")?.setAttribute('class', 'toolbar-button selected') : document.getElementById("settings-button")?.setAttribute('class', 'toolbar-button');

    $: isDirty = R.getisProjectDirty();

    $: imageList = R.getImageList();

    $: soundList = R.getSoundList();

    $: isHelpActive = R.getIsHelpActive();

    function onKeyDown(e:KeyboardEvent) { 
        //console.log(e);
        let speed:number = getUserSettings().listenerMoveSpeed;
        if (e.key=="Shift") {
            if(getUserSettings().proportionalScaleOnByDefault) R.setIsProportionalScaleOn(false);
            else R.setIsProportionalScaleOn(true);
        } 
        else if (e.key == "Delete" || e.key == "Backspace") removeSelected();
        else if (e.key == "Alt") R.setIsInDeleteMode(true);
        else if (e.key == "s" && e.shiftKey && (e.metaKey || e.ctrlKey)) saveProject(true);
        else if (e.key == "s" && (e.metaKey || e.ctrlKey)) saveProject(false);
        else if (e.key == "o" && (e.metaKey || e.ctrlKey)) loadProject();
        else if (e.key == "n" && (e.metaKey || e.ctrlKey)) clearProject();
        else if (e.key == "m" && (e.metaKey || e.ctrlKey)) readFiles();
        // using unary + here to prevent weird concat issues
        else if (e.key == "w") 
            R.getListener().setLatLng([R.getListener().getLatLng().lat + +speed, R.getListener().getLatLng().lng]);
        else if (e.key == "a") 
            R.getListener().setLatLng([R.getListener().getLatLng().lat, R.getListener().getLatLng().lng - +speed]);
        else if (e.key == "s") 
            R.getListener().setLatLng([R.getListener().getLatLng().lat - +speed, R.getListener().getLatLng().lng]);
        else if (e.key == "d") 
            R.getListener().setLatLng([R.getListener().getLatLng().lat, R.getListener().getLatLng().lng + +speed]);
        //console.log("listener is at", R.getListener().getLatLng())
    };
    function onKeyUp(e:KeyboardEvent) {
        //console.log(e); 
        if (e.key=="Shift") {
            if(getUserSettings().proportionalScaleOnByDefault) R.setIsProportionalScaleOn(true);
            else R.setIsProportionalScaleOn(false);
        } 
        else if (e.key == "Alt") R.setIsInDeleteMode(false);
    };
    function onDrag(e:any) {
        console.log(e);
    }
    
    setInterval(() => {
        isDirty = R.getisProjectDirty();
        projectName = R.getProjectName();
        isAboutMenuOpen = R.getIsAboutMenuOpen();
        isSettingsMenuOpen = R.getIsSettingsMenuOpen();
        imageList = R.getImageList();
        soundList = R.getSoundList();
        isHelpActive = R.getIsHelpActive();
    }, 15);

    let mousePos = { x: 0, y: 0 };

	function handleMousemove(event:MouseEvent) {
		mousePos.x = event.clientX;
		mousePos.y = event.clientY;
	}

    let soundTrack:HTMLButtonElement;

    /*document.addEventListener('contextmenu', event => {
        event.preventDefault();
        R.getMap().flyTo(R.getMap().containerPointToLatLng([event.x, event.y]));
    });*/

    let sidebarHidden = false;

    function toggleSidebar() {
        sidebarHidden = !sidebarHidden;
    }

</script>

<svelte:window
    on:keydown={onKeyDown}
    on:keyup={onKeyUp}
    on:drag={onDrag}
/>

<div data-tauri-drag-region class="titlebar" 
on:wheel|preventDefault={()=>{}}>
    <h1 data-tauri-drag-region  
    on:focus={()=>{}} 
    on:mouseover={()=>{isDirty ? help(data.help.titlebar.titleDirty) : help(data.help.titlebar.title)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        <span data-tauri-drag-region class="project-name">{projectName}</span>
        <span data-tauri-drag-region>{#if isDirty}*{/if}</span>
    </h1>
    
    <button class="toolbar-button" 
    on:click={readFiles} 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(data.help.titlebar.addMedia)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        {#if R.getIsLoading()}<IconLoading />{:else}<IconImageFile />{/if}
        <span class="button-title-short">{data.ui.addMediaShort}</span>
        <span class="button-title-full">{data.ui.addMedia}</span>
    </button>

    <span data-tauri-drag-region class="toolbar-spacer"></span>
    
    <button class="toolbar-button"
    on:click={() => saveProject(false)} 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(data.help.titlebar.save)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        {#if R.getIsSaving()}<IconLoading />{:else}<IconSave />{/if}
        <span class="button-title-short">{data.ui.saveShort}</span>
        <span class="button-title-full">{data.ui.save}</span>
    </button>
    
    <button class="toolbar-button"
    on:click={() => saveProject(true)}
    on:focus={()=>{}} 
    on:mouseover={()=>{help(data.help.titlebar.saveAs)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        {#if R.getIsSaving()}<IconLoading />{:else}<IconSaveAs />{/if}
        <span class="button-title-short">{data.ui.saveAsShort}</span>
        <span class="button-title-full">{data.ui.saveAs}</span>
    </button>
    
    <span data-tauri-drag-region class="toolbar-spacer"></span>
    
    <button class="toolbar-button"
    on:click={loadProject} 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(data.help.titlebar.openProject)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        {#if R.getIsLoading()}<IconLoading />{:else}<IconLoad />{/if}
        <span class="button-title-short">{data.ui.openProjectShort}</span>
        <span class="button-title-full">{data.ui.openProject}</span>
    </button>
    
    <button class="toolbar-button"  title="new project" 
    on:click={clearProject} 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(data.help.titlebar.newProject)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        <IconNew />
        <span class="button-title-short">{data.ui.newProjectShort}</span>
        <span class="button-title-full">{data.ui.newProject}</span>
    </button>
    
    <span data-tauri-drag-region class="toolbar-spacer"></span>
    
    <button class="toolbar-button" id="settings-button"
    on:click={toggleSettingsMenu} 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(data.help.titlebar.settings)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        <IconSettings />
        <span class="button-title-short">{data.ui.settingsShort}</span>
        <span class="button-title-full">{data.ui.settings}</span>
    </button>

    <button class="toolbar-button" id="about-button" 
    on:click={toggleAboutMenu} 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(data.help.titlebar.about)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        <IconAbout />
        <span class="button-title-short">{data.ui.aboutShort}</span>
        <span class="button-title-full">{data.ui.about}</span>
    </button>
    
    <!--<input accept="audio/wav, audio/mpeg" bind:files id="audioInput" name="audioInput" type="file" />-->

    <div data-tauri-drag-region class="titlebar-drag"></div>
    
    <button class="titlebar-button" id="titlebar-minimize" title="minimize" 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(data.help.titlebar.minimize)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g transform="rotate(-90 12 12)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M10 12L13 9M10 12L13 15"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="6;0"/></path></g></g></svg>
    </button>

    <button class="titlebar-button" id="titlebar-maximize" title="maximize" 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(data.help.titlebar.maximize)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g transform="rotate(-90 12 12) translate(24 0) scale(-1 1)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M10 12L13 9M10 12L13 15"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="6;0"/></path></g></g></svg>
    </button>

    <button class="titlebar-button" id="titlebar-close" title="close" 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(data.help.titlebar.close)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="8" stroke-dashoffset="8" d="M12 12L16 16M12 12L8 8M12 12L8 16M12 12L16 8"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="8;0"/></path></g></svg>
    </button>
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

<div id="controls" class:sidebarHidden>
    <button id="zoom-in"
    on:click={()=>{R.getMap().zoomIn()}}
    on:focus={()=>{}} 
    on:mouseover={()=>{help(data.help.map.zoomIn, data.help.map.zoomInShortcut)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        <IconZoomIn/>
    </button>

    <button id="zoom-out"
    on:click={()=>{R.getMap().zoomOut()}}
    on:focus={()=>{}} 
    on:mouseover={()=>{help(data.help.map.zoomOut, data.help.map.zoomOutShortcut)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        <IconZoomOut/>
    </button>

    <div class="control-spacer"></div>

    <button id="recenter"
    on:click={()=>{R.getMap().flyTo(R.getListener().getLatLng())}}
    on:focus={()=>{}} 
    on:mouseover={()=>{help(data.help.map.recenter, data.help.map.recenterShortcut)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        <IconRecenter/>
    </button>
    
    <div class="control-spacer"></div>
    
    <button id="hide-show"
    on:click={toggleSidebar}
    on:focus={()=>{}} 
    on:mouseover={()=>{sidebarHidden? help(data.help.map.showSidebar, data.help.map.toggleSidebarShortcut) : help(data.help.map.hideSidebar, data.help.map.toggleSidebarShortcut)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        {#if sidebarHidden}<IconExpand/>{:else}<IconCollapse/>{/if}
    </button>
</div>

<div id="browser" class:sidebarHidden>
    {#if soundList.length>0}
        <div id="browser-sounds">
            {#each soundList as item, i }
                <div class="item sound-item" class:selected={R.getIsSelected(item.emitter)} id="sound-item-{i}" 
                class:locked={R.getIsLocked(item.emitter)}
                on:wheel|preventDefault={(event) => changeBaseVolume(item, event)} >

                    <div class="volume" style={"height: "+(item.volume*100)+"%"}></div>

                    <button class="item-name" 
                    on:click={() => {R.toggleSelected(item.emitter)}}
                    on:dblclick={() => { if(item.soundType != S.SOUNDTYPE_GLOBAL) toggleSoundEdit(item.emitter);}}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{
                        if (item.soundType == S.SOUNDTYPE_GLOBAL) {
                            help(data.help.map.soundTypeGlobal, data.help.map.soundItemActions);
                        } else if (R.getIsSelected(item.emitter)) {
                            if (item.soundType == S.SOUNDTYPE_AREA) help(data.help.map.selected, data.help.map.soundTypeArea, data.help.map.soundItemActions, data.help.map.itemSelectedActions);
                            else help(data.help.map.selected, data.help.map.soundTypeLocal, data.help.map.soundItemActions, data.help.map.itemSelectedActions);
                        } else if (R.getIsLocked(item.emitter)){
                            if (item.soundType == S.SOUNDTYPE_AREA) help(data.help.map.locked, data.help.map.soundTypeArea, data.help.map.itemLocked, data.help.map.soundItemActions, data.help.map.itemLockedActions);
                            else help(data.help.map.locked, data.help.map.soundTypeLocal, data.help.map.itemLocked, data.help.map.soundItemActions, data.help.map.itemLockedActions);
                        } else {
                            if (item.soundType == S.SOUNDTYPE_AREA) help(data.help.map.soundTypeArea, data.help.map.soundItemActions, data.help.map.itemUnselectedActions);
                            else help(data.help.map.soundTypeLocal, data.help.map.soundItemActions, data.help.map.itemUnselectedActions);
                        }
                    }}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        {item.data.name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim()}
                    </button>
                    
                    <button class="item-button item-type" 
                    on:click={() => {cycleSoundType(item)}} 
                    on:focus={()=>{}} 
                    on:mouseover={()=>{
                        if (item.soundType == S.SOUNDTYPE_AREA) help(data.help.map.soundTypeArea, data.help.map.soundTypeAreaActions);
                        else if (item.soundType == S.SOUNDTYPE_GLOBAL) help(data.help.map.soundTypeGlobal, data.help.map.soundTypeGlobalActions);
                        else help(data.help.map.soundTypeLocal, data.help.map.soundTypeLocalActions)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        {#if item.soundType == S.SOUNDTYPE_AREA}<IconSoundArea/>{:else if item.soundType == S.SOUNDTYPE_GLOBAL}<IconSoundGlobal/>{:else}<IconSoundLocal/>{/if}
                    </button>
                    
                    <button class="item-button item-pause" class:activated={!item.sound.playing()}  
                    on:click={() => togglePause(item)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{item.sound.playing() ? help(data.help.map.soundPause) : help(data.help.map.soundUnPause)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        <IconSoundPause/>
                    </button>
                    
                    <button class="item-button item-mute" class:activated={item.muted} 
                    on:click={() => toggleMute(i)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{item.muted? help(data.help.map.soundMute) : help(data.help.map.soundUnMute)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        M
                    </button>
                    
                    <button class="item-button item-solo" class:activated={item.solo} 
                    on:click={() => toggleSolo(i)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{item.solo ? help(data.help.map.soundUnSolo) : help(data.help.map.soundSolo)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        S
                    </button>
                    
                    <button class="item-button item-add" 
                    on:click={() => duplicateSound(item)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{help(data.help.map.soundDuplicate)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        +
                    </button>
                    
                    <button class="item-button item-delete" 
                    on:click={() => removeSound(i)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{help(data.help.map.soundDelete)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        ×
                    </button>
                    
                    <button class="sound-item-progress-track" 
                    bind:this={soundTrack} 
                    on:mousemove={handleMousemove} 
                    on:click={() => seekToByClick(item, soundTrack, mousePos.x)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{help(data.help.map.soundSeek)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        <div style={"width: "+((item.sound.seek()/item.sound.duration())*100).toString()+"%"} class="sound-item-progress-bar"></div>
                    </button>
                </div>
            {/each}
            <div role="heading" aria-level="2" 
            on:focus={()=>{}} 
            on:mouseover={()=>{help(data.help.map.soundsTitle)}}
            on:mouseout={()=>{help()}}
            on:blur={()=>{}}>
                sounds
            </div>
        </div>
    {/if}
    {#if imageList.length > 0}
        <div id="browser-images">
            {#each imageList as item, i}
                <div class="item image-item" id="image-item-{i}" class:selected={R.getIsSelected(item.rect)} class:locked={!item.rect.editEnabled()} role="listitem"
                on:wheel|preventDefault={(event) => changeOpacity(item, event)}>
                    <div class="volume" style={"height: "+(item.opacity*100)+"%"}></div>

                    <button class="item-name" 
                    on:click={() => {R.toggleSelected(item.rect)}}
                    on:dblclick={() => { toggleImageEdit(item.rect);}}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{
                        if (R.getIsSelected(item.rect)) help(data.help.map.selected, data.help.map.image, data.help.map.imageItemActions, data.help.map.itemSelectedActions);
                        else if (!item.rect.editEnabled()) help(data.help.map.locked, data.help.map.image, data.help.map.imageItemActions, data.help.map.itemLockedActions);
                        else help(data.help.map.image, data.help.map.imageItemActions, data.help.map.itemUnselectedActions)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        {item.data.name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim()}
                    </button>

                    <button class="item-button item-add" title="duplicate image" 
                    on:click={() => duplicateImage(item)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{help(data.help.map.imageDuplicate)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        +
                    </button>
                    
                    <button class="item-button item-delete" title="delete image" 
                    on:click={() => removeImage(i)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{help(data.help.map.imageDelete)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        ×
                    </button>
                </div>
            {/each}

            <div role="heading" aria-level="2" 
            on:focus={()=>{}} 
            on:mouseover={()=>{help(data.help.map.imagesTitle)}}
            on:mouseout={()=>{help()}}
            on:blur={()=>{}}>
                images
            </div>
        </div>
    {/if}
</div>

<div id="help" class:activated={isHelpActive}>
    <button id="help-toggle" 
    on:click={()=>{R.toggleHelpActive()}}>
        ?
    </button>
    <span id="help-text"></span>
</div>

<Settings data={data} />

<About data={data} />

<Loading />

<div id="toolbar">
</div>
