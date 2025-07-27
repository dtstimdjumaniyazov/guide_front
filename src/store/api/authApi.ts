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



export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Вход
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'user/login/',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Регистрация
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: 'user/register/',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Выход
    logout: builder.mutation<{ message: string }, { refresh_token: string }>({
      query: (data) => ({
        url: 'user/logout/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),



    // Обновление токена
    refreshToken: builder.mutation<{ access: string }, { refresh: string }>({
      query: (data) => ({
        url: 'user/token/refresh/',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApi