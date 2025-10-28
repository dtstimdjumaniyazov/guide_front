// src/store/api/authApi.ts
import { baseApi } from './baseApi'
import type { User } from '../slices/authSlice'

// Типы для запросов авторизации
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
  phone?: string
}

export interface LoginResponse {
  message: string
  user: User
  access_token: string
}

export interface RegisterResponse {
  message: string
  user: User
  access_token: string
}

// Новые типы для Google OAuth2
export interface GoogleAuthRequest {
  access_token: string  // Google access token
}

export interface ConvertTokenRequest {
  grant_type: 'convert_token'
  client_id: string
  backend: 'google-oauth2'
  token: string  // Google access token
}

export interface ConvertTokenResponse {
  access_token: string
  expires_in: number
  token_type: 'Bearer'
  scope: string
  refresh_token: string,
  user: User,
}

const toUrlEncoded = (obj: Record<string, any>) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.append(key, String(value));
  });
  return params.toString();
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Google OAuth2 авторизация
    googleAuth: builder.mutation<ConvertTokenResponse, ConvertTokenRequest>({
      query: (tokenData) => ({
        url: 'auth/convert-token/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        body: toUrlEncoded(tokenData),
      }),
      invalidatesTags: ['User'],
    }),

    // Выход
    logout: builder.mutation<{ message: string }, { client_id: string, refresh_token: string }>({
      query: (data) => ({
        url: 'auth/revoke-token/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Обновление токена OAuth2 формат
    refreshToken: builder.mutation<{ access_token: string; refresh_token: string }, {grant_type: 'refresh_token', refresh_token: string, client_id: string}>({
      query: (data) => ({
        url: 'auth/token/',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useGoogleAuthMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApi