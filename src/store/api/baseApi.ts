// src/store/api/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { setCredentials, logout } from '../slices/authSlice'
import type { RootState } from '../index'

// Типы для токенов
interface RefreshResponse {
  access: string
  refresh: string
}

// Базовый query с автоматическим обновлением токенов
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8000/', // Замените на ваш Django URL
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

// Query с автоматическим refresh токена
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    // Пытаемся обновить токен
    const refreshToken = (api.getState() as RootState).auth.refreshToken
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: 'user/token/refresh/',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      )

      if (refreshResult.data) {
        const data = refreshResult.data as RefreshResponse
        // Сохраняем новые токены
        api.dispatch(setCredentials({
          accessToken: data.access,
          refreshToken: data.refresh,
        }))
        
        // Повторяем оригинальный запрос с новым токеном
        result = await baseQuery(args, api, extraOptions)
      } else {
        // Refresh не удался - выходим
        api.dispatch(logout())
      }
    } else {
      // Нет refresh токена - выходим
      api.dispatch(logout())
    }
  }

  return result
}

// Базовый API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Institution', 
    'User', 
    'Favorite', 
    'Submission',
    'ModeratorAction'
  ],
  endpoints: () => ({}),
})

export default baseApi