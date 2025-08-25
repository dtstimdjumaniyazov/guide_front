export const validators = {
  // Валидация email
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Валидация номера телефона
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  },

  // Валидация пароля
  isValidPassword: (password: string): {
    isValid: boolean
    errors: string[]
  } => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Пароль должен содержать минимум 8 символов')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Пароль должен содержать минимум одну заглавную букву')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Пароль должен содержать минимум одну строчную букву')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Пароль должен содержать минимум одну цифру')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Валидация URL
  isValidUrl: (url: string): boolean => {
    if (!url || !url.trim()) {
      return true // Пустое поле считается валидным (поле необязательное)
    }

    const trimmedUrl = url.trim()

    // Паттерны для различных форматов URL
    const urlPatterns = [
      // С протоколом: https://example.com, http://example.com
      /^https?:\/\/[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.+[a-zA-Z]{2,}(?:\/.*)?$/i,
      
      // Без протокола: example.com, sub.example.com
      /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.+[a-zA-Z]{2,}(?:\/.*)?$/i,
      
      // С www: www.example.com
      /^www\.[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.+[a-zA-Z]{2,}(?:\/.*)?$/i
    ]

    // Проверяем соответствие хотя бы одному паттерну
    const isValidPattern = urlPatterns.some(pattern => pattern.test(trimmedUrl))
    
    if (!isValidPattern) {
      return false
    }

    // Дополнительная проверка - пытаемся создать URL с протоколом
    try {
      // Если уже есть протокол
      if (trimmedUrl.match(/^https?:\/\//i)) {
        new URL(trimmedUrl)
        return true
      }
      
      // Если нет протокола, добавляем https:// для проверки
      new URL(`https://${trimmedUrl}`)
      return true
    } catch {
      return false
    }
  },

  // Метод для нормализации URL (добавляет https:// если нужно)
  normalizeUrl: (url: string): string => {
    if (!url || !url.trim()) {
      return ''
    }

    const trimmedUrl = url.trim()

    // Если уже есть протокол, возвращаем как есть
    if (trimmedUrl.match(/^https?:\/\//i)) {
      return trimmedUrl
    }

    // Добавляем https:// если нет протокола
    return `https://${trimmedUrl}`
  }
}