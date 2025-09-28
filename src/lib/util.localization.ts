import I18n from "sveltekit-i18n";
import { addLocale } from "./registry.svelte";
import { exists, readDir, readTextFile } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";

// Built-in locales
import enInfo from '../assets/localization/en/info.json'
import esInfo from '../assets/localization/es/info.json'

// Set up localization config with built-in locales, use English as fallback
let config = {
    fallbackLocale: 'en',
    loaders: [
        { locale: 'en', key: 'info', loader: async () => (await import ('../assets/localization/en/info.json')).default },
        { locale: 'en', key: 'help', loader: async () => (await import ('../assets/localization/en/help.json')).default },
        { locale: 'en', key: 'ui',   loader: async () => (await import ('../assets/localization/en/ui.json')).default },
        
        { locale: 'custom', key: 'info', loader: async () => (await getCustomLangFile('info.json')) },
        { locale: 'custom', key: 'help', loader: async () => (await getCustomLangFile('help.json')) },
        { locale: 'custom', key: 'ui',   loader: async () => (await getCustomLangFile('ui.json')) },
    ]
};

addLocale({locale:"en", language:enInfo.language});
addLocale({locale:"custom", language:"Custom"});

export let { t, locale, locales, loading, loadTranslations } = new I18n(config);

async function getCustomLangFile(filename:string){
    if (await exists(await join(await appDataDir(), "lang", filename))) {
        return await JSON.parse(await readTextFile(await join(await appDataDir(), "lang", filename)))
    }
}
