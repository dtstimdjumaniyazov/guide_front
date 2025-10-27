import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { email } from '../../constants'

const RulesPage: React.FC = () => {
  const { t } = useTranslation('rules')
  useDocumentTitle(t('title'))

  const sections = Array.from({ length: 10 }, (_, i) => i + 1)

  const renderItem = (text: string) => {
    const processedText = text.replace('{{email}}', email)
    const parts = processedText.split(/(<link>|<\/link>)/)
    let isLink = false
    
    return parts.map((part, idx) => {
      if (part === '<link>') {
        isLink = true
        return null
      }
      if (part === '</link>') {
        isLink = false
        return null
      }
      if (isLink) {
        return (
          <Link key={idx} to="/privacy" className="text-blue-600 hover:underline">
            {part}
          </Link>
        )
      }
      return (
        <span 
          key={idx} 
          dangerouslySetInnerHTML={{ __html: part }}
        />
      )
    })
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('title')}
        </h1>

        {sections.map((num) => {
          const items = t(`section${num}_items`, { returnObjects: true })
          
          if (!Array.isArray(items)) {
            return null
          }

          return (
            <div key={num} className="bg-white p-6 rounded-lg shadow mb-[5px]">
              <p className="text-lg font-semibold mb-4">{t(`section${num}_title`)}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {items.map((item, i) => (
                  <li key={i}>
                    {renderItem(item)}
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

export default RulesPage