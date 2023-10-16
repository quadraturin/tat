import * as R from "$lib/registry"
import * as S from "$lib/settings"
import { removeImage } from "./media.removeImage";
import { removeSound } from "./media.removeSound";
import type { MapSound } from "./classes/MapSound";
import type { MapImage } from "./classes/MapImage";

export async function clearProject() {
    R.getImageList().forEach(e => {
        removeImage(e.rect, false);
    });
    R.setImageList(new Array<MapImage>);

    R.getSoundList().forEach(e => {
        removeSound(e.circle, false);
    });
    R.setSoundList(new Array<MapSound>);
    
    R.setProjectClean();
    R.setHasMedia(false);
    R.setProjectName(S.defaultProjectName);
}