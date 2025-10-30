import I18n from "sveltekit-i18n";
import { addLocale } from "./registry.svelte";
import { exists, readTextFile } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";

// Built-in locales
import enInfo from '../assets/localization/en/info.json'
import esInfo from '../assets/localization/es/info.json'
import ptInfo from '../assets/localization/pt/info.json'

// Set up localization config with built-in locales, use English as fallback
let config = {
    fallbackLocale: 'en',
    loaders: [
        { locale: 'en', key: 'info', loader: async () => (await import ('../assets/localization/en/info.json')).default },
        { locale: 'en', key: 'help', loader: async () => (await import ('../assets/localization/en/help.json')).default },
        { locale: 'en', key: 'ui',   loader: async () => (await import ('../assets/localization/en/ui.json')).default },

        { locale: 'es', key: 'info', loader: async () => (await import ('../assets/localization/es/info.json')).default },
        { locale: 'es', key: 'help', loader: async () => (await import ('../assets/localization/es/help.json')).default },
        { locale: 'es', key: 'ui',   loader: async () => (await import ('../assets/localization/es/ui.json')).default },

        { locale: 'pt', key: 'info', loader: async () => (await import ('../assets/localization/pt/info.json')).default },
        { locale: 'pt', key: 'help', loader: async () => (await import ('../assets/localization/pt/help.json')).default },
        { locale: 'pt', key: 'ui',   loader: async () => (await import ('../assets/localization/pt/ui.json')).default },
        
        { locale: 'custom', key: 'info', loader: async () => (await getCustomLangFile('info.json')) },
        { locale: 'custom', key: 'help', loader: async () => (await getCustomLangFile('help.json')) },
        { locale: 'custom', key: 'ui',   loader: async () => (await getCustomLangFile('ui.json')) },
    ]
};

addLocale({locale:"en", language:enInfo.language});
addLocale({locale:"es", language:esInfo.language});
addLocale({locale:"pt", language:ptInfo.language});
addLocale({locale:"custom", language:"Custom"});

export let { t, locale, locales, loading, loadTranslations } = new I18n(config);

async function getCustomLangFile(filename:string){
    if (await exists(await join(await appDataDir(), "lang", filename))) {
        return await JSON.parse(await readTextFile(await join(await appDataDir(), "lang", filename)))
    }
}
