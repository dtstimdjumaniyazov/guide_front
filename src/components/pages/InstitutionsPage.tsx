// src/pages/InstitutionsPage.tsx
import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useGetInstitutionsQuery } from '../../store/api/institutionsApi'
import { useDebounce } from '../../hooks/useDebounce'
// import { formatters } from '../../hooks/formatters'
import { LoadingCard } from '../../components/Loading'
import { Pagination } from '../../components/Pagination'
import type { InstitutionFilters } from '../../types'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { InstitutionCard } from '../institutionsCard'

const InstitutionsPage: React.FC = () => {
  useDocumentTitle('Каталог учреждений')
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  
  // Извлекаем параметры из URL
  const [filters, setFilters] = useState<InstitutionFilters>({
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page') || '1'),
    page_size: 12,
    ordering: searchParams.get('ordering') || '-created_at'
  })

  const debouncedSearch = useDebounce(filters.search, 500)
  
  // Запрос к API
  const { data, isLoading, error } = useGetInstitutionsQuery({
    ...filters,
    search: debouncedSearch
  })

  // Обновляем URL при изменении фильтров
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filters.search) params.set('search', filters.search)
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString())
    if (filters.ordering && filters.ordering !== '-created_at') params.set('ordering', filters.ordering)
    
    setSearchParams(params)
  }, [filters, setSearchParams])

  const handleFilterChange = (newFilters: Partial<InstitutionFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Сбрасываем на первую страницу при изменении фильтров
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sortOptions = [
    { value: '-created_at', label: 'Новые' },
    { value: 'created_at', label: 'Старые' },
    { value: 'name', label: 'По названию (А-Я)' },
    { value: '-name', label: 'По названию (Я-А)' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок и поиск */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Каталог детских учреждений
          </h1>
          
          {/* Поиск */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск по названию, описанию или адресу..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Сортировка */}
            <div className="sm:w-48">
              <select
                value={filters.ordering}
                onChange={(e) => handleFilterChange({ ordering: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Кнопка фильтров */}
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="sm:w-auto px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Фильтры
            </button>
          </div>

          {/* Панель фильтров */}
          {isFiltersOpen && (
            <div className="bg-white p-6 rounded-lg shadow-lg border mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Возрастная группа
                  </label>
                  <input
                    type="text"
                    placeholder="Например: 3-5 лет"
                    value={filters.age_group || ''}
                    onChange={(e) => handleFilterChange({ age_group: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Услуги
                  </label>
                  <input
                    type="text"
                    placeholder="Например: английский"
                    value={filters.services || ''}
                    onChange={(e) => handleFilterChange({ services: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Минимальная цена
                  </label>
                  <input
                    type="number"
                    placeholder="От"
                    value={filters.price_min || ''}
                    onChange={(e) => handleFilterChange({ price_min: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Максимальная цена
                  </label>
                  <input
                    type="number"
                    placeholder="До"
                    value={filters.price_max || ''}
                    onChange={(e) => handleFilterChange({ price_max: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.has_media || false}
                    onChange={(e) => handleFilterChange({ has_media: e.target.checked || undefined })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Только с фотографиями</span>
                </label>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    setFilters({
                      search: '',
                      page: 1,
                      page_size: 12,
                      ordering: '-created_at'
                    })
                    setIsFiltersOpen(false)
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Сбросить фильтры
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Результаты */}
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ошибка загрузки
            </h3>
            <p className="text-gray-600">
              Не удалось загрузить список учреждений. Попробуйте обновить страницу.
            </p>
          </div>
        ) : isLoading ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <LoadingCard count={6} />
            </div>
          </div>
        ) : data?.results.length ? (
          <>
            {/* Счетчик результатов */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-700">
                Найдено <span className="font-semibold">{data.count}</span> учреждений
              </p>
            </div>

            {/* Сетка учреждений */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data.results.map((institution) => (
                <InstitutionCard 
                  key={institution.id} 
                  institution={institution} 
                  showFullAddress={true}
                  showServices={true}
                />
              ))}
            </div>

            {/* Пагинация */}
            {data.total_pages > 1 && (
              <Pagination
                currentPage={data.current_page}
                totalCount={data.count}
                pageSize={data.page_size}
                onPageChange={handlePageChange}
                className="mt-8"
              />
            )}
          </>
        ) : (
          /* Пустое состояние */
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Учреждения не найдены
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска или добавьте новое учреждение.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button
                onClick={() => {
                  setFilters({
                    search: '',
                    page: 1,
                    page_size: 12,
                    ordering: '-created_at'
                  })
                  setIsFiltersOpen(false)
                }}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Сбросить фильтры
              </button>
              <Link
                to="/submit"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Добавить учреждение
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InstitutionsPage