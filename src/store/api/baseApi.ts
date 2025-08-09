// src/store/api/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { setCredentials, logout } from '../slices/authSlice'
import type { RootState } from '../index'
import { BASE_URL } from '../../constants'

// Типы для токенов
interface RefreshResponse {
  access_token: string
  refresh_token: string
}

const OAUTH2_CLIENT_ID = "HFkcZQSZSYYgiLDuyRW3ZDHsM1ScGxGx2Z9kmocX"

// Базовый query с автоматическим обновлением токенов
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL, // Замените на ваш Django URL
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

// Query с автоматическим refresh токена для OAuth2
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
          url: 'auth/token/',
          method: 'POST',
          body: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: OAUTH2_CLIENT_ID
          },
        },
        api,
        extraOptions
      )

      if (refreshResult.data) {
        const data = refreshResult.data as RefreshResponse
        // Сохраняем новые токены
        api.dispatch(setCredentials({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
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
    'InstitutionType',
    'Institution', 
    'User', 
    'Favorite', 
    'Submission',
    'ModeratorAction'
  ],
  endpoints: () => ({}),
})

export default baseApi