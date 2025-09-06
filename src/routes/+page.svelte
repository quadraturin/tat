<script lang="ts">

    // ###################
    // ##### IMPORTS #####
    // ###################

    // ===== Styles =====
    import '../app.css'

    // ===== Registry =====
    import * as R from '$lib/registry.svelte';

    // ===== Settings =====
    import * as S from '$lib/settings.appSettings';
    import { getUserSettings } from '$lib/settings.userSettings.svelte'
	import { loadUserSettings } from '$lib/settings.loadUserSettings';

    // ===== Modules =====
    import { onMount } from 'svelte'
    import { LogicalSize, Window } from '@tauri-apps/api/window'
    import { getCurrentWindow } from '@tauri-apps/api/window';
	import { tryQuit } from '$lib/quit';

    // ===== Project =====
	import { saveProject } from '$lib/project.saveProject';
	import { loadProject } from '$lib/project.loadProject';
	import { clearProject } from '$lib/project.clearProject';

    // ===== Media =====
	import { readFiles } from '$lib/media.readFiles';
    import { removeSelected } from '$lib/media.removeSelected';
	import { changeMasterOpacity, changeMasterVolume } from '$lib/media.controlMedia';
	import { manageCanvasSounds } from '$lib/media.manageSounds';

    // ===== UI =====
	import { closeAllMenus, toggleAboutMenu, toggleSettingsMenu } from '$lib/ui.menus';

    // ===== Utilities =====
    import { t } from '$lib/util.localization';
	import { help } from '$lib/util.help';
    import { dragDrop } from '$lib/util.dragDrop';
	import { canvasMouseUp, canvasDblClick, canvasMouseDown, canvasMouseMove, canvasWheel } from '$lib/util.canvasObjects.svelte';

    // ===== Menus =====
	import Loading from '$lib/menus/loading.svelte';
	import About from '$lib/menus/about.svelte';
	import Settings from '$lib/menus/settings.svelte';

    // ===== Icons =====
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
	import { listen } from '@tauri-apps/api/event';
	import { browser } from '$app/environment';
	import type { CanvasObject } from '$lib/classes/CanvasObject.svelte';
	import { CanvasImage } from '$lib/classes/CanvasImage.svelte';
	import type { CanvasSound } from '$lib/classes/CanvasSound.svelte';
	

    // #####################
    // ##### VARIABLES #####
    // #####################

    // ===== App Window =====
    const appWindow = getCurrentWindow();

    // ===== App States =====
    let isDirty = $state(R.getisProjectDirty());
    let isAboutMenuOpen = $state(R.getIsAboutMenuOpen());
    let isSettingsMenuOpen = $state(R.getIsSettingsMenuOpen());
    let isHelpActive = $state(R.getIsHelpActive());
    let sidebarHidden = $state(false);

    // ===== Project States =====
    let projectName = $state("");
    let imageList = $state(R.getImages());
    let soundList = $state(R.getSounds());
    let masterVolume = $state(1);
    let masterOpacity = $state(1);


    // ##########################
    // ##### INPUT HANDLING #####
    // ##########################

    /**
     * Triggers when keys are pressed. Handles keyboard shortcuts and controls.
     * @param e The keyDown keyboard event.
     */
    function onKeyDown(e:KeyboardEvent) { 
        let speed:number = getUserSettings().listenerMoveSpeed;
        // key bindings
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
        else if (e.key == "c") R.getCanvas().flyToPoint(R.getListener().x, R.getListener().y);
        // Move the listener
        else if (e.key == "w") {
            if(R.getListener().editable) {
                R.getListener().y = R.getListener().y - speed;
            }
        } else if (e.key == "a") {
            if(R.getListener().editable) { 
                R.getListener().x = R.getListener().x - speed;
            }
        } else if (e.key == "s") {
            if(R.getListener().editable) { 
                R.getListener().y = R.getListener().y + speed;
            }
        } else if (e.key == "d") {
            if(R.getListener().editable) { 
                R.getListener().x = R.getListener().x + speed;
            }
        }
        // Canvas controls
        else if (e.key == "ArrowUp") R.getCanvas().offsetDown(10);
        else if (e.key == "ArrowDown") R.getCanvas().offsetUp(10);
        else if (e.key == "ArrowLeft") R.getCanvas().offsetRight(10);
        else if (e.key == "ArrowRight") R.getCanvas().offsetLeft(10);
        else if (e.key == "-") R.getCanvas().zoom(0.95);
        else if (e.key == "=") R.getCanvas().zoom(1.05);
        else if (e.key == "0") R.getCanvas().zoom();
    }

    /**
     * Triggers when keys are released. Used for proportional scale and delete mode.
     * @param e The keyUp keyboard event.
     */
    function onKeyUp(e:KeyboardEvent) {
        if (e.key=="Shift") {
            if(getUserSettings().proportionalScaleOnByDefault) R.setIsProportionalScaleOn(true);
            else R.setIsProportionalScaleOn(false);
        } 
        else if (e.key == "Alt") R.setIsInDeleteMode(false);
    }


    // #####################
    // ##### INTERFACE #####
    // #####################

    /** Toggle the sidebar show/hide state. */
    function toggleSidebar() {
        sidebarHidden = !sidebarHidden;
    }

    /**
     * Update menu tab visuals
     */
    $effect(()=>{
        isAboutMenuOpen ? 
            document.getElementById("about-button")?.setAttribute('class', 'adaptive selected') : 
            document.getElementById("about-button")?.setAttribute('class', 'adaptive');
        isSettingsMenuOpen ? 
            document.getElementById("settings-button")?.setAttribute('class', 'adaptive selected') : 
            document.getElementById("settings-button")?.setAttribute('class', 'adaptive');
    });

    // ######################
    // ##### INITIALIZE #####
    // ######################

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

        // Set the default project name
        R.setProjectName(S.defaultProjectName);

        // Set up the listener
        R.setListener();

        // Set up the drag-and-drop handler
        dragDrop();

        //document.addEventListener("contextmenu", (e) => e.preventDefault(), false);

        // Canvas setup
        R.setCanvas();

        // Canvas mouse actions
        document.getElementById("canvas")!.addEventListener("dblclick",  (e) => { canvasDblClick(e);  });
        document.getElementById("canvas")!.addEventListener("wheel",     (e) => { canvasWheel(e);     });
        document.getElementById("canvas")!.addEventListener("mousedown", (e) => { canvasMouseDown(e); });
        document.getElementById("canvas")!.addEventListener("mousemove", (e) => { canvasMouseMove(e); });
        document.getElementById("canvas")!.addEventListener("mouseup",   (e) => { canvasMouseUp(e);   })

        // Draggable lists. Have to do it a roundabout way because
        // normal HTML dragover doesn't work if drag-and-drop files are
        // enabled in Tauri. :(
        const browserSounds = document.getElementById("browser-sounds-list");
        const browserImages = document.getElementById("browser-images-list");
        let draggingItem: {element:HTMLElement|null, index:number} = {element:browserSounds, index:0};
        let dragIntervalID = 0;
        let draggingOverItem:{element:Element|null, above:boolean, index:number};

        // Sound list drag start
        browserSounds?.addEventListener("dragstart", (e) => {
            if (draggingItem) {
                draggingItem.element = e.target as HTMLElement;
                draggingItem.element.classList.add("dragging");
                dragIntervalID = setInterval(()=>{dragOver(browserSounds)}, 15);
            }
        });

        // Image list drag start
        browserImages?.addEventListener("dragstart", (e) => {
            if (draggingItem) {
                draggingItem.element = e.target as HTMLElement;
                draggingItem.element.classList.add("dragging");
                dragIntervalID = setInterval(()=>{dragOver(browserImages)}, 15);
            }
        });

        // Sound list drag end
        browserSounds?.addEventListener("dragend", () => { dragEnd(browserSounds); });

        // Image list drag end
        browserImages?.addEventListener("dragend", () => { dragEnd(browserImages); });

        /**
         * Handle the list item drag drop.
         * @param list The list an item's being drag/dropped in.
         */
        function dragEnd(list:Element) {
            if (draggingItem.element) {
                // Stop the dragging loop.
                clearInterval(dragIntervalID);

                // Reset classes.
                draggingItem.element?.classList.remove("dragging");
                document.querySelectorAll("#browser .item")
                    .forEach(item => item.classList.remove("over", "insertAbove", "insertBelow"));

                // If not dropping on anything or dropping an item on itself, return.
                if (!draggingOverItem.element || draggingOverItem.element.id == draggingItem.element.id) return;

                let regItems: Array<CanvasObject> = R.getImages();
                if (list == browserSounds) regItems = R.getSounds();
                // Handle image item.
                let item;
                for (let i = 0; i < regItems.length; i++){
                    if (regItems[i].uuid == draggingItem.element.id.replace("item-","")){
                        item = regItems.splice(i, 1)[0];
                        break;
                    }
                }
                if (item) {
                    for (let i = 0; i < regItems.length; i++){
                        if (regItems[i].uuid == draggingOverItem.element.id.replace("item-","")){
                            if (draggingOverItem.above) regItems.splice(i, 0, item);
                            else regItems.splice(i+1, 0, item);
                            break;
                        }
                    }
                }
                /*
                // If there's an element we're dragging over, splice the relevant list.
                if (draggingOverItem.element) {
                    // Determine the index to splice into: if above, index of item, if below, +1
                    let i = draggingOverItem.above ? draggingOverItem.index : draggingOverItem.index+1;
                    // But if the item getting spliced out is before its destination location, -1
                    i = draggingItem.index < 1 ? i-1 : i;

                    if (list == browserImages) {
                        const img = R.getImages().splice(draggingItem.index, 1)[0];
                        R.getImages().splice(i, 0, img);
                    }
                    else if (list == browserSounds) {
                        const snd = R.getSounds().splice(draggingItem.index, 1)[0];
                        R.getSounds().splice(i, 0, snd);
                    }
                } */
            }
        }

        /**
         * Called repeatedly while user is dragging a list item. Finds the item under the dragged item.
         * @param list The item list to drag over.
         */
        function dragOver(list:HTMLElement) {
            if (list != null) {
                // Find the closest item being dragged over.
                draggingOverItem = getDragOverElement(list);
                console.log(draggingOverItem)

                // Reset classes.
                document.querySelectorAll("#browser .item").forEach(item => item.classList.remove("over", "insertAbove", "insertBelow"));
                
                // Add classes to the relevant item.
                if (draggingItem && draggingOverItem) {
                    draggingOverItem.element?.classList.add("over", draggingOverItem.above ? "insertAbove" : "insertBelow");
                }
            }
        }

        /**
         * Gets the closest item being dragged over, whether to insert above or below, and the item index.
         * @param list The list the item is in.
         */
        function getDragOverElement(list:Element):{element:Element|null, above:boolean, index:number} {
            // Get all sounds not currently being dragged in sound list
            const draggableElements = [...list.querySelectorAll(".item")];
            let closest;
            for (let i = 0; i < draggableElements.length; i++) {
                if (draggableElements[i] == draggingItem.element) draggingItem.index = i;
                const box = draggableElements[i].getBoundingClientRect();
                if (R.getMouse().y > box.y && R.getMouse().y < box.bottom + 5) {
                    let putAbove = false;
                    if (R.getMouse().y < box.y + box.height/2) putAbove = true;
                    return {element:draggableElements[i], above:putAbove, index:i};
                }
            }
            return {element:null, above:false, index:0};
        }
    });

    
    // ############################
    // ##### MAIN UPDATE LOOP #####
    // ############################

    setInterval(() => {
        isDirty = R.getisProjectDirty();
        projectName = R.getProjectName();
        isAboutMenuOpen = R.getIsAboutMenuOpen();
        isSettingsMenuOpen = R.getIsSettingsMenuOpen();
        imageList = R.getImages();
        soundList = R.getSounds();
        isHelpActive = R.getIsHelpActive();
        masterOpacity = R.getMasterOpacity();
        masterVolume = R.getMasterGain().gain.value;
        manageCanvasSounds();
        R.getCanvas().panInertia();
        R.getCanvas().update();
    }, 15);

