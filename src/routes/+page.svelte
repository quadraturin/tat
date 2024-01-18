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
	import Settings from '$lib/menus/settings.svelte';
	import { tryQuit } from '$lib/quit';
	import Loading from '$lib/menus/loading.svelte';
	import { toggleMute, toggleSolo } from '$lib/media.mixSound';
	import { removeImage } from '$lib/media.removeImage';
	import { removeSound } from '$lib/media.removeSound';
	import { duplicateImage } from '$lib/media.loadImage';
	import { cycleSoundType, duplicateSound, toggleSoundEdit } from '$lib/media.loadSound';
	import { changeBaseVolume, seekToByClick, togglePause } from '$lib/media.controlSound';
	import { changeOpacity } from '$lib/media.controlOpacity';
	import IconSoundGlobal from '$lib/icons/iconSoundGlobal.svelte';
	import IconSoundLocal from '$lib/icons/iconSoundLocal.svelte';
	import IconSoundArea from '$lib/icons/iconSoundArea.svelte';
	import IconSoundPause from '$lib/icons/iconSoundPause.svelte';
	import { help } from '$lib/util.help';
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
    let isHelpActive = false;
    let projectName:string;
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

        // load text
        R.setText();

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

    $: isDirty = R.getisProjectDirty();

    $: imageList = R.getImageList();

    $: soundList = R.getSoundList();

    $: isHelpActive = R.getIsHelpActive();

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
    on:mouseover={()=>{isDirty ? help(R.t.help.titlebar.titleDirty) : help(R.t.help.titlebar.title)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        <span data-tauri-drag-region class="project-name">{projectName}</span>
        <span data-tauri-drag-region>{#if isDirty}*{/if}</span>
    </h1>
    
    <button class="toolbar-button" title="add media" 
    on:click={readFiles} 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(R.t.help.titlebar.addMedia)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        {#if R.getIsLoading()}<IconLoading />{:else}<IconImageFile />{/if}
        <span class="button-title-short"><span>m</span>ed</span>
        <span class="button-title-full">add <span>m</span>edia</span>
    </button>
    
    <button class="toolbar-button" title="save" 
    on:click={() => saveProject(false)} 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(R.t.help.titlebar.save)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        {#if R.getIsSaving()}<IconLoading />{:else}<IconSave />{/if}
        <span class="button-title-short"><span>s</span>av</span>
        <span class="button-title-full"><span>s</span>ave</span>
    </button>
    
    <button class="toolbar-button"  title="save as" 
    on:click={() => saveProject(true)}
    on:focus={()=>{}} 
    on:mouseover={()=>{help(R.t.help.titlebar.saveAs)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        {#if R.getIsSaving()}<IconLoading />{:else}<IconSaveAs />{/if}
        <span class="button-title-short"><span>S</span>va</span>
        <span class="button-title-full"><span>S</span>ave as</span>
    </button>
    
    <span data-tauri-drag-region class="toolbar-spacer"></span>
    
    <button class="toolbar-button"  title="open project" 
    on:click={loadProject} 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(R.t.help.titlebar.openProject)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        {#if R.getIsLoading()}<IconLoading />{:else}<IconLoad />{/if}
        <span class="button-title-short"><span>o</span>pn</span>
        <span class="button-title-full"><span>o</span>pen</span>
    </button>
    
    <button class="toolbar-button"  title="new project" 
    on:click={clearProject} 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(R.t.help.titlebar.newProject)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
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

    <button class="toolbar-button" id="about-button"  title="about" 
    on:click={toggleAboutMenu} 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(R.t.help.titlebar.about)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        <IconAbout />
        <span class="button-title-short">a<span>b</span>t</span>
        <span class="button-title-full">a<span>b</span>out</span>
    </button>
    
    <!--<input accept="audio/wav, audio/mpeg" bind:files id="audioInput" name="audioInput" type="file" />-->

    <div data-tauri-drag-region class="titlebar-drag"></div>
    
    <button class="titlebar-button" id="titlebar-minimize" title="minimize" 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(R.t.help.titlebar.minimize)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g transform="rotate(-90 12 12)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M10 12L13 9M10 12L13 15"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="6;0"/></path></g></g></svg>
    </button>

    <button class="titlebar-button" id="titlebar-maximize" title="maximize" 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(R.t.help.titlebar.maximize)}}
    on:mouseout={()=>{help()}}
    on:blur={()=>{}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g transform="rotate(-90 12 12) translate(24 0) scale(-1 1)"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M10 12L13 9M10 12L13 15"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="6;0"/></path></g></g></svg>
    </button>

    <button class="titlebar-button" id="titlebar-close" title="close" 
    on:focus={()=>{}} 
    on:mouseover={()=>{help(R.t.help.titlebar.close)}}
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

<div id="browser">
    {#if soundList.length>0}
        <div id="browser-sounds">
            {#each soundList as item, i }
                <div class="item sound-item" class:selected={R.getIsSelected(item.emitter)} class:locked={!item.emitter.editEnabled()} id="sound-item-{i}" 
                on:wheel|preventDefault={(event) => changeBaseVolume(item, event)} >

                    <div class="volume" style={"height: "+(item.volume*100)+"%"}></div>

                    <button class="item-name" 
                    on:click={() => {R.toggleSelected(item.emitter)}}
                    on:dblclick={() => { if(item.soundType != S.SOUNDTYPE_GLOBAL) toggleSoundEdit(item.emitter);}}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{
                        if (item.soundType == S.SOUNDTYPE_GLOBAL) {
                            help(R.t.help.map.soundTypeGlobal, R.t.help.map.soundItemActions);
                        } else if (R.getIsSelected(item.emitter)) {
                            if (item.soundType == S.SOUNDTYPE_AREA) help(R.t.help.map.selected, R.t.help.map.soundTypeArea, R.t.help.map.soundItemActions, R.t.help.map.itemSelectedActions);
                            else help(R.t.help.map.selected, R.t.help.map.soundTypeLocal, R.t.help.map.soundItemActions, R.t.help.map.itemSelectedActions);
                        } else if (!item.emitter.editEnabled()) {
                            if (item.soundType == S.SOUNDTYPE_AREA) help(R.t.help.map.locked, R.t.help.map.soundTypeArea, R.t.help.map.itemLocked, R.t.help.map.soundItemActions, R.t.help.map.itemLockedActions);
                            else help(R.t.help.map.locked, R.t.help.map.soundTypeLocal, R.t.help.map.itemLocked, R.t.help.map.soundItemActions, R.t.help.map.itemLockedActions);
                        } else {
                            if (item.soundType == S.SOUNDTYPE_AREA) help(R.t.help.map.soundTypeArea, R.t.help.map.soundItemActions, R.t.help.map.itemUnselectedActions);
                            else help(R.t.help.map.soundTypeLocal, R.t.help.map.soundItemActions, R.t.help.map.itemUnselectedActions);
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
                        if (item.soundType == S.SOUNDTYPE_AREA) help(R.t.help.map.soundTypeArea, R.t.help.map.soundTypeAreaActions);
                        else if (item.soundType == S.SOUNDTYPE_GLOBAL) help(R.t.help.map.soundTypeGlobal, R.t.help.map.soundTypeGlobalActions);
                        else help(R.t.help.map.soundTypeLocal, R.t.help.map.soundTypeLocalActions)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        {#if item.soundType == S.SOUNDTYPE_AREA}<IconSoundArea/>{:else if item.soundType == S.SOUNDTYPE_GLOBAL}<IconSoundGlobal/>{:else}<IconSoundLocal/>{/if}
                    </button>
                    
                    <button class="item-button item-pause" class:activated={!item.sound.playing()}  
                    on:click={() => togglePause(item)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{item.sound.playing() ? help(R.t.help.map.soundPause) : help(R.t.help.map.soundUnPause)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        <IconSoundPause/>
                    </button>
                    
                    <button class="item-button item-mute" class:activated={item.muted} 
                    on:click={() => toggleMute(i)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{item.muted? help(R.t.help.map.soundMute) : help(R.t.help.map.soundUnMute)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        M
                    </button>
                    
                    <button class="item-button item-solo" class:activated={item.solo} 
                    on:click={() => toggleSolo(i)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{item.solo ? help(R.t.help.map.soundUnSolo) : help(R.t.help.map.soundSolo)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        S
                    </button>
                    
                    <button class="item-button item-add" 
                    on:click={() => duplicateSound(item)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{help(R.t.help.map.soundDuplicate)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        +
                    </button>
                    
                    <button class="item-button item-delete" 
                    on:click={() => removeSound(i)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{help(R.t.help.map.soundDelete)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        ×
                    </button>
                    
                    <button class="sound-item-progress-track" 
                    bind:this={soundTrack} 
                    on:mousemove={handleMousemove} 
                    on:click={() => seekToByClick(item, soundTrack, mousePos.x)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{help(R.t.help.map.soundSeek)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        <div style={"width: "+((item.sound.seek()/item.sound.duration())*100).toString()+"%"} class="sound-item-progress-bar"></div>
                    </button>
                </div>
            {/each}
            <div role="heading" aria-level="2" 
            on:focus={()=>{}} 
            on:mouseover={()=>{help(R.t.help.map.soundsTitle)}}
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
                    on:focus={()=>{}} 
                    on:mouseover={()=>{
                        if (R.getIsSelected(item.rect)) help(R.t.help.map.selected, R.t.help.map.image, R.t.help.map.imageItemActions, R.t.help.map.itemSelectedActions);
                        else if (!item.rect.editEnabled()) help(R.t.help.map.locked, R.t.help.map.image, R.t.help.map.imageItemActions, R.t.help.map.itemLockedActions);
                        else help(R.t.help.map.image, R.t.help.map.imageItemActions, R.t.help.map.itemUnselectedActions)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        {item.data.name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim()}
                    </button>

                    <button class="item-button item-add" title="duplicate image" 
                    on:click={() => duplicateImage(item)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{help(R.t.help.map.imageDuplicate)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        +
                    </button>
                    
                    <button class="item-button item-delete" title="delete image" 
                    on:click={() => removeImage(i)}
                    on:focus={()=>{}} 
                    on:mouseover={()=>{help(R.t.help.map.imageDelete)}}
                    on:mouseout={()=>{help()}}
                    on:blur={()=>{}}>
                        ×
                    </button>
                </div>
            {/each}

            <div role="heading" aria-level="2" 
            on:focus={()=>{}} 
            on:mouseover={()=>{help(R.t.help.map.imagesTitle)}}
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

<Settings />

<About />

<Loading />

<div id="toolbar">
</div>
