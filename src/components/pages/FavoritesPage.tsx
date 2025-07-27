// src/pages/FavoritesPage.tsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetFavoritesQuery, useRemoveFromFavoritesMutation } from '../../store/api/institutionsApi'
import { useAuth } from '../../providers/AuthProvider'
// import { formatters } from '../../hooks/formatters'
import { LoadingSpinner, LoadingCard } from '../../components/Loading'
import { SimplePagination } from '../../components/Pagination'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { InstitutionCard } from '../institutionsCard'

const FavoritesPage: React.FC = () => {
  useDocumentTitle('Избранные учреждения')
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set())

  const { data, isLoading, error, refetch } = useGetFavoritesQuery({
    page: currentPage,
    page_size: 12
  })

  const [removeFromFavorites] = useRemoveFromFavoritesMutation()

  const handleRemoveFromFavorites = async (institutionId: number) => {
    if (removingIds.has(institutionId)) return

    setRemovingIds(prev => new Set(prev).add(institutionId))
    
    try {
      await removeFromFavorites(institutionId).unwrap()
      // Если на текущей странице осталось мало элементов, переходим на предыдущую
      if (data && data.results.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1)
      }
    } catch (error) {
      console.error('Error removing from favorites:', error)
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(institutionId)
        return newSet
      })
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-300 rounded w-64 animate-pulse mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-96 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <LoadingCard count={6} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Ошибка загрузки
          </h1>
          <p className="text-gray-600 mb-6">
            Не удалось загрузить избранные учреждения. Попробуйте обновить страницу.
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Избранные учреждения
          </h1>
          <p className="text-gray-600">
            {user?.full_name ? `${user.full_name}, в` : 'В'}ы можете сохранять понравившиеся учреждения и быстро находить их здесь
          </p>
        </div>

        {data?.results.length ? (
          <>
            {/* Счетчик */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-700">
                {data.count === 1 
                  ? '1 избранное учреждение'
                  : `${data.count} избранных учреждений`
                }
              </p>
              
              {/* Кнопка очистки всего избранного */}
              <button
                onClick={() => {
                  if (window.confirm('Вы уверены, что хотите удалить все учреждения из избранного?')) {
                    // Можно добавить batch удаление в API
                    data.results.forEach(favorite => {
                      handleRemoveFromFavorites(favorite.institution.id)
                    })
                  }
                }}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Очистить все
              </button>
            </div>

            {/* Сетка избранных учреждений */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data.results.map((favorite) => {
                const { institution } = favorite
                const isRemoving = removingIds.has(institution.id)
                
                return (
                  <div
                    key={favorite.id}
                    className={`relative ${isRemoving ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <InstitutionCard 
                      institution={institution} 
                      showFullAddress={true}
                    />
                    
                    {/* Кнопка удаления из избранного */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleRemoveFromFavorites(institution.id)
                      }}
                      disabled={isRemoving}
                      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 z-10"
                      title="Удалить из избранного"
                    >
                      {isRemoving ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Пагинация */}
            {data.total_pages > 1 && (
              <SimplePagination
                currentPage={data.current_page}
                totalPages={data.total_pages}
                onPageChange={handlePageChange}
                className="flex justify-center"
              />
            )}
          </>
        ) : (
          /* Пустое состояние */
          <div className="text-center py-16">
            <div className="text-6xl mb-6">💝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              У вас пока нет избранных учреждений
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Просматривайте каталог детских учреждений и добавляйте понравившиеся в избранное, нажимая на сердечко ♥
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                to="/institutions"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Найти учреждения
              </Link>
              <Link
                to="/submit"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Добавить учреждение
              </Link>
            </div>
          </div>
        )}

        {/* Советы пользователю */}
        {data?.results.length && data.results.length > 0 && (
          <div className="mt-12 bg-blue-50 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-blue-900 mb-2">
                  Полезные советы
                </h4>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• Сравнивайте цены и услуги между избранными учреждениями</li>
                  <li>• Звоните заранее, чтобы уточнить наличие мест</li>
                  <li>• Посещайте учреждения лично перед принятием решения</li>
                  <li>• Добавляйте в избранное запасные варианты</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FavoritesPage