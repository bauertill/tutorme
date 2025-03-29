import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import {
  initReactI18next,
  Trans as TransBase,
  useTranslation as useTranslationBase,
} from "react-i18next";
import de from "./locales/de";
import en from "./locales/en";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .init({
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

export const Trans: typeof TransBase = (props) => {
  const { t } = useTranslation();
  return <TransBase {...props} t={t} />;
};

export { i18n };
