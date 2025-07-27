// src/types/index.ts

// Базовые типы
export interface BaseEntity {
  id: number
  created_at: string
  updated_at: string
}

// Пользователь
export interface User extends BaseEntity {
  email: string
  phone?: string
  first_name: string
  last_name: string
  full_name: string
  avatar?: string
  role: UserRole
  date_joined: string
  is_active: boolean
  google_id?: string
}

export type UserRole = 'user' | 'moderator' | 'admin'

// Тип учреждения
export interface InstitutionType extends BaseEntity {
  name: string
  description: string
}

// Медиафайл учреждения
export interface InstitutionMedia extends BaseEntity {
  file: string
  media_type: MediaType
  caption: string
  order: number
  uploaded_at: string
  institution_id: number
}

export type MediaType = 'photo' | 'video'

// Учреждение (полная версия)
export interface Institution extends BaseEntity {
  institution_type?: InstitutionType
  name: string
  description: string
  address: string
  contact_phone: string
  website?: string
  social_links: SocialLinks
  age_group: string
  price_range: string
  services: string[]
  services_display: string
  schedule: string
  latitude: number
  longitude: number
  coordinates: Coordinates
  media: InstitutionMedia[]
  created_by: User
  created_by_name: string
  created_by_email: string
  is_approved: boolean
  is_favorited?: boolean
}

// Краткая версия учреждения для списков
export interface InstitutionListItem {
  id: number
  name: string
  description: string
  address: string
  contact_phone: string
  age_group: string
  price_range: string
  services_display: string
  coordinates: Coordinates
  media_count: number
  first_image?: {
    id: number
    file: string
    caption: string
    media_type: 'photo' | 'video'
  } | null
  created_by_name: string
  created_at: string
  is_approved: boolean
  is_favorited?: boolean
}

// Избранное учреждение
export interface FavoriteInstitution extends BaseEntity {
  user_id: number
  institution: InstitutionListItem
  added_at: string
}

// Заявка на добавление учреждения
export interface Submission extends BaseEntity {
  user: User
  institution_data: InstitutionSubmissionData
  institution_name: string
  status: SubmissionStatus
  moderator_comment?: string
  user_name: string
  user_email: string
  reviewed_at?: string
  approved_institution?: Institution
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'needs_edit'

export interface MediaFile {
  id?: number
  file: File | string
  media_type: 'photo' | 'video'
  caption?: string
  order: number
  preview?: string
  uploaded_at?: string
}

// Данные учреждения в заявке
export interface InstitutionSubmissionData {
  name: string
  description: string
  address: string
  contact_phone: string
  website?: string
  social_links?: SocialLinks
  age_group: string
  price_range: string
  services: string[]
  schedule: string
  latitude: number
  longitude: number
  institution_type?: number
  institution_type_name?: string
  media_files?: MediaFile[]
}

// Действие модератора
export interface ModeratorAction extends BaseEntity {
  moderator: User
  submission: Submission
  action: ModeratorActionType
  comment: string
  moderator_name: string
  submission_name: string
}

export type ModeratorActionType = 'approve' | 'reject' | 'request_edit'

// Вспомогательные типы
export interface Coordinates {
  lat: number
  lng: number
}

export interface SocialLinks {
  instagram?: string
  facebook?: string
  telegram?: string
  youtube?: string
  tiktok?: string
  [key: string]: string | undefined
}

// Типы для API запросов
export interface PaginatedResponse<T> {
  count: number
  total_pages: number
  current_page: number
  page_size: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface PaginationParams {
  page?: number
  page_size?: number
}

// Фильтры для учреждений
export interface InstitutionFilters extends PaginationParams {
  search?: string
  age_group?: string
  price_min?: number
  price_max?: number
  services?: string
  latitude_min?: number
  latitude_max?: number
  longitude_min?: number
  longitude_max?: number
  has_media?: boolean
  is_approved?: boolean
  ordering?: string
}

// Формы
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
  phone?: string
}

export interface UserUpdateFormData {
  phone?: string
  first_name?: string
  last_name?: string
}

export interface PasswordChangeFormData {
  old_password: string
  new_password: string
  new_password_confirm: string
}

export interface InstitutionFormData {
  name: string
  description: string
  address: string
  contact_phone: string
  website?: string
  social_links?: SocialLinks
  age_group: string
  price_range: string
  services?: string[]
  schedule: string
  latitude: number
  longitude: number
  institution_type?: number
  media_files?: File[]
}

// Статистика
export interface PublicStats {
  total_institutions: number
  institutions_with_media: number
  total_favorites: number
}

export interface ModerationStats {
  total_submissions: number
  pending_submissions: number
  approved_submissions: number
  rejected_submissions: number
  needs_edit_submissions: number
  total_institutions: number
  approved_institutions: number
  total_users: number
}

export interface UserStats {
  total_submissions: number
  approved_submissions: number
  rejected_submissions: number
  pending_submissions: number
  total_favorites: number
  institutions_created: number
}

// Уведомления/Toast
export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

// Поиск
export interface SearchSuggestions {
  institutions: string[]
  services: string[]
}

// Геолокация
export interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  loading: boolean
  error: string | null
}

// Состояние загрузки
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

// Файлы
export interface FileUpload {
  file: File
  preview?: string
  uploading?: boolean
  uploaded?: boolean
  error?: string
}

// Модальные окна
export interface ModalState {
  isOpen: boolean
  title?: string
  content?: React.ReactNode
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'error' | 'success'
}

// Фильтры модерации
export interface ModerationFilters extends PaginationParams {
  status?: SubmissionStatus
  moderator?: number
  user?: number
  created_at_min?: string
  created_at_max?: string
}

// API Error
export interface ApiError {
  message: string
  code?: string
  field?: string
  details?: Record<string, any>
}

// Ответы API
export interface LoginResponse {
  message: string
  user: User
  tokens: {
    access: string
    refresh: string
  }
}

export interface RegisterResponse {
  message: string
  user: User
  tokens: {
    access: string
    refresh: string
  }
}

export interface SubmissionCreateResponse {
  message: string
  submission_id: number
  status: SubmissionStatus
}

// Контекст темы (если планируется)
export interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

// Настройки приложения
export interface AppSettings {
  language: 'ru' | 'uz' | 'en'
  theme: 'light' | 'dark' | 'auto'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  map: {
    defaultZoom: number
    defaultCenter: Coordinates
  }
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Form validation
export interface ValidationError {
  field: string
  message: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Экспорт всех типов из других файлов
export * from '../store/slices/authSlice'
export * from '../store/api/authApi'
export * from '../store/api/userApi'
export * from '../store/api/institutionsApi'