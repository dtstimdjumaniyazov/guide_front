import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetInstitutionsQuery, useGetPublicStatsQuery } from '../../store/api/institutionsApi'
import { LoadingCard } from '../../components/Loading'
import { formatters } from '../../hooks/formatters'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { InstitutionCard } from '../institutionsCard'


const HomePage: React.FC = () => {
  useDocumentTitle('Главная')
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  
  // Получаем статистику
  const { data: stats, isLoading: statsLoading } = useGetPublicStatsQuery()

  // Получаем популярные учреждения
  const { data: institutionsData, isLoading: institutionsLoading } = useGetInstitutionsQuery({
    page_size: 6,
    ordering: '-created_at'
  })
  console.log(institutionsData)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/institutions?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const categories = [
    {
      name: 'Детские сады',
      icon: '🏫',
      description: 'Государственные и частные детские сады',
      link: '/institutions?search=детский сад'
    },
    {
      name: 'Кружки и секции',
      icon: '🎨',
      description: 'Творческие и развивающие кружки',
      link: '/institutions?search=кружок'
    },
    {
      name: 'Спорт',
      icon: '⚽',
      description: 'Спортивные секции и школы',
      link: '/institutions?search=спорт'
    },
    {
      name: 'Языковые школы',
      icon: '🗣️',
      description: 'Изучение иностранных языков',
      link: '/institutions?search=язык'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero секция */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Найдите лучшее для
              <span className="block text-yellow-300">вашего ребенка</span>
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Детские сады, кружки, спортивные секции и развивающие центры в одном месте
            </p>

            {/* Поиск */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Поиск детских учреждений..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 text-gray-900 bg-white rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 text-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg shadow-lg transition-colors duration-200 text-lg"
                >
                  Найти
                </button>
              </div>
            </form>

            {/* Быстрые ссылки */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="text-blue-200">Популярные запросы:</span>
              <Link to="/institutions?search=детский сад" className="text-yellow-300 hover:text-yellow-200 underline">
                детские сады
              </Link>
              <Link to="/institutions?search=английский" className="text-yellow-300 hover:text-yellow-200 underline">
                английский язык
              </Link>
              <Link to="/institutions?search=танцы" className="text-yellow-300 hover:text-yellow-200 underline">
                танцы
              </Link>
              <Link to="/institutions?search=футбол" className="text-yellow-300 hover:text-yellow-200 underline">
                футбол
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Статистика */}
      {statsLoading ? (
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center animate-pulse">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : stats && (
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl mb-4">🏫</div>
                <div className="text-3xl font-bold text-gray-900">{formatters.formatNumber(stats.total_institutions)}</div>
                <div className="text-gray-600">Учреждений</div>
              </div>
              <div>
                <div className="text-4xl mb-4">📸</div>
                <div className="text-3xl font-bold text-gray-900">{formatters.formatNumber(stats.institutions_with_media)}</div>
                <div className="text-gray-600">С фотографиями</div>
              </div>
              <div>
                <div className="text-4xl mb-4">♥️</div>
                <div className="text-3xl font-bold text-gray-900">{formatters.formatNumber(stats.total_favorites)}</div>
                <div className="text-gray-600">В избранном</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Категории */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Категории учреждений
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Выберите подходящую категорию, чтобы найти именно то, что нужно вашему ребенку
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Популярные учреждения */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Новые учреждения
            </h2>
            <p className="text-gray-600">
              Недавно добавленные детские учреждения
            </p>
          </div>

          {institutionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LoadingCard count={6} />
            </div>
          ) : institutionsData?.results.length ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {institutionsData.results.map((institution) => (
                  <InstitutionCard 
                    key={institution.id} 
                    institution={institution} 
                  />
                ))}
              </div>
              
              <div className="text-center">
                <Link
                  to="/institutions"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Посмотреть все учреждения
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏫</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Пока учреждений нет
              </h3>
              <p className="text-gray-600 mb-6">
                Станьте первым, кто добавит детское учреждение!
              </p>
              <Link
                to="/submit"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Добавить учреждение
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* CTA секция */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Есть учреждение для детей?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Добавьте ваше учреждение на платформу и помогите родителям найти лучшее для их детей
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg shadow-lg transition-colors duration-200 text-lg"
          >
            Добавить учреждение
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage