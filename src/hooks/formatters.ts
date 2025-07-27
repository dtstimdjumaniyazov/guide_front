export const formatters = {
  // Форматирование даты
  formatDate: (date: string | Date, locale = 'ru-RU'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },

  // Форматирование даты и времени
  formatDateTime: (date: string | Date, locale = 'ru-RU'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  },

  // Относительное время (например, "2 часа назад")
  formatRelativeTime: (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

    if (diffInSeconds < 60) return 'только что'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин. назад`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч. назад`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} дн. назад`
    
    return formatters.formatDate(dateObj)
  },

  // Форматирование номера телефона
  formatPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.length === 12 && cleaned.startsWith('998')) {
      // Узбекистанский номер: +998 90 123 45 67
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`
    }
    
    if (cleaned.length === 11 && cleaned.startsWith('7')) {
      // Российский номер: +7 900 123 45 67
      return `+${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`
    }
    
    return phone
  },

  // Сокращение текста
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trim() + '...'
  },

  // Форматирование числа с разделителями
  formatNumber: (num: number): string => {
    return num.toLocaleString('ru-RU')
  }
}
