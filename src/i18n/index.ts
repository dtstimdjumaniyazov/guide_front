import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Импортируем JSON-файлы с переводами
import ruAboutPage from "./locales/ru/AboutPage.json";
import uzAboutPage from "./locales/uz/AboutPage.json";
import ruFooter from './locales/ru/Footer.json';
import uzFooter from './locales/uz/Footer.json';
import ruAuth from './locales/ru/auth.json';
import uzAuth from './locales/uz/auth.json';
import ruHeader from './locales/ru/Header.json'
import uzHeader from './locales/uz/Header.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: {
        about: ruAboutPage,
        footer: ruFooter,
        auth: ruAuth,
        header: ruHeader,
      },
      uz: {
        about: uzAboutPage,
        footer: uzFooter,
        auth: uzAuth,
        header: uzHeader,
      },
    },
    lng: "ru", // язык по умолчанию
    fallbackLng: "ru", // если перевод не найден, будет использоваться русский
    ns: ["about", "translation"],
    interpolation: {
      escapeValue: false, // React уже экранирует HTML
    },
  });

export default i18n;