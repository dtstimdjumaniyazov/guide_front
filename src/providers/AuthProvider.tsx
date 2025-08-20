import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { setCredentials, logout, selectIsAuthenticated, selectCurrentUser, selectIsLoading } from '../store/slices/authSlice'
import { useGetUserInfoQuery } from '../store/api/userApi'
import type { User } from '../store/slices/authSlice'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (accessToken: string, user: User, refreshToken?: string) => void
  logout: () => void
  refetchUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isLoading = useAppSelector(selectIsLoading)
  const [initialCheckComplete, setInitialCheckComplete] = useState(false)

  // Автоматическая проверка пользователя при наличии токена
  const { 
    data: userData, 
    error, 
    isLoading: userQueryLoading,
    refetch 
  } = useGetUserInfoQuery(undefined, {
    skip: !isAuthenticated || !initialCheckComplete,
  })

  // Проверяем наличие сохраненных токенов при загрузке
  useEffect(() => {
    setInitialCheckComplete(true)
  }, [])

  // Обновляем данные пользователя при успешном запросе
  useEffect(() => {
    if (userData && !error) {
      dispatch(setCredentials({ user: userData }))
    } else if (error) {
      // Если ошибка получения пользователя - токен невалидный
      dispatch(logout())
    }
  }, [userData, error, dispatch])

  const handleLogin = (accessToken: string, user: User, refreshToken?: string) => {
    dispatch(setCredentials({
      accessToken,
      refreshToken,
      user
    }))
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const refetchUser = () => {
    refetch()
  }

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: isLoading || (isAuthenticated && userQueryLoading && !userData),
    login: (accessToken, user, refreshToken) => handleLogin(accessToken, user, refreshToken),
    logout: handleLogout,
    refetchUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Хук для проверки ролей
export const useRole = () => {
  const { user } = useAuth()
  
  return {
    role: user?.role,
    isUser: user?.role === 'user',
    isModerator: user?.role === 'moderator' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
  }
}