// src/pages/EditSubmissionPage.tsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGetSubmissionQuery, useCreateSubmissionMutation } from '../../store/api/institutionsApi'
import { useAuth } from '../../providers/AuthProvider'
import { validators } from '../../hooks/validators'
import { LoadingPage, LoadingSpinner } from '../../components/Loading'
import type { InstitutionSubmissionData } from '../../types'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

interface FormErrors {
  [key: string]: string
}

const EditSubmissionPage: React.FC = () => {
  useDocumentTitle('Редактирование заявки')

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { data: submission, isLoading: loadingSubmission, error } = useGetSubmissionQuery(Number(id), {
    skip: !id
  })
  
  const [updateSubmission, { isLoading: isSubmitting }] = useCreateSubmissionMutation()
  
  const [formData, setFormData] = useState<InstitutionSubmissionData>({
    name: '',
    description: '',
    address: '',
    contact_phone: '',
    website: '',
    social_links: {
      instagram: '',
      facebook: '',
      telegram: '',
    },
    age_group: '',
    price_range: '',
    services: [],
    schedule: '',
    latitude: 0,
    longitude: 0,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [serviceInput, setServiceInput] = useState('')

  // Заполняем форму данными из заявки
  useEffect(() => {
    if (submission?.institution_data) {
      const data = submission.institution_data
      setFormData({
        name: data.name || '',
        description: data.description || '',
        address: data.address || '',
        contact_phone: data.contact_phone || '',
        website: data.website || '',
        social_links: {
          instagram: data.social_links?.instagram || '',
          facebook: data.social_links?.facebook || '',
          telegram: data.social_links?.telegram || '',
        },
        age_group: data.age_group || '',
        price_range: data.price_range || '',
        services: data.services || [],
        schedule: data.schedule || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      })
    }
  }, [submission])

  const steps = [
    { id: 1, name: 'Основная информация', icon: '🏫' },
    { id: 2, name: 'Контакты и местоположение', icon: '📍' },
    { id: 3, name: 'Услуги и расписание', icon: '📋' },
    { id: 4, name: 'Проверка и отправка', icon: '✅' }
  ]

  const handleInputChange = (field: keyof InstitutionSubmissionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Очищаем ошибку для поля при изменении
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }))
  }

  const addService = () => {
    if (serviceInput.trim() && !formData.services.includes(serviceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, serviceInput.trim()]
      }))
      setServiceInput('')
    }
  }

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Название обязательно'
        if (!formData.description.trim()) newErrors.description = 'Описание обязательно'
        if (formData.description.length < 50) newErrors.description = 'Описание должно содержать минимум 50 символов'
        if (!formData.age_group.trim()) newErrors.age_group = 'Возрастная группа обязательна'
        if (!formData.price_range.trim()) newErrors.price_range = 'Ценовой диапазон обязателен'
        break

      case 2:
        if (!formData.address.trim()) newErrors.address = 'Адрес обязателен'
        if (!formData.contact_phone.trim()) {
          newErrors.contact_phone = 'Телефон обязателен'
        } else if (!validators.isValidPhone(formData.contact_phone)) {
          newErrors.contact_phone = 'Некорректный номер телефона'
        }
        if (formData.website && !validators.isValidUrl(formData.website)) {
          newErrors.website = 'Некорректный URL сайта'
        }
        if (formData.latitude === 0 || formData.longitude === 0) {
          newErrors.coordinates = 'Укажите местоположение на карте'
        }
        break

      case 3:
        if (!formData.schedule.trim()) newErrors.schedule = 'Расписание обязательно'
        if (formData.services.length === 0) newErrors.services = 'Добавьте хотя бы одну услугу'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    try {
      const response = await updateSubmission({
        institution_data: formData
      }).unwrap()

      // Перенаправляем на страницу заявок с уведомлением об успехе
      navigate('/my-submissions', {
        state: {
          message: 'Заявка успешно обновлена и отправлена на повторное рассмотрение!',
          submissionId: response.submission_id
        }
      })
    } catch (error: any) {
      console.error('Submit error:', error)
      setErrors({ submit: error.data?.message || 'Ошибка при отправке заявки' })
    }
  }

  const getLocationFromAddress = async () => {
    if (!formData.address) return

    try {
      // Здесь можно использовать геокодинг API (например, Google Geocoding)
      // Для примера используем заглушку
      const mockCoords = {
        lat: 41.2995 + (Math.random() - 0.5) * 0.1, // Примерные координаты Ташкента
        lng: 69.2401 + (Math.random() - 0.5) * 0.1
      }
      
      setFormData(prev => ({
        ...prev,
        latitude: mockCoords.lat,
        longitude: mockCoords.lng
      }))
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  if (loadingSubmission) {
    return <LoadingPage message="Загрузка заявки для редактирования..." />
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
            to="/my-submissions"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            ← К моим заявкам
          </Link>
        </div>
      </div>
    )
  }

  // Проверяем права на редактирование
  if (submission.user_email !== user?.email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Доступ запрещен
          </h1>
          <p className="text-gray-600 mb-6">
            Вы можете редактировать только свои заявки.
          </p>
          <Link
            to="/my-submissions"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            ← К моим заявкам
          </Link>
        </div>
      </div>
    )
  }

  // Проверяем статус заявки
  if (submission.status !== 'needs_edit') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Заявка не требует редактирования
          </h1>
          <p className="text-gray-600 mb-6">
            Редактировать можно только заявки со статусом "Требует доработки".
            <br />
            Текущий статус: <strong>{
              submission.status === 'pending' ? 'На рассмотрении' :
              submission.status === 'approved' ? 'Одобрено' :
              submission.status === 'rejected' ? 'Отклонено' : 'Неизвестно'
            }</strong>
          </p>
          <Link
            to={`/my-submissions/${submission.id}`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            Посмотреть заявку
          </Link>
        </div>
      </div>
    )
  }

  // Здесь используем ту же логику рендеринга шагов, что и в SubmitPage
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название учреждения *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Например: Детский сад 'Солнышко'"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание учреждения *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Расскажите подробно об учреждении, его особенностях, преимуществах, методиках обучения..."
              />
              <div className="mt-1 flex justify-between text-sm text-gray-500">
                <span>{formData.description.length} символов (минимум 50)</span>
                {errors.description && <span className="text-red-600">{errors.description}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Возрастная группа *
                </label>
                <input
                  type="text"
                  value={formData.age_group}
                  onChange={(e) => handleInputChange('age_group', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.age_group ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Например: 3-6 лет, от 2 лет, школьники"
                />
                {errors.age_group && <p className="mt-1 text-sm text-red-600">{errors.age_group}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ценовой диапазон *
                </label>
                <input
                  type="text"
                  value={formData.price_range}
                  onChange={(e) => handleInputChange('price_range', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.price_range ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Например: 500,000 - 800,000 сум/месяц"
                />
                {errors.price_range && <p className="mt-1 text-sm text-red-600">{errors.price_range}</p>}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Полный адрес учреждения"
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Контактный телефон *
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.contact_phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+998 90 123 45 67"
                />
                {errors.contact_phone && <p className="mt-1 text-sm text-red-600">{errors.contact_phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Веб-сайт
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.website ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com"
                />
                {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Социальные сети
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📸</span>
                  <input
                    type="url"
                    value={formData.social_links?.instagram || ''}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Instagram: https://instagram.com/username"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📘</span>
                  <input
                    type="url"
                    value={formData.social_links?.facebook || ''}
                    onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Facebook: https://facebook.com/page"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💬</span>
                  <input
                    type="url"
                    value={formData.social_links?.telegram || ''}
                    onChange={(e) => handleSocialLinkChange('telegram', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Telegram: https://t.me/channel"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Местоположение *
              </label>
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-gray-600">
                    {formData.latitude && formData.longitude && formData.latitude !== 0 && formData.longitude !== 0
                      ? `Координаты: ${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`
                      : 'Местоположение не указано'
                    }
                  </p>
                  <button
                    type="button"
                    onClick={getLocationFromAddress}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    Получить координаты
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Широта
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      placeholder="41.2995"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Долгота
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      placeholder="69.2401"
                    />
                  </div>
                </div>
                {errors.coordinates && <p className="mt-2 text-sm text-red-600">{errors.coordinates}</p>}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Услуги и программы *
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Например: Английский язык, Танцы, Рисование"
                />
                <button
                  type="button"
                  onClick={addService}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Добавить
                </button>
              </div>
              
              {formData.services.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.services.map((service, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {errors.services && <p className="text-sm text-red-600">{errors.services}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Режим работы и расписание *
              </label>
              <textarea
                value={formData.schedule}
                onChange={(e) => handleInputChange('schedule', e.target.value)}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.schedule ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={`Например:
Понедельник - Пятница: 08:00 - 18:00
Суббота: 09:00 - 15:00
Воскресенье: выходной

Группа 3-4 года: 09:00 - 12:00
Группа 5-6 лет: 14:00 - 17:00`}
              />
              {errors.schedule && <p className="mt-1 text-sm text-red-600">{errors.schedule}</p>}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            {/* Комментарий модератора */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Комментарий модератора
                  </h3>
                  <p className="text-blue-800">
                    {submission.moderator_comment}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Готово к отправке
                  </h3>
                  <p className="text-green-800 text-sm">
                    Убедитесь, что вы учли все замечания модератора. После отправки заявка будет рассмотрена повторно.
                  </p>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Редактирование заявки
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Внесите необходимые изменения согласно комментарию модератора и отправьте заявку на повторное рассмотрение.
          </p>
        </div>

        {/* Индикатор шагов */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, index) => (
                <li key={step.id} className={`relative ${index < steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      currentStep === step.id
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : currentStep > step.id
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}>
                      {currentStep > step.id ? (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-lg">{step.icon}</span>
                      )}
                    </div>
                    <span className={`ml-4 text-sm font-medium ${
                      currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute top-6 left-6 -ml-px mt-0.5 h-0.5 w-8 sm:w-20 bg-gray-300" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Форма */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            {renderStep()}
          </div>

          {/* Навигация */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              ← Назад
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Далее →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Отправка...
                  </>
                ) : (
                  'Отправить на рассмотрение'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Важная информация
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Внимательно прочитайте комментарий модератора на последнем шаге</li>
                  <li>Убедитесь, что все обязательные поля заполнены корректно</li>
                  <li>После отправки заявка получит статус "На рассмотрении"</li>
                  <li>Процесс рассмотрения может занять до 3 рабочих дней</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопка возврата */}
        <div className="mt-6 text-center">
          <Link
            to="/my-submissions"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Вернуться к моим заявкам
          </Link>
        </div>
      </div>
    </div>
  )
}

export default EditSubmissionPage