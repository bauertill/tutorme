"use client";
import { i18n } from "@/i18n/react";
import { useStore } from "@/store";
import { useEffect } from "react";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const userLanguage = useStore.use.userLanguage();
  const setUserLanguage = useStore.use.setUserLanguage();
  useEffect(() => {
    if (userLanguage) {
      void i18n.changeLanguage(userLanguage);
    }
  }, [userLanguage]);
  useEffect(() => {
    if (userLanguage === null) {
      const language = i18n.language.split("-")[0];
      if (language && language !== userLanguage) {
        setUserLanguage(language);
      }
    }
    const handler = (lng: string) => {
      const language = lng.split("-")[0];
      if (language && language !== userLanguage) {
        setUserLanguage(language);
      }
    };
    i18n.on("languageChanged", handler);
    return () => {
      i18n.off("languageChanged", handler);
    };
  }, [userLanguage, setUserLanguage]);
  return children;
}
