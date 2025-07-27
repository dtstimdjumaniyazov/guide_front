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
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}