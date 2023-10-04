import L from "leaflet";
import { setMapSoundVolumes } from "./setMapSoundVolumes";

    // set up the initial map state
    export function setupMap(): L.Map 
    {
        // get the viewport dimensions
        const width = window.innerWidth;
        const height = window.innerHeight; 

        const map = L.map('map', 
        {
            crs: L.CRS.Simple,
            editable: true,
            minZoom: -5,
            maxZoom: 20
        }).setView([height/2, width/2], 1);
        map.dragging.enable();

        /*// test polygon
        let polygon: L.Polygon<Draggable> = L.polygon([
            [0, 0],
            [150, 0],
            [200, 300],
            [50, 100]
        ]).addTo(map);
        polygon.bindPopup("I am a polygon.");
        polygon.enableEdit();*/

        map.fitBounds([[0,0], [height, width]] as L.LatLngBoundsExpression);

        // trying to add a grid bkg
        //map.addLayer(new L.TileLayer('data:image/svg+xml, <svg width="10" height="10"><line x1="5" y1="0" x2="5" y2="10" stroke="white" stroke-width="1" /><line x1="0" y1="5" x2="10" y2="5" stroke="white" stroke-width="1" /></svg>'));
        
        return map;
    }