// src/pages/moderation/ModerationPage.tsx
import React, { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useRole } from '../../../providers/AuthProvider'
import { useGetModerationSubmissionsQuery, useGetModerationStatsQuery, useModerateSubmissionMutation } from '../../../store/api/institutionsApi'
import { formatters } from '../../../hooks/formatters'
import { LoadingCard } from '../../../components/Loading'
import { SimplePagination } from '../../../components/Pagination'
import type { SubmissionStatus } from '../../../types'
import ModerationSubmissionDetailPage from './ModerationSubmissionDetailPage'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

// Dashboard Component
const ModerationDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useGetModerationStatsQuery()
  const { data: pendingSubmissions, isLoading: submissionsLoading } = useGetModerationSubmissionsQuery({
    status: 'pending',
    page: 1
  })
  useDocumentTitle('Модерация')

  if (statsLoading || submissionsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 rounded"></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 rounded"></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">⏳</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">На рассмотрении</dt>
                <dd className="text-2xl font-semibold text-gray-900">{stats?.pending_submissions || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">✅</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Одобрено</dt>
                <dd className="text-2xl font-semibold text-gray-900">{stats?.approved_submissions || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-semibold">❌</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Отклонено</dt>
                <dd className="text-2xl font-semibold text-gray-900">{stats?.rejected_submissions || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">🏫</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Всего учреждений</dt>
                <dd className="text-2xl font-semibold text-gray-900">{stats?.total_institutions || 0}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Последние заявки */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Последние заявки на рассмотрении
            </h3>
            <Link
              to="/moderation/submissions"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Посмотреть все →
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {pendingSubmissions?.results.length ? (
            <div className="space-y-4">
              {pendingSubmissions.results.slice(0, 5).map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {submission.institution_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      от {submission.user_name} • {formatters.formatRelativeTime(submission.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      На рассмотрении
                    </span>
                    <Link
                      to={`/moderation/submissions/${submission.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Рассмотреть
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">Нет заявок на рассмотрении</p>
            </div>
          )}
        </div>
      </div>

      {/* Полезная информация */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h4 className="text-lg font-semibold text-blue-900 mb-2">
              Рекомендации по модерации
            </h4>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Проверяйте достоверность контактной информации</li>
              <li>• Убедитесь, что адрес и координаты соответствуют реальному местоположению</li>
              <li>• Отклоняйте заявки с неполной или некорректной информацией</li>
              <li>• При сомнениях запрашивайте дополнительные данные</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Submissions List Component
const ModerationSubmissions: React.FC = () => {
  useDocumentTitle('Модерация')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus | 'all'>('pending')
  const [moderatingId, setModeratingId] = useState<number | null>(null)

  const { data, isLoading, error } = useGetModerationSubmissionsQuery({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    page: currentPage
  })

  const [moderateSubmission] = useModerateSubmissionMutation()

  const handleQuickAction = async (submissionId: number, action: 'approved' | 'rejected', comment?: string) => {
    setModeratingId(submissionId)
    try {
      await moderateSubmission({
        id: submissionId,
        status: action,
        moderator_comment: comment
      }).unwrap()
    } catch (error) {
      console.error('Moderation error:', error)
    } finally {
      setModeratingId(null)
    }
  }

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'needs_edit': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const statusOptions = [
    { value: 'all', label: 'Все заявки', count: data?.count || 0 },
    { value: 'pending', label: 'На рассмотрении', icon: '⏳' },
    { value: 'approved', label: 'Одобрено', icon: '✅' },
    { value: 'rejected', label: 'Отклонено', icon: '❌' },
    { value: 'needs_edit', label: 'Требует доработки', icon: '📝' }
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
        </div>
        <LoadingCard count={5} className="h-32" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Ошибка загрузки заявок</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setSelectedStatus(option.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {option.icon && <span className="mr-2">{option.icon}</span>}
            {option.label}
            {option.count !== undefined && ` (${option.count})`}
          </button>
        ))}
      </div>

      {/* Список заявок */}
      {data?.results.length ? (
        <>
          <div className="space-y-4">
            {data.results.map((submission) => (
              <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {submission.institution_name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status === 'pending' && '⏳ На рассмотрении'}
                        {submission.status === 'approved' && '✅ Одобрено'}
                        {submission.status === 'rejected' && '❌ Отклонено'}
                        {submission.status === 'needs_edit' && '📝 Требует доработки'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1 mb-4">
                      <p><strong>От:</strong> {submission.user_name} ({submission.user_email})</p>
                      <p><strong>Подано:</strong> {formatters.formatDateTime(submission.created_at)}</p>
                      {submission.reviewed_at && (
                        <p><strong>Рассмотрено:</strong> {formatters.formatDateTime(submission.reviewed_at)}</p>
                      )}
                    </div>

                    {/* Краткая информация */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-500">Адрес:</span>
                        <p className="text-gray-900">{formatters.truncateText(submission.institution_data.address || 'Не указан', 50)}</p>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Возраст:</span>
                        <p className="text-gray-900">{submission.institution_data.age_group || 'Не указан'}</p>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Телефон:</span>
                        <p className="text-gray-900">{submission.institution_data.contact_phone || 'Не указан'}</p>
                      </div>
                    </div>

                    {/* Комментарий модератора */}
                    {submission.moderator_comment && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                        <p className="text-sm text-gray-700">
                          <strong>Комментарий:</strong> {submission.moderator_comment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Действия */}
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <Link
                      to={`/my-submissions/${submission.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Подробнее
                    </Link>
                  </div>

                  {submission.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleQuickAction(submission.id, 'approved', 'Заявка одобрена')}
                        disabled={moderatingId === submission.id}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
                      >
                        ✅ Одобрить
                      </button>
                      <button
                        onClick={() => {
                          const comment = prompt('Причина отклонения:')
                          if (comment) handleQuickAction(submission.id, 'rejected', comment)
                        }}
                        disabled={moderatingId === submission.id}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
                      >
                        ❌ Отклонить
                      </button>
                      <Link
                        to={`/moderation/submissions/${submission.id}`}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      >
                        📝 Рассмотреть
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Пагинация */}
          {data.total_pages > 1 && (
            <SimplePagination
              currentPage={data.current_page}
              totalPages={data.total_pages}
              onPageChange={(page) => {
                setCurrentPage(page)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="flex justify-center"
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Заявок не найдено
          </h3>
          <p className="text-gray-600">
            {selectedStatus === 'pending' 
              ? 'Нет заявок, ожидающих рассмотрения'
              : `Нет заявок со статусом "${statusOptions.find(o => o.value === selectedStatus)?.label}"`
            }
          </p>
        </div>
      )}
    </div>
  )
}

// Stats Component
const ModerationStats: React.FC = () => {
  useDocumentTitle('Модерация')
  const { data: stats, isLoading } = useGetModerationStatsQuery()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Подробная статистика
      </h2>

      {/* Статистика заявок */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Заявки</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{stats?.total_submissions || 0}</div>
            <div className="text-sm text-gray-600">Всего заявок</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats?.pending_submissions || 0}</div>
            <div className="text-sm text-gray-600">На рассмотрении</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats?.approved_submissions || 0}</div>
            <div className="text-sm text-gray-600">Одобрено</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats?.rejected_submissions || 0}</div>
            <div className="text-sm text-gray-600">Отклонено</div>
          </div>
        </div>
      </div>

      {/* Статистика учреждений */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Учреждения</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{stats?.total_institutions || 0}</div>
            <div className="text-sm text-gray-600">Всего учреждений</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats?.approved_institutions || 0}</div>
            <div className="text-sm text-gray-600">Одобренных</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats?.total_users || 0}</div>
            <div className="text-sm text-gray-600">Пользователей</div>
          </div>
        </div>
      </div>

      {/* Процентные показатели */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Эффективность модерации</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Процент одобрения</span>
                <span>{stats.total_submissions ? Math.round((stats.approved_submissions / stats.total_submissions) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${stats.total_submissions ? (stats.approved_submissions / stats.total_submissions) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Процент отклонения</span>
                <span>{stats.total_submissions ? Math.round((stats.rejected_submissions / stats.total_submissions) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ 
                    width: `${stats.total_submissions ? (stats.rejected_submissions / stats.total_submissions) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main Moderation Page Component
const ModerationPage: React.FC = () => {
  useDocumentTitle('Модерация')
  const location = useLocation()
  const { isModerator } = useRole()

  // Дополнительная проверка прав (на всякий случай)
  if (!isModerator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Доступ запрещен
          </h1>
          <p className="text-gray-600">
            У вас нет прав для доступа к панели модерации.
          </p>
        </div>
      </div>
    )
  }

  const isActive = (path: string) => {
    if (path === '/moderation' && location.pathname === '/moderation') {
      return true
    }
    return location.pathname.startsWith(path) && path !== '/moderation'
  }

  const navItems = [
    { path: '/moderation', label: 'Панель управления', exact: true, icon: '📊' },
    { path: '/moderation/submissions', label: 'Заявки', icon: '📋' },
    { path: '/moderation/stats', label: 'Статистика', icon: '📈' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Панель модерации</h1>
          <p className="mt-2 text-gray-600">Управление заявками и контент-модерация</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Боковое меню */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow p-4 sticky top-6">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive(item.path)
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Основной контент */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              <Routes>
                <Route index element={<ModerationDashboard />} />
                <Route path="submissions" element={<ModerationSubmissions />} />
                <Route path="stats" element={<ModerationStats />} />
                <Route path="submissions/:id" element={<ModerationSubmissionDetailPage />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModerationPage