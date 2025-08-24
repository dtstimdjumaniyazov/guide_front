import React from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

const capitalize = (str?: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  useDocumentTitle(`Профиль пользователя`)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Профиль пользователя
        </h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Добро пожаловать, {capitalize(user?.first_name)} {capitalize(user?.last_name) || user?.email}!</p>
          <p className="text-sm text-gray-500 mt-2">Роль: {user?.role}</p>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage