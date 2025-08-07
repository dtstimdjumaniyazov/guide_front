import { baseApi } from './baseApi'

// Типы для учреждений
export interface InstitutionType {
  id: number
  name: string
  description: string
  icon?: string
}

export interface InstitutionMedia {
  id: number
  file: string
  media_type: 'photo' | 'video'
  caption: string
  order: number
  uploaded_at: string
}

export interface MediaUploadRequest {
  submission_id: number
  files: File[]
  captions?: string[]
  orders?: number[]
  media_types?: ('photo' | 'video')[]
}

export interface MediaUpdateRequest {
  caption?: string
  order?: number
}

export interface MediaUploadResponse {
  message: string
  uploaded_files: number
  total_media_files: number
  files_info: Array<{
    file_url: string
    file_path: string
    file_name: string
    file_size: number
    caption: string
    order: number
    media_type: 'photo' | 'video'
    uploaded_at: string
  }>
}

export interface Institution {
  id: number
  institution_type?: InstitutionType
  name: string
  description: string
  address: string
  contact_phone: string
  website?: string
  social_links: Record<string, string>
  age_group: string
  price_range: string
  services: string[]
  services_display: string
  schedule: string
  latitude: number
  longitude: number
  coordinates: { lat: number; lng: number }
  media: InstitutionMedia[]
  created_by_name: string
  created_by_email: string
  is_approved: boolean
  is_favorited?: boolean
  created_at: string
  updated_at: string
}

export interface InstitutionListItem {
  id: number
  name: string
  description: string
  address: string
  contact_phone: string
  age_group: string
  price_range: string
  services_display: string
  coordinates: { lat: number; lng: number }
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

export interface FavoriteInstitution {
  id: number
  institution: InstitutionListItem
  added_at: string
}

export interface Submission {
  id: number
  institution_data: Record<string, any>
  institution_name: string
  status: 'pending' | 'approved' | 'rejected' | 'needs_edit'
  moderator_comment?: string
  user_name: string
  user_email: string
  created_at: string
  reviewed_at?: string
}

// Типы для запросов
export interface InstitutionFilters {
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
  page?: number
  page_size?: number
  ordering?: string
}

export interface PaginatedResponse<T> {
  count: number
  total_pages: number
  current_page: number
  page_size: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface SubmissionCreateRequest {
  institution_data: {
    name: string
    description: string
    address: string
    contact_phone: string
    website?: string
    social_links?: Record<string, string | undefined>
    age_group: string
    price_range: string
    services?: string[]
    schedule: string
    latitude: number
    longitude: number
    institution_type?: number
  }
}

export interface Stats {
  total_institutions: number
  institutions_with_media: number
  total_favorites: number
}

export interface SearchSuggestions {
  institutions: string[]
  services: string[]
}

export const institutionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение типов учреждений
    getInstitutionTypes: builder.query<InstitutionType[], void>({
      query: () => 'institution/types/',
      providesTags: [{ type: 'InstitutionType', id: 'LIST' }],
    }),

    // Получение списка учреждений
    getInstitutions: builder.query<PaginatedResponse<InstitutionListItem>, InstitutionFilters | void>({
      query: (filters = {}) => ({
        url: 'institution/',
        params: filters as Record<string, any>,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Institution' as const, id })),
              { type: 'Institution', id: 'LIST' },
            ]
          : [{ type: 'Institution', id: 'LIST' }],
    }),

    // Получение детальной информации об учреждении
    getInstitution: builder.query<Institution, number>({
      query: (id) => `institution/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Institution', id }],
    }),

    // Создание заявки на добавление учреждения
    createSubmission: builder.mutation<{ message: string; submission_id: number; status: string }, SubmissionCreateRequest>({
      query: (data) => ({
        url: 'institution/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Submission', id: 'LIST' }],
    }),
    
    // Загрузка медиафайлов для заявки
    uploadSubmissionMedia: builder.mutation<MediaUploadResponse, MediaUploadRequest>({
      query: ({ submission_id, files, captions = [], orders = [], media_types = [] }) => {
        const formData = new FormData()
        
        // Добавляем файлы
        files.forEach((file) => {
          formData.append('files', file)
        })
        
        // Добавляем метаданные
        captions.forEach((caption) => {
          formData.append('captions', caption || '')
        })
        
        orders.forEach((order) => {
          formData.append('orders', order.toString())
        })
        
        media_types.forEach((type) => {
          formData.append('media_types', type)
        })

        return {
          url: `institution/submissions/${submission_id}/upload-media/`,
          method: 'POST',
          body: formData
        }
      },
      invalidatesTags: ['Submission'],
    }),

    // Загрузка медиафайлов для учреждения
    uploadInstitutionMedia: builder.mutation<{ message: string; media: InstitutionMedia[] }, { institution_id: number; formData: FormData }>({
      query: ({ institution_id, formData }) => ({
        url: `institution/${institution_id}/media/`,
        method: 'POST',
        body: formData,
        // Не устанавливаем Content-Type - браузер сделает это автоматически для FormData
      }),
      invalidatesTags: (_result, _error, { institution_id }) => [
        { type: 'Institution', id: institution_id },
        { type: 'Submission', id: 'LIST' }
      ],
    }),

    // Удаление медиафайла
    deleteMedia: builder.mutation<void, number>({
      query: (mediaId) => ({
        url: `institution/media/${mediaId}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Institution', id: 'LIST' },
        { type: 'Submission', id: 'LIST' }
      ],
    }),

