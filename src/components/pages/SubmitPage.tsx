import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateSubmissionMutation, useUploadSubmissionMediaMutation } from '../../store/api/institutionsApi'
import { formatters } from '../../hooks/formatters'
import { validators } from '../../hooks/validators'
import { LoadingSpinner } from '../../components/Loading'
import type { InstitutionSubmissionData } from '../../types'
import { MediaUpload } from '../../components/mediaUpload'
import type { MediaFile } from '../../components/mediaUpload'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

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
  useDocumentTitle('Формирование заявки')
  
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
    media_files: [],
  })

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
          website: formData.website,
          social_links: formData.social_links,
          age_group: formData.age_group,
          price_range: formData.price_range,
          services: formData.services,
          schedule: formData.schedule,
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

      // Показываем сообщение об успехе
      alert('Заявка успешно отправлена на модерацию!')
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

      // Очищаем ошибку координат
      if (errors.coordinates) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.coordinates
          return newErrors
        })
      }
    } catch (error) {
      console.error('Geocoding error:', error)
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
                <p className="text-xs text-gray-500 mt-2">
                  💡 Нажмите "Получить координаты" для автоматического определения по адресу
                </p>
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

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Краткая информация</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Название</dt>
                  <dd className="text-sm text-gray-900">{formData.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Возрастная группа</dt>
                  <dd className="text-sm text-gray-900">{formData.age_group}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Адрес</dt>
                  <dd className="text-sm text-gray-900">{formData.address}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Телефон</dt>
                  <dd className="text-sm text-gray-900">{formatters.formatPhone(formData.contact_phone)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ценовой диапазон</dt>
                  <dd className="text-sm text-gray-900">{formData.price_range}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Количество услуг</dt>
                  <dd className="text-sm text-gray-900">{formData.services?.length || 0}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Медиафайлы</dt>
                  <dd className="text-sm text-gray-900">
                    {formData.media_files?.length || 0} файлов
                    {formData.media_files && formData.media_files.length > 0 && (
                      <span className="text-gray-500">
                        {' '}(📸 {formData.media_files.filter(f => f.media_type === 'photo').length}, 
                        🎥 {formData.media_files.filter(f => f.media_type === 'video').length})
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Координаты</dt>
                  <dd className="text-sm text-gray-900">
                    {formData.latitude && formData.longitude && formData.latitude !== 0 && formData.longitude !== 0
                      ? `${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}`
                      : 'Не указаны'
                    }
                  </dd>
                </div>
              </dl>
            </div>

            {/* Услуги */}
            {formData.services && formData.services.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Услуги ({formData.services.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formData.services.map((service, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Расписание */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Расписание</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {formData.schedule || 'Расписание не указано'}
                </pre>
              </div>
            </div>

            {/* Превью медиафайлов */}
            {formData.media_files && formData.media_files.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Загруженные файлы ({formData.media_files.length})
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
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
              disabled={isSubmitting}
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
    </div>
  )
}

export default SubmitPage