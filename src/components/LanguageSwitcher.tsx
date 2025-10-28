import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { institutionsApi } from '../store/api/institutionsApi'


const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();

  const changeLanguage = (lng: "ru" | "uz") => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng); // ✅ сохраняем выбор пользователя
    dispatch(
      institutionsApi.util.invalidateTags([
        {type: "InstitutionType", id: "LIST"},
      ])
    )
  };

  const currentLang = i18n.language;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage("ru")}
        className={`px-2 py-1 rounded ${
          currentLang === "ru"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        RU
      </button>

      <button
        onClick={() => changeLanguage("uz")}
        className={`px-2 py-1 rounded ${
          currentLang === "uz"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        UZ
      </button>
    </div>
  );
};

export default LanguageSwitcher;
