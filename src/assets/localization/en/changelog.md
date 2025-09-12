## Changelog

### v0.5.0: Rewrite (2025-09-09)
- **Complete rewrite of the canvas system.**
    - Removed all canvas libraries/dependencies (Leaflet and add-ons).
    - Re-implemented an infinite canvas with native Canvas element.
    - Re-implemented shape drawing, shape controls, & collision detection.
    - New adaptive canvas grid changes based on zoom level.
    - Better image scaling with ability to flip images on X and Y axes.
    - Allows for much more control over how everything works & is displayed, and is much more extendable.
- **Complete rewrite of audio system.**
    - Removed all audio libraries/dependencies (Howler and others).
    - Re-implemented audio system with native WebAudio API, allowing for much more control over audio, and is much more extendable.
- **Localization support.**
    - English
    - Spanish
- **Theme support.**
    - Switch themes in the Settings menu.
    - Built-in themes:
        - Dark
        - Light
        - Dark high contrast
        - Light high contrast
        - WBR
        - Mothership
- **Sound triggers.**
    - **Manual:** Play/pause on click (default).
    - **Play On Enter:** Plays when the listener touches the emitter. Reverts to manual on trigger.
    - **Restart On Enter:** Plays from beginning when the listener touches the emitter. Reverts to manual on trigger.
    - **Play Inside:** Plays only when the listener is touching the emitter.
    - **Restart Inside:** Plays from beginning when the listener touches the emitter and play only when the listener is touching the emitter.
    - **Timer:** Set a timer. Plays when timer reaches 00:00:00, then reset timer.
- **Looping Toggle:** Toggle whether the sound loops or not. Note: In **Timer** trigger mode, this instead loops the *timer,* not the audio directly.
- **UI Scrolling** for volume, etc. should now be more consistent across platforms.
- **Drag-and-drop to reorder project items** in the object lists.
- **Right-click menus** for the canvas and canvas objects.
- **Clicking a canvas object no longer raises it to the top.** You can instead use the right-click menu for this or reorder with drag-and-drop on the object lists.
- **Reworked settings menu.**
- **Global image opacity control to match global audio volume control.**
- **About page links edits.**
- **Removed overscroll bounce** affecting entire app.
- **Upgraded to Svelte 5 and Sveltekit 2.**
- **Added capital letters.**
- **Much more help text** across the app.
- **Projects now save and load listener and view positions.**
- **Now only using Tabler icons.** (With some modifications.)
- **Basic debug display:** show/hide with `.

### v0.4.1: drag-and-drop (2024-12-22)
- added drag-and-drop support for media files.
- fixed maximize button.

### v0.3.0: upgrades & tweaks (2024-12-19)
- upgraded wrapper to tauri 2
- added UI scroll sensitivity setting
- updated social media links on about page
- reset to default user settings now works properly
- added show/hide toggles for images and sounds
- nicer look for polygon middle anchors

### v0.2.0: better for streaming (2024-01-29)
- settings option to hide window contents from stream
- fix for sometimes broken map at startup
- opening settings or about menu now closes other menus
- changelog corrections

### v0.1.0: initial alpha release to kickstarter backers (2024-01-25)
- create projects
- save (+save as) projects: copies media files to folder, deletes unused media, writes project json
- open projects
- import images and sounds(supported image filetypes: .png, .gif, .jpg, .jpeg, .webp. supported audio filetypes: .wav, .m4a, .mp3, .ogg, .flac)
- move images and sounds
- resize images and sounds
- proportionally resize images
- move the sound listener pin
- select images and sounds
- delete selected images and sounds
- lock and unlock images and sounds to prevent editing/moving
- "about" menu
- title bar layout adjusts to window size
- confirm on exit when there are unsaved changes
- localizable text
- help text on hover in collapsible help bar
- map zoom in and out
- recenter on listener
- sidebar ui lists sounds and images in stacking order
- duplicate sounds and images
- adjust opacity of images
- adjust volume of sounds
- adjust global volume
- sound type - local: emanates from a point with falloff
- sound type - area: constant volume within a polygon
- sound type - global: audible everywhere
- change sound type: cycle between local, area, and global
- mute/unmute sounds
- solo/unsolo sounds
- pause/play sounds
- interactive sound playback display
- move listener with WASD
- user settings: reverse scroll direction, listener movement speed, default to proportional image scaling
