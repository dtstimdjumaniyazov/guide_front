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
            <strong>Детский Гид</strong> — это онлайн-платформа, созданная специально для родителей Узбекистана.
Здесь вы можете легко найти и сравнить детские сады, кружки, спортивные секции и развивающие центры, чтобы выбрать лучшее и качественное учреждение для вашего ребёнка.
          </p>
          <p className="text-gray-600 mb-4">
            Мы стремимся к тому, чтобы каждая семья могла быстро получить достоверную информацию о доступных образовательных и развивающих учреждениях в своём городе.
          </p>
          <p className="text-gray-600 mb-4">
            Чтобы поддерживать высокое качество сервиса, на сайте работает система модерации. Все описания учреждений, добавляемые авторизованными пользователями, проходят проверку нашими модераторами. Это помогает исключить недостоверную информацию и гарантировать родителям только актуальные данные.
          </p>
          <p className="text-gray-600 mb-4">
            <strong>Наша цель</strong> — сделать процесс выбора простым, удобным и безопасным для родителей и детей.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage