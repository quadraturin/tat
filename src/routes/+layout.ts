export const prerender = true;
export const ssr = false;
import { loadTranslations } from '$lib/util.translations';

export const load = async () => {
    const initialLocale = 'en';
    await loadTranslations(initialLocale); // keep this just before the `return`
    return {};
}