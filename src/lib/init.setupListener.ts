import L from "leaflet";
import {t} from "$lib/registry";

import { setMapSoundVolumes } from "./media.setMapSoundVolumes";
import { help } from "./util.help";

export function setupListener(map:L.Map): L.Marker<any>
{
    // set up the listener marker icon
    let iconUrl = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><filter id="blurMe"><feGaussianBlur in="SourceGraphic" stdDeviation="3" /></filter><g fill="rgba(0,0,0,0.75)" transform="rotate(-10 50 100) translate(10 14) skewX(20) scale(0.8 0.4)"><path filter="url(#blurMe)" d="M16 2A11.013 11.013 0 0 0 5 13a10.889 10.889 0 0 0 2.216 6.6s.3.395.349.452L16 30l8.439-9.953c.044-.053.345-.447.345-.447l.001-.003A10.885 10.885 0 0 0 27 13A11.013 11.013 0 0 0 16 2m0 15a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4"/></g><path stroke="black" fill="coral" d="M16 2A11.013 11.013 0 0 0 5 13a10.889 10.889 0 0 0 2.216 6.6s.3.395.349.452L16 30l8.439-9.953c.044-.053.345-.447.345-.447l.001-.003A10.885 10.885 0 0 0 27 13A11.013 11.013 0 0 0 16 2m0 15a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4"/></svg>');
    let icon = L.icon( 
    {
        iconUrl: iconUrl,
        iconSize: [36,36],
        iconAnchor: [18,35]
    } );

    // get the viewport dimensions
    const width = window.innerWidth;
    const height = window.innerHeight; 
    
    // put the listener in the center of the viewport
    const listener = L.marker([height/2, width/2],
    {
        contextmenu:false,
        contextmenuItems:[],
        draggable: true,
        autoPan: true,
        icon: icon 
    }).addTo(map);

    // adjust sound volumes when the listener gets dragged around
    listener.on('drag', () => { setMapSoundVolumes() });

    listener.on('mouseover', () => {
        help(t.help.map.listener, t.help.map.listenerActions);
    });
    listener.on('mouseout', () => {help()});
    
    // listener popup
    //listener.bindPopup("<b>i am the audio listener.</b><br>drag me around :)").openPopup();

    return listener;
}