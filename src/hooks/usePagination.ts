import { useMemo } from 'react'

interface UsePaginationProps {
  totalCount: number
  pageSize: number
  siblingCount?: number
  currentPage: number
}

interface UsePaginationReturn {
  paginationRange: (number | string)[]
  isFirstPage: boolean
  isLastPage: boolean
  totalPages: number
}

const DOTS = '...'

export function usePagination({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage
}: UsePaginationProps): UsePaginationReturn {
  const paginationRange = useMemo(() => {
    const totalPages = Math.ceil(totalCount / pageSize)

    // Количество страниц для отображения в пагинации
    const totalPageNumbers = siblingCount + 5

    // Если общее количество страниц меньше числа страниц для отображения, возвращаем весь диапазон
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2

    const firstPageIndex = 1
    const lastPageIndex = totalPages

    // Только правые точки
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = range(1, leftItemCount)
      return [...leftRange, DOTS, totalPages]
    }

    // Только левые точки
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = range(totalPages - rightItemCount + 1, totalPages)
      return [firstPageIndex, DOTS, ...rightRange]
    }

    // Обе стороны точек
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex)
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex]
    }

    return []
  }, [totalCount, pageSize, siblingCount, currentPage])

  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    paginationRange,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    totalPages
  }
}

// Вспомогательная функция для создания диапазона чисел
function range(start: number, end: number): number[] {
  const length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}