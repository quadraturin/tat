<script lang="ts">
    import Greet from '../lib/Greet.svelte'
    import { open } from "@tauri-apps/api/dialog"
    import { readBinaryFile, readTextFile, createDir, exists, readDir, removeDir, removeFile, writeBinaryFile } from "@tauri-apps/api/fs"
    import { appLocalDataDir, homeDir } from '@tauri-apps/api/path'
    import { onMount, beforeUpdate } from 'svelte'
    import { sound } from "svelte-sound"
    import blipSound from "../assets/blip.wav"
    import { appWindow } from '@tauri-apps/api/window'
    import IconAdd from '$lib/iconAdd.svelte'
    import IconPlay from '$lib/iconPlay.svelte'
    import IconLoading from '$lib/iconLoading.svelte'
    import IconLevels from '$lib/iconLevels.svelte'
	import IconSettings from '$lib/iconSettings.svelte';
    import L from "leaflet";

    let mapElement: HTMLElement
    let dataDirPath = ''
    let selectedPath = ''
    let content = new Uint8Array
    let mapImageURL = ''
    let loading = false
    let preResizeX: number
    let preResizeY: number

    onMount( () => 
    {
        mapElement = document.getElementById("map") as HTMLElement

        const titlebarMinimize = document.getElementById('titlebar-minimize') as HTMLElement
        titlebarMinimize.addEventListener('click', () => appWindow.minimize())
        const titlebarMaximize = document.getElementById('titlebar-maximize') as HTMLElement
        titlebarMaximize.addEventListener('click', () => appWindow.toggleMaximize())
        const titlebarClose = document.getElementById('titlebar-close') as HTMLElement
        titlebarClose.addEventListener('click', () => appWindow.close())
        preResizeX = window.innerWidth
        preResizeY = window.innerHeight

        mapSetup();        
    })

    function mapSetup() {
        let map = L.map('map').setView([51.505, -0.09], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        var marker = L.marker([51.5, -0.09],{
            draggable: true,
            autoPan: true}).addTo(map);
        var circle = L.circle([51.508, -0.11], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        }).addTo(map);
        var polygon = L.polygon([
            [51.509, -0.08],
            [51.503, -0.06],
            [51.51, -0.047]
        ]).addTo(map);
        marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
        circle.bindPopup("I am a circle.");
        polygon.bindPopup("I am a polygon.");
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
            loading = true
            content = await readBinaryFile(selectedPath as string)
            loading = false
            const img = new Image()
            mapImageURL = URL.createObjectURL( new Blob([content.buffer], { type: 'image/png' } ))
        } 
        catch (err) 
        {
            console.error(err)
        }
    }
</script>

<div data-tauri-drag-region class="titlebar">
    <h1>paradiso</h1>
    <button class="toolbar-button" id="add-button" on:click={readFileContents}>{#if loading}<IconLoading />{:else}<IconAdd />{/if}<span>load image/audio</span></button>
    <button class="toolbar-button" use:sound={{src: blipSound, events: ["click"]}}><IconPlay /><span>zorp</span></button>
    <button class="toolbar-button" use:sound={{src: blipSound, events: ["click"]}}><IconLevels /><span>mixer</span></button>
    <button class="toolbar-button" use:sound={{src: blipSound, events: ["click"]}}><IconSettings /><span>settings</span></button>

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
        {#if mapImageURL}
        <img src="{mapImageURL}" alt="map" />
        {/if}
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
