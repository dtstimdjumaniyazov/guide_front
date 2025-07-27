import React from 'react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

const AboutPage: React.FC = () => {
  useDocumentTitle('О нас')
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          О проекте
        </h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            Детский Гид - это платформа для поиска и выбора лучших детских учреждений в вашем городе.
          </p>
          <p className="text-gray-600">
            Мы помогаем родителям найти подходящие детские сады, кружки, спортивные секции и другие развивающие центры.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage