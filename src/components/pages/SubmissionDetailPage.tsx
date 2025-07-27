// src/pages/SubmissionDetailPage.tsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetSubmissionQuery } from '../../store/api/institutionsApi'
import { useAuth, useRole } from '../../providers/AuthProvider'
import { formatters } from '../../hooks/formatters'
import { LoadingPage } from '../../components/Loading'
import type { SubmissionStatus } from '../../types'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

const SubmissionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  // const navigate = useNavigate()
  const { user } = useAuth()
  const { isModerator } = useRole()

  const { data: submission, isLoading, error } = useGetSubmissionQuery(Number(id), {
    skip: !id
  })

  useDocumentTitle(`Детали заявки ${submission?.institution_name}`)

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

  if (isLoading) {
    return <LoadingPage message="Загрузка информации о заявке..." />
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Заявка не найдена
          </h1>
          <p className="text-gray-600 mb-6">
            Запрашиваемая заявка не существует или у вас нет прав для её просмотра.
          </p>
          <div className="space-x-4">
            <Link
              to="/my-submissions"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              ← Мои заявки
            </Link>
            {isModerator && (
              <Link
                to="/moderation"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                К модерации
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Проверяем права доступа
  const canView = isModerator || submission.user_email === user?.email

  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Доступ запрещен
          </h1>
          <p className="text-gray-600 mb-6">
            У вас нет прав для просмотра этой заявки.
          </p>
          <Link
            to="/my-submissions"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            ← Мои заявки
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хлебные крошки */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700">
                  Главная
                </Link>
              </li>
              <li>
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link 
                  to={isModerator ? "/moderation" : "/my-submissions"} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  {isModerator ? 'Модерация' : 'Мои заявки'}
                </Link>
              </li>
              <li>
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-gray-900 font-medium">Заявка #{submission.id}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основной контент */}
          <div className="lg:col-span-2">
            {/* Заголовок и статус */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {submission.institution_name}
                  </h1>
                  <p className="text-gray-600">
                    Заявка #{submission.id} • Подана {formatters.formatDate(submission.created_at)}
                  </p>
                </div>
                
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(submission.status)}`}>
                  <span className="mr-2 text-lg">{getStatusIcon(submission.status)}</span>
                  {getStatusText(submission.status)}
                </span>
              </div>

              {/* Временная шкала */}
              <div className="border-l-2 border-gray-200 pl-4 space-y-4">
                <div className="flex items-center">
                  <div className="bg-blue-500 w-3 h-3 rounded-full -ml-6 mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Заявка подана</p>
                    <p className="text-sm text-gray-500">{formatters.formatDateTime(submission.created_at)}</p>
                  </div>
                </div>
                
                {submission.reviewed_at && (
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full -ml-6 mr-3 ${
                      submission.status === 'approved' ? 'bg-green-500' :
                      submission.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {submission.status === 'approved' ? 'Заявка одобрена' :
                         submission.status === 'rejected' ? 'Заявка отклонена' : 'Требует доработки'}
                      </p>
                      <p className="text-sm text-gray-500">{formatters.formatDateTime(submission.reviewed_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Комментарий модератора */}
            {submission.moderator_comment && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className={`p-4 rounded-lg border-l-4 ${
                  submission.status === 'rejected' 
                    ? 'bg-red-50 border-red-400'
                    : submission.status === 'needs_edit'
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-green-50 border-green-400'
                }`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className={`w-5 h-5 ${
                        submission.status === 'rejected' ? 'text-red-400' :
                        submission.status === 'needs_edit' ? 'text-blue-400' : 'text-green-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        submission.status === 'rejected' ? 'text-red-800' :
                        submission.status === 'needs_edit' ? 'text-blue-800' : 'text-green-800'
                      }`}>
                        Комментарий модератора
                      </h3>
                      <p className={`text-sm mt-1 ${
                        submission.status === 'rejected' ? 'text-red-700' :
                        submission.status === 'needs_edit' ? 'text-blue-700' : 'text-green-700'
                      }`}>
                        {submission.moderator_comment}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Данные учреждения */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Информация об учреждении
              </h2>

              <div className="prose max-w-none mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Описание</h3>
                <p className="text-gray-700 leading-relaxed">
                  {submission.institution_data.description || 'Описание не предоставлено'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Контактная информация</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Адрес:</span>
                      <p className="text-sm text-gray-900">{submission.institution_data.address || 'Не указан'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Телефон:</span>
                      <p className="text-sm text-gray-900">
                        {submission.institution_data.contact_phone 
                          ? formatters.formatPhone(submission.institution_data.contact_phone)
                          : 'Не указан'
                        }
                      </p>
                    </div>
                    {submission.institution_data.website && (
                      <div>
                        <span className="text-sm text-gray-600">Сайт:</span>
                        <a 
                          href={submission.institution_data.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 break-all"
                        >
                          {submission.institution_data.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Характеристики</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Возрастная группа:</span>
                      <p className="text-sm text-gray-900">{submission.institution_data.age_group || 'Не указана'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Ценовой диапазон:</span>
                      <p className="text-sm text-gray-900">{submission.institution_data.price_range || 'Не указан'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Координаты:</span>
                      <p className="text-sm text-gray-900">
                        {submission.institution_data.latitude && submission.institution_data.longitude
                          ? `${submission.institution_data.latitude}, ${submission.institution_data.longitude}`
                          : 'Не указаны'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Услуги */}
            {submission.institution_data.services && submission.institution_data.services.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Услуги и программы
                </h2>
                <div className="flex flex-wrap gap-2">
                  {submission.institution_data.services.map((service:string, index:number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Расписание */}
            {submission.institution_data.schedule && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Режим работы
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">
                    {submission.institution_data.schedule}
                  </p>
                </div>
              </div>
            )}

            {/* Социальные сети */}
            {submission.institution_data.social_links && Object.keys(submission.institution_data.social_links).length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Социальные сети
                </h2>
                <div className="space-y-2">
                  {Object.entries(submission.institution_data.social_links as Record<string, string>).map(([platform, url]) => (
                    url && (
                      <div key={platform} className="flex items-center">
                        <span className="text-sm text-gray-600 capitalize w-20">{platform}:</span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 break-all"
                        >
                          {url}
                        </a>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Боковая панель */}
          <div className="lg:col-span-1">
            {/* Информация о заявке */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Информация о заявке
              </h2>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">ID заявки:</span>
                  <p className="text-sm font-mono text-gray-900">#{submission.id}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Подал заявку:</span>
                  <p className="text-sm text-gray-900">{submission.user_name}</p>
                  <p className="text-sm text-gray-500">{submission.user_email}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Дата подачи:</span>
                  <p className="text-sm text-gray-900">{formatters.formatDateTime(submission.created_at)}</p>
                </div>
                
                {submission.reviewed_at && (
                  <div>
                    <span className="text-sm text-gray-600">Дата рассмотрения:</span>
                    <p className="text-sm text-gray-900">{formatters.formatDateTime(submission.reviewed_at)}</p>
                  </div>
                )}

                <div>
                  <span className="text-sm text-gray-600">Статус:</span>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-1 ${getStatusColor(submission.status)}`}>
                    <span className="mr-2">{getStatusIcon(submission.status)}</span>
                    {getStatusText(submission.status)}
                  </div>
                </div>
              </div>

              {/* Ссылка на созданное учреждение */}
              {submission.status === 'approved' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    to={`/institutions/${submission.id}`} // Здесь должен быть ID созданного учреждения
                    className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Перейти к учреждению
                  </Link>
                </div>
              )}

              {/* Карта (если есть координаты) */}
              {submission.institution_data.latitude && submission.institution_data.longitude && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const coords = `${submission.institution_data.latitude},${submission.institution_data.longitude}`
                      const url = `https://www.google.com/maps/search/?api=1&query=${coords}`
                      window.open(url, '_blank')
                    }}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                    </svg>
                    Показать на карте
                  </button>
                </div>
              )}
            </div>

            {/* Действия */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Действия
              </h3>
              
              <div className="space-y-3">
                <Link
                  to={isModerator ? "/moderation" : "/my-submissions"}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {isModerator ? 'К списку заявок' : 'К моим заявкам'}
                </Link>

                {isModerator && (
                  <Link
                    to={`/moderation/submissions/${submission.id}`}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Модерировать
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubmissionDetailPage