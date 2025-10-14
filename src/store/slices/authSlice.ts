// src/store/slices/authSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Типы для пользователя
export interface User {
  id: number
  email: string
  phone?: string
  first_name: string
  last_name: string
  full_name: string
  avatar?: string
  avatar_url: string
  role: 'user' | 'moderator' | 'admin'
  date_joined: string
}

// Состояние авторизации
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Начальное состояние из localStorage
const getInitialState = (): AuthState => {
  try {
    const savedAuth = localStorage.getItem('auth')
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth)
      return {
        user: parsed.user || null,
        accessToken: parsed.accessToken || null,
        refreshToken: parsed.refreshToken || null,
        isAuthenticated: !!parsed.accessToken,
        isLoading: false,
      }
    }
  } catch (error) {
    console.error('Error parsing auth from localStorage:', error)
    localStorage.removeItem('auth')
  }
  
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user?: User
        accessToken?: string
        refreshToken?: string
      }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload
      
      if (user) {
        state.user = user
      }
      if (accessToken) {
        state.accessToken = accessToken
        state.isAuthenticated = true
      }
      if (refreshToken) {
        state.refreshToken = refreshToken
      }
      
      // Сохраняем в localStorage
      localStorage.setItem('auth', JSON.stringify({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }))
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        
        // Обновляем localStorage
        localStorage.setItem('auth', JSON.stringify({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
        }))
      }
    },
    
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      
      // Очищаем localStorage
      localStorage.removeItem('auth')
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { setCredentials, updateUser, logout, setLoading } = authSlice.actions

// Селекторы
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role
export const selectIsModerator = (state: { auth: AuthState }) => 
  state.auth.user?.role === 'moderator' || state.auth.user?.role === 'admin'

export default authSlice.reducer