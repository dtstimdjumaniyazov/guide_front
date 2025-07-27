// src/store/api/userApi.ts
import { baseApi } from './baseApi'
import type { User } from '../slices/authSlice'

// Типы для пользовательских операций
export interface UserUpdateRequest {
  phone?: string
  first_name?: string
  last_name?: string
}

export interface PasswordChangeRequest {
  old_password: string
  new_password: string
  new_password_confirm: string
}

export interface UserStats {
  total_submissions: number
  approved_submissions: number
  rejected_submissions: number
  pending_submissions: number
  total_favorites: number
  institutions_created: number
}

export interface UserActivity {
  id: number
  action: string
  description: string
  created_at: string
  related_object?: {
    type: 'institution' | 'submission' | 'favorite'
    id: number
    name: string
  }
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение профиля пользователя
    getProfile: builder.query<User, void>({
      query: () => 'user/profile/',
      providesTags: ['User'],
    }),

    // Получение информации о текущем пользователе
    getUserInfo: builder.query<User, void>({
      query: () => 'user/me/',
      providesTags: ['User'],
    }),

    // Обновление профиля
    updateProfile: builder.mutation<User, UserUpdateRequest>({
      query: (data) => ({
        url: 'user/profile/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
      // Оптимистичное обновление
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          userApi.util.updateQueryData('getProfile', undefined, (draft) => {
            Object.assign(draft, patch)
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    // Смена пароля
    changePassword: builder.mutation<{ message: string }, PasswordChangeRequest>({
      query: (data) => ({
        url: 'user/change-password/',
        method: 'POST',
        body: data,
      }),
    }),

    // Загрузка аватара (если потребуется в будущем)
    uploadAvatar: builder.mutation<{ avatar: string }, FormData>({
      query: (formData) => ({
        url: 'user/upload-avatar/',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['User'],
    }),

    // Получение статистики пользователя
    getUserStats: builder.query<UserStats, void>({
      query: () => 'user/stats/',
      providesTags: ['User'],
    }),

    // Получение активности пользователя
    getUserActivity: builder.query<{
      count: number
      results: UserActivity[]
    }, { page?: number; page_size?: number }>({
      query: (params = {}) => ({
        url: 'user/activity/',
        params,
      }),
      providesTags: ['User'],
    }),

    // Удаление аккаунта
    deleteAccount: builder.mutation<{ message: string }, { password: string }>({
      query: (data) => ({
        url: 'user/delete-account/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Настройки уведомлений (если потребуется)
    updateNotificationSettings: builder.mutation<
      { message: string },
      {
        email_notifications?: boolean
        sms_notifications?: boolean
        push_notifications?: boolean
      }
    >({
      query: (data) => ({
        url: 'user/notification-settings/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Экспорт данных пользователя (GDPR)
    exportUserData: builder.mutation<{ download_url: string }, void>({
      query: () => ({
        url: 'user/export-data/',
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useGetProfileQuery,
  useGetUserInfoQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useGetUserStatsQuery,
  useGetUserActivityQuery,
  useDeleteAccountMutation,
  useUpdateNotificationSettingsMutation,
  useExportUserDataMutation,
} = userApi