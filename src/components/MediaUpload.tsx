import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { BASE_URL } from '../constants'

export interface MediaFile {
  file: File | string
  media_type: 'photo' | 'video'
  caption?: string
  order?: number
  preview?: string
}

interface MediaUploadProps {
  mediaFiles: MediaFile[]
  onMediaChange: (files: MediaFile[]) => void
  maxFiles?: number
  disabled?: boolean
  onError?: (error: string) => void
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  mediaFiles,
  onMediaChange,
  maxFiles = 10,
  disabled = false,
  onError
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Константы для валидации
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/quicktime']

  const validateFiles = (files: File[]): { validFiles: File[], errors: string[] } => {
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach(file => {
      // Проверка размера файла
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`Файл "${file.name}" слишком большой (максимум 10MB)`)
        return
      }

      // Проверка типа файла
      if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
        errors.push(`Файл "${file.name}" имеет неподдерживаемый формат`)
        return
      }

      // Дополнительная проверка по расширению
      const extension = file.name.toLowerCase().split('.').pop()
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'wmv']
      if (!extension || !allowedExtensions.includes(extension)) {
        errors.push(`Файл "${file.name}" имеет недопустимое расширение`)
        return
      }

      validFiles.push(file)
    })

    return { validFiles, errors }
  }

  // Функция для определения типа медиафайла
  const getMediaType = (file: File): 'photo' | 'video' => {
    if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return 'video'
    }
    return 'photo'
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Очищаем предыдущие ошибки
    setValidationError(null)
    
    // Проверяем лимит файлов
    const remainingSlots = maxFiles - mediaFiles.length
    if (acceptedFiles.length > remainingSlots) {
      const error = `Можно загрузить максимум ${remainingSlots} файлов`
      setValidationError(error)
      onError?.(error)
      return
    }

    // Валидируем файлы
    const { validFiles, errors } = validateFiles(acceptedFiles)
    
    // Обработка отклоненных файлов
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(rejected => {
        rejected.errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            errors.push(`Файл "${rejected.file.name}" слишком большой (максимум 10MB)`)
          } else if (error.code === 'file-invalid-type') {
            errors.push(`Файл "${rejected.file.name}" имеет неподдерживаемый тип`)
          } else {
            errors.push(`Ошибка с файлом "${rejected.file.name}": ${error.message}`)
          }
        })
      })
    }

    if (errors.length > 0) {
      const errorMessage = errors.join('; ')
      setValidationError(errorMessage)
      onError?.(errorMessage)
      
      // Если есть валидные файлы, все равно добавляем их
      if (validFiles.length === 0) {
        return
      }
    }

    // Добавляем валидные файлы
    if (validFiles.length > 0) {
      const newFiles: MediaFile[] = validFiles.map((file, index) => {
        const mediaType = getMediaType(file)
        let preview = ''
        
        try {
          preview = URL.createObjectURL(file)
        } catch (error) {
          console.error('Ошибка создания превью для файла:', file.name, error)
        }

        return {
          file,
          media_type: mediaType,
          caption: '',
          order: mediaFiles.length + index,
          preview
        }
      })

      onMediaChange([...mediaFiles, ...newFiles])
    }
  }, [mediaFiles, onMediaChange, maxFiles, onError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv']
    },
    maxFiles: maxFiles - mediaFiles.length,
    maxSize: MAX_FILE_SIZE,
    disabled
  })

  const removeFile = (index: number) => {
    const fileToRemove = mediaFiles[index]
    
    // Очищаем blob URL если он был создан
    if (fileToRemove.preview && fileToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    
    const updatedFiles = mediaFiles.filter((_, i) => i !== index)
    onMediaChange(updatedFiles)
    
    // Очищаем ошибку при удалении файла
    if (validationError) {
      setValidationError(null)
    }
  }

  const updateCaption = (index: number, caption: string) => {
    const updatedFiles = mediaFiles.map((file, i) => 
      i === index ? { ...file, caption } : file
    )
    onMediaChange(updatedFiles)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null) return

    const reorderedFiles = [...mediaFiles]
    const draggedFile = reorderedFiles[draggedIndex]
    
    reorderedFiles.splice(draggedIndex, 1)
    reorderedFiles.splice(dropIndex, 0, draggedFile)
    
    // Обновляем порядок
    const updatedFiles = reorderedFiles.map((file, index) => ({
      ...file,
      order: index
    }))
    
    onMediaChange(updatedFiles)
    setDraggedIndex(null)
  }

  const getFilePreview = (file: MediaFile): string => {
    // Если уже есть превью URL
    if (file.preview) {
      return file.preview
    }
    
    // Если это строка (URL с сервера)
    if (typeof file.file === 'string') {
      // Добавляем базовый URL если нужно
      const baseUrl = BASE_URL // замените на ваш backend URL
      return file.file.startsWith('http') ? file.file : `${baseUrl}${file.file}`
    }
    
    // Если это File объект, создаем blob URL
    if (file.file instanceof File) {
      try {
        return URL.createObjectURL(file.file)
      } catch (error) {
        console.error('Ошибка создания превью:', error)
        return ''
      }
    }
    
    return ''
  }

  const renderPreview = (file: MediaFile) => {
    const previewUrl = getFilePreview(file)
    
    if (!previewUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <span className="text-gray-500 text-sm">Нет превью</span>
        </div>
      )
    }

    if (file.media_type === 'photo') {
      return (
        <img
          src={previewUrl}
          alt={file.caption || 'Фото'}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Ошибка загрузки изображения:', previewUrl)
            e.currentTarget.style.display = 'none'
          }}
        />
      )
    } else {
      return (
        <video
          src={previewUrl}
          className="w-full h-full object-cover"
          muted
          preload="metadata"
          onError={(e) => {
            console.error('Ошибка загрузки видео:', previewUrl)
          }}
        />
      )
    }
  }

  // Очистка blob URLs при размонтировании
  useEffect(() => {
    return () => {
      mediaFiles.forEach(file => {
        if (file.preview && file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Ошибка валидации */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-600">{validationError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Загруженные файлы */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {mediaFiles.map((file, index) => (
            <div
              key={index}
              className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              {/* Превью */}
              <div className="aspect-video bg-gray-100 relative">
                {renderPreview(file)}
                
                {/* Индикатор типа файла */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    file.media_type === 'photo' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {file.media_type === 'photo' ? '📸' : '🎥'} {file.media_type === 'photo' ? 'Фото' : 'Видео'}
                  </span>
                </div>

                {/* Кнопка удаления */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>

                {/* Индикатор порядка */}
                <div className="absolute bottom-2 left-2">
                  <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    #{index + 1}
                  </span>
                </div>
              </div>

              {/* Подпись */}
              <div className="p-3">
                <input
                  type="text"
                  value={file.caption || ''}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  placeholder="Добавить подпись..."
                  className="w-full text-sm border-none focus:ring-0 focus:outline-none bg-transparent placeholder-gray-400"
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Зона загрузки */}
      {mediaFiles.length < maxFiles && !disabled && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-3">
            <div className="text-4xl">
              {isDragActive ? '📤' : '📷'}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive
                  ? 'Отпустите файлы здесь'
                  : 'Перетащите фото или видео сюда'
                }
              </p>
              <p className="text-sm text-gray-500">
                или нажмите для выбора файлов
              </p>
            </div>
            <div className="text-xs text-gray-400">
              <p>Поддерживаемые форматы:</p>
              <p>Фото: JPEG, PNG, GIF, WebP</p>
              <p>Видео: MP4, AVI, MOV, WMV</p>
              <p>Максимальный размер: 10MB</p>
              <p>Максимум {maxFiles} файлов</p>
            </div>
          </div>
        </div>
      )}

      {/* Подсказка по перетаскиванию */}
      {mediaFiles.length > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 <strong>Совет:</strong> Перетащите изображения для изменения порядка отображения
          </p>
        </div>
      )}

      {/* Достигнут лимит файлов */}
      {mediaFiles.length >= maxFiles && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Достигнуто максимальное количество файлов ({maxFiles})
          </p>
        </div>
      )}
    </div>
  )
}