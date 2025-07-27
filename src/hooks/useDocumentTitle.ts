// src/hooks/useDocumentTitle.ts
import { useEffect } from 'react'

const DEFAULT_TITLE = 'Детский гид'

export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    const previousTitle = document.title
    
    if (title) {
      document.title = `${title}`
    } else {
      document.title = DEFAULT_TITLE
    }

    // Cleanup function для восстановления предыдущего title
    return () => {
      document.title = previousTitle
    }
  }, [title])
}

// Альтернативная версия с более гибкой настройкой
export const useDocumentTitleWithSuffix = (title?: string, suffix = 'KidsPlaces') => {
  useEffect(() => {
    if (title) {
      document.title = suffix ? `${title} | ${suffix}` : title
    } else {
      document.title = DEFAULT_TITLE
    }
  }, [title, suffix])
}