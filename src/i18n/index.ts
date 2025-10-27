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
import ruHomePage from './locales/ru/HomePage.json'
import uzHomePage from './locales/uz/HomePage.json'
import ruContactsPage from './locales/ru/ContactsPage.json'
import uzContactsPage from './locales/uz/ContactsPage.json'
import ruInstitutionsPage from './locales/ru/InstitutionsPage.json'
import uzInstitutionsPage from './locales/uz/InstitutionsPage.json'
import ruInstitutionDetail from './locales/ru/InstitutionDetailPage.json'
import uzInstitutionDetail from './locales/uz/InstitutionDetailPage.json'
import ruPrivacyPage from './locales/ru/PrivacyPage.json'
import uzPrivacyPage from './locales/uz/PrivacyPage.json'
import ruRulesPage from './locales/ru/RulesPage.json'
import uzRulesPage from './locales/uz/RulesPage.json'
import ruQR from './locales/ru/QR.json'
import uzQR from './locales/uz/QR.json'
import ruHelpPage from './locales/ru/HelpPage.json'
import uzHelpPage from './locales/uz/HelpPage.json'


i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: {
        about: ruAboutPage,
        footer: ruFooter,
        auth: ruAuth,
        header: ruHeader,
        homePage: ruHomePage,
        contactsPage: ruContactsPage,
        institutionsPage: ruInstitutionsPage,
        institutionDetail: ruInstitutionDetail,
        privacy: ruPrivacyPage,
        rules: ruRulesPage,
        QR: ruQR,
        help: ruHelpPage,
      },
      uz: {
        about: uzAboutPage,
        footer: uzFooter,
        auth: uzAuth,
        header: uzHeader,
        homePage: uzHomePage,
        contactsPage: uzContactsPage,
        institutionsPage: uzInstitutionsPage,
        institutionDetail: uzInstitutionDetail,
        privacy: uzPrivacyPage,
        rules: uzRulesPage,
        QR: uzQR,
        help: uzHelpPage,
      },
    },
    lng: "ru", // язык по умолчанию
    fallbackLng: "ru", // если перевод не найден, будет использоваться русский
    ns: ["about", "translation", "privacy"],
    interpolation: {
      escapeValue: false, // React уже экранирует HTML
    },
  });

export default i18n;