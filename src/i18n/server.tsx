import i18n from "i18next";
import de from "./locales/de";
import en from "./locales/en";

i18n
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: "en",
  })
  .catch((err) => {
    console.error("Error initializing i18n", err);
  });

export { i18n };
