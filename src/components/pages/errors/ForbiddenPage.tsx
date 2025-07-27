import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../providers/AuthProvider'

const ForbiddenPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">403</h1>
          <div className="text-6xl mb-4">🚫</div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Доступ запрещен
        </h2>
        
        <p className="text-gray-600 mb-8">
          {isAuthenticated 
            ? 'У вас недостаточно прав для просмотра этой страницы.'
            : 'Для доступа к этой странице необходимо войти в систему.'
          }
        </p>
        
        <div className="space-y-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Вернуться на главную
              </Link>
              
              <Link
                to="/profile"
                className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Перейти в профиль
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Войти в систему
              </Link>
              
              <Link
                to="/auth/register"
                className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Создать аккаунт
              </Link>
            </>
          )}
        </div>
        
        {isAuthenticated && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  Ваша роль: <strong>{user?.role === 'admin' ? 'Администратор' : 
                                    user?.role === 'moderator' ? 'Модератор' : 'Пользователь'}</strong>
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Для доступа к панели модерации необходимы права модератора или администратора
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-sm text-gray-500">
          Если вы считаете, что это ошибка, пожалуйста,{' '}
          <Link to="/contacts" className="text-blue-600 hover:text-blue-500">
            свяжитесь с администрацией
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForbiddenPage