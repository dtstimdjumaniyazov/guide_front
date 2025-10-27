import React from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { email } from '../../constants'
import { Link } from 'react-router-dom'

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation('privacy')
  useDocumentTitle(t('title'))

  const sections = Array.from({ length: 11 }, (_, i) => i + 1)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

        {sections.map((num) => {
          const items = t(`section${num}_items`, { returnObjects: true })
          
          // Проверка, что items действительно массив
          if (!Array.isArray(items)) {
            return null
          }

          return (
            <div key={num} className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">{t(`section${num}_title`)}</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {items.map((_, i) => (
                  <li key={i}>
                    <Trans
                      i18nKey={`section${num}_items.${i}`}
                      ns="privacy"
                      components={{
                        strong: <strong />,
                        link: <Link to="/contacts" className="text-blue-600 hover:underline" />
                      }}
                      values={{ email }}
                      defaults=""
                    />
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PrivacyPage