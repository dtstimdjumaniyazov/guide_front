// src/pages/errors/NotFoundPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <div className="text-6xl mb-4">🏫</div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Страница не найдена
        </h2>
        
        <p className="text-gray-600 mb-8">
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Вернуться на главную
          </Link>
          
          <Link
            to="/institutions"
            className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Просмотреть учреждения
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          Если вы считаете, что это ошибка, пожалуйста,{' '}
          <Link to="/contacts" className="text-blue-600 hover:text-blue-500">
            свяжитесь с нами
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage