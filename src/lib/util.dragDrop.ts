import { getCurrentWebview } from "@tauri-apps/api/webview";
import { loadFile } from "./media.loadFile";
import { getCanvas } from "./registry.svelte";

export async function dragDrop() {
    const unlisten = await getCurrentWebview().onDragDropEvent((event) => {
        if (event.payload.type === 'over') {
            //console.log('User hovering', event.payload.position);
        } else if (event.payload.type === 'drop') {
            console.log('User dropped', event.payload.paths);
            for (let i=0; i<event.payload.paths.length; i++) {
                loadFile(
                    event.payload.paths[i], 
                    getCanvas().toWorldX(event.payload.position.x), 
                    getCanvas().toWorldY(event.payload.position.y)
                );
            }
        } else {
            //console.log('File drop cancelled');
        }
    });
}
