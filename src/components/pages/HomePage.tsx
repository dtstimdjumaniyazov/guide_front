import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetInstitutionsQuery, useGetPublicStatsQuery, useGetInstitutionTypesQuery, useGetFavoritesQuery } from '../../store/api/institutionsApi'
import { LoadingCard } from '../../components/Loading'
import { formatters } from '../../hooks/formatters'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { InstitutionCard } from '../InstitutionsCard'
import { useAuth } from '../../providers/AuthProvider'


const HomePage: React.FC = () => {
  useDocumentTitle('Главная')
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  
  const { isAuthenticated } = useAuth()

  // Получаем статистику
  const { data: stats, isLoading: statsLoading } = useGetPublicStatsQuery()

  // Получаем личные избранные (только для авторизованных)
  const { data: favoritesData, isLoading: favoritesLoading, error: favoritesError } = useGetFavoritesQuery(
    { page: 1, page_size: 1 }, // Запрашиваем минимум для получения count
    { skip: !isAuthenticated } // Пропускаем запрос если не авторизован
  )
  console.log('=== FAVORITES DEBUG ===')
  console.log('isAuthenticated:', isAuthenticated)
  console.log('favoritesData:', favoritesData)
  console.log('favoritesLoading:', favoritesLoading)
  console.log('favoritesError:', favoritesError)
  console.log('stats:', stats)

  // Получаем типы учреждений
  const { data: institutionTypes, isLoading: typesLoading } = useGetInstitutionTypesQuery()

  // Получаем популярные учреждения
  const { data: institutionsData, isLoading: institutionsLoading } = useGetInstitutionsQuery({
    page_size: 6,
    ordering: '-created_at'
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/institutions?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero секция */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Вместе подберем лучшее для
              <span className="block text-yellow-300">вашего ребенка</span>
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Детские сады, кружки, спортивные секции и развивающие центры в одном месте
            </p>

            {/* Кнопка входа через Google - показываем только если не авторизован
            {!isAuthenticated && (
              <div className="mb-8">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto">
                  <p className="text-lg mb-4 text-blue-100">
                    Войдите для персональных рекомендаций
                  </p>
                  <GoogleOAuthProvider clientId={GOOGLE_AUTH_CLIENT_ID}>
                    <div className="flex justify-center">
                      <GoogleSignInButton 
                        handleGoogleSignIn={handleGoogleSignIn}
                        isLoading={googleAuthLoading}
                      />
                    </div>
                  </GoogleOAuthProvider>
                </div>
              </div>
            )} */}

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
                <div className="text-3xl font-bold text-gray-900">
                  {/* Показываем личную статистику для авторизованных, общую для остальных */}
                  {isAuthenticated 
                    ? formatters.formatNumber(favoritesData?.count || 0)
                    : formatters.formatNumber(stats.total_favorites)
                  }
                </div>
                <div className="text-gray-600">В избранном</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Динамические категории */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Категории учреждений
            </h2>
            <p className="text-gray-600">
              Выберите подходящую категорию, чтобы найти именно то, что нужно вашему ребенку
            </p>
          </div>

          {typesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : institutionTypes && institutionTypes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {institutionTypes.map((type) => (
                <Link
                  key={type.id}
                  to={`/institutions?institution_type_id=${type.id}`}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                      {type?.icon || '🏫'}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {type.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {type.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Пока нет доступных категорий</p>
            </div>
          )}
        </div>
      </div>

      {/* Популярные учреждения */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Новые учреждения
              </h2>
              <p className="text-gray-600">
                Недавно добавленные детские учреждения
              </p>
            </div>
            <Link
              to="/institutions"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Показать все
            </Link>
          </div>

          {institutionsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : institutionsData && institutionsData.results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {institutionsData.results.map((institution) => (
                <InstitutionCard key={institution.id} institution={institution} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Пока нет доступных учреждений</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA секция */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Есть детское учреждение?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Добавьте его в наш каталог и расскажите родителям о ваших услугах
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* {isAuthenticated ? (
              <Link
                to="/submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
              >
                Добавить учреждение
              </Link>
            ) : (
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-blue-100 mb-3">Войдите через Google, чтобы добавить учреждение</p>
                <GoogleOAuthProvider clientId={GOOGLE_AUTH_CLIENT_ID}>
                  <GoogleSignInButton 
                    handleGoogleSignIn={handleGoogleSignIn}
                    isLoading={googleAuthLoading}
                  />
                </GoogleOAuthProvider>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage