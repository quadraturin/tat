import L from "leaflet";

/**
 * set up the initial map state.
 * @returns the map.
 */
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
        zoomControl: false,
        contextmenu: false,
        contextmenuItems: []
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

    map.fitBounds([[0,0], [height, width]] as L.LatLngBoundsExpression);

    // grid bkg
    
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

    map.invalidateSize();

    return map;
}