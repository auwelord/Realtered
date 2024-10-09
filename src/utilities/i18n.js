import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import fr from './locales/fr.json';

const i18n = createI18n({
  locale: 'en', // Langue par défaut
  fallbackLocale: 'en', // Langue de repli
  messages: {
    en: en,
    fr: fr,
  }
});

export default i18n;