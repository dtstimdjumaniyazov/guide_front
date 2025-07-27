export const CONSTANTS = {
  // Размеры страниц для пагинации
  PAGE_SIZES: {
    SMALL: 10,
    MEDIUM: 20,
    LARGE: 50
  },

  // Временные интервалы
  TIMEOUTS: {
    DEBOUNCE: 300,
    SEARCH_DEBOUNCE: 500,
    TOAST: 5000
  },

  // Статусы заявок
  SUBMISSION_STATUSES: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    NEEDS_EDIT: 'needs_edit'
  } as const,

  // Роли пользователей
  USER_ROLES: {
    USER: 'user',
    MODERATOR: 'moderator',
    ADMIN: 'admin'
  } as const,

  // Типы медиа
  MEDIA_TYPES: {
    PHOTO: 'photo',
    VIDEO: 'video'
  } as const,

  // Максимальные размеры файлов (в байтах)
  FILE_LIMITS: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    VIDEO: 50 * 1024 * 1024, // 50MB
  },

  // Поддерживаемые форматы файлов
  ALLOWED_FILE_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/webp'],
    VIDEOS: ['video/mp4', 'video/webm']
  }
}