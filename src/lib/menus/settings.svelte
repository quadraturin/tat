<script lang="ts">
    import { t, locales, locale } from '$lib/util.translations';
	import * as R from '$lib/registry';
	import { getDefaultUserSettings, getUserSettings, resetUserSettings } from '$lib/settings.userSettings';
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { saveUserSettings } from '$lib/settings.saveUserSettings';
    const appWindow = getCurrentWebviewWindow();

    let currentUserSettings:any = getUserSettings();
    let listenerMoveSpeed:number = getUserSettings().listenerMoveSpeed;
    let uiScrollSensitivity:number = getUserSettings().uiScrollSensitivity;
    let language:string = getUserSettings().language;

    setInterval(() => {
        currentUserSettings = getUserSettings();
        listenerMoveSpeed = currentUserSettings.listenerMoveSpeed;
        uiScrollSensitivity = currentUserSettings.uiScrollSensitivity;
    }, 15);
    
    //appWindow.setContentProtected(true);
</script>

<div class="menu" id="settings">
    <h2>{$t('settings.settingsTitle')}</h2>

    <div class="setting" class:changed={getDefaultUserSettings().hideWindowContentsFromStream != currentUserSettings.hideWindowContentsFromStream}>
        <input type="checkbox" id="hideWindowContentsFromStream" class="fancy"
        checked={currentUserSettings?.hideWindowContentsFromStream}
        on:click={()=>{
            appWindow.setContentProtected(!currentUserSettings?.hideWindowContentsFromStream);
            getUserSettings().hideWindowContentsFromStream = !currentUserSettings.hideWindowContentsFromStream;
            saveUserSettings();
            }} /> 
        <label for="hideWindowContentsFromStream">{$t('settings.hideWindowContentsFromStream')}</label>
    </div>

    <div class="setting" class:changed={getDefaultUserSettings().invertVolumeScroll != currentUserSettings.invertVolumeScroll}>
        <input type="checkbox" id="invertVolumeScroll" class="fancy" 
        checked={currentUserSettings?.invertVolumeScroll}
        on:click={()=>{
            getUserSettings().invertVolumeScroll = !currentUserSettings.invertVolumeScroll;
            saveUserSettings();
            }} /> 
        <label for="invertVolumeScroll">{$t('settings.invertVolumeScroll')}</label>
    </div>

    <div class="setting" class:changed={getDefaultUserSettings().proportionalScaleOnByDefault != currentUserSettings.proportionalScaleOnByDefault}>
        <input type="checkbox" id="proportionalScaleOnByDefault" class="fancy"
        checked={currentUserSettings?.proportionalScaleOnByDefault}
        on:click={()=>{
            getUserSettings().proportionalScaleOnByDefault = ! currentUserSettings.proportionalScaleOnByDefault;
            saveUserSettings();
            R.toggleProportionalScale();
            }}  /> 
        <label for="proportionalScaleOnByDefault">{$t('settings.proportionalScaleOnByDefault')}</label>
    </div>

    <div class="setting" class:changed={getDefaultUserSettings().uiScrollSensitivity != uiScrollSensitivity}>
        <input type="range" id="uiScrollSensitivity" class="fancy" min="0.01" max="2" step="0.01"
        placeholder={uiScrollSensitivity.toString()}
        bind:value={uiScrollSensitivity} 
        on:input={()=>{
            getUserSettings().uiScrollSensitivity = uiScrollSensitivity;
            saveUserSettings();
            }}/> 
        <label for="uiScrollSensitivity">
            <span class="rangeValue">{uiScrollSensitivity}</span>
            {$t('settings.uiScrollSensitivity')}
        </label>
    </div>

    <div class="setting" class:changed={getDefaultUserSettings().listenerMoveSpeed != listenerMoveSpeed}>
        <input type="range" id="listenerMoveSpeed" class="fancy" min="1" max="100" step="1"
        placeholder={listenerMoveSpeed.toString()}
        bind:value={listenerMoveSpeed} 
        on:input={()=>{ 
            getUserSettings().listenerMoveSpeed = listenerMoveSpeed;
            saveUserSettings();
            }}/> 
        <label for="listenerMoveSpeed">
            <span class="rangeValue">{listenerMoveSpeed}</span>
            {$t('settings.listenerMoveSpeed')}
        </label>
    </div>

    <div class="setting" class:changed={getDefaultUserSettings().language != currentUserSettings.language}>
        <select bind:value="{$locale}" id="language" class="fancy"
        on:change={()=>{ 
            getUserSettings().language = $locale;
            saveUserSettings();
            }}>
            {#each $locales as value}
                <option value="{value}">{$t(`lang.${value}`)}</option>
            {/each}
        </select>
        <label for="language">{$t('settings.language')}</label>
        
    </div>

    <div class="setting">
        <button id="resetSettings" class="fancy"
        on:click={()=>{ resetUserSettings() }}>
            {$t('settings.reset')}
        </button>
        <em>{$t('settings.autoSave')}</em>
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