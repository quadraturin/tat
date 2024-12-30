<script lang="ts">
    import { t, locales, locale } from '$lib/util.localization';
	import * as R from '$lib/registry.svelte';
	import { getDefaultUserSettings, getUserSettings, resetUserSettings, userSettings } from '$lib/settings.userSettings.svelte';
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { saveUserSettings } from '$lib/settings.saveUserSettings';
	import { getThemesList } from '$lib/settings.theme';
    const appWindow = getCurrentWebviewWindow();

    let themesList = $state(getThemesList());
    let loc:string;

</script>

<!-- Settings Menu -->
<div class="menu" id="settings">
    <h2>{$t('settings.settingsTitle')}</h2>

    <!-- Hide Window Contents From Stream -->
    <div class={["setting", (getDefaultUserSettings().hideWindowContentsFromStream != userSettings.hideWindowContentsFromStream) && "changed"]}>
        <input type="checkbox" id="hideWindowContentsFromStream" class="fancy"
        checked={userSettings?.hideWindowContentsFromStream}
        onclick={()=>{
            appWindow.setContentProtected(!userSettings?.hideWindowContentsFromStream);
            getUserSettings().hideWindowContentsFromStream = !userSettings.hideWindowContentsFromStream;
            saveUserSettings();
            }} /> 
        <label for="hideWindowContentsFromStream">{$t('settings.hideWindowContentsFromStream')} {getDefaultUserSettings().hideWindowContentsFromStream} {userSettings.hideWindowContentsFromStream}</label>
    </div>

    <!-- Invert Volume Scroll-->
    <div class="setting" class:changed={getDefaultUserSettings().invertVolumeScroll != userSettings.invertVolumeScroll}>
        <input type="checkbox" id="invertVolumeScroll" class="fancy" 
        checked={userSettings?.invertVolumeScroll}
        onclick={()=>{
            userSettings.invertVolumeScroll = !userSettings.invertVolumeScroll;
            saveUserSettings();
            }} /> 
        <label for="invertVolumeScroll">{$t('settings.invertVolumeScroll')}</label>
    </div>

    <!-- Proportional Scale On By Default -->
    <div class="setting" class:changed={getDefaultUserSettings().proportionalScaleOnByDefault != userSettings.proportionalScaleOnByDefault}>
        <input type="checkbox" id="proportionalScaleOnByDefault" class="fancy"
        checked={userSettings?.proportionalScaleOnByDefault}
        onclick={()=>{
            userSettings.proportionalScaleOnByDefault = ! userSettings.proportionalScaleOnByDefault;
            saveUserSettings();
            R.toggleProportionalScale();
            }}  /> 
        <label for="proportionalScaleOnByDefault">{$t('settings.proportionalScaleOnByDefault')}</label>
    </div>

    <!-- UI Scroll Sensitivity -->
    <div class="setting" class:changed={getDefaultUserSettings().uiScrollSensitivity != userSettings.uiScrollSensitivity}>
        <input type="range" id="uiScrollSensitivity" class="fancy" min="0.01" max="2" step="0.01"
        placeholder={userSettings.uiScrollSensitivity.toString()}
        bind:value={userSettings.uiScrollSensitivity} 
        oninput={()=>{
            userSettings.uiScrollSensitivity = userSettings.uiScrollSensitivity;
            saveUserSettings();
            }}/> 
        <label for="uiScrollSensitivity">
            <span class="rangeValue">{userSettings.uiScrollSensitivity}</span>
            {$t('settings.uiScrollSensitivity')}
        </label>
    </div>

    <!-- Listener Move Speed -->
    <div class="setting" class:changed={getDefaultUserSettings().listenerMoveSpeed != userSettings.listenerMoveSpeed}>
        <input type="range" id="listenerMoveSpeed" class="fancy" min="1" max="100" step="1"
        placeholder={userSettings.listenerMoveSpeed.toString()}
        bind:value={userSettings.listenerMoveSpeed} 
        oninput={()=>{ 
            userSettings.listenerMoveSpeed = userSettings.listenerMoveSpeed;
            saveUserSettings();
            }}/> 
        <label for="listenerMoveSpeed">
            <span class="rangeValue">{userSettings.listenerMoveSpeed}</span>
            {$t('settings.listenerMoveSpeed')}
        </label>
    </div>

    <!-- Language -->
    <div class="setting" class:changed={getDefaultUserSettings().language != userSettings.language}>
        <select bind:value={userSettings.language} id="language" class="fancy"
        onchange={ ()=>{ 
            locale.set(userSettings.language);
            saveUserSettings();
            }}>
            {#each $locales as value}
                <option value="{value}">{$t(`lang.${value}`)}</option>
            {/each}
        </select>
        <label for="language">{$t('settings.language')}</label>
    </div>

    <!-- Theme -->
    <div class="setting" class:changed={getDefaultUserSettings().theme != userSettings.theme}>
        <select bind:value={userSettings.theme} id="theme" class="fancy"
        onchange={()=>{ 
            saveUserSettings();
            }}>
            {#each themesList as theme}
                <option value="{theme.name}">{theme.name}</option>
            {/each}
        </select>
        <label for="theme">{$t('settings.theme')}</label>
    </div>

    <!-- Reset To Defaults-->
    <div class="setting">
        <button id="resetSettings" class="fancy"
        onclick={()=>{ resetUserSettings() }}>
            {$t('settings.reset')}
        </button>
        <em>{$t('settings.autoSave')}</em>
    </div>
</div>
