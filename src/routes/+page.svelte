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
    import { getUserSettings, userSettings } from '$lib/settings.userSettings.svelte'
	import { loadUserSettings } from '$lib/settings.loadUserSettings';

    // ===== Modules =====
    import { onMount } from 'svelte'
    import { LogicalSize, Window } from '@tauri-apps/api/window'
    import { getCurrentWindow } from '@tauri-apps/api/window';

    // ===== Project =====
	import { saveProject } from '$lib/project.saveProject';
	import { loadProject } from '$lib/project.loadProject';
	import { clearProject } from '$lib/project.clearProject';

    // ===== Media =====
	import { readFiles } from '$lib/media.readFiles';
    import { tryRemoveSelected } from '$lib/media.remove';
	import { changeMasterOpacity, changeMasterVolume } from '$lib/media.controlMedia';
	import { manageCanvasSounds } from '$lib/media.manageSounds';

    // ===== UI =====
	import { closeAllMenus, toggleAboutMenu, toggleSettingsMenu } from '$lib/ui.menus';

    // ===== Utilities =====
	import { tryQuit } from '$lib/util.quit';
    import { t } from '$lib/util.localization';
	import { help } from '$lib/util.help';
    import { dragDrop } from '$lib/util.dragDrop';
	import { canvasMouseUp, canvasDblClick, canvasMouseDown, canvasMouseMove, canvasWheel } from '$lib/util.canvasObjects.svelte';
    import { Menu } from '@tauri-apps/api/menu';

    // ===== Menus =====
	import Loading from '$lib/menus/modal.svelte';
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
	import type { CanvasObject } from '$lib/classes/CanvasObject.svelte';
	import { setWindowMenu } from '$lib/util.appMenus.svelte';
	import { CanvasListener } from '$lib/classes/CanvasListener.svelte';
	import Modal from '$lib/menus/modal.svelte';
	import { saveUserSettings } from '$lib/settings.saveUserSettings';

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
        else if (e.key == "Delete" || e.key == "Backspace") tryRemoveSelected();
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
            if(!R.getListener().locked) {
                R.getListener().y = R.getListener().y - speed;
            }
        } else if (e.key == "a") {
            if(!R.getListener().locked) { 
                R.getListener().x = R.getListener().x - speed;
            }
        } else if (e.key == "s") {
            if(!R.getListener().locked) { 
                R.getListener().y = R.getListener().y + speed;
            }
        } else if (e.key == "d") {
            if(!R.getListener().locked) { 
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

    // Update menu tab visuals.
    $effect(()=>{
        isAboutMenuOpen ? 
            document.getElementById("about-button")?.setAttribute('class', 'adaptive active') : 
            document.getElementById("about-button")?.setAttribute('class', 'adaptive');
        isSettingsMenuOpen ? 
            document.getElementById("settings-button")?.setAttribute('class', 'adaptive active') : 
            document.getElementById("settings-button")?.setAttribute('class', 'adaptive');
    });

    

    // ######################
    // ##### INITIALIZE #####
    // ######################

    // Initialize the app.
    onMount( () => 
    {
        // Set minimum window size.
        appWindow.setMinSize(new LogicalSize(480,320));

        // Set the native app window menu.
        setWindowMenu();

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

        // Handle the context menu
        document.addEventListener("contextmenu", (e) => {
            //e.preventDefault();
            if (R.getHoveredCanvasObject() instanceof CanvasListener) {
                R.setupCtxMenuCanvasListener().then(() => {
                    R.ctxMenuCanvasListener.popup();
                });
            } else if (R.getHoveredCanvasObject()) {
                R.setupCtxMenuCanvasObject().then(() => {
                    R.ctxMenuCanvasObject.popup();
                });
            } else {
                R.setupCtxMenu(e).then(()=>{
                    R.ctxMenuCanvas.popup();
                });
            }
        });

        // Canvas setup
        R.setCanvas();

        // Canvas mouse actions
        document.getElementById("canvas")!.addEventListener("dblclick",  (e) => { if (e.button===0) canvasDblClick(e); });
        document.getElementById("canvas")!.addEventListener("wheel",     (e) => { canvasWheel(e); });
        document.getElementById("canvas")!.addEventListener("mousedown", (e) => { if (e.button===0) canvasMouseDown(e); });
        document.getElementById("canvas")!.addEventListener("mousemove", (e) => { canvasMouseMove(e); });
        document.getElementById("canvas")!.addEventListener("mouseup",   (e) => { if (e.button===0) canvasMouseUp(e); })

        // Draggable lists. Have to do it a roundabout way because
        // normal HTML dragover doesn't work if drag-and-drop files are
        // enabled in Tauri. :(
        const mediaSounds = document.getElementById("media-sounds-list");
        const mediaImages = document.getElementById("media-images-list");
        let draggingItem: {element:HTMLElement|null, index:number} = {element:mediaSounds, index:0};
        let dragIntervalID = 0;
        let draggingOverItem:{element:Element|null, above:boolean, index:number};

        // Sound list drag start
        mediaSounds?.addEventListener("dragstart", (e) => {
            if (draggingItem) {
                draggingItem.element = e.target as HTMLElement;
                draggingItem.element.classList.add("dragging");
                dragIntervalID = setInterval(()=>{dragOver(mediaSounds)}, 15);
            }
        });

        // Image list drag start
        mediaImages?.addEventListener("dragstart", (e) => {
            if (draggingItem) {
                draggingItem.element = e.target as HTMLElement;
                draggingItem.element.classList.add("dragging");
                dragIntervalID = setInterval(()=>{dragOver(mediaImages)}, 15);
            }
        });

        // Sound list drag end
        mediaSounds?.addEventListener("dragend", () => { dragEnd(mediaSounds); });

        // Image list drag end
        mediaImages?.addEventListener("dragend", () => { dragEnd(mediaImages); });

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
                document.querySelectorAll("#media .item")
                    .forEach(item => item.classList.remove("over", "insertAbove", "insertBelow"));

                // If not dropping on anything or dropping an item on itself, return.
                if (!draggingOverItem.element || draggingOverItem.element.id == draggingItem.element.id) return;

                let regItems: Array<CanvasObject> = R.getImages();
                if (list == mediaSounds) regItems = R.getSounds();
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

                // Reset classes.
                document.querySelectorAll("#media .item").forEach(item => item.classList.remove("over", "insertAbove", "insertBelow"));
                
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

<!-- The Window -->
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
    onmouseover = {()=>{help($t('help.titlebar.addMedia'), $t('help.titlebar.addMediaKey'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        {#if R.getIsLoading()}<IconLoading />{:else}<IconImageFile />{/if}
        <span class="text-short">{$t('ui.titlebar.addMediaShort')}</span>
        <span class="text-full">{$t('ui.titlebar.addMedia')}</span>
    </button>

    <!-- Save Button -->
    <button class="adaptive l"
    onclick     = {()=>saveProject(false)} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.save'), $t('help.titlebar.saveKey'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        {#if R.getIsSaving()}<IconLoading />{:else}<IconSave />{/if}
        <span class="text-short">{$t('ui.titlebar.saveShort')}</span>
        <span class="text-full">{$t('ui.titlebar.save')}</span>
    </button>

    <!-- Save As Button -->
    <button class="adaptive r"
    onclick     = {()=>saveProject(true)}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.saveAs'), $t('help.titlebar.saveAsKey'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        {#if R.getIsSaving()}<IconLoading />{:else}<IconSaveAs />{/if}
        <span class="text-short">{$t('ui.titlebar.saveAsShort')}</span>
        <span class="text-full">{$t('ui.titlebar.saveAs')}</span>
    </button>

    <!-- Open Project Button -->
    <button class="adaptive l"
    onclick     = {loadProject} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.openProject'), $t('help.titlebar.openProjectKey'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        {#if R.getIsLoading()}<IconLoading />{:else}<IconLoad />{/if}
        <span class="text-short">{$t('ui.titlebar.openProjectShort')}</span>
        <span class="text-full">{$t('ui.titlebar.openProject')}</span>
    </button>

    <!-- New Project Button -->
    <button class="adaptive r"
    onclick     = {clearProject} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.newProject'), $t('help.titlebar.newProjectKey'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconNew />
        <span class="text-short">{$t('ui.titlebar.newProjectShort')}</span>
        <span class="text-full">{$t('ui.titlebar.newProject')}</span>
    </button>

    <!-- Settings Menu Button -->
    <button class="adaptive l" id="settings-button"
    onclick     = {toggleSettingsMenu} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.settings'), $t('help.titlebar.settingsKey'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconSettings />
        <span class="text-short">{$t('ui.titlebar.settingsShort')}</span>
        <span class="text-full">{$t('ui.titlebar.settings')}</span>
    </button>

    <!-- About Menu Button -->
    <button class="adaptive r" id="about-button" 
    onclick     = {toggleAboutMenu} 
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.about'), $t('help.titlebar.aboutKey'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconAbout />
        <span class="text-short">{$t('ui.titlebar.aboutShort')}</span>
        <span class="text-full">{$t('ui.titlebar.about')}</span>
    </button>

    <!-- Spacer -->
    <div data-tauri-drag-region class="spacer"></div>

    <!-- Minimize Button -->
    <button class="window-button" id="titlebar-minimize" title="minimize" aria-label="minimize"
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.minimize'), $t('help.titlebar.minimizeKey'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconMinimize />
    </button>

    <!-- Maximize Button -->
    <button class="window-button" id="titlebar-maximize" title="maximize" aria-label="maximize"
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.maximize'), $t('help.titlebar.maximizeKey'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconMaximize />
    </button>

    <!-- Quit Button -->
    <button class="window-button" id="titlebar-close" title="close" aria-label="close"
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.titlebar.close'), $t('help.titlebar.closeKey'))}}
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
    onmouseover = {()=>{help($t('help.controlsPanel.zoomIn'), $t('help.controlsPanel.zoomInKey'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconZoomIn/>
    </button>

    <!-- Zoom Out -->
    <button id="zoom-out" class="r"
    onclick     = {()=>{R.getCanvas().zoom(0.95)}}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.controlsPanel.zoomOut'), $t('help.controlsPanel.zoomOutKey'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        <IconZoomOut/>
    </button>

    <!-- Recenter On Listener -->
    <button id="recenter"
    onclick     = {()=>{R.getCanvas().flyToPoint(R.getListener().x, R.getListener().y)}}
    onfocus     = {()=>{}} 
    onmouseover = {()=>{help($t('help.controlsPanel.recenter'), $t('help.controlsPanel.recenterKey'))}}
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
            help($t('help.controlsPanel.showSidebar'), $t('help.controlsPanel.toggleSidebarKey')) : 
            help($t('help.controlsPanel.hideSidebar'), $t('help.controlsPanel.toggleSidebarKey'))}}
    onmouseout  = {()=>{help()}}
    onblur      = {()=>{}}>
        {#if sidebarHidden}<IconExpand/>{:else}<IconCollapse/>{/if}
    </button>
</div>


<!-- The Sidebar Media Lists -->
<div id="media" class="shadow" class:sidebarHidden>

    <!-- The Sounds List -->
    <div id="media-sounds">

        <!-- Sound List Header -->
        <div role="heading" class="heading" aria-level="2">

            <!-- Master Volume -->
            <div id="master-volume" aria-level="3" role="heading"
            onfocus     = {()=>{}} 
            onblur      = {()=>{}}
            onwheel     = {(e) => { e.preventDefault(); changeMasterVolume(e); }}
            onmouseout  = {()=>{help()}}
            onmouseover = {()=>{help($t('help.mediaPanel.soundList.volume'))}}>
                <div id="master-volume-bar" style={"height:" + (masterVolume * 100) + "%"}></div>
            </div>

            <!-- Sound List Title -->
            <span role="heading" aria-level="3"
            onfocus     = {()=>{}} 
            onblur      = {()=>{}}
            onmouseout  = {()=>{help()}}
            onmouseover = {()=>{help($t('help.mediaPanel.soundList.title'))}}>
            {$t('ui.mediaPanel.sounds')}
            </span>

            <!-- Sound List Show/Hide Toggle -->
            <button class="media-heading-button" id="hide-sounds-toggle" class:R.getSoundsHidden()
            onclick     = {()=>{
                R.toggleSoundsHidden();
                R.getSoundsHidden() ? help($t('help.mediaPanel.soundList.show')) : help($t('help.mediaPanel.soundList.hide'))}}
            onfocus     = {()=>{}} 
            onblur      = {()=>{}}
            onmouseout  = {()=>{help()}}
            onmouseover = {()=>{
                R.getSoundsHidden() ? help($t('help.mediaPanel.soundList.show')) : help($t('help.mediaPanel.soundList.hide'))
            }}>
                {#if R.getSoundsHidden()}<IconEyeOff/>{:else}<IconEye/>{/if}
            </button>
        </div>

        <!-- List Of Sounds -->
         <div id="media-sounds-list">
            {#each soundList as item, i }
                <SoundListItem item={item} i={i} />
            {/each}
        </div>
    </div>

    <!-- The Images Browser -->
    <div id="media-images">

        <!-- Images List Header -->
        <div role="heading" class="heading" aria-level="2">

            <!-- Master Opacity -->
            <div id="master-opacity"  aria-level="3" role="heading"
            onfocus     = {()=>{}} 
            onblur      = {()=>{}}
            onwheel={(e) => { e.preventDefault(); changeMasterOpacity(e); }}
            onmouseout  = {()=>{help()}}
            onmouseover = {()=>{help($t('help.mediaPanel.imageList.opacity'))}}>
                <div id="master-opacity-bar" style={"height:" + (masterOpacity * 100) + "%"}></div>
            </div>

            <!-- Image List Title -->
            <span role="heading" aria-level="3"
            onfocus     = {()=>{}} 
            onmouseover = {()=>{help($t('help.mediaPanel.imageList.title'))}}
            onmouseout  = {()=>{help()}}
            onblur      = {()=>{}}>
                {$t('ui.mediaPanel.images')}
            </span>

            <!-- Image List Show/Hide Toggle -->
            <button class="media-heading-button" id="hide-images-toggle"  class:R.getImagesHidden()
            onclick={()=>{
                R.toggleImagesHidden()
                R.getImagesHidden() ? help($t('help.mediaPanel.imagelist.show')) : help($t('help.mediaPanel.imageList.hide'))}}
            onfocus={()=>{}} 
            onblur={()=>{}}
            onmouseout={()=>{help()}}
            onmouseover = {()=>{
                R.getImagesHidden() ? help($t('help.mediaPanel.imageList.show')) : help($t('help.mediaPanel.imageList.hide'))
            }}>
                {#if R.getImagesHidden()}<IconEyeOff/>{:else}<IconEye/>{/if}
            </button>
        </div>

        <!-- The Images List -->
        <div id="media-images-list">
            {#each imageList as item, i}
                <ImageListItem item={item} i={i} />
            {/each}
        </div>
    </div>
</div>


<!-- Help Text Display Area -->
<div id="help" role="banner" class="shadow" class:activated={getUserSettings().helpOpen}>
    

    <!-- Help Text Show / Hide Toggle -->
    <button id="help-toggle" 
        onclick     = {()=>{ userSettings.helpOpen = !userSettings.helpOpen; saveUserSettings(); }}
        onfocus     = {()=>{}} 
        onmouseover = {()=>{ help($t('help.helpPanel.helpArea')); }}
        onmouseout  = {()=>{ help() }}
        onblur      = {()=>{}}> i </button>

    <!-- Help Text -->
    <span id="help-text"></span>
</div>


<!-- Settings Menu -->
<Settings />


<!-- About Menu -->
<About />


<!-- Modal Menu -->
<Modal />


<!-- Window Toolbar -->
<div id="toolbar"></div>
