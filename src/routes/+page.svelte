<script lang="ts">
    import Greet from '../lib/Greet.svelte'
    import { open } from "@tauri-apps/api/dialog"
    import { readBinaryFile, readTextFile, createDir, exists, readDir, removeDir, removeFile, writeBinaryFile } from "@tauri-apps/api/fs"
    import { appLocalDataDir, homeDir } from '@tauri-apps/api/path'
    import { onMount } from 'svelte'
    import Panzoom from '@panzoom/panzoom'
    import { sound } from "svelte-sound"
    import blipSound from "../assets/blip.wav";

    onMount( () => { reloadPanzoom() } )

    let dataDirPath = ''
    let homeDirPath = ''
    let selectedPath = ''
    let content = new Uint8Array
    let mapImageURL = ''
    
    async function reloadPanzoom()
    {
        const panzoom = await Panzoom(document.getElementById("map") as HTMLElement, {
            maxScale: 5,
            contain: 'outside'
        })
        const panzoomWrapper = document.getElementById("map-wrapper") as HTMLElement
        panzoomWrapper.addEventListener('wheel', panzoom.zoomWithWheel)
    }


    const getDataDir = async () => 
    {
        try 
        {
            dataDirPath = await appLocalDataDir()
            console.log(dataDirPath)
        } 
        catch (err) 
        {
            console.error(err)
        }
    }
    getDataDir()
    

    const readFileContents = async () => {
        try 
        {
            selectedPath = await open
            ({
                multiple: false,
                title: "open file",
                filters: 
                [{
                    extensions: ['png', 'gif', 'jpg', 'jpeg', 'webp', 'm4a', 'mp3', 'ogg', 'flac', 'wav'], 
                    name: "*"
                }]
            }) as string
            console.log(selectedPath)
            if (!selectedPath) return
            content = await readBinaryFile(selectedPath as string)
            const img = new Image()
            mapImageURL = URL.createObjectURL( new Blob([content.buffer], { type: 'image/png' } ))
            reloadPanzoom()
        } 
        catch (err) 
        {
            console.error(err)
        }
    }

</script>

<div id="map-wrapper">
    <div id="map">
        {#if mapImageURL}
        <img src="{mapImageURL}" alt="map" />
        {/if}
        <div id="map-overlay">
            <p>put your files in: <em>{dataDirPath}</em></p>
            <p>selected path: <em>{selectedPath}</em></p>
        </div>
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
    <h1>O</h1>
    <button on:click={readFileContents}>load image or audio file</button>
    <button use:sound={{src: blipSound, events: ["click"]}}>zorp</button>
</div>
