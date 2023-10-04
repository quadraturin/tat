import L from "leaflet";
import * as R from '$lib/registry';

import { setMapSoundVolumes } from "./setMapSoundVolumes";

export function setupListener(map:L.Map): L.Marker<any>
{
    // set up the listener marker icon
    let iconUrl = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="coral" fill-rule="evenodd" clip-rule="evenodd"><path d="M16.272 10.272a4 4 0 1 1-8 0a4 4 0 0 1 8 0Zm-2 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0Z"/><path d="M5.794 16.518a9 9 0 1 1 12.724-.312l-6.206 6.518l-6.518-6.206Zm11.276-1.691l-4.827 5.07l-5.07-4.827a7 7 0 1 1 9.897-.243Z"/></g></svg>');
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
        draggable: true,
        autoPan: true,
        icon: icon 
    }).addTo(map);

    // adjust sound volumes when the listener gets dragged around
    listener.on('drag', () => { setMapSoundVolumes(map, listener, R.getSoundList()) });
    // listener popup
    //listener.bindPopup("<b>i am the audio listener.</b><br>drag me around :)").openPopup();

    return listener;
}