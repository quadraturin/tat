import { assets } from "$app/paths";
import I18n from "sveltekit-i18n";
import lang from "../assets/localization/languages.json"

/** @type {import('sveltekit-i18n').Config} */
const config = ({
    translations: {
        en: { lang },
        es: { lang },
    },
    loaders: [
        { locale: 'en', key: 'about', loader: async () => (await import ('../assets/localization/en/about.json')).default },
        { locale: 'en', key: 'dialog', loader: async () => (await import ('../assets/localization/en/dialog.json')).default },
        { locale: 'en', key: 'help', loader: async () => (await import ('../assets/localization/en/help.json')).default },
        { locale: 'en', key: 'settings', loader: async () => (await import ('../assets/localization/en/settings.json')).default },
        { locale: 'en', key: 'ui', loader: async () => (await import ('../assets/localization/es/ui.json')).default },
        
        { locale: 'es', key: 'about', loader: async () => (await import ('../assets/localization/es/about.json')).default },
        { locale: 'es', key: 'dialog', loader: async () => (await import ('../assets/localization/es/dialog.json')).default },
        { locale: 'es', key: 'help', loader: async () => (await import ('../assets/localization/es/help.json')).default },
        { locale: 'es', key: 'settings', loader: async () => (await import ('../assets/localization/es/settings.json')).default },
        { locale: 'es', key: 'ui', loader: async () => (await import ('../assets/localization/es/ui.json')).default },
    ]
});

export const { t, locale, locales, loading, loadTranslations } = new I18n(config);