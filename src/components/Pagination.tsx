// src/components/Pagination.tsx
import React from 'react'
import { usePagination } from '../hooks/usePagination'

interface PaginationProps {
  currentPage: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  siblingCount?: number
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  siblingCount = 1,
  className = ''
}) => {
  const { paginationRange, isFirstPage, isLastPage, totalPages } = usePagination({
    currentPage,
    totalCount,
    pageSize,
    siblingCount
  })

  // Не показываем пагинацию если страница только одна
  if (totalPages <= 1) {
    return null
  }

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage) {
      onPageChange(page)
    }
  }

  const handlePrevious = () => {
    if (!isFirstPage) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (!isLastPage) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <nav className={`flex items-center justify-between ${className}`} aria-label="Pagination">
      {/* Информация о странице */}
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          Показано{' '}
          <span className="font-medium">
            {Math.min((currentPage - 1) * pageSize + 1, totalCount)}
          </span>{' '}
          -{' '}
          <span className="font-medium">
            {Math.min(currentPage * pageSize, totalCount)}
          </span>{' '}
          из{' '}
          <span className="font-medium">{totalCount}</span>{' '}
          результатов
        </p>
      </div>

      {/* Пагинация */}
      <div className="flex items-center space-x-1">
        {/* Предыдущая страница */}
        <button
          onClick={handlePrevious}
          disabled={isFirstPage}
          className={`
            relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
            ${isFirstPage
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
          aria-label="Предыдущая страница"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline ml-1">Назад</span>
        </button>

        {/* Номера страниц */}
        <div className="hidden sm:flex space-x-1">
          {paginationRange.map((pageNumber, index) => {
            if (pageNumber === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              )
            }

            const isCurrentPage = pageNumber === currentPage

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageClick(pageNumber)}
                className={`
                  relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                  ${isCurrentPage
                    ? 'bg-blue-600 text-white cursor-default'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                aria-current={isCurrentPage ? 'page' : undefined}
                aria-label={`Страница ${pageNumber}`}
              >
                {pageNumber}
              </button>
            )
          })}
        </div>

        {/* Мобильная версия - только текущая страница */}
        <div className="sm:hidden">
          <span className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700">
            {currentPage} из {totalPages}
          </span>
        </div>

        {/* Следующая страница */}
        <button
          onClick={handleNext}
          disabled={isLastPage}
          className={`
            relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
            ${isLastPage
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
          aria-label="Следующая страница"
        >
          <span className="hidden sm:inline mr-1">Вперед</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  )
}

// Простая пагинация для компактных мест
interface SimplePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export const SimplePagination: React.FC<SimplePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) {
    return null
  }

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        className={`
          p-2 rounded-md transition-colors duration-200
          ${isFirstPage
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className={`
          p-2 rounded-md transition-colors duration-200
          ${isLastPage
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}