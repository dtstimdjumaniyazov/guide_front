import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetMySubmissionsQuery } from '../../store/api/institutionsApi'
import { useAuth } from '../../providers/AuthProvider'
import { formatters } from '../../hooks/formatters'
import { LoadingCard } from '../../components/Loading'
import { SimplePagination } from '../../components/Pagination'
import type { SubmissionStatus } from '../../types'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

const MySubmissionsPage: React.FC = () => {
  useDocumentTitle('Мои заявки')
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus | 'all'>('all')

  const { data, isLoading, error, refetch } = useGetMySubmissionsQuery({
    page: currentPage,
    page_size: 10
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'needs_edit':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'approved':
        return '✅'
      case 'rejected':
        return '❌'
      case 'needs_edit':
        return '📝'
      default:
        return '❓'
    }
  }

  const getStatusText = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending':
        return 'На рассмотрении'
      case 'approved':
        return 'Одобрено'
      case 'rejected':
        return 'Отклонено'
      case 'needs_edit':
        return 'Требует доработки'
      default:
        return 'Неизвестно'
    }
  }

  const filteredSubmissions = data?.results.filter(submission => 
    selectedStatus === 'all' || submission.status === selectedStatus
  ) || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-300 rounded w-64 animate-pulse mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-96 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <LoadingCard count={5} className="h-32" />
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
            Не удалось загрузить ваши заявки. Попробуйте обновить страницу.
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
            Мои заявки
          </h1>
          <p className="text-gray-600">
            {user?.full_name ? `${user.full_name}, з` : 'З'}десь вы можете отслеживать статус своих заявок на добавление учреждений
          </p>
        </div>

        {data?.results.length ? (
          <>
            {/* Фильтры и статистика */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Статистика */}
                <div className="flex flex-wrap gap-4">
                  {(['all', 'pending', 'approved', 'rejected', 'needs_edit'] as const).map(status => {
                    const count = status === 'all' 
                      ? data.results.length 
                      : data.results.filter(s => s.status === status).length
                    
                    if (count === 0 && status !== 'all') return null

                    return (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                          selectedStatus === status
                            ? status === 'all' 
                              ? 'bg-blue-600 text-white border-blue-600'
                              : getStatusColor(status as SubmissionStatus)
                            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {status === 'all' ? '🗂️' : getStatusIcon(status as SubmissionStatus)} {' '}
                        {status === 'all' ? 'Все' : getStatusText(status as SubmissionStatus)} ({count})
                      </button>
                    )
                  })}
                </div>

                {/* Кнопка добавить новую заявку */}
                <Link
                  to="/submit"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Новая заявка
                </Link>
              </div>
            </div>

            {/* Список заявок */}
            <div className="space-y-4 mb-8">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Заголовок и статус */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {submission.institution_name}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              <span>Заявка #{submission.id}</span>
                              <span>•</span>
                              <span>{formatters.formatDate(submission.created_at)}</span>
                              {submission.reviewed_at && (
                                <>
                                  <span>•</span>
                                  <span>Рассмотрено {formatters.formatDate(submission.reviewed_at)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(submission.status)}`}>
                            <span className="mr-2">{getStatusIcon(submission.status)}</span>
                            {getStatusText(submission.status)}
                          </span>
                        </div>

                        {/* Краткая информация */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {formatters.truncateText(submission.institution_data.address || 'Адрес не указан', 40)}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {submission.institution_data.age_group || 'Возраст не указан'}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            {submission.institution_data.price_range || 'Цена не указана'}
                          </div>
                        </div>

                        {/* Комментарий модератора */}
                        {submission.moderator_comment && (
                          <div className={`p-4 rounded-lg border-l-4 ${
                            submission.status === 'rejected' 
                              ? 'bg-red-50 border-red-400'
                              : 'bg-blue-50 border-blue-400'
                          }`}>
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <svg className={`w-5 h-5 ${
                                  submission.status === 'rejected' ? 'text-red-400' : 'text-blue-400'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h4 className={`text-sm font-medium ${
                                  submission.status === 'rejected' ? 'text-red-800' : 'text-blue-800'
                                }`}>
                                  Комментарий модератора
                                </h4>
                                <p className={`text-sm mt-1 ${
                                  submission.status === 'rejected' ? 'text-red-700' : 'text-blue-700'
                                }`}>
                                  {submission.moderator_comment}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Действия */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex space-x-3">
                            <Link
                              to={`/my-submissions/${submission.id}`}
                              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Подробнее
                            </Link>

                            {/* Кнопка редактирования для заявок, требующих доработки */}
                            {submission.status === 'needs_edit' && (
                              <Link
                                to={`/edit-submission/${submission.id}`}
                                className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Редактировать
                              </Link>
                            )}

                            {/* Ссылка на созданное учреждение */}
                            {submission.status === 'approved' && (
                              <Link
                                to={`/institutions/${submission.id}`} // Здесь должен быть ID созданного учреждения
                                className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Перейти к учреждению
                              </Link>
                            )}
                          </div>

                          <div className="text-xs text-gray-500">
                            {formatters.formatRelativeTime(submission.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
            <div className="text-6xl mb-6">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              У вас пока нет заявок
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Добавьте детское учреждение в наш каталог. После модерации оно станет доступно для всех пользователей.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                to="/submit"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Подать заявку
              </Link>
              <Link
                to="/institutions"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Посмотреть каталог
              </Link>
            </div>
          </div>
        )}

        {/* Информационный блок */}
        {data?.results.length && data.results.length > 0 && (
          <div className="mt-12 bg-yellow-50 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-yellow-900 mb-2">
                  Процесс модерации
                </h4>
                <ul className="text-yellow-800 space-y-1 text-sm">
                  <li>• ⏳ <strong>На рассмотрении</strong> - заявка ожидает проверки модератором</li>
                  <li>• 📝 <strong>Требует доработки</strong> - необходимо исправить указанные замечания</li>
                  <li>• ✅ <strong>Одобрено</strong> - учреждение добавлено в каталог</li>
                  <li>• ❌ <strong>Отклонено</strong> - заявка не соответствует требованиям</li>
                </ul>
                <p className="text-yellow-700 text-sm mt-3">
                  Модерация обычно занимает 1-3 рабочих дня. Вы получите уведомление при изменении статуса.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MySubmissionsPage