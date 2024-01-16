import type { event } from "@tauri-apps/api";
import L from "leaflet";

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
            maxZoom: 2,
            boxZoom: false,
            contextmenu: true,
            contextmenuItems: [{
                text: 'center map here',
                callback: centerMap
            },
            {
                text: 'zoom in',
                callback: zoomIn
            },
            {
                text: 'zoom out',
                callback: zoomOut
            }]
        });
        map.createPane("soundPane").style.zIndex = "450";
        map.setView([height/2, width/2], 1);
        map.dragging.enable();

        // TODO: get correct types
        function centerMap (e:any) {
            map.panTo(e.latlng);
        }
         
        function zoomIn (e:any) {
            map.zoomIn();
        }
         
        function zoomOut (e:any) {
            map.zoomOut();
        }

        // test polygon
        let polygon = L.polygon([
            [0, 0],
            [150, 0],
            [200, 300],
            [50, 100]
        ]).addTo(map);
        polygon.bindPopup("I am a polygon.");
        polygon.enableEdit();


        map.fitBounds([[0,0], [height, width]] as L.LatLngBoundsExpression);

        // trying to add a grid bkg
        
        let Grid = L.GridLayer.extend({
            createTile: function (coords:any) {
                var tile = document.createElement('div');
                //tile.style.borderBottom = "1px solid #333";
                //tile.style.borderRight = "1px solid #333";
                tile.innerHTML = ".";
                return tile;
            },
            options: {
                tileSize: 50,
                maxZoom: 10,
                minZoom: -5
            }
        });
        
        let grid = function() {
            return new Grid();
        };
        
        //map.addLayer( grid() );

        grid().addTo(map);

        return map;
    }