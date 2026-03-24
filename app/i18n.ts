import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enResource from "../i18n/en/resource.json";
import cnResource from "../i18n/cn/resource.json";
import hiResource from "../i18n/hi/resource.json";
import taResource from "../i18n/ta/resource.json";
import teResource from "../i18n/te/resource.json";
import bnResource from "../i18n/bn/resource.json";

const resources = {
  en: { translation: enResource },
  cn: { translation: cnResource },
  hi: { translation: hiResource },
  ta: { translation: taResource },
  te: { translation: teResource },
  bn: { translation: bnResource },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  compatibilityJSON: "v3",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
