import React from 'react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useTranslation } from "react-i18next"

const AboutPage: React.FC = () => {
  useDocumentTitle('О нас')
  const { t } = useTranslation("about");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t("About project")}
        </h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            <strong>{t("Child guide")}</strong> — {t("definition")}
          </p>
          <p className="text-gray-600 mb-4">
            {t("purpose")}
          </p>
          <p className="text-gray-600 mb-4">
            {t("description")}
          </p>
          <p className="text-gray-600 mb-4">
            <strong>{t("Our purpose")}</strong> — {t("purpose_description")}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage