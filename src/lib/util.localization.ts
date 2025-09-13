import I18n from "sveltekit-i18n";
import lang from "../assets/localization/languages.json"

const config = ({
    translations: {
        en: { lang },
        //es: { lang },
    },
    loaders: [
        { locale: 'en', key: 'help', loader: async () => (await import ('../assets/localization/en/help.json')).default },
        { locale: 'en', key: 'ui',   loader: async () => (await import ('../assets/localization/en/ui.json')).default },
        
        //{ locale: 'es', key: 'help', loader: async () => (await import ('../assets/localization/es/help.json')).default },
        //{ locale: 'es', key: 'ui',   loader: async () => (await import ('../assets/localization/es/ui.json')).default },
    ]
});

export const { t, locale, locales, loading, loadTranslations } = new I18n(config);
