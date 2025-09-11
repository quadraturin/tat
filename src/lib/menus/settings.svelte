<script lang="ts">
    import { t, locales, locale } from '$lib/util.localization';
	import * as R from '$lib/registry.svelte';
	import { getDefaultUserSettings, getUserSettings, resetUserSettings, userSettings } from '$lib/settings.userSettings.svelte';
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { saveUserSettings } from '$lib/settings.saveUserSettings';
	import { getThemesList } from '$lib/settings.theme';
	import IconReset from '$lib/icons/iconReset.svelte';
	import { help } from '$lib/util.help';
    const appWindow = getCurrentWebviewWindow();

    let themesList = $state(getThemesList());

</script>

<!-- Settings Menu -->
<div class="menu" id="settings">
    <h2>{$t('ui.menu.settings.title')}</h2>

    <!-- Hide Window Contents From Stream -->
    <div class={["setting", (getDefaultUserSettings().hideWindowContentsFromStream != userSettings.hideWindowContentsFromStream) && "changed"]}
        role="heading" aria-level="4"
        onfocus     = {()=>{}} 
        onblur      = {()=>{}}
        onmouseover = {()=>{help($t('help.menu.settings.hideWindowContents'))}}
        onmouseout  = {()=>{help()}}>
        <label for="hideWindowContentsFromStream">{$t('ui.menu.settings.hideWindowContents')}</label>
        <input type="checkbox" id="hideWindowContentsFromStream" class="fancy"
        checked={userSettings?.hideWindowContentsFromStream}
        onclick={()=>{
            appWindow.setContentProtected(!userSettings?.hideWindowContentsFromStream);
            getUserSettings().hideWindowContentsFromStream = !userSettings.hideWindowContentsFromStream;
            saveUserSettings();
            }} /> 
    </div>

    <!-- Invert Volume Scroll-->
    <div class="setting" class:changed={getDefaultUserSettings().invertVolumeScroll != userSettings.invertVolumeScroll}
        role="heading" aria-level="4"
        onfocus     = {()=>{}} 
        onblur      = {()=>{}}
        onmouseover = {()=>{help($t('help.menu.settings.invertScroll'))}}
        onmouseout  = {()=>{help()}}>
        <label for="invertVolumeScroll">{$t('ui.menu.settings.invertScroll')}</label>
        <input type="checkbox" id="invertVolumeScroll" class="fancy" 
        checked={userSettings?.invertVolumeScroll}
        onclick={()=>{
            userSettings.invertVolumeScroll = !userSettings.invertVolumeScroll;
            saveUserSettings();
            }} /> 
    </div>

    <!-- Proportional Scale On By Default -->
    <div class="setting" class:changed={getDefaultUserSettings().proportionalScaleOnByDefault != userSettings.proportionalScaleOnByDefault}
        role="heading" aria-level="4"
        onfocus     = {()=>{}} 
        onblur      = {()=>{}}
        onmouseover = {()=>{help($t('help.menu.settings.proportionalScale'))}}
        onmouseout  = {()=>{help()}}>
        <label for="proportionalScaleOnByDefault">{$t('ui.menu.settings.proportionalScale')}</label>
        <input type="checkbox" id="proportionalScaleOnByDefault" class="fancy"
        checked={userSettings?.proportionalScaleOnByDefault}
        onclick={()=>{
            userSettings.proportionalScaleOnByDefault = ! userSettings.proportionalScaleOnByDefault;
            saveUserSettings();
            R.toggleProportionalScale();
            }}  /> 
    </div>

    <!-- UI Scroll Sensitivity -->
    <div class="setting" class:changed={getDefaultUserSettings().uiScrollSensitivity != userSettings.uiScrollSensitivity}
        role="heading" aria-level="4"
        onfocus     = {()=>{}} 
        onblur      = {()=>{}}
        onmouseover = {()=>{help($t('help.menu.settings.scrollSensitivity'))}}
        onmouseout  = {()=>{help()}}>
        <label for="uiScrollSensitivity">
            {$t('ui.menu.settings.scrollSensitivity')}
        </label>
        <span class="rangeValue">{userSettings.uiScrollSensitivity}</span>
        <input type="range" id="uiScrollSensitivity" class="fancy" min="0.01" max="2" step="0.01"
        placeholder={userSettings.uiScrollSensitivity.toString()}
        bind:value={userSettings.uiScrollSensitivity} 
        oninput={()=>{
            userSettings.uiScrollSensitivity = userSettings.uiScrollSensitivity;
            saveUserSettings();
            }}/> 
    </div>

    <!-- Listener Move Speed -->
    <div class="setting" class:changed={getDefaultUserSettings().listenerMoveSpeed != userSettings.listenerMoveSpeed}
        role="heading" aria-level="4"
        onfocus     = {()=>{}} 
        onblur      = {()=>{}}
        onmouseover = {()=>{help($t('help.menu.settings.listenerMoveSpeed'))}}
        onmouseout  = {()=>{help()}}>
        <label for="listenerMoveSpeed">
            {$t('ui.menu.settings.listenerMoveSpeed')}
        </label>
        <span class="rangeValue">{userSettings.listenerMoveSpeed}</span>
        <input type="range" id="listenerMoveSpeed" class="fancy" min="1" max="100" step="1"
        placeholder={userSettings.listenerMoveSpeed.toString()}
        bind:value={userSettings.listenerMoveSpeed} 
        oninput={()=>{ 
            userSettings.listenerMoveSpeed = userSettings.listenerMoveSpeed;
            saveUserSettings();
            }}/> 
    </div>

    <!-- Language -->
    <div class="setting" class:changed={getDefaultUserSettings().language != userSettings.language}
        role="heading" aria-level="4"
        onfocus     = {()=>{}} 
        onblur      = {()=>{}}
        onmouseover = {()=>{help($t('help.menu.settings.language'))}}
        onmouseout  = {()=>{help()}}>
        <label for="language">{$t('ui.menu.settings.language')}</label>
        <select bind:value={userSettings.language} id="language" class="fancy"
        onchange={ ()=>{ 
            locale.set(userSettings.language);
            saveUserSettings();
            }}>
            {#each $locales as value}
                <option value="{value}">{$t(`lang.${value}`)}</option>
            {/each}
        </select>
    </div>

    <!-- Theme -->
    <div class="setting" class:changed={getDefaultUserSettings().theme != userSettings.theme}
        role="heading" aria-level="4"
        onfocus     = {()=>{}} 
        onblur      = {()=>{}}
        onmouseover = {()=>{help($t('help.menu.settings.theme'))}}
        onmouseout  = {()=>{help()}}>
        <label for="theme">{$t('ui.menu.settings.theme')}</label>
        <select bind:value={userSettings.theme} id="theme" class="fancy"
        onchange={()=>{ 
            R.setTheme(userSettings.theme);
            saveUserSettings();
            }}>
            {#each themesList as theme}
                <option value="{theme.info?.name}">{theme.info?.name}</option>
            {/each}
        </select>
    </div>

    <!-- Reset To Defaults-->
    <div class="setting" role="heading" aria-level="4"
        onfocus     = {()=>{}} 
        onblur      = {()=>{}}
        onmouseover = {()=>{help($t('help.menu.settings.reset'))}}
        onmouseout  = {()=>{help()}}>
        <button id="resetSettings" class="fancy"
        onclick={()=>{ resetUserSettings() }}>
            <IconReset/><span>{$t('ui.menu.settings.reset')}</span>
        </button>
        <em>{$t('ui.menu.settings.autoSave')}</em>
    </div>
</div>
