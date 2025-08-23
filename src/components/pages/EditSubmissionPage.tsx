// src/pages/EditSubmissionPage.tsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  useGetSubmissionQuery, 
  useUpdateSubmissionDataMutation,
  useGetInstitutionTypesQuery,
  useUploadSubmissionMediaMutation
} from '../../store/api/institutionsApi'
import { useAuth } from '../../providers/AuthProvider'
import { validators } from '../../hooks/validators'
import { LoadingPage, LoadingSpinner } from '../../components/Loading'
import type { InstitutionSubmissionData } from '../../types'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { MediaUpload } from '../../components/MediaUpload'
import type { MediaFile } from '../../components/MediaUpload'

interface FormErrors {
  [key: string]: string | undefined
  media_upload?: string
}

const EditSubmissionPage: React.FC = () => {
  useDocumentTitle('Редактирование заявки')

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { data: submission, isLoading: loadingSubmission, error } = useGetSubmissionQuery(Number(id), {
    skip: !id
  })
  
  const [updateSubmissionData, { isLoading: isSubmitting }] = useUpdateSubmissionDataMutation()
  const { data: institutionTypes, isLoading: typesLoading } = useGetInstitutionTypesQuery()
  const [uploadSubmissionMedia] = useUploadSubmissionMediaMutation()
  
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

  const [errors, setErrors] = useState<FormErrors>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [serviceInput, setServiceInput] = useState('')

  // Заполняем форму данными из заявки
  useEffect(() => {
    if (submission?.institution_data) {
      const data = submission.institution_data

      // Основные данные формы
      const baseFormData = {
        name: data.name || '',
        institution_type: data.institution_type || 0,
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
      }

      // Правильная обработка медиафайлов
      let existingMediaFiles: MediaFile[] = []
      
      if (data.media_files && Array.isArray(data.media_files)) {
        existingMediaFiles = data.media_files
          .filter((mediaFile: any) => {
            // Фильтруем только существующие файлы (с file_url), исключаем File объекты
            return mediaFile.file_url && typeof mediaFile.file_url === 'string'
          })
          .map((mediaFile: any, index: number) => {
            // console.log(`Обработка существующего медиафайла ${index}:`, mediaFile)
            
            // Для существующих файлов используем file_url
            const fileUrl = mediaFile.file_url
            
            // Формируем полный URL (добавляем базовый URL сервера)
            const baseUrl = import.meta.env.VITE_BASE_URL
            const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${baseUrl}${fileUrl}`
            
            const processedFile = {
              file: fullUrl, // Полный URL существующего файла
              preview: fullUrl, // Превью - тот же URL
              caption: mediaFile.caption || '',
              media_type: mediaFile.media_type || 'photo',
              order: mediaFile.order !== undefined ? mediaFile.order : index,
              id: mediaFile.id, // ID файла для возможного удаления
              // Дополнительные поля для отображения
              file_name: mediaFile.file_name,
              file_size: mediaFile.file_size,
              uploaded_at: mediaFile.uploaded_at,
              // Сохраняем оригинальный URL
              originalUrl: fileUrl,
              isExisting: true // Флаг что это существующий файл
            }
            return processedFile
          })
      }
      
      setFormData({
        ...baseFormData,
        media_files: existingMediaFiles
      })
    }
  }, [submission])

  const steps = [
    { id: 1, name: 'Основная информация', icon: '🏫' },
    { id: 2, name: 'Контакты и местоположение', icon: '📍' },
    { id: 3, name: 'Услуги, расписание и медиа', icon: '📋' },
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

  const handleMediaChange = (files: MediaFile[]) => {
    
    const validatedFiles = files.map((file, index) => {
      let media_type: 'photo' | 'video' = 'photo'
      
      // Для новых File объектов
      if (typeof file.file !== 'string' && file.file instanceof File) {
        if (file.file.type.startsWith('video/')) {
          media_type = 'video'
        }
      } 
      // Для существующих URL файлов
      else if (typeof file.file === 'string') {
        // Проверяем расширение в URL
        const url = file.file.toLowerCase()
        const extension = url.split('.').pop()?.split('?')[0] // Убираем query параметры
        
        if (extension && ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
          media_type = 'video'
        }
        
        // Если тип уже определен в данных, используем его
        if (file.media_type) {
          media_type = file.media_type
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
        if (!formData.institution_type || formData.institution_type === 0) {
          newErrors.institution_type = 'Выберите тип учреждения'
        }
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
      // Обновляем основные данные заявки (без медиафайлов)
      const response = await updateSubmissionData({
        id: Number(id),
        data: {
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
            institution_type: formData.institution_type,
            latitude: formData.latitude,
            longitude: formData.longitude,
            // НЕ включаем media_files в основные данные
          }
        }
      }).unwrap()

      // Загружаем только НОВЫЕ медиафайлы (File объекты, не строки)
      if (formData.media_files && formData.media_files.length > 0) {
        try {
          const newFileObjects = formData.media_files
            .filter(mediaFile => mediaFile.file instanceof File) // Только новые File объекты
            .map(mediaFile => mediaFile.file as File)
                    
          if (newFileObjects.length > 0) {
            const captions = formData.media_files
              .filter(mediaFile => mediaFile.file instanceof File)
              .map(mediaFile => mediaFile.caption || '')
            
            const orders = formData.media_files
              .filter(mediaFile => mediaFile.file instanceof File)
              .map((mediaFile, index) => mediaFile.order ?? index)
            
            const media_types = formData.media_files
              .filter(mediaFile => mediaFile.file instanceof File)
              .map(mediaFile => mediaFile.media_type || 'photo')

            await uploadSubmissionMedia({
              submission_id: Number(id),
              files: newFileObjects,
              captions,
              orders,
              media_types
            }).unwrap()
          }
        } catch (uploadError: any) {
          console.error('Ошибка загрузки медиафайлов:', uploadError)
          
          setErrors({
            media_upload: `Заявка обновлена, но возникла ошибка при загрузке новых медиафайлов: ${uploadError.data?.error || uploadError.message || 'Неизвестная ошибка'}`
          })
          
          setTimeout(() => {
            navigate('/my-submissions', {
              state: {
                message: 'Заявка успешно обновлена! Некоторые новые медиафайлы могли не загрузиться.',
                submissionId: response.submission_id
              }
            })
          }, 2000)
          return
        }
      }

      // Успешное завершение
      navigate('/my-submissions', {
        state: {
          message: 'Заявка успешно обновлена и отправлена на повторное рассмотрение!',
          submissionId: response.submission_id
        }
      })
    } catch (error: any) {
      console.error('Submit error:', error)
      
      let errorMessage = 'Ошибка при отправке заявки'
      
      if (error.status === 404) {
        errorMessage = 'Заявка не найдена или недоступна для редактирования'
      } else if (error.status === 400) {
        errorMessage = error.data?.error || 'Неверные данные запроса'
      } else if (error.data?.error) {
        errorMessage = error.data.error
      } else if (error.data?.details) {
        errorMessage = `Ошибка валидации: ${JSON.stringify(error.data.details)}`
      } else if (error.data?.message) {
        errorMessage = error.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setErrors({ submit: errorMessage })
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
                  value={formData.institution_type || 0}
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
                Добавьте или обновите фотографии и видео учреждения. Это поможет родителям лучше понять атмосферу места.
              </p>
              
              {/* Отображение существующих медиафайлов */}
              {formData.media_files && formData.media_files.some(f => typeof f.file === 'string') && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Загруженные медиафайлы ({formData.media_files.filter(f => typeof f.file === 'string').length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                    {formData.media_files
                      .filter(file => typeof file.file === 'string')
                      .map((file, index) => {
                        // console.log(`Отображение медиафайла ${index}:`, file)
                        // console.log(`URL для отображения: ${file.file}`)
                        
                        return (
                          <div key={file.id || index} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              {file.media_type === 'photo' ? (
                                <img
                                  src={file.file as string}
                                  alt={file.caption || `Фото ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onLoad={() => {
                                    console.log(`✅ Изображение загружено успешно: ${file.file}`)
                                  }}
                                  onError={(e) => {
                                    console.error(`❌ Ошибка загрузки изображения: ${file.file}`);
                                    console.error('Ошибка:', e);
                                    // Можно добавить placeholder изображение
                                    (e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              ) : (
                                <video
                                  src={file.file as string}
                                  className="w-full h-full object-cover"
                                  muted
                                  preload="metadata"
                                  controls={false}
                                  onLoadedData={() => {
                                    console.log(`✅ Видео загружено успешно: ${file.file}`)
                                  }}
                                  onError={(e) => {
                                    console.error(`❌ Ошибка загрузки видео: ${file.file}`)
                                    console.error('Ошибка:', e)
                                  }}
                                />
                              )}
                              
                              {/* Индикатор типа файла */}
                              <div className="absolute bottom-2 left-2">
                                <span className="bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
                                  {file.media_type === 'photo' ? '📸' : '🎥'}
                                </span>
                              </div>
                              
                              {/* Подпись */}
                              {file.caption && (
                                <div className="absolute bottom-2 right-2">
                                  <span 
                                    className="bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded cursor-help" 
                                    title={file.caption}
                                  >
                                    💬
                                  </span>
                                </div>
                              )}
                              
                              {/* Кнопка удаления */}
                              <button
                                type="button"
                                onClick={() => {
                                  console.log('Удаление файла:', file)
                                  const updatedFiles = formData.media_files?.filter(f => f !== file) || []
                                  console.log('Файлы после удаления:', updatedFiles)
                                  setFormData(prev => ({ ...prev, media_files: updatedFiles }))
                                }}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Удалить файл"
                              >
                                ×
                              </button>
                              
                              {/* Fallback если изображение не загружается */}
                              {!file.file && (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <div className="text-center">
                                    <div className="text-2xl mb-1">❌</div>
                                    <div className="text-xs">Файл не найден</div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Информация о файле */}
                            <div className="mt-1 text-xs text-gray-500">
                              <div className="truncate" title={file.file_name || 'Файл'}>
                                {file.file_name || 'Неизвестный файл'}
                              </div>
                              {file.file_size && (
                                <div className="text-gray-400">
                                  {(file.file_size / 1024 / 1024).toFixed(1)} MB
                                </div>
                              )}
                              {/* URL для отладки */}
                              <div className="text-gray-300 truncate text-xs" title={file.file as string}>
                                {(file.file as string)?.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              )}
              
              {/* Компонент для загрузки новых файлов */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Добавить новые файлы
                </h4>
                <MediaUpload
                  mediaFiles={formData.media_files?.filter(f => f.file instanceof File) || []}
                  onMediaChange={(newFiles) => {
                    // Объединяем существующие URL файлы с новыми File объектами
                    const existingUrlFiles = formData.media_files?.filter(f => typeof f.file === 'string') || []
                    const allFiles = [...existingUrlFiles, ...newFiles]
                    handleMediaChange(allFiles)
                  }}
                  maxFiles={10 - (formData.media_files?.filter(f => typeof f.file === 'string').length || 0)}
                  disabled={isSubmitting}
                  onError={(error: string) => {
                    setErrors(prev => ({ 
                      ...prev, 
                      media_upload: error 
                    }))
                  }}
                />
              </div>
              
              {/* Отображение ошибки медиафайлов */}
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
              
              {/* Информация о лимитах */}
              <div className="mt-3 text-xs text-gray-500">
                💡 Всего файлов: {formData.media_files?.length || 0}/10. 
                Можно добавить ещё: {10 - (formData.media_files?.length || 0)} файлов
              </div>
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
                              href={formData.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline break-all"
                            >
                              {formData.website}
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

            {/* Статус готовности */}
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

            {/* Ошибки отправки */}
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
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">Ошибка при отправке</p>
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
                      {currentStep > step.id ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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