</script>

<svelte:window
    onkeydown={onKeyDown}
    onkeyup={onKeyUp}
    ondrag={ondrag}
/>

<!-- The Window Titlebar -->
<div data-tauri-drag-region id="titlebar" class="shadow" onwheel={(event) => { event.preventDefault() }}>

    <!-- Project Name -->
    <h1 data-tauri-drag-region  
    onfocus     = {()=>{}} 
    onmouseover = {()=>{isDirty ? help($t('help.titlebar.titleDirty')) : help($t('help.titlebar.title'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <span data-tauri-drag-region class="project-name">{projectName}</span>
        <span data-tauri-drag-region>{#if isDirty}*{/if}</span>
    </h1>

    <!-- Add Media Button -->
    <button class="adaptive"
    onclick     = {readFiles} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.addMedia'), $t('help.titlebar.addMediaShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        {#if R.getIsLoading()}<IconLoading />{:else}<IconImageFile />{/if}
        <span class="text-short">{$t('ui.addMediaShort')}</span>
        <span class="text-full">{$t('ui.addMedia')}</span>
    </button>

    <!-- Save Button -->
    <button class="adaptive l"
    onclick     = {()=>saveProject(false)} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.save'), $t('help.titlebar.saveShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        {#if R.getIsSaving()}<IconLoading />{:else}<IconSave />{/if}
        <span class="text-short">{$t('ui.saveShort')}</span>
        <span class="text-full">{$t('ui.save')}</span>
    </button>

    <!-- Save As Button -->
    <button class="adaptive r"
    onclick     = {()=>saveProject(true)}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.saveAs'), $t('help.titlebar.saveAsShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        {#if R.getIsSaving()}<IconLoading />{:else}<IconSaveAs />{/if}
        <span class="text-short">{$t('ui.saveAsShort')}</span>
        <span class="text-full">{$t('ui.saveAs')}</span>
    </button>

    <!-- Open Project Button -->
    <button class="adaptive l"
    onclick     = {loadProject} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.openProject'), $t('help.titlebar.openProjectShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        {#if R.getIsLoading()}<IconLoading />{:else}<IconLoad />{/if}
        <span class="text-short">{$t('ui.openProjectShort')}</span>
        <span class="text-full">{$t('ui.openProject')}</span>
    </button>

    <!-- New Project Button -->
    <button class="adaptive r"
    onclick     = {clearProject} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.newProject'), $t('help.titlebar.newProjectShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconNew />
        <span class="text-short">{$t('ui.newProjectShort')}</span>
        <span class="text-full">{$t('ui.newProject')}</span>
    </button>

    <!-- Settings Menu Button -->
    <button class="adaptive l" id="settings-button"
    onclick     = {toggleSettingsMenu} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.settings'), $t('help.titlebar.settingsShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconSettings />
        <span class="text-short">{$t('ui.settingsShort')}</span>
        <span class="text-full">{$t('ui.settings')}</span>
    </button>

    <!-- About Menu Button -->
    <button class="adaptive r" id="about-button" 
    onclick     = {toggleAboutMenu} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.about'), $t('help.titlebar.aboutShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconAbout />
        <span class="text-short">{$t('ui.aboutShort')}</span>
        <span class="text-full">{$t('ui.about')}</span>
    </button>

    <!-- Spacer -->
    <div data-tauri-drag-region class="spacer"></div>

    <!-- Minimize Button -->
    <button class="window-button" id="titlebar-minimize" title="minimize" aria-label="minimize"
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.minimize'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconMinimize />
    </button>

    <!-- Maximize Button -->
    <button class="window-button" id="titlebar-maximize" title="maximize" aria-label="maximize"
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.maximize'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconMaximize />
    </button>

    <!-- Quit Button -->
    <button class="window-button" id="titlebar-close" title="close" aria-label="close"
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.close'), $t('help.titlebar.closeShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconQuit />
    </button>
</div>


<!-- The Infinite Canvas -->
<div class="container">
    <canvas id="canvas"></canvas>
</div>


<!-- The Sidebar Controls -->
<div id="controls" class="shadow" class:sidebarHidden onwheel={(event) => {event.preventDefault(); }}>

    <!-- Zoom In -->
    <button id="zoom-in" class="l"
    onclick     = {()=>{R.getCanvas().zoom(1.05)}}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.map.zoomIn'), $t('help.map.zoomInShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconZoomIn/>
    </button>

    <!-- Zoom Out -->
    <button id="zoom-out" class="r"
    onclick     = {()=>{R.getCanvas().zoom(0.95)}}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.map.zoomOut'), $t('help.map.zoomOutShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconZoomOut/>
    </button>

    <!-- Recenter On Listener -->
    <button id="recenter"
    onclick     = {()=>{R.getCanvas().flyToPoint(R.getListener().x, R.getListener().y)}}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.map.recenter'), $t('help.map.recenterShortcut'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconRecenter/>
    </button>
    
    <!-- Sidebar Hide/Show Toggle -->
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


<!-- The Sidebar Media Browser -->
<div id="browser" class="shadow" class:sidebarHidden>

    <!-- The Sounds Browser -->
    <div id="browser-sounds">

        <!-- Sound List Header -->
        <div role="heading" class="heading" aria-level="2" 
        onwheel={(event) => {
            event.preventDefault(); 
            changeMasterVolume(event);
        }}>

            <!-- Master Volume -->
            <div id="master-volume">
                <div id="master-volume-bar" style={"height:" + (masterVolume * 100) + "%"}></div>
            </div>

            <!-- Sound List Title -->
            <span role="heading" aria-level="3"
            onfocus     = {()=>{}} 
            onblur      = {()=>{}}
            onmouseout  = {()=>{help()}}
            onmouseover = {()=>{help($t('help.map.soundsTitle'))}}>
            {$t('ui.sounds')}
            </span>

            <!-- Sound List Show/Hide Toggle -->
            <button class="browser-heading-button" id="hide-sounds-toggle" class:R.getSoundsHidden()
            onclick     = {()=>{
                R.toggleSoundsHidden();
                R.getSoundsHidden() ? help($t('help.map.soundsShow')) : help($t('help.map.soundsHide'))}}
            onfocus     = {()=>{}} 
            onblur      = {()=>{}}
            onmouseout  = {()=>{help()}}
            onmouseover = {()=>{
                R.getSoundsHidden() ? help($t('help.map.soundsShow')) : help($t('help.map.soundsHide'))
            }}>
                {#if R.getSoundsHidden()}<IconEye/>{:else}<IconEyeOff/>{/if}
            </button>
        </div>

        <!-- List Of Sounds -->
         <div id="browser-sounds-list">
            {#each soundList as item, i }
                <SoundListItem item={item} i={i} />
            {/each}
        </div>
    </div>

    <!-- The Images Browser -->
    <div id="browser-images">

        <!-- Images List Header -->
        <div role="heading" class="heading" aria-level="2" onwheel={(event) => {
            event.preventDefault(); 
            changeMasterOpacity(event);
        }}>

            <!-- Master Opacity -->
            <div id="master-opacity">
                <div id="master-opacity-bar" style={"height:" + (masterOpacity * 100) + "%"}></div>
            </div>

            <!-- Image List Title -->
            <span role="heading" aria-level="3"
            onfocus     = {()=>{}} 
            onmouseover = {()=>{help($t('help.map.imagesTitle'))}}
            onmouseout  = {()=>{help()}}
            onblur      = {()=>{}}>
                {$t('ui.images')}
            </span>

            <!-- Image List Show/Hide Toggle -->
            <button class="browser-heading-button" id="hide-images-toggle"  class:R.getImagesHidden()
            onclick={()=>{
                R.toggleImagesHidden()
                R.getImagesHidden() ? help($t('help.map.imagesShow')) : help($t('help.map.imagesHide'))}}
            onfocus={()=>{}} 
            onblur={()=>{}}
            onmouseout={()=>{help()}}
            onmouseover = {()=>{
                R.getImagesHidden() ? help($t('help.map.imagesShow')) : help($t('help.map.imagesHide'))
            }}>
                {#if R.getImagesHidden()}<IconEye/>{:else}<IconEyeOff/>{/if}
            </button>
        </div>

        <!-- The Images List -->
         <div id="browser-images-list">
            {#each imageList as item, i}
                <ImageListItem item={item} i={i} />
            {/each}
        </div>
    </div>
</div>


<!-- Help Text Display Area -->
<div id="help" class="shadow" class:activated={isHelpActive}>

    <!-- Help Text Show / Hide Toggle -->
    <button id="help-toggle" onclick={()=>{R.toggleHelpActive()}}> ? </button>

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
<div id="toolbar"></div>
