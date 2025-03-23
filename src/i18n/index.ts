import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import {
  initReactI18next,
  useTranslation as useTranslationBase,
} from "react-i18next";
import de from "./locales/de";
import en from "./locales/en";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: "en",

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  })
  .catch((err) => {
    console.error("Error initializing i18n", err);
  });

export const useTranslation = () => {
  return useTranslationBase(undefined, { i18n });
};

export { i18n };
