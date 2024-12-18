<script lang="ts">
	import * as R from '$lib/registry';
	import { getUserSettings, resetUserSettings, setUserSetting } from '$lib/settings.userSettings';
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import type { LayoutData } from '../../routes/$types';
const appWindow = getCurrentWebviewWindow()
    export let data:LayoutData;

    let userSettings:any = getUserSettings();
    let listenerMoveSpeed:number = getUserSettings().listenerMoveSpeed;
    let uiScrollSensitivity:number = getUserSettings().uiScrollSensitivity;

    setInterval(() => {
        userSettings = getUserSettings();
        listenerMoveSpeed = userSettings.listenerMoveSpeed;
        uiScrollSensitivity = userSettings.uiScrollSensitivity;
    }, 15);
    
    //appWindow.setContentProtected(true);
</script>

<div class="menu" id="settings">
    <h2>{data.settings.settingsTitle}</h2>

    <div class="setting">
        <input type="checkbox" id="hideWindowContentsFromStream" class="fancyCheck" 
        checked={userSettings?.hideWindowContentsFromStream}
        on:click={()=>{
            appWindow.setContentProtected(!userSettings?.hideWindowContentsFromStream);
            setUserSetting("hideWindowContentsFromStream", !userSettings.hideWindowContentsFromStream);
            }} /> 
        <label for="hideWindowContentsFromStream">{data.settings.hideWindowContentsFromStream}</label>
    </div>

    <div class="setting">
        <input type="checkbox" id="invertVolumeScroll" class="fancyCheck" 
        checked={userSettings?.invertVolumeScroll}
        on:click={()=>{setUserSetting("invertVolumeScroll", !userSettings.invertVolumeScroll)}} /> 
        <label for="invertVolumeScroll">{data.settings.invertVolumeScroll}</label>
    </div>

    <div class="setting">
        <input type="input" id="uiScrollSensitivity" class="fancyText"
        placeholder={uiScrollSensitivity.toString()}
        bind:value={uiScrollSensitivity} 
        on:input={()=>{setUserSetting("uiScrollSensitivity", uiScrollSensitivity)}}/> 
        <label for="uiScrollSensitivity">{data.settings.uiScrollSensitivity}</label>
    </div>

    <div class="setting">
        <input type="checkbox" id="proportionalScaleOnByDefault" class="fancyCheck"
        checked={userSettings?.proportionalScaleOnByDefault}
        on:click={()=>{
            setUserSetting("proportionalScaleOnByDefault", !userSettings.proportionalScaleOnByDefault);
            R.toggleProportionalScale()}}  /> 
        <label for="proportionalScaleOnByDefault">{data.settings.proportionalScaleOnByDefault}</label>
    </div>

    <div class="setting">
        <input type="input" id="listenerMoveSpeed" class="fancyText"
        placeholder={listenerMoveSpeed.toString()}
        bind:value={listenerMoveSpeed} 
        on:input={()=>{setUserSetting("listenerMoveSpeed", listenerMoveSpeed)}}/> 
        <label for="listenerMoveSpeed">{data.settings.listenerMoveSpeed}</label>
    </div>

    <div class="setting">
        <button id="resetSettings"
        on:click={()=>{
            resetUserSettings(); }}>
            {data.settings.reset}
        </button>
        <em>{data.settings.autoSave}</em>
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