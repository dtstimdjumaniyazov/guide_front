import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { email } from '../../constants'

const HelpPage: React.FC = () => {
  const { t } = useTranslation('help')
  useDocumentTitle(t('title'))

  const renderItem = (text: string) => {
    return text.replace('{{email}}', email)
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('title')}
        </h1>

        {/* Section 1 */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">{t('section1_title')}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {(t('section1_items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Section 2 */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">{t('section2_title')}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {(t('section2_items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>
                {item}
                {i === 2 && (
                  <ul className="list-none text-gray-700 pl-10 mt-2">
                    {(t('section2_subitems', { returnObjects: true }) as string[]).map((subitem, j) => (
                      <li key={j} className="relative before:content-['-'] before:absolute before:-left-4">
                        {subitem}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">{t('section3_title')}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {(t('section3_items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Section 4 */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">{t('section4_title')}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {(t('section4_items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Section 5 */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">{t('section5_title')}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {(t('section5_items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>
                {item}
                {i === 3 && (
                  <ul className="list-none text-gray-700 pl-10 mt-2">
                    {(t('section5_subitems', { returnObjects: true }) as string[]).map((subitem, j) => (
                      <li key={j} className="relative before:content-['-'] before:absolute before:-left-4">
                        {subitem}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Section 6 */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">{t('section6_title')}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {(t('section6_items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>
                {renderItem(item)}
                {i === 0 && (
                  <ul className="list-none text-gray-700 pl-10 mt-2">
                    {(t('section6_subitems', { returnObjects: true }) as string[]).map((subitem, j) => (
                      <li key={j} className="relative before:content-['-'] before:absolute before:-left-4">
                        {subitem}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default HelpPage