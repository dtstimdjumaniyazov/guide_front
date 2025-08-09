import React, { useState } from 'react'
import { BASE_URL } from '../../constants'

interface MediaFile {
  file_url: string
  file_path?: string
  file_name: string
  file_size: number
  caption: string
  order: number
  media_type: 'photo' | 'video'
  uploaded_at: string
}

interface SubmissionMediaViewerProps {
  mediaFiles: MediaFile[]
}

export const SubmissionMediaViewer: React.FC<SubmissionMediaViewerProps> = ({ mediaFiles }) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!mediaFiles || mediaFiles.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">📷</div>
        <p className="text-gray-500">Медиафайлы не загружены</p>
      </div>
    )
  }

  // Сортируем медиафайлы по порядку
  const sortedMedia = [...mediaFiles].sort((a, b) => a.order - b.order)

  // Разделяем на фото и видео
  const photos = sortedMedia.filter(media => media.media_type === 'photo')
  const videos = sortedMedia.filter(media => media.media_type === 'video')

  const getFileUrl = (fileUrl: string) => {
    if (fileUrl.startsWith('http')) {
      return fileUrl
    }
    const baseUrl = BASE_URL
    return fileUrl.startsWith('/') ? `${baseUrl}${fileUrl}` : `${baseUrl}/${fileUrl}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Медиафайлы ({sortedMedia.length})
        </h3>
        <div className="text-sm text-gray-500">
          📸 {photos.length} фото, 🎥 {videos.length} видео
        </div>
      </div>

      {/* Основное изображение/видео */}
      {sortedMedia.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="aspect-video bg-gray-100 relative">
            {sortedMedia[selectedMediaIndex].media_type === 'photo' ? (
              <img
                src={getFileUrl(sortedMedia[selectedMediaIndex].file_url)}
                alt={sortedMedia[selectedMediaIndex].caption || `Медиафайл ${selectedMediaIndex + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setIsModalOpen(true)}
                onError={(e) => {
                  console.error('Ошибка загрузки изображения:', sortedMedia[selectedMediaIndex].file_url)
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIwNSAxNTAgMjEwIDE0NSAyMTAgMTQwQzIxMCAxMzUgMjA1IDEzMCAyMDAgMTMwQzE5NSAxMzAgMTkwIDEzNSAxOTAgMTQwQzE5MCAxNDUgMTk1IDE1MCAyMDAgMTUwWiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjU3Mzg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7QntGI0LjQsdC60LAg0LfQsNCz0YDRg9C30LrQuDwvdGV4dD4KPC9zdmc+'
                }}
              />
            ) : (
              <video
                src={getFileUrl(sortedMedia[selectedMediaIndex].file_url)}
                className="w-full h-full object-cover cursor-pointer"
                controls
                preload="metadata"
                onError={(e) => {
                  console.error('Ошибка загрузки видео:', sortedMedia[selectedMediaIndex].file_url)
                }}
              />
            )}

            {/* Навигация если несколько файлов */}
            {sortedMedia.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedMediaIndex(prev => prev > 0 ? prev - 1 : sortedMedia.length - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedMediaIndex(prev => prev < sortedMedia.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Индикатор файла */}
            <div className="absolute top-4 left-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                sortedMedia[selectedMediaIndex].media_type === 'photo'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {sortedMedia[selectedMediaIndex].media_type === 'photo' ? '📸 Фото' : '🎥 Видео'}
              </span>
            </div>

            {/* Счетчик */}
            {sortedMedia.length > 1 && (
              <div className="absolute top-4 right-4">
                <span className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedMediaIndex + 1} / {sortedMedia.length}
                </span>
              </div>
            )}
          </div>

          {/* Информация о файле */}
          <div className="p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Информация о файле</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Имя: {sortedMedia[selectedMediaIndex].file_name}</div>
                  <div>Размер: {formatFileSize(sortedMedia[selectedMediaIndex].file_size)}</div>
                  <div>Загружен: {formatDate(sortedMedia[selectedMediaIndex].uploaded_at)}</div>
                </div>
              </div>
              {sortedMedia[selectedMediaIndex].caption && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Подпись</h4>
                  <p className="text-sm text-gray-600">{sortedMedia[selectedMediaIndex].caption}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Миниатюры */}
      {sortedMedia.length > 1 && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {sortedMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => setSelectedMediaIndex(index)}
              className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                selectedMediaIndex === index
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {media.media_type === 'photo' ? (
                <img
                  src={getFileUrl(media.file_url)}
                  alt={media.caption || `Файл ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA1MEMNTCA1MiA1MiA1MCA1MCA1MEM0OCA1MCA0NiA1MiA0NiA1MEM0NiA0OCA0OCA0NiA1MCA0NkM1MiA0NiA1NCA0OCA1NCA1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 5h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Индикатор типа */}
              <div className="absolute top-1 right-1">
                <span className="text-xs">
                  {media.media_type === 'photo' ? '📸' : '🎥'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Модальное окно для полноэкранного просмотра */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            {sortedMedia[selectedMediaIndex].media_type === 'photo' ? (
              <img
                src={getFileUrl(sortedMedia[selectedMediaIndex].file_url)}
                alt={sortedMedia[selectedMediaIndex].caption || 'Изображение'}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video
                src={getFileUrl(sortedMedia[selectedMediaIndex].file_url)}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
              />
            )}

            {/* Кнопка закрытия */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}