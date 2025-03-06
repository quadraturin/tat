<script lang="ts">


    /**
     * Imports
     */

    // styles
    import 'leaflet/dist/leaflet.css'
    import 'leaflet-contextmenu/dist/leaflet.contextmenu.css'
    import '../app.css'

    // modules
    import * as R from '$lib/registry.svelte';
    import * as S from '$lib/settings.appSettings';
    import L from "leaflet";
    import * as H from 'howler';
    import { onMount } from 'svelte'
    import { LogicalSize } from '@tauri-apps/api/window'
    import { getCurrentWindow } from '@tauri-apps/api/window';
	import { tryQuit } from '$lib/quit';

    // init
	import { setupMap } from '$lib/init.setupMap';
	import { setupListener } from '$lib/init.setupListener';

    // project
	import { saveProject } from '$lib/project.saveProject';
	import { loadProject } from '$lib/project.loadProject';
	import { clearProject } from '$lib/project.clearProject';

    // media
	import { readFiles } from '$lib/media.readFiles';
    import { removeSelected } from '$lib/media.removeSelected';
	import { changeMasterVolume } from '$lib/media.controlSound';
	import { setMapSoundVolumes } from '$lib/media.setMapSoundVolumes';

    // ui
	import { closeAllMenus, toggleAboutMenu, toggleSettingsMenu } from '$lib/ui.menus';

    // util
    import { t } from '$lib/util.localization';
	import { help } from '$lib/util.help';
    import { dragDrop } from '$lib/util.dragDrop';

    // settings
    import { getUserSettings } from '$lib/settings.userSettings.svelte'
	import { loadUserSettings } from '$lib/settings.loadUserSettings';

    // menus
	import Loading from '$lib/menus/loading.svelte';
	import About from '$lib/menus/about.svelte';
	import Settings from '$lib/menus/settings.svelte';

    // icons
    import IconLoading from '$lib/icons/iconLoading.svelte';
	import IconSettings from '$lib/icons/iconSettings.svelte';
	import IconSave from '$lib/icons/iconSave.svelte';
    import IconLoad from '$lib/icons/iconLoad.svelte';
    import IconImageFile from '$lib/icons/iconImageFile.svelte';
    import IconSaveAs from '$lib/icons/iconSaveAs.svelte';
    import IconNew from '$lib/icons/iconNew.svelte'
	import IconAbout from '$lib/icons/iconAbout.svelte';
	import IconZoomIn from '$lib/icons/iconZoomIn.svelte';
	import IconZoomOut from '$lib/icons/iconZoomOut.svelte';
	import IconRecenter from '$lib/icons/iconRecenter.svelte';
	import IconCollapse from '$lib/icons/iconCollapse.svelte';
	import IconExpand from '$lib/icons/iconExpand.svelte';
    import IconEye from '$lib/icons/iconEye.svelte';
    import IconEyeOff from '$lib/icons/iconEyeOff.svelte';
	import IconMinimize from '$lib/icons/IconMinimize.svelte';
	import IconMaximize from '$lib/icons/iconMaximize.svelte';
	import IconQuit from '$lib/icons/iconQuit.svelte';
	import SoundListItem from '$lib/fragments/soundListItem.svelte';
	import ImageListItem from '$lib/fragments/imageListItem.svelte';
	import { image } from '@tauri-apps/api';

    import { InfiniteCanvas } from '$lib/util.infiniteCanvas.svelte';

    /**
     * Variables
     */

    const appWindow = getCurrentWindow();

    let isDirty = $state(R.getisProjectDirty());
    let isAboutMenuOpen = $state(R.getIsAboutMenuOpen());
    let isSettingsMenuOpen = $state(R.getIsSettingsMenuOpen());
    let isHelpActive = $state(R.getIsHelpActive());
    let projectName = $state("");
    let imageList = $state(R.getImageList());
    let soundList = $state(R.getSoundList());
    let masterVolume = $state(H.Howler.volume());
    let sidebarHidden = $state(false);
    let imagesHidden = $state(false);
    let soundsHidden = $state(false);

    /**
     * Triggers when keys are pressed. Handles keyboard shortcuts and controls.
     * @param e
     */
    function onKeyDown(e:KeyboardEvent) { 
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
        else if (e.key == "i" && (e.metaKey || e.ctrlKey)) readFiles();
        else if (e.key == "w" && (e.metaKey || e.ctrlKey)) tryQuit();
        else if (e.key == "m" && (e.metaKey || e.ctrlKey)) appWindow.minimize();
        else if (e.key == "m" && e.shiftKey && (e.metaKey || e.ctrlKey)) appWindow.maximize();
        else if (e.key == "1" && (e.metaKey || e.ctrlKey)) toggleSettingsMenu();
        else if (e.key == "2" && (e.metaKey || e.ctrlKey)) toggleAboutMenu();
        else if (e.key == 'Escape') closeAllMenus();
        else if (e.key == "h") toggleSidebar();
        else if (e.key == "c") R.getMap().flyTo(R.getListener().getLatLng());
        // using unary + here to prevent weird concat issues
        else if (e.key == "w") 
            R.getListener().setLatLng([R.getListener().getLatLng().lat + +speed, R.getListener().getLatLng().lng]);
        else if (e.key == "a") 
            R.getListener().setLatLng([R.getListener().getLatLng().lat, R.getListener().getLatLng().lng - +speed]);
        else if (e.key == "s") 
            R.getListener().setLatLng([R.getListener().getLatLng().lat - +speed, R.getListener().getLatLng().lng]);
        else if (e.key == "d") 
            R.getListener().setLatLng([R.getListener().getLatLng().lat, R.getListener().getLatLng().lng + +speed]);
        // canvas controls
        else if (e.key == "ArrowUp") R.getCanvas().offsetDown(10);
        else if (e.key == "ArrowDown") R.getCanvas().offsetUp(10);
        else if (e.key == "ArrowLeft") R.getCanvas().offsetRight(10);
        else if (e.key == "ArrowRight") R.getCanvas().offsetLeft(10);
        else if (e.key == "-") R.getCanvas().zoom(0.95);
        else if (e.key == "=") R.getCanvas().zoom(1.05);
        else if (e.key == "0") R.getCanvas().zoom();
    }

    /**
     * Triggers when keys are released. Used for controlling proportional scale and delete mode.
     * @param e
     */
    function onKeyUp(e:KeyboardEvent) {
        if (e.key=="Shift") {
            if(getUserSettings().proportionalScaleOnByDefault) R.setIsProportionalScaleOn(true);
            else R.setIsProportionalScaleOn(false);
        } 
        else if (e.key == "Alt") R.setIsInDeleteMode(false);
    }

    /**
     * Show/hide the sidebar.
     */
    function toggleSidebar() {
        sidebarHidden = !sidebarHidden;
    }

    /**
     * Initialize
     */
    
    onMount( () => 
    {
        // Set minimum window size
        appWindow.setMinSize(new LogicalSize(480,320));

        // Load the user's settings, or, if none, the defaults, then set the theme.
        loadUserSettings().then(()=>{R.setTheme(getUserSettings().theme)})
        
        // Set up title bar window controls
        const titlebarMinimize = document.getElementById('titlebar-minimize') as HTMLElement;
        titlebarMinimize.addEventListener('click', () => appWindow.minimize());
        const titlebarMaximize = document.getElementById('titlebar-maximize') as HTMLElement;
        titlebarMaximize.addEventListener('click', () => appWindow.toggleMaximize());
        const titlebarClose = document.getElementById('titlebar-close') as HTMLElement;
        titlebarClose.addEventListener('click', () => tryQuit());
        
        // Override so circle scaling doesn't break when using L.CRS.Simple map coordinates
        L.LatLng.prototype.distanceTo = function (currentPostion:L.LatLng) 
        {
            var dx = currentPostion.lng - this.lng;
            var dy = currentPostion.lat - this.lat;
            return Math.sqrt(dx*dx + dy*dy);
        }

        // Set the default project name
        R.setProjectName(S.defaultProjectName);

        // Set up the map
        R.setMap(setupMap());

        // Set up the listener
        R.setListener(setupListener(R.getMap()));

        // Set up the drag-and-drop handler
        dragDrop();

        //document.addEventListener("contextmenu", (e) => e.preventDefault(), false);

        // Infinite canvas setup
        R.setCanvas();

        // Infinite canvas zoom
        document.getElementById("canvas")!
        .addEventListener("wheel", (e) => {
            if (e.deltaY < 0){
                R.getCanvas().zoom(1.01);
            } else if (e.deltaY > 0) {
                R.getCanvas().zoom(0.99)
            }
        });

        // Infinite canvas pan
        document.getElementById("canvas")!
        .addEventListener("mousedown", (e) => {
            R.startPanning(e.clientX, e.clientY);
        });

        document.getElementById("canvas")!
        .addEventListener("mousemove", (e) => {
            if (R.getPanning()) {
                //console.log(e.clientX, e.clientY);
                R.getCanvas().pan(R.getPanLastX(), R.getPanLastY(), e.clientX, e.clientY);
                R.setPanLastX(e.clientX);
                R.setPanLastY(e.clientY);
                //R.startPanning(e.clientX, e.clientY);
            }
        });

        document.getElementById("canvas")!
        .addEventListener("mouseup", () => {
            R.stopPanning();
        });

        document.getElementById("zoom-in")!
        .addEventListener("click", () => R.getCanvas().zoom(1.05));

        document.getElementById("zoom-out")!
        .addEventListener("click", () => R.getCanvas().zoom(0.95));

        document.getElementById("move-left")!
        .addEventListener("click", () => R.getCanvas().offsetLeft(10));

        document.getElementById("move-right")!
        .addEventListener("click", () => R.getCanvas().offsetRight(10));

        document.getElementById("move-up")!
        .addEventListener("click", () => R.getCanvas().offsetUp(10));

        document.getElementById("move-down")!
        .addEventListener("click", () => R.getCanvas().offsetDown(10));

    })

    /**
     * Update menu tab visuals
     */

    $effect(()=>{
        isAboutMenuOpen ? 
            document.getElementById("about-button")?.setAttribute('class', 'toolbar-button selected') : 
            document.getElementById("about-button")?.setAttribute('class', 'toolbar-button');
        isSettingsMenuOpen ? 
            document.getElementById("settings-button")?.setAttribute('class', 'toolbar-button selected') : 
            document.getElementById("settings-button")?.setAttribute('class', 'toolbar-button');
    });
    
    /**
     * Main update loop
     */

    setInterval(() => {
        masterVolume = H.Howler.volume();
        isDirty = R.getisProjectDirty();
        projectName = R.getProjectName();
        isAboutMenuOpen = R.getIsAboutMenuOpen();
        isSettingsMenuOpen = R.getIsSettingsMenuOpen();
        imageList = R.getImageList();
        soundList = R.getSoundList();
        isHelpActive = R.getIsHelpActive();
        setMapSoundVolumes();
    }, 15);

