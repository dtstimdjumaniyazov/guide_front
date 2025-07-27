import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useGetSubmissionQuery, useModerateSubmissionMutation } from '../../../store/api/institutionsApi'
import { useRole } from '../../../providers/AuthProvider'
import { formatters } from '../../../hooks/formatters'
import { LoadingPage, LoadingSpinner } from '../../../components/Loading'
import type { SubmissionStatus } from '../../../types'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { SubmissionMediaViewer } from '../../moderation/SubmissionMediaViewer'

const ModerationSubmissionDetailPage: React.FC = () => {
  useDocumentTitle('Модерация')
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isModerator } = useRole()
  
  const [moderationAction, setModerationAction] = useState<'approved' | 'rejected' | 'needs_edit' | null>(null)
  const [moderatorComment, setModeratorComment] = useState('')
  const [showModerationForm, setShowModerationForm] = useState(false)

  const { data: submission, isLoading, error } = useGetSubmissionQuery(Number(id), {
    skip: !id
  })

  const [moderateSubmission, { isLoading: isModerating }] = useModerateSubmissionMutation()

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

  const handleModerationSubmit = async () => {
    if (!moderationAction) return

    if ((moderationAction === 'rejected' || moderationAction === 'needs_edit') && !moderatorComment.trim()) {
      alert('Комментарий обязателен при отклонении или запросе доработки')
      return
    }

    try {
      await moderateSubmission({
        id: Number(id),
        status: moderationAction,
        moderator_comment: moderatorComment.trim() || undefined
      }).unwrap()

      // Показываем уведомление об успехе
      alert(`Заявка ${
        moderationAction === 'approved' ? 'одобрена' :
        moderationAction === 'rejected' ? 'отклонена' : 'отправлена на доработку'
      }`)

      // Возвращаемся к списку заявок
      navigate('/moderation/submissions')
    } catch (error: any) {
      console.error('Moderation error:', error)
      alert('Ошибка при модерации заявки: ' + (error.data?.message || 'Неизвестная ошибка'))
    }
  }

  const openModerationForm = (action: 'approved' | 'rejected' | 'needs_edit') => {
    setModerationAction(action)
    setShowModerationForm(true)
    if (action === 'approved') {
      setModeratorComment('Заявка одобрена')
    } else {
      setModeratorComment('')
    }
  }

  if (!isModerator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Доступ запрещен
          </h1>
          <p className="text-gray-600 mb-6">
            У вас нет прав для модерации заявок.
          </p>
          <Link
            to="/moderation"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            ← К панели модерации
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <LoadingPage message="Загрузка заявки для модерации..." />
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
            Запрашиваемая заявка не существует или была удалена.
          </p>
          <Link
            to="/moderation/submissions"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            ← К списку заявок
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
                <Link to="/moderation" className="text-gray-500 hover:text-gray-700">
                  Модерация
                </Link>
              </li>
              <li>
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link to="/moderation/submissions" className="text-gray-500 hover:text-gray-700">
                  Заявки
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
                    Заявка #{submission.id} • От {submission.user_name}
                  </p>
                </div>
                
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(submission.status)}`}>
                  <span className="mr-2 text-lg">{getStatusIcon(submission.status)}</span>
                  {getStatusText(submission.status)}
                </span>
              </div>

              {/* Временная шкала */}
              <div className="border-l-2 border-gray-200 pl-4 space-y-4 mb-6">
                <div className="flex items-center">
                  <div className="bg-blue-500 w-3 h-3 rounded-full -ml-6 mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Заявка подана</p>
                    <p className="text-sm text-gray-500">{formatters.formatDateTime(submission.created_at)}</p>
                    <p className="text-xs text-gray-400">Пользователь: {submission.user_email}</p>
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

              {/* Текущий комментарий модератора */}
              {submission.moderator_comment && (
                <div className={`p-4 rounded-lg border-l-4 ${
                  submission.status === 'rejected' 
                    ? 'bg-red-50 border-red-400'
                    : submission.status === 'needs_edit'
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-green-50 border-green-400'
                }`}>
                  <h4 className={`text-sm font-medium ${
                    submission.status === 'rejected' ? 'text-red-800' :
                    submission.status === 'needs_edit' ? 'text-blue-800' : 'text-green-800'
                  }`}>
                    Текущий комментарий модератора
                  </h4>
                  <p className={`text-sm mt-1 ${
                    submission.status === 'rejected' ? 'text-red-700' :
                    submission.status === 'needs_edit' ? 'text-blue-700' : 'text-green-700'
                  }`}>
                    {submission.moderator_comment}
                  </p>
                </div>
              )}
            </div>

            {/* Данные учреждения */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Проверка данных учреждения
              </h2>

              {/* Основная информация */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Основная информация</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Название:</span>
                      <p className="text-gray-900">{submission.institution_data.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Описание:</span>
                      <p className="text-gray-900 whitespace-pre-line break-words">{submission.institution_data.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Возрастная группа:</span>
                        <p className="text-gray-900">{submission.institution_data.age_group}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Ценовой диапазон:</span>
                        <p className="text-gray-900">{submission.institution_data.price_range}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Контактная информация */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Контактная информация</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Адрес:</span>
                      <p className="text-gray-900">{submission.institution_data.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Телефон:</span>
                        <p className="text-gray-900">
                          {formatters.formatPhone(submission.institution_data.contact_phone)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Сайт:</span>
                        {submission.institution_data.website ? (
                          <a 
                            href={submission.institution_data.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 break-all"
                          >
                            {submission.institution_data.website}
                          </a>
                        ) : (
                          <p className="text-gray-500">Не указан</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Координаты:</span>
                      <p className="text-gray-900">
                        {submission.institution_data.latitude}, {submission.institution_data.longitude}
                        <button
                          onClick={() => {
                            const coords = `${submission.institution_data.latitude},${submission.institution_data.longitude}`
                            const url = `https://www.google.com/maps/search/?api=1&query=${coords}`
                            window.open(url, '_blank')
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          (открыть на карте)
                        </button>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Услуги */}
                {submission.institution_data.services && submission.institution_data.services.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Услуги и программы</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
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
                  </div>
                )}

                {/* Расписание */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Режим работы</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-line">{submission.institution_data.schedule}</p>
                  </div>
                </div>

                {/* Социальные сети */}
                {submission.institution_data.social_links && Object.keys(submission.institution_data.social_links).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Социальные сети</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      {Object.entries(submission.institution_data.social_links as Record<string, string>).map(([platform, url]) => (
                        url && (
                          <div key={platform} className="flex items-center">
                            <span className="text-sm font-medium text-gray-600 capitalize w-24">{platform}:</span>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 break-all text-sm"
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
            </div>
          </div>

          {/* Медиафайлы заявки */}
          {submission.institution_data.media_files && submission.institution_data.media_files.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <SubmissionMediaViewer mediaFiles={submission.institution_data.media_files} />
            </div>
          )}

          {/* Боковая панель модерации */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Панель модерации
              </h2>

              {submission.status === 'pending' ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Выберите действие для этой заявки:
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={() => openModerationForm('approved')}
                      className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <span className="mr-2">✅</span>
                      Одобрить заявку
                    </button>

                    <button
                      onClick={() => openModerationForm('needs_edit')}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <span className="mr-2">📝</span>
                      Требует доработки
                    </button>

                    <button
                      onClick={() => openModerationForm('rejected')}
                      className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <span className="mr-2">❌</span>
                      Отклонить заявку
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">{getStatusIcon(submission.status)}</div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {getStatusText(submission.status)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Заявка уже была рассмотрена
                  </p>
                </div>
              )}

              {/* Информация о заявке */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Информация о заявке
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">ID:</span>
                    <span className="ml-2 text-gray-900">#{submission.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Пользователь:</span>
                    <span className="ml-2 text-gray-900">{submission.user_email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Подана:</span>
                    <span className="ml-2 text-gray-900">{formatters.formatDate(submission.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Навигация */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <Link
                  to="/moderation/submissions"
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <span className="mr-2">←</span>
                  К списку заявок
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно модерации */}
      {showModerationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {moderationAction === 'approved' && 'Одобрить заявку'}
              {moderationAction === 'rejected' && 'Отклонить заявку'}
              {moderationAction === 'needs_edit' && 'Запросить доработку'}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комментарий модератора {(moderationAction === 'rejected' || moderationAction === 'needs_edit') && '*'}
              </label>
              <textarea
                value={moderatorComment}
                onChange={(e) => setModeratorComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={
                  moderationAction === 'approved' 
                    ? 'Заявка одобрена (необязательно)' 
                    : moderationAction === 'rejected'
                    ? 'Укажите причину отклонения...'
                    : 'Укажите, что нужно исправить...'
                }
              />
              {(moderationAction === 'rejected' || moderationAction === 'needs_edit') && (
                <p className="text-xs text-gray-500 mt-1">* Комментарий обязателен</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModerationForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200"
                disabled={isModerating}
              >
                Отмена
              </button>
              <button
                onClick={handleModerationSubmit}
                disabled={isModerating}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 ${
                  moderationAction === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                  moderationAction === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isModerating ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Обработка...
                  </span>
                ) : (
                  'Подтвердить'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModerationSubmissionDetailPage