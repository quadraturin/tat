<script lang="ts">
	import type { LayoutData } from '../../routes/$types';
    export let data:LayoutData;
</script>

<div class="menu" id="settings">
    <h2>{data.settings.settingsTitle}</h2>

    <div class="setting">
        <input type="checkbox" id="invertVolumeScroll" class="fancyCheck" /> 
        <label for="invertVolumeScroll">{data.settings.invertVolumeScroll}</label>
    </div>

    <div class="setting">
        <input type="checkbox" id="proportionalScaleOn" class="fancyCheck"  /> 
        <label for="proportionalScaleOn">{data.settings.proportionalScaleOn}</label>
    </div>

    <div class="setting">
        <input type="input" id="listenerMoveSpeed" value="5" class="fancyText"  /> 
        <label for="listenerMoveSpeed">{data.settings.listenerMoveSpeed}</label>
    </div>
<!--
    <h2>theme</h2>
    <ul>
        <li>
            <input type="color" id="color1" name="color1" value="coral" />
            <label for="color1">Primary Color</label>
        </li>
        <li>
            <input type="color" id="color2" name="color2" value="black" />
            <label for="color2">Secondary Color</label>
        </li>
    </ul>
    -->
</div>