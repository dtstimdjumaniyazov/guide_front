import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateSubmissionMutation, useUploadSubmissionMediaMutation, useGetInstitutionTypesQuery } from '../../store/api/institutionsApi'
import { useAuth } from '../../providers/AuthProvider'
import { validators } from '../../hooks/validators'
import { LoadingSpinner } from '../../components/Loading'
import type { InstitutionSubmissionData } from '../../types'
import { MediaUpload } from '../../components/MediaUpload'
import type { MediaFile } from '../../components/MediaUpload'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import LocationPicker from '../LocationPicker'
import { GoogleOAuthProvider } from '@react-oauth/google'
import GoogleSignInButton from '../../components/GoogleSignInButton'
import { useGoogleAuthMutation } from '../../store/api/authApi'
import PrivacyConsentModal from '../../components/PrivacyConsentModal'

const GOOGLE_AUTH_CLIENT_ID = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID

interface FormErrors {
  [key: string]: string | undefined
  media_upload?: string
  submit?: string
  coordinates?: string
  services?: string
}

const SubmitPage: React.FC = () => {
  const navigate = useNavigate()
  const [createSubmission, { isLoading: isSubmitting }] = useCreateSubmissionMutation()
  const [uploadSubmissionMedia] = useUploadSubmissionMediaMutation()
  const { data: institutionTypes, isLoading: typesLoading } = useGetInstitutionTypesQuery()
  useDocumentTitle('Формирование заявки')

  const { isAuthenticated, login } = useAuth()
  const [googleAuthMutation, { isLoading: googleAuthLoading }] = useGoogleAuthMutation()
  
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
    institution_type: 0,
    media_files: [],
  })

  // Новые состояния для модального окна и токена
    const [showPrivacyModal, setShowPrivacyModal] = useState(false)
    const [pendingGoogleToken, setPendingGoogleToken] = useState<any>(null)

  // Первый шаг: проверяем согласие перед входом
  const handleGoogleSignInAttempt = async (tokenResponse: any) => {
    // Проверяем, давал ли пользователь согласие ранее
    const hasConsent = localStorage.getItem('privacy_consent_accepted')
    
    if (hasConsent === 'true') {
      // Если согласие уже есть, входим сразу
      await processGoogleSignIn(tokenResponse)
    } else {
      // Если согласия нет, показываем модальное окно
      setPendingGoogleToken(tokenResponse)
      setShowPrivacyModal(true)
    }
  }

  // Второй шаг: обработка согласия
  const handlePrivacyAccept = async () => {
    // Сохраняем факт согласия
    localStorage.setItem('privacy_consent_accepted', 'true')
    localStorage.setItem('privacy_consent_date', new Date().toISOString())
    
    setShowPrivacyModal(false)
    
    // Продолжаем вход с сохраненным токеном
    if (pendingGoogleToken) {
      await processGoogleSignIn(pendingGoogleToken)
      setPendingGoogleToken(null)
    }
  }

  // Третий шаг: фактический вход через Google
  const processGoogleSignIn = async (tokenResponse: any) => {
    try {
      const result = await googleAuthMutation({
        grant_type: 'convert_token',
        client_id: import.meta.env.VITE_CLIENT_ID,
        backend: 'google-oauth2',
        token: tokenResponse.access_token,
      }).unwrap()

      login(result.access_token, result.user, result.refresh_token)
    } catch (error) {
      console.error('Google sign in failed:', error)
    }
  }

  const handlePrivacyModalClose = () => {
    setShowPrivacyModal(false)
    setPendingGoogleToken(null)
  }

  const [errors, setErrors] = useState<FormErrors>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [serviceInput, setServiceInput] = useState('')

  const steps = [
    { id: 1, name: 'Основная информация', icon: '🏫' },
    { id: 2, name: 'Контакты и местоположение', icon: '📍' },
    { id: 3, name: 'Услуги, расписание и медиа', icon: '📋' },
    { id: 4, name: 'Проверка и отправка', icon: '✅' },
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

  const handleMediaChange = (files: MediaFile[]) => {
    // Убеждаемся, что все файлы имеют правильную структуру
    const validatedFiles = files.map((file, index) => {
      let media_type: 'photo' | 'video' = 'photo'
      
      // Более точное определение типа медиафайла
      if (typeof file.file !== 'string' && file.file instanceof File) {
        // Для File объектов проверяем MIME тип
        if (file.file.type.startsWith('video/')) {
          media_type = 'video'
        }
      } else if (typeof file.file === 'string') {
        // Для строковых URL проверяем расширение
        const extension = file.file.toLowerCase().split('.').pop()
        if (extension && ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
          media_type = 'video'
        }
      }
      
      return {
        ...file,
        order: file.order ?? index,
        caption: file.caption ?? '',
        media_type: file.media_type ?? media_type
      }
    })
    
    setFormData(prev => ({ ...prev, media_files: validatedFiles }))

    // Очищаем ошибку медиафайлов при изменении файлов
    if (errors.media_upload) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.media_upload
        return newErrors
      })
    }
  }

  const addService = () => {
    if (serviceInput.trim() && !formData.services?.includes(serviceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services ?? [], serviceInput.trim()]
      }))
      setServiceInput('')
    }
  }

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services?.filter((_, i) => i !== index)
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
        if (!formData.institution_type || formData.institution_type === 0) newErrors.institution_type = 'Выберите тип учреждения'
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
        if (!formData.services || formData.services.length === 0) newErrors.services = 'Добавьте хотя бы одну услугу'
        break

      case 4:
        // Финальная валидация всех шагов
        if (!formData.name.trim()) newErrors.name = 'Название обязательно'
        if (!formData.description.trim()) newErrors.description = 'Описание обязательно'
        if (!formData.address.trim()) newErrors.address = 'Адрес обязателен'
        if (!formData.contact_phone.trim()) newErrors.contact_phone = 'Телефон обязателен'
        if (!formData.schedule.trim()) newErrors.schedule = 'Расписание обязательно'
        if (!formData.services || formData.services.length === 0) newErrors.services = 'Добавьте хотя бы одну услугу'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateCurrentStep = (): boolean => {
    return validateStep(currentStep)
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return

    try {
      setErrors({})
      
      // Создаем заявку
      const submissionResult = await createSubmission({
        institution_data: {
          name: formData.name,
          description: formData.description,
          address: formData.address,
          contact_phone: formData.contact_phone,
          website: validators.normalizeUrl(formData.website || ''),
          social_links: formData.social_links,
          age_group: formData.age_group,
          price_range: formData.price_range,
          services: formData.services,
          schedule: formData.schedule,
          institution_type: formData.institution_type,
          latitude: formData.latitude,
          longitude: formData.longitude,
        }
      }).unwrap()

      const submissionId = submissionResult.submission_id

      // Загружаем медиафайлы, если они есть
      if (formData.media_files && formData.media_files.length > 0) {
        try {
          // Фильтруем только File объекты (не строки)
          const fileObjects = formData.media_files
            .filter(mediaFile => mediaFile.file instanceof File)
            .map(mediaFile => mediaFile.file as File)
          
          if (fileObjects.length > 0) {
            const captions = formData.media_files
              .filter(mediaFile => mediaFile.file instanceof File)
              .map(mediaFile => mediaFile.caption || '')
            
            const orders = formData.media_files
              .filter(mediaFile => mediaFile.file instanceof File)
              .map((_, index) => index)
            
            const media_types = formData.media_files
              .filter(mediaFile => mediaFile.file instanceof File)
              .map(mediaFile => mediaFile.media_type)

            const uploadResult = await uploadSubmissionMedia({
              submission_id: submissionId,
              files: fileObjects,
              captions,
              orders,
              media_types
            }).unwrap()

            console.log('Медиафайлы загружены:', uploadResult)
          }
        } catch (uploadError: any) {
          console.error('Ошибка загрузки медиафайлов:', uploadError)
          
          // Показываем предупреждение, но не блокируем успешное создание заявки
          setErrors({
            media_upload: `Заявка создана, но возникла ошибка при загрузке медиафайлов: ${uploadError.data?.error || uploadError.message || 'Неизвестная ошибка'}`
          })
          
          // Все равно переходим на страницу учреждений, но с предупреждением
          setTimeout(() => {
            alert('Заявка создана, но некоторые медиафайлы не загрузились. Вы можете добавить их позже.')
            navigate('/institutions')
          }, 2000)
          return
        }
      }

      // Перенаправление после успешной подачи заявки
      navigate('/institutions')

    } catch (error: any) {
      console.error('Ошибка отправки заявки:', error)
      
      // Более детальная обработка ошибок
      let errorMessage = 'Произошла ошибка при отправке заявки. Попробуйте еще раз.'
      
      if (error.data?.error) {
        errorMessage = error.data.error
      } else if (error.data?.details) {
        errorMessage = `Ошибка валидации: ${JSON.stringify(error.data.details)}`
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setErrors({
        submit: errorMessage
      })
    }
  }

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
                Тип учреждения *
              </label>
              {typesLoading ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                  Загрузка типов...
                </div>
              ) : (
                <select
                  value={formData.institution_type}
                  onChange={(e) => handleInputChange('institution_type', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.institution_type ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value={0}>Выберите тип учреждения</option>
                  {institutionTypes?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.institution_type && <p className="mt-1 text-sm text-red-600">{errors.institution_type}</p>}
              {institutionTypes && formData?.institution_type !== undefined && formData?.institution_type > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  {institutionTypes.find(t => t.id === formData.institution_type)?.description}
                </p>
              )}
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
              <LocationPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={(lat, lng) => {
                  setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng
                  }));
                  // Очищаем ошибку координат
                  if (errors.coordinates) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.coordinates;
                      return newErrors;
                    });
                  }
                }}
                error={errors.coordinates}
                showManualInput={true}
                defaultLat={41.2995} // Ташкент
                defaultLng={69.2401}
              />
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
              
              {formData.services && formData.services.length > 0 && (
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
              
              <p className="text-xs text-gray-500">
                Добавьте все услуги, которые предоставляет учреждение
              </p>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фотографии и видео
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Добавьте фотографии и видео учреждения. Это поможет родителям лучше понять атмосферу места.
              </p>
              <MediaUpload
                mediaFiles={formData.media_files || []}
                onMediaChange={handleMediaChange}
                maxFiles={10}
                disabled={isSubmitting}
                onError={(error: string) => {
                  setErrors(prev => ({ 
                    ...prev, 
                    media_upload: error 
                  }))
                }}
              />
              {/* Добавляем отображение ошибки медиафайлов */}
              {errors.media_upload && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{errors.media_upload}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            {/* Уведомление о необходимости авторизации для неавторизованных */}
            {!isAuthenticated && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Почти готово!
                    </h3>
                    <p className="text-blue-800 text-sm mb-4">
                      Чтобы отправить заявку, необходимо войти в систему через Google. Все введенные данные сохранятся.
                    </p>
                    
                    {/* Google Sign-In Button */}
                    <GoogleOAuthProvider clientId={GOOGLE_AUTH_CLIENT_ID}>
                      <GoogleSignInButton 
                        handleGoogleSignIn={handleGoogleSignInAttempt}
                        isLoading={googleAuthLoading}
                      />
                    </GoogleOAuthProvider>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Проверьте данные перед отправкой
                  </h3>
                  <p className="text-blue-800 text-sm">
                    Убедитесь, что вся информация указана корректно. После отправки заявка будет рассмотрена модератором в течение 1-3 рабочих дней.
                  </p>
                </div>
              </div>
            </div>

            {/* Полная сводка данных */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Сводка информации об учреждении
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Основная информация */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      Основная информация
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Название:</span>
                        <p className="text-gray-900 font-medium">{formData.name || '—'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Тип учреждения:</span>
                        <p className="text-gray-900">
                          {formData.institution_type && institutionTypes
                            ? institutionTypes.find(t => t.id === formData.institution_type)?.name || '—'
                            : '—'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Возрастная группа:</span>
                        <p className="text-gray-900">{formData.age_group || '—'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Ценовой диапазон:</span>
                        <p className="text-gray-900">{formData.price_range || '—'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      Контактная информация
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Телефон:</span>
                        <p className="text-gray-900">{formData.contact_phone || '—'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Веб-сайт:</span>
                        <p className="text-gray-900">
                          {formData.website ? (
                            <a 
                              href={validators.normalizeUrl(formData.website)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline break-all"
                            >
                              {validators.normalizeUrl(formData.website)}
                            </a>
                          ) : '—'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Координаты:</span>
                        <p className="text-gray-900">
                          {formData.latitude && formData.longitude && formData.latitude !== 0 && formData.longitude !== 0
                            ? `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`
                            : '—'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Медиафайлы:</span>
                        <p className="text-gray-900">
                          {formData.media_files?.length || 0} файлов
                          {formData.media_files && formData.media_files.length > 0 && (
                            <span className="text-gray-500">
                              {' '}(📸 {formData.media_files.filter(f => f.media_type === 'photo').length}, 
                              🎥 {formData.media_files.filter(f => f.media_type === 'video').length})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Описание */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Описание учреждения
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {formData.description || '—'}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      {formData.description.length} символов
                    </div>
                  </div>
                </div>

                {/* Адрес */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Адрес
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 leading-relaxed">
                      {formData.address || '—'}
                    </p>
                  </div>
                </div>

                {/* Услуги */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Услуги и программы ({formData.services?.length || 0})
                  </h4>
                  {formData.services && formData.services.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.services.map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Услуги не указаны</p>
                  )}
                </div>

                {/* Расписание */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Режим работы и расписание
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {formData.schedule || '—'}
                    </p>
                  </div>
                </div>

                {/* Социальные сети */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Социальные сети
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: 'instagram', name: 'Instagram', icon: '📸', color: 'pink' },
                      { key: 'facebook', name: 'Facebook', icon: '📘', color: 'blue' },
                      { key: 'telegram', name: 'Telegram', icon: '💬', color: 'sky' }
                    ].map(({ key, name, icon, color }) => (
                      <div key={key} className="flex items-center space-x-3">
                        <span className="text-2xl">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">{name}</p>
                          {formData.social_links?.[key as keyof typeof formData.social_links] ? (
                            <a
                              href={formData.social_links[key as keyof typeof formData.social_links]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm text-blue-600 hover:text-blue-800 underline truncate block`}
                            >
                              {formData.social_links[key as keyof typeof formData.social_links]}
                            </a>
                          ) : (
                            <p className="text-sm text-gray-500">Не указан</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Превью медиафайлов */}
                {formData.media_files && formData.media_files.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      Загруженные файлы ({formData.media_files.length})
                    </h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {formData.media_files.map((file, index) => (
                        <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {file.media_type === 'photo' ? (
                            <img
                              src={file.preview || (typeof file.file === 'string' ? file.file : URL.createObjectURL(file.file as File))}
                              alt={file.caption || `Фото ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <video
                              src={file.preview || (typeof file.file === 'string' ? file.file : URL.createObjectURL(file.file as File))}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                          <div className="absolute bottom-1 left-1">
                            <span className="bg-black bg-opacity-50 text-white px-1 text-xs rounded">
                              {file.media_type === 'photo' ? '📸' : '🎥'}
                            </span>
                          </div>
                          {file.caption && (
                            <div className="absolute bottom-1 right-1">
                              <span className="bg-black bg-opacity-50 text-white px-1 text-xs rounded" title={file.caption}>
                                💬
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ошибки */}
            {errors.media_upload && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">Ошибка загрузки медиафайлов</h4>
                    <p className="text-sm text-red-600 mt-1">{errors.media_upload}</p>
                  </div>
                </div>
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">Ошибка отправки заявки</h4>
                    <p className="text-sm text-red-600 mt-1">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Другие ошибки валидации */}
            {Object.entries(errors).filter(([key]) => !['media_upload', 'submit'].includes(key)).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">Необходимо исправить ошибки</h4>
                    <ul className="text-sm text-red-600 mt-1 list-disc list-inside">
                      {Object.entries(errors)
                        .filter(([key]) => !['media_upload', 'submit'].includes(key))
                        .map(([key, error]) => (
                          <li key={key}>{error}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Финальное подтверждение - только для авторизованных */}
            {isAuthenticated && (
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
                      Проверьте всю информацию выше. После отправки заявка будет рассмотрена модератором. 
                      Вы получите уведомление о результатах рассмотрения.
                    </p>
                  </div>
                </div>
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
            Добавить учреждение
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Заполните информацию о детском учреждении. После проверки модератором оно будет добавлено в каталог.
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
                      {currentStep > step.id ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xl">{step.icon}</span>
                      )}
                    </div>
                    <div className="ml-4 min-w-0 hidden sm:block">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`absolute top-6 left-12 w-full h-0.5 ${
                      currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                    } hidden sm:block`} />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Форма */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep - 1].name}
            </h2>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {renderStep()}
        </div>

        {/* Навигация */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            ← Назад
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Далее →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !isAuthenticated}
              className="inline-flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Отправляем...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Отправить заявку
                </>
              )}
            </button>
          )}
        </div>

        {/* Информационный блок */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-yellow-900 mb-2">
                Важная информация
              </h4>
              <ul className="text-yellow-800 space-y-1 text-sm">
                <li>• Модерация заявок происходит в течение 1-3 рабочих дней</li>
                <li>• Убедитесь, что вся информация актуальна и достоверна</li>
                <li>• Добавляйте только легальные детские учреждения</li>
                <li>• При необходимости модератор может запросить дополнительную информацию</li>
                <li>• После одобрения учреждение станет доступно всем пользователям</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Модальное окно с политикой конфиденциальности */}
            <PrivacyConsentModal
              isOpen={showPrivacyModal}
              onClose={handlePrivacyModalClose}
              onAccept={handlePrivacyAccept}
            />
    </div>
  )
}

export default SubmitPage