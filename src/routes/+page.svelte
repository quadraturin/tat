<script lang="ts">
    import Greet from '../lib/Greet.svelte'
    import { open } from "@tauri-apps/api/dialog"
    import { readBinaryFile, readTextFile, createDir, exists, readDir, removeDir, removeFile, writeBinaryFile } from "@tauri-apps/api/fs"
    import { appLocalDataDir, homeDir } from '@tauri-apps/api/path'
    import { onMount, beforeUpdate } from 'svelte'
    import zapAudio from "../assets/blip.wav"
    import { appWindow } from '@tauri-apps/api/window'
    import IconAdd from '$lib/iconAdd.svelte'
    import IconPlay from '$lib/iconPlay.svelte'
    import IconLoading from '$lib/iconLoading.svelte'
    import IconLevels from '$lib/iconLevels.svelte'
	import IconSettings from '$lib/iconSettings.svelte';
    import IconAudioFile from '$lib/iconAudioFile.svelte'
    import IconImageFile from '$lib/iconImageFile.svelte'
    import 'leaflet/dist/leaflet.css'
    import '../app.css'
    import L, { Draggable, LatLng, type LatLngBoundsExpression } from "leaflet";
    import 'leaflet-editable';
    import 'leaflet.path.drag';
    import * as T from '@turf/turf'
	import { distanceToPolygon_direct } from '$lib/pointPolyDistance';
    import {Howl, Howler} from 'howler';
    import {arr2base} from 'uint8-util';

    let mapElement: HTMLElement;
    let dataDirPath = '';
    let selected: String | String[] | null;
    let content = new Uint8Array;
    let loadingImage = false;
    let loadingAudio = false;
    let map: L.Map;
    let listener: L.Marker;
    let mapIndex: number;

    let maps = new Array<MapInfo>;
    let images = new Array<MapImage>;
    let sounds = new Array<MapSound>;

    const zapSound = new Howl({src:[zapAudio]});

    // override so circle scaling doesn't break when using L.CRS.Simple map coords
    L.LatLng.prototype.distanceTo = function (currentPostion:LatLng) 
    {
        var dx = currentPostion.lng - this.lng;
        var dy = currentPostion.lat - this.lat;
        return Math.sqrt(dx*dx + dy*dy);
    }

    // class that defines a particular map 
    class MapInfo 
    {
        name = "untitled";
        data:Uint8Array;
        width:number;
        height:number;

        constructor(data:Uint8Array, width:number, height:number)
        {
            this.data = data;
            this.width = width;
            this.height = height;
        }
    }

    // class that defines an audio emitter
    class MapSound
    {
        circle:L.Circle;
        sound:Howl;
        
        constructor(sound:Howl, circle:L.Circle)
        {
            this.sound = sound;
            this.circle = circle;
        }
    }

    // class that defines an image on the map
    class MapImage
    {
        constructor()
        {
        }
    }

    // set up the initial map state
    function setupMap() 
    {
        mapElement = document.getElementById("map") as HTMLElement  

        const width = window.innerWidth;
        const height = window.innerHeight; 

        let iconUrl = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="coral" fill-rule="evenodd" clip-rule="evenodd"><path d="M16.272 10.272a4 4 0 1 1-8 0a4 4 0 0 1 8 0Zm-2 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0Z"/><path d="M5.794 16.518a9 9 0 1 1 12.724-.312l-6.206 6.518l-6.518-6.206Zm11.276-1.691l-4.827 5.07l-5.07-4.827a7 7 0 1 1 9.897-.243Z"/></g></svg>');

        let icon = L.icon( 
        {
            iconUrl: iconUrl,
            iconSize: [36,36],
            iconAnchor: [18,35]
        } );

        map = L.map('map', 
        {
            crs: L.CRS.Simple,
            editable: true,
            minZoom: -5,
            maxZoom: 20
        }).setView([height/2, width/2], 1);
        map.dragging.enable();

        listener = L.marker([height/2, width/2],
        {
            draggable: true,
            autoPan: true,
            icon: icon 
        }).addTo(map);

        //listener.bindPopup("<b>i am the audio listener.</b><br>drag me around :)").openPopup();

        listener.on('drag', setMapSoundVolumes);

        /*// test polygon
        let polygon: L.Polygon<Draggable> = L.polygon([
            [0, 0],
            [150, 0],
            [200, 300],
            [50, 100]
        ]).addTo(map);
        polygon.bindPopup("I am a polygon.");
        polygon.enableEdit();*/

        map.fitBounds([[0,0], [height, width]] as LatLngBoundsExpression);
    }

    function setMapSoundVolumes()
    {
        map.eachLayer((layer) => 
        {
            if(layer instanceof L.Polygon) 
            {
                const inside = T.booleanPointInPolygon([listener.getLatLng().lng,listener.getLatLng().lat],layer.toGeoJSON());
                if (!inside) return;
            }
            if(layer instanceof L.Circle) 
            {
                const a = layer.getLatLng().lat - listener.getLatLng().lat;
                const b = layer.getLatLng().lng - listener.getLatLng().lng;
                const c = Math.sqrt(a*a + b*b);
                const volume = Math.max(0,(layer.getRadius() - c) / layer.getRadius());
                console.log("circle volume: " + Math.ceil(volume*100) + "%");
                sounds.forEach(e => 
                {
                    if (e.circle == layer) e.sound.volume(volume);
                });
            }
        })
    }

    // put an image on the map and frame it
    function loadImageToMap(imageURL:string, width:number, height:number) 
    {
        map.setView([height/2, width/2], 1);
        let bounds = [[0,0], [height,width]] as LatLngBoundsExpression;

        let image = L.imageOverlay(imageURL, bounds, 
        {
            interactive: true
        }).addTo(map);

        map.fitBounds(bounds);
    }

    // find a random currently visible point on the map and return it
    function getRandomPointInViewport<LatLng>()
    {
        const min = map.getBounds().getSouthWest();
        const max = map.getBounds().getNorthEast();
        const w = max.lng - min.lng;
        const h = max.lat - min.lat;
        return new LatLng(Math.random() * h + min.lat, Math.random() * w + min.lng);
    }

    // put a sound on the map
    function createMapSound(sound:Howl)
    {
        const emitter: L.Circle = L.circle(getRandomPointInViewport(), {
            color: 'coral',
            fillColor: 'coral',
            fillOpacity: 0.5,
            radius: 100,

        }).addTo(map);
        emitter.enableEdit();
        emitter.on('dblclick', L.DomEvent.stop).on('dblclick', emitter.toggleEdit);
        emitter.on('drag', setMapSoundVolumes); //could be optimized to only update *this* vol
        //emitter.on('resize', setMapSoundVolumes);
        emitter.on('editable:editing', setMapSoundVolumes);
        //emitter.bindPopup("I am an audio emitter.");
        sounds.push(new MapSound(sound, emitter));
        setMapSoundVolumes();
        sound.play();
    }


    onMount( () => 
    {
        const titlebarMinimize = document.getElementById('titlebar-minimize') as HTMLElement
        titlebarMinimize.addEventListener('click', () => appWindow.minimize())
        const titlebarMaximize = document.getElementById('titlebar-maximize') as HTMLElement
        titlebarMaximize.addEventListener('click', () => appWindow.toggleMaximize())
        const titlebarClose = document.getElementById('titlebar-close') as HTMLElement
        titlebarClose.addEventListener('click', () => appWindow.close()) 
        
        setupMap();
    })

    
    const getDataDir = async () => 
    {
        try 
        {
            dataDirPath = await appLocalDataDir()
            //console.log(dataDirPath)
        } 
        catch (err) 
        {
            console.error(err)
        }
    }
    getDataDir()

    
    const readImageFile = async () => {
        try 
        {
            selected = await open
            ({
                multiple: false,
                title: "open file",
                filters: 
                [{
                    extensions: ['png', 'gif', 'jpg', 'jpeg', 'webp'], 
                    name: "*"
                }]
            });

            if (selected === null) 
            {
                // user cancelled the selection
                return;
            } 
            else if (Array.isArray(selected)) 
            {
                // user selected multiple files
            }
            else 
            {
                // user selected a single file
            }

            loadingImage = true;

            content = await readBinaryFile(selected as string);
            const bmp = await createImageBitmap(new Blob([content]));
            const { width, height } = bmp;
            bmp.close(); // free memory
            maps.push(new MapInfo(content, width, height));
            mapIndex = maps.length - 1;

            const mapImageURL = URL.createObjectURL( new Blob([maps[mapIndex].data.buffer], { type: 'image/png' } ));
            loadImageToMap(mapImageURL, maps[mapIndex].width, maps[mapIndex].height); 

            loadingImage = false;
        } 
        catch (err) 
        {
            console.error(err)
        }
    }

    const readAudioFile = async () => {
        try 
        {
            selected = await open
            ({
                multiple: false,
                title: "open file",
                filters: 
                [{
                    extensions: ['wav', 'm4a', 'mp3', 'ogg', 'flac', 'wav'], 
                    name: "*"
                }]
            });

            console.log(selected);

            if (selected === null) 
            {
                // user cancelled the selection
                return;
            } 
            else if (Array.isArray(selected)) 
            {
                // user selected multiple files
            }
            else 
            {
                // user selected a single file
            }

            loadingAudio = true;

            content = await readBinaryFile(selected as string);

            let filename:string = selected as string;
            let format:string;
            format = ((filename.split('.')).pop() as string).toLowerCase();
            const file = new File([content], "audio." + format,{type: format});
            //console.log("file: ");
            //console.log(filename);
            const audioURL = URL.createObjectURL( file );
            //console.log("audio url: ")
            //console.log(audioURL);
            const sound = new Howl({
                src: [audioURL],
                format: [format],
                loop: true
            });

            createMapSound(sound);

            loadingAudio = false;
        } 
        catch (err) 
        {
            console.error(err)
        }
    }

    function zap()
    {
        zapSound.play();
    }

	let files:FileList;
    let fileSound:Howl;

	$: if (files) 
    {
		console.log(files);
		for (const file of files) 
        {
			console.log(`${file.name}: ${file.type}, ${file.size} bytes`);
            let fileurl = URL.createObjectURL(file);
            fileSound = new Howl(
            {
                src: [fileurl], 
                format: [file.type.split("/")[1]], //only uses mime subtype
                loop: true
            });
            createMapSound(fileSound);
		}
	}


    L.Path = L.Path.extend({
        options: {
            icon: new L.DivIcon({
            iconSize: new L.Point(100, 100),
            className: 'leaflet-div-icon leaflet-editing-icon my-own-icon',
            }),
        },
    });

</script>

<div data-tauri-drag-region class="titlebar">
    <h1>paradiso</h1>
    <button class="toolbar-button" id="add-button" on:click={readImageFile}>{#if loadingImage}<IconLoading />{:else}<IconImageFile />{/if}<span>load image</span></button>
    <button class="toolbar-button" id="add-button" on:click={readAudioFile}>{#if loadingAudio}<IconLoading />{:else}<IconAudioFile />{/if}<span>load audio</span></button>
    <button class="toolbar-button" on:click={zap}><IconLevels /><span>mixer</span></button>
    <button class="toolbar-button"><IconSettings /><span>settings</span></button>
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
