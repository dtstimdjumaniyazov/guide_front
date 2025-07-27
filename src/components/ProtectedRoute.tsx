// src/components/ProtectedRoute.tsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, useRole } from '../providers/AuthProvider'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireModerator?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  requireModerator = false,
  requireAdmin = false,
  redirectTo = '/auth/login',
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const { isModerator, isAdmin } = useRole()
  const location = useLocation()

  // Показываем загрузку пока проверяем аутентификацию
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Проверяем требования к аутентификации
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Проверяем требования к роли модератора
  if (requireModerator && (!isAuthenticated || !isModerator)) {
    return <Navigate to="/403" replace />
  }

  // Проверяем требования к роли администратора
  if (requireAdmin && (!isAuthenticated || !isAdmin)) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}

// Хук для защищенных действий
export const useProtectedAction = () => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  const requireAuth = (action: () => void, redirectTo = '/auth/login') => {
    if (isAuthenticated) {
      action()
    } else {
      // Здесь можно использовать navigate или другой способ редиректа
      window.location.href = `${redirectTo}?from=${encodeURIComponent(location.pathname)}`
    }
  }

  return { requireAuth }
}