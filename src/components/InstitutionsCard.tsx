import React from 'react'
import { Link } from 'react-router-dom'
import { formatters } from '../hooks/formatters'
import type { InstitutionListItem } from '../types'

interface InstitutionCardProps {
  institution: InstitutionListItem
  showFullAddress?: boolean
  showServices?: boolean
}

export const InstitutionCard: React.FC<InstitutionCardProps> = ({
  institution,
  showFullAddress = false,
  showServices = false
}) => {
  // Формируем полный URL для изображения
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return ''
    
    // Если URL уже полный
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    
    // Добавляем базовый URL сервера
    const baseUrl = 'http://localhost:8000'
    
    // Если путь начинается с /, добавляем базовый URL
    if (imagePath.startsWith('/')) {
      return `${baseUrl}${imagePath}`
    }
    
    // Иначе добавляем / и базовый URL
    return `${baseUrl}/${imagePath}`
  }

  const imageUrl = institution.first_image ? getImageUrl(institution.first_image.file) : ''

  return (
    <Link
      to={`/institutions/${institution.id}`}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
    >
      {/* Изображение */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {institution.first_image && imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={institution.first_image.caption || institution.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onLoad={() => {
                console.log('✅ Изображение загружено:', imageUrl)
              }}
              onError={(e) => {
                console.error('❌ Ошибка загрузки изображения:', {
                  url: imageUrl,
                  originalPath: institution.first_image?.file,
                  institution: institution.name
                })
                // Скрываем изображение и показываем fallback
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon')
                if (fallback) {
                  fallback.classList.remove('hidden')
                }
              }}
            />
            {/* Fallback иконка (скрыта по умолчанию) */}
            <div className="fallback-icon hidden absolute inset-0 bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-4xl mb-2">🚫</div>
                <div className="text-xs">Ошибка загрузки</div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white h-full">
            <div className="text-center">
              <div className="text-4xl mb-2">🏫</div>
              <div className="text-xs">Нет изображения</div>
            </div>
          </div>
        )}
        
        {/* Счетчик медиафайлов */}
        {institution.media_count > 0 && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
            {institution.media_count} {institution.media_count === 1 ? 'фото' : 'фото'}
          </div>
        )}
      </div>
      
      {/* Контент */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {institution.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {formatters.truncateText(institution.description, showFullAddress ? 150 : 100)}
        </p>
        
        <div className="space-y-2 mb-4">
          {showFullAddress && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {formatters.truncateText(institution.address, 50)}
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            {institution.age_group}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            {institution.price_range}
          </div>
          
          {showServices && institution.services_display && (
            <div className="flex items-start text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="line-clamp-2">{formatters.truncateText(institution.services_display, 80)}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Добавлено {formatters.formatDate(institution.created_at)}</span>
          {institution.is_favorited && (
            <span className="text-red-500">❤️</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default InstitutionCard