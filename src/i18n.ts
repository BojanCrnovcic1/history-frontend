import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation.json";
import sr from "./locales/sr/translation.json";

const savedLang = localStorage.getItem("lang") || "sr";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sr: { translation: sr },
    },
    lng: savedLang,
    fallbackLng: "sr",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