</script>

<svelte:window
    onkeydown={onKeyDown}
    onkeyup={onKeyUp}
    ondrag={ondrag}
/>



<!-- The Window Titlebar -->

<div data-tauri-drag-region class="titlebar" onwheel={(event) => { event.preventDefault() }}>

    <!-- Project Name -->
    <h1 data-tauri-drag-region  
    onfocus     = {()=>{}} 
    onmouseover = {()=>{isDirty ? help($t('help.titlebar.titleDirty')) : help($t('help.titlebar.title'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <span data-tauri-drag-region class="project-name">{projectName}</span>
        <span data-tauri-drag-region>{#if isDirty}*{/if}</span>
    </h1>

    <!-- Spacer -->
    <span data-tauri-drag-region class="toolbar-spacer"></span>

    <!-- Add Media Button -->
    <button class="toolbar-button" 
    onclick     = {readFiles} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.addMedia'), $t('help.titlebar.addMediaShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        {#if R.getIsLoading()}<IconLoading />{:else}<IconImageFile />{/if}
        <span class="button-title-short">{$t('ui.addMediaShort')}</span>
        <span class="button-title-full">{$t('ui.addMedia')}</span>
    </button>
    
    <!-- Spacer -->
    <span data-tauri-drag-region class="toolbar-spacer"></span>

    <!-- Save Button -->
    <button class="toolbar-button button-l"
    onclick     = {()=>saveProject(false)} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.save'), $t('help.titlebar.saveShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        {#if R.getIsSaving()}<IconLoading />{:else}<IconSave />{/if}
        <span class="button-title-short">{$t('ui.saveShort')}</span>
        <span class="button-title-full">{$t('ui.save')}</span>
    </button>

    <!-- Save As Button -->
    <button class="toolbar-button button-r"
    onclick     = {()=>saveProject(true)}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.saveAs'), $t('help.titlebar.saveAsShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        {#if R.getIsSaving()}<IconLoading />{:else}<IconSaveAs />{/if}
        <span class="button-title-short">{$t('ui.saveAsShort')}</span>
        <span class="button-title-full">{$t('ui.saveAs')}</span>
    </button>

    <!-- Spacer -->
    <span data-tauri-drag-region class="toolbar-spacer"></span>

    <!-- Open Project Button -->
    <button class="toolbar-button button-l"
    onclick     = {loadProject} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.openProject'), $t('help.titlebar.openProjectShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        {#if R.getIsLoading()}<IconLoading />{:else}<IconLoad />{/if}
        <span class="button-title-short">{$t('ui.openProjectShort')}</span>
        <span class="button-title-full">{$t('ui.openProject')}</span>
    </button>

    <!-- New Project Button -->
    <button class="toolbar-button button-r"
    onclick     = {clearProject} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.newProject'), $t('help.titlebar.newProjectShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconNew />
        <span class="button-title-short">{$t('ui.newProjectShort')}</span>
        <span class="button-title-full">{$t('ui.newProject')}</span>
    </button>

    <!-- Spacer -->
    <span data-tauri-drag-region class="toolbar-spacer"></span>

    <!-- Settings Menu Button -->
    <button class="toolbar-button button-l" id="settings-button"
    onclick     = {toggleSettingsMenu} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.settings'), $t('help.titlebar.settingsShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconSettings />
        <span class="button-title-short">{$t('ui.settingsShort')}</span>
        <span class="button-title-full">{$t('ui.settings')}</span>
    </button>

    <!-- Spacer -->
    <span data-tauri-drag-region class="toolbar-spacer"></span>

    <!-- About Menu Button -->
    <button class="toolbar-button button-r" id="about-button" 
    onclick     = {toggleAboutMenu} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.about'), $t('help.titlebar.aboutShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconAbout />
        <span class="button-title-short">{$t('ui.aboutShort')}</span>
        <span class="button-title-full">{$t('ui.about')}</span>
    </button>

    <!-- Spacer -->
    <div data-tauri-drag-region class="titlebar-drag"></div>

    <!-- Minimize Button -->
    <button class="titlebar-button" id="titlebar-minimize" title="minimize" aria-label="minimize"
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.minimize'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconMinimize />
    </button>

    <!-- Maximize Button -->
    <button class="titlebar-button" id="titlebar-maximize" title="maximize" aria-label="maximize"
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.maximize'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconMaximize />
    </button>

    <!-- Quit Button -->
    <button class="titlebar-button" id="titlebar-close" title="close" aria-label="close"
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.close'), $t('help.titlebar.closeShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconQuit />
    </button>
</div>




<!-- The Map -->

<div id="map-wrapper" class:imagesHidden class:soundsHidden style="display:none;">
    <div id="map"></div>
</div>

<div class="container">
    <canvas id="canvas"></canvas>

    <div id="controls">
        <button type="button" id="zoom-in">+</button>
        <button type="button" id="zoom-out">-</button>
        <button type="button" id="move-left">&lt;</button>
        <button type="button" id="move-right">&gt;</button>
        <button type="button" id="move-up">^</button>
        <button type="button" id="move-down">v</button>
    </div>
</div>

<!-- The Sidebar Controls -->
<!--
<div id="controls" class:sidebarHidden onwheel={(event) => {
    event.preventDefault(); 
}}>

    <button id="zoom-in" class="button-l"
    onclick     = {()=>{R.getMap().zoomIn()}}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.map.zoomIn'), $t('help.map.zoomInShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconZoomIn/>
    </button>

    <button id="zoom-out" class="button-r"
    onclick     = {()=>{R.getMap().zoomOut()}}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.map.zoomOut'), $t('help.map.zoomOutShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconZoomOut/>
    </button>

    <div class="control-spacer"></div>

    <button id="recenter"
    onclick     = {()=>{R.getMap().flyTo(R.getListener().getLatLng())}}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.map.recenter'), $t('help.map.recenterShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconRecenter/>
    </button>
    
    <div class="control-spacer"></div>
    
    <button id="hide-show"
    onclick     = {toggleSidebar}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{
        sidebarHidden? 
            help($t('help.map.showSidebar'), $t('help.map.toggleSidebarShortcut')) : 
            help($t('help.map.hideSidebar'), $t('help.map.toggleSidebarShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        {#if sidebarHidden}<IconExpand/>{:else}<IconCollapse/>{/if}
    </button>
</div>
-->


<!-- The Sidebar Media Browser -->

{#if (soundList.length>0 || imageList.length>0)}
<div id="browser" class:sidebarHidden>
    {#if soundList.length>0}

        <!-- The Sounds Browser -->
        <div id="browser-sounds">
            {#each soundList as item, i }
                <SoundListItem item={item} i={i} />
            {/each}

            <!-- Sound List Header -->
            <div role="heading" class="browser-heading" aria-level="2" 
            onwheel={(event) => {
                event.preventDefault(); 
                changeMasterVolume(event);
            }}>

                <!-- Master Volume -->
                <div id="master-volume">
                    <div id="master-volume-bar" style={"height:"+(masterVolume*100)+"%"}></div>
                </div>

                <!-- Sound List Title -->
                <span role="heading" aria-level="3"
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseout  = {()=>{help()}}
                onmouseover = {()=>{help($t('help.map.soundsTitle'))}}>
                {$t('ui.sounds')}
                </span>

                <!-- Sound List Show / Hide Toggle -->
                <button class="browser-heading-button" id="hide-sounds-toggle" class:soundsHidden
                onclick     = {()=>{
                    soundsHidden = !soundsHidden;
                    soundsHidden ? help($t('help.map.soundsShow')) : help($t('help.map.soundsHide'))}}
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseout  = {()=>{help()}}
                onmouseover = {()=>{
                    soundsHidden ? help($t('help.map.soundsShow')) : help($t('help.map.soundsHide'))
                }}>
                    {#if soundsHidden}<IconEye/>{:else}<IconEyeOff/>{/if}
                </button>
            </div>
        </div>
    {/if}

    <!-- The Images Browser -->
    {#if imageList.length > 0}
        <div id="browser-images">
            {#each imageList as item, i}
                <ImageListItem item={item} i={i} />
            {/each}

            <!-- Image List Heading -->
            <div role="heading" class="browser-heading" aria-level="2"onwheel={(event) => {
                event.preventDefault();
            }}>

                <!-- Image List Title -->
                <span role="heading" aria-level="3"
                onfocus     = {()=>{}} 
                onmouseover = {()=>{help($t('help.map.imagesTitle'))}}
                onmouseout  = {()=>{help()}}
                onblur      = {()=>{}}>
                    {$t('ui.images')}
                </span>

                <!-- Image List Show / Hide Toggle -->
                <button class="browser-heading-button" id="hide-images-toggle"  class:imagesHidden
                onclick={()=>{
                    imagesHidden = !imagesHidden;
                    imagesHidden ? help($t('help.map.imagesShow')) : help($t('help.map.imagesHide'))}}
                onfocus={()=>{}} 
                onblur={()=>{}}
                onmouseout={()=>{help()}}
                onmouseover = {()=>{
                    imagesHidden ? help($t('help.map.imagesShow')) : help($t('help.map.imagesHide'))
                }}>
                    {#if imagesHidden}<IconEye/>{:else}<IconEyeOff/>{/if}
                </button>
            </div>
        </div>
    {/if}
</div>
{/if}


<!-- Help Text Display Area -->

<div id="help" class:activated={isHelpActive}>

    <!-- Help Text Show / Hide Toggle -->
    <button id="help-toggle" 
    onclick={()=>{R.toggleHelpActive()}}>
        ?
    </button>

    <!-- Help Text -->
    <span id="help-text"></span>
</div>



<!-- Settings Menu -->

<Settings />



<!-- About Menu -->

<About />



<!-- Loading Menu -->

<Loading />



<!-- Window Toolbar -->

<div id="toolbar">
</div>
