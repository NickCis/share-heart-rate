import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import es from "@/locales/es.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    supportedLngs: ["en", "es"],
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["cookie", "navigator"],
      caches: ["cookie"],
      lookupCookie: "locale",
      cookieMinutes: 60 * 24 * 365,
    },
  });

export default i18n;