    // Обновление медиафайла
    updateMedia: builder.mutation<InstitutionMedia, { id: number; data: MediaUpdateRequest }>({
      query: ({ id, data }) => ({
        url: `institution/media/${id}/`,
        method: 'PATCH',
        body: data,
      }),
    }),

    // Получение избранных учреждений
    getFavorites: builder.query<PaginatedResponse<FavoriteInstitution>, { page?: number; page_size?: number }>({
      query: (params = {}) => ({
        url: 'institution/favorites/',
        params,
      }),
      providesTags: [{ type: 'Favorite', id: 'LIST' }],
    }),

    // Добавление в избранное
    addToFavorites: builder.mutation<FavoriteInstitution, { institution_id: number }>({
      query: (data) => ({
        url: 'institution/favorites/add/',
        method: 'POST',
        body: data,
      }),

      // Оптимистичное обновление
      async onQueryStarted({ institution_id }, { dispatch, queryFulfilled }) {
        // Обновляем детальную страницу учреждения
        const patchResult = dispatch(
          institutionsApi.util.updateQueryData('getInstitution', institution_id, (draft) => {
            draft.is_favorited = true
          })
        )

        // Обновляем список учреждений
        dispatch(
          institutionsApi.util.updateQueryData('getInstitutions', undefined, (draft) => {
            const institution = draft.results.find(inst => inst.id === institution_id)
            if (institution) {
              institution.is_favorited = true
            }
          })
        )

        try {
          await queryFulfilled
        } catch {
          // Откатываем изменения в случае ошибки
          patchResult.undo()
        }
      },
      invalidatesTags: [{ type: 'Favorite', id: 'LIST' }, { type: 'Institution', id: 'LIST' }],
    }),

    // Удаление из избранного
    removeFromFavorites: builder.mutation<void, number>({
      query: (institutionId) => ({
        url: `institution/favorites/${institutionId}/remove/`,
        method: 'DELETE',
      }),
      // Оптимистичное обновление
      async onQueryStarted(institutionId, { dispatch, queryFulfilled }) {
        // Обновляем детальную страницу учреждения
        const patchResult = dispatch(
          institutionsApi.util.updateQueryData('getInstitution', institutionId, (draft) => {
            draft.is_favorited = false
          })
        )

        // Обновляем список учреждений
        dispatch(
          institutionsApi.util.updateQueryData('getInstitutions', undefined, (draft) => {
            const institution = draft.results.find(inst => inst.id === institutionId)
            if (institution) {
              institution.is_favorited = false
            }
          })
        )

        try {
          await queryFulfilled
        } catch {
          // Откатываем изменения в случае ошибки
          patchResult.undo()
        }
      },
      invalidatesTags: [{ type: 'Favorite', id: 'LIST' }, { type: 'Institution', id: 'LIST' }],
    }),

    // Получение моих заявок
    getMySubmissions: builder.query<PaginatedResponse<Submission>, { page?: number; page_size?: number }>({
      query: (params = {}) => ({
        url: 'institution/my-submissions/',
        params,
      }),
      providesTags: [{ type: 'Submission', id: 'LIST' }],
    }),

    // Получение детальной информации о заявке
    getSubmission: builder.query<Submission, number>({
      query: (id) => `institution/submissions/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Submission', id }],
    }),

    // Получение публичной статистики
    getPublicStats: builder.query<Stats, void>({
      query: () => 'institution/stats/',
    }),

    // Получение подсказок для поиска
    getSearchSuggestions: builder.query<SearchSuggestions, string>({
      query: (query) => ({
        url: 'institution/search-suggestions/',
        params: { q: query },
      }),
    }),

    // Модерация (только для модераторов)
    getModerationSubmissions: builder.query<PaginatedResponse<Submission>, { status?: string; page?: number }>({
      query: (params = {}) => ({
        url: 'institution/moderation/submissions/',
        params,
      }),
      providesTags: [{ type: 'Submission', id: 'MODERATION' }],
    }),

    // Модерация заявки
    moderateSubmission: builder.mutation<Submission, { id: number; status: string; moderator_comment?: string }>({
      query: ({ id, ...data }) => ({
        url: `institution/moderation/submissions/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Submission', id: 'MODERATION' },
        { type: 'Submission', id: 'LIST' },
        { type: 'Institution', id: 'LIST' },
      ],
    }),

    // Статистика модерации
    getModerationStats: builder.query<{
      total_submissions: number
      pending_submissions: number
      approved_submissions: number
      rejected_submissions: number
      needs_edit_submissions: number
      total_institutions: number
      approved_institutions: number
      total_users: number
    }, void>({
      query: () => 'institution/moderation/stats/',
    }),
  }),
})

export const {
  useGetInstitutionTypesQuery,
  useGetInstitutionsQuery,
  useGetInstitutionQuery,
  useCreateSubmissionMutation,
  useGetFavoritesQuery,
  useUploadSubmissionMediaMutation,
  useUploadInstitutionMediaMutation,
  useDeleteMediaMutation,
  useUpdateMediaMutation,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
  useGetMySubmissionsQuery,
  useGetSubmissionQuery,
  useGetPublicStatsQuery,
  useGetSearchSuggestionsQuery,
  useGetModerationSubmissionsQuery,
  useModerateSubmissionMutation,
  useGetModerationStatsQuery,
} = institutionsApi