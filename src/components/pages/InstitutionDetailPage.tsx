// src/pages/InstitutionDetailPage.tsx
import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useGetInstitutionQuery, useAddToFavoritesMutation, useRemoveFromFavoritesMutation } from '../../store/api/institutionsApi'
import { useAuth } from '../../providers/AuthProvider'
import { formatters } from '../../hooks/formatters'
import { LoadingPage } from '../../components/Loading'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { FaYandexInternational } from "react-icons/fa6";
import { SiGooglemaps } from "react-icons/si";
import { useTranslation } from 'react-i18next'

const InstitutionDetailPage: React.FC = () => {
  const { t } = useTranslation("institutionDetail")

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const { data: institution, isLoading, error } = useGetInstitutionQuery(Number(id), {
    skip: !id
  })
  // console.log(institution);

  useDocumentTitle(`${institution?.name ?? undefined}`)

  const [addToFavorites, { isLoading: isAddingToFavorites }] = useAddToFavoritesMutation()
  const [removeFromFavorites, { isLoading: isRemovingFromFavorites }] = useRemoveFromFavoritesMutation()

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: { pathname: `/institutions/${id}` } } })
      return
    }

    if (!institution) return

    try {
      if (institution.is_favorited) {
        await removeFromFavorites(institution.id).unwrap()
      } else {
        await addToFavorites({ institution_id: institution.id }).unwrap()
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  if (isLoading) {
    return <LoadingPage message={t("loading")} />
  }

  if (error || !institution) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t("not_found")}
          </h1>
          <p className="text-gray-600 mb-6">
            {t("not_found_description")}
          </p>
          <Link
            to="/institutions"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            ← {t("back_catalog")}
          </Link>
        </div>
      </div>
    )
  }

  const images = institution.media.filter(media => media.media_type === 'photo')
  const videos = institution.media.filter(media => media.media_type === 'video')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хлебные крошки */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700">
                  {t("back_home")}
                </Link>
              </li>
              <li>
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link to="/institutions" className="text-gray-500 hover:text-gray-700">
                  {t("inst")}
                </Link>
              </li>
              <li>
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-gray-900 font-medium">{institution.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основной контент */}
          <div className="lg:col-span-2">
            {/* Галерея */}
            {images.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={images[selectedImageIndex]?.file}
                    alt={images[selectedImageIndex]?.caption || institution.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setIsImageModalOpen(true)}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                </div>
                
                {/* Миниатюры */}
                {images.length > 1 && (
                  <div className="p-4 flex space-x-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                          index === selectedImageIndex ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image.file}
                          alt={image.caption}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏫</div>
                    <p className="text-xl">{t("no_photos")}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Основная информация */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {institution.name}
                  </h1>
                  {institution.institution_type && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {institution.institution_type.name}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={handleFavoriteToggle}
                  disabled={isAddingToFavorites || isRemovingFromFavorites}
                  className={`p-3 rounded-full transition-colors duration-200 ${
                    institution.is_favorited
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  <svg className="w-6 h-6" fill={institution.is_favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {institution.description}
                </p>
              </div>
            </div>

            {/* Услуги */}
            {institution.services && institution.services.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t("services_and")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {institution.services.map((service, index) => (
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
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t("working")}
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">
                  {institution.schedule}
                </p>
              </div>
            </div>

            {/* Видео */}
            {videos.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Видео
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {videos.map((video) => (
                    <div key={video.id} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <video
                        src={video.file}
                        controls
                        className="w-full h-full object-cover"
                        poster={video.caption}
                      >
                        Ваш браузер не поддерживает видео.
                      </video>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Боковая панель */}
          <div className="lg:col-span-1">
            {/* Контактная информация */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t("contact_info")}
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Адрес</p>
                    <p className="text-gray-900">{institution.address}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Телефон</p>
                    <a href={`tel:${institution.contact_phone}`} className="text-blue-600 hover:text-blue-700">
                      {formatters.formatPhone(institution.contact_phone)}
                    </a>
                  </div>
                </div>

                {institution.website && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Веб-сайт</p>
                      <a
                        href={institution.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 break-all"
                      >
                        {institution.website}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">{t("age_group")}</p>
                    <p className="text-gray-900">{institution.age_group}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">{t("price")}</p>
                    <p className="text-gray-900 font-semibold">{institution.price_range}</p>
                  </div>
                </div>
              </div>

              {/* Социальные сети */}
              {Object.keys(institution.social_links).length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">{t("social_media")}</p>
                  <div className="flex space-x-3">
                    {institution.social_links.instagram && (
                      <a
                        href={institution.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-500 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                    {institution.social_links.facebook && (
                      <a
                        href={institution.social_links.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {institution.social_links.telegram && (
                      <a
                        href={institution.social_links.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.378 1.286-.624 1.285-1.237 1.285-.438 0-.658-.28-.882-.51-1.92-1.867-4.734-2.16-4.734-2.16s3.598-1.292 4.734-2.16c.224-.23.444-.51.882-.51.613 0 .859-.001 1.237 1.285 0 0 .727 4.87.896 6.728z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Кнопка "Показать на карте" */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    const coords = `${institution.latitude},${institution.longitude}`
                    const url = `https://www.google.com/maps/search/?api=1&query=${coords}`
                    window.open(url, '_blank')
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  <SiGooglemaps className="w-5 h-5 mr-3 text-blue-600"/>
                  {t("show_on_google_map")}
                </button>
                <br />
                <button
                  onClick={() => {
                    // latitude = 41.5465472, longtitude = 60.62.73536
                    const url = `https://yandex.ru/maps/?ll=${institution.longitude},${institution.latitude}&z=16&pt=${institution.longitude},${institution.latitude},pm2rdm`;
                    window.open(url, '_blank')
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  <FaYandexInternational className="w-5 h-5 mr-3 text-red-500"/>
                  {t("show_on_yandex_map")}
                </button>
              </div>              
            </div>

            {/* Информация о добавившем */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t("publication_info")}
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">{t("added_by")}:</span>
                  <span className="ml-2 text-gray-900">{institution.created_by_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t("publish_date")}:</span>
                  <span className="ml-2 text-gray-900">
                    {formatters.formatDate(institution.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t("last_update")}:</span>
                  <span className="ml-2 text-gray-900">
                    {formatters.formatDate(institution.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно для просмотра изображений */}
      {isImageModalOpen && images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center" onClick={() => setIsImageModalOpen(false)}>
          <div className="relative max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[selectedImageIndex]?.file}
              alt={images[selectedImageIndex]?.caption || institution.name}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Закрыть */}
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Навигация */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Счетчик */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InstitutionDetailPage