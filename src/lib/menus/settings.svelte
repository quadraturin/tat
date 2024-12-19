<script lang="ts">
	import * as R from '$lib/registry';
	import { getUserSettings, resetUserSettings } from '$lib/settings.userSettings';
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import type { LayoutData } from '../../routes/$types';
	import { saveUserSettings } from '$lib/settings.saveUserSettings';
    const appWindow = getCurrentWebviewWindow()
    export let data:LayoutData;

    let currentUserSettings:any = getUserSettings();
    let listenerMoveSpeed:number = getUserSettings().listenerMoveSpeed;
    let uiScrollSensitivity:number = getUserSettings().uiScrollSensitivity;

    setInterval(() => {
        currentUserSettings = getUserSettings();
        listenerMoveSpeed = currentUserSettings.listenerMoveSpeed;
        uiScrollSensitivity = currentUserSettings.uiScrollSensitivity;
    }, 15);
    
    //appWindow.setContentProtected(true);
</script>

<div class="menu" id="settings">
    <h2>{data.settings.settingsTitle}</h2>

    <div class="setting">
        <input type="checkbox" id="hideWindowContentsFromStream" class="fancyCheck" 
        checked={currentUserSettings?.hideWindowContentsFromStream}
        on:click={()=>{
            appWindow.setContentProtected(!currentUserSettings?.hideWindowContentsFromStream);
            getUserSettings().hideWindowContentsFromStream = !currentUserSettings.hideWindowContentsFromStream;
            saveUserSettings();
            }} /> 
        <label for="hideWindowContentsFromStream">{data.settings.hideWindowContentsFromStream}</label>
    </div>

    <div class="setting">
        <input type="checkbox" id="invertVolumeScroll" class="fancyCheck" 
        checked={currentUserSettings?.invertVolumeScroll}
        on:click={()=>{
            getUserSettings().invertVolumeScroll = !currentUserSettings.invertVolumeScroll;
            saveUserSettings();
            }} /> 
        <label for="invertVolumeScroll">{data.settings.invertVolumeScroll}</label>
    </div>

    <div class="setting">
        <input type="input" id="uiScrollSensitivity" class="fancyText"
        placeholder={uiScrollSensitivity.toString()}
        bind:value={uiScrollSensitivity} 
        on:input={()=>{
            getUserSettings().uiScrollSensitivity = uiScrollSensitivity;
            saveUserSettings();
            }}/> 
        <label for="uiScrollSensitivity">{data.settings.uiScrollSensitivity}</label>
    </div>

    <div class="setting">
        <input type="checkbox" id="proportionalScaleOnByDefault" class="fancyCheck"
        checked={currentUserSettings?.proportionalScaleOnByDefault}
        on:click={()=>{
            getUserSettings().proportionalScaleOnByDefault = ! currentUserSettings.proportionalScaleOnByDefault;
            saveUserSettings();
            R.toggleProportionalScale();
            }}  /> 
        <label for="proportionalScaleOnByDefault">{data.settings.proportionalScaleOnByDefault}</label>
    </div>

    <div class="setting">
        <input type="input" id="listenerMoveSpeed" class="fancyText"
        placeholder={listenerMoveSpeed.toString()}
        bind:value={listenerMoveSpeed} 
        on:input={()=>{ 
            getUserSettings().listenerMoveSpeed = listenerMoveSpeed;
            saveUserSettings();
            }}/> 
        <label for="listenerMoveSpeed">{data.settings.listenerMoveSpeed}</label>
    </div>

    <div class="setting">
        <button id="resetSettings"
        on:click={()=>{ resetUserSettings() }}>
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