<script lang="ts">
	import type { LayoutData } from '../../routes/$types';
    export let data:LayoutData;
</script>

<div class="menu" id="settings">
    <h2>settings</h2>

    <div class="setting">
        <input type="checkbox" id="invertVolumeScroll" class="fancyCheck" /> 
        <label for="invertVolumeScroll">invert volume scroll direction</label>
    </div>

    <div class="setting">
        <input type="checkbox" id="proportionalScaleOn" class="fancyCheck"  /> 
        <label for="proportionalScaleOn">proportional image scaling on by default (shift turns off)</label>
    </div>

    <div class="setting">
        <input type="input" id="listenerMoveSpeed" value="5" class="fancyText"  /> 
        <label for="listenerMoveSpeed">listener movement speed (WASD)</label>
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