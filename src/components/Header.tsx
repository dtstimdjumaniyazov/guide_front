import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, useRole } from '../providers/AuthProvider'
import { useLogoutMutation, useGoogleAuthMutation } from '../store/api/authApi'
import { GoogleOAuthProvider } from '@react-oauth/google'
import GoogleSignInButton from '../components/GoogleSignInButton'
import PrivacyConsentModal from '../components/PrivacyConsentModal'

const GOOGLE_AUTH_CLIENT_ID = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID

const Header: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout, login } = useAuth()
  const { isModerator } = useRole()
  const [logoutMutation] = useLogoutMutation()
  const [googleAuthMutation, { isLoading: googleAuthLoading }] = useGoogleAuthMutation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  
  // Новые состояния для модального окна и токена
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [pendingGoogleToken, setPendingGoogleToken] = useState<any>(null)

  const handleLogout = async () => {
    try {
      const authData = localStorage.getItem('auth')
      if (authData) {
        const parsed = JSON.parse(authData)
        if (parsed.refreshToken) {
          await logoutMutation({ 
            client_id: import.meta.env.VITE_CLIENT_ID,
            refresh_token: parsed.refreshToken 
          }).unwrap()
        }
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logout()
      navigate('/')
      setIsUserMenuOpen(false)
    }
  }

  // Первый шаг: проверяем согласие перед входом
  const handleGoogleSignInAttempt = async (tokenResponse: any) => {
    // Проверяем, давал ли пользователь согласие ранее
    const hasConsent = localStorage.getItem('privacy_consent_accepted')
    
    if (hasConsent === 'true') {
      // Если согласие уже есть, входим сразу
      await processGoogleSignIn(tokenResponse)
    } else {
      // Если согласия нет, показываем модальное окно
      setPendingGoogleToken(tokenResponse)
      setShowPrivacyModal(true)
    }
  }

  // Второй шаг: обработка согласия
  const handlePrivacyAccept = async () => {
    // Сохраняем факт согласия
    localStorage.setItem('privacy_consent_accepted', 'true')
    localStorage.setItem('privacy_consent_date', new Date().toISOString())
    
    setShowPrivacyModal(false)
    
    // Продолжаем вход с сохраненным токеном
    if (pendingGoogleToken) {
      await processGoogleSignIn(pendingGoogleToken)
      setPendingGoogleToken(null)
    }
  }

  // Третий шаг: фактический вход через Google
  const processGoogleSignIn = async (tokenResponse: any) => {
    try {
      const result = await googleAuthMutation({
        grant_type: 'convert_token',
        client_id: import.meta.env.VITE_CLIENT_ID,
        backend: 'google-oauth2',
        token: tokenResponse.access_token,
      }).unwrap()

      login(result.access_token, result.user, result.refresh_token)
    } catch (error) {
      console.error('Google sign in failed:', error)
    }
  }

  const handlePrivacyModalClose = () => {
    setShowPrivacyModal(false)
    setPendingGoogleToken(null)
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const navLinks = [
    { path: '/', label: 'Главная', public: true },
    { path: '/institutions', label: 'Учреждения', public: true },
    { path: '/about', label: 'О проекте', public: true },
  ]

  const userLinks = [
    { path: '/favorites', label: 'Избранное', icon: '♥' },
    { path: '/submit', label: 'Добавить учреждение', icon: '+' },
    { path: '/my-submissions', label: 'Мои заявки', icon: '📋' },
  ]

  const moderatorLinks = [
    { path: '/moderation', label: 'Модерация', icon: '⚖️' },
  ]

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <span className="text-white font-bold text-xl">🏫</span>
                </div>
                <span className="text-xl font-bold text-gray-800">Детский Гид</span>
              </Link>
            </div>

            {/* Навигация для десктопа */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Пользовательское меню / Google Auth */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    {user?.avatar_url || user?.avatar ? (
                      <img
                        src={user.avatar_url || user.avatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user?.first_name?.[0] || user?.full_name?.[0] || user?.email[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.full_name || user?.email}
                    </span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Выпадающее меню пользователя */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-2">
                        {/* Информация о пользователе */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Пользователь'}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          {user?.role && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {user.role === 'admin' ? 'Администратор' : 
                               user.role === 'moderator' ? 'Модератор' : 'Пользователь'}
                            </span>
                          )}
                        </div>

                        {/* Пользовательские ссылки */}
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <span className="mr-3">👤</span>
                            Профиль
                          </Link>
                          {userLinks.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <span className="mr-3">{link.icon}</span>
                              {link.label}
                            </Link>
                          ))}
                        </div>

                        {/* Ссылки модератора */}
                        {isModerator && (
                          <div className="py-2 border-t border-gray-100">
                            {moderatorLinks.map((link) => (
                              <Link
                                key={link.path}
                                to={link.path}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <span className="mr-3">{link.icon}</span>
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Выход */}
                        <div className="py-2 border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <span className="mr-3">🚪</span>
                            Выйти
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Google OAuth кнопка для неавторизованных пользователей */
                <div className="flex items-center">
                  <GoogleOAuthProvider clientId={GOOGLE_AUTH_CLIENT_ID}>
                    <GoogleSignInButton 
                      handleGoogleSignIn={handleGoogleSignInAttempt}
                      isLoading={googleAuthLoading}
                    />
                  </GoogleOAuthProvider>
                </div>
              )}

              {/* Мобильное меню кнопка */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Мобильное меню */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                {/* Навигационные ссылки */}
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive(link.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Мобильная авторизация для неавторизованных */}
                {!isAuthenticated && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="px-3">
                      <GoogleOAuthProvider clientId={GOOGLE_AUTH_CLIENT_ID}>
                        <GoogleSignInButton 
                          handleGoogleSignIn={handleGoogleSignInAttempt}
                          isLoading={googleAuthLoading}
                        />
                      </GoogleOAuthProvider>
                    </div>
                  </div>
                )}

                {/* Мобильные ссылки для авторизованных пользователей */}
                {isAuthenticated && (
                  <div className="pt-4 border-t border-gray-200 space-y-1">
                    <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-200 pb-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {user?.avatar_url || user?.avatar ? (
                          <img
                            src={user.avatar_url || user.avatar}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user?.first_name?.[0] || user?.full_name?.[0] || user?.email[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{user?.full_name || 'Пользователь'}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-3">👤</span>
                      Профиль
                    </Link>
                    
                    {userLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="mr-3">{link.icon}</span>
                        {link.label}
                      </Link>
                    ))}
                    
                    {isModerator && moderatorLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="mr-3">{link.icon}</span>
                        {link.label}
                      </Link>
                    ))}
                    
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <span className="mr-3">🚪</span>
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Overlay для закрытия выпадающих меню */}
        {(isUserMenuOpen || isMenuOpen) && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => {
              setIsUserMenuOpen(false)
              setIsMenuOpen(false)
            }}
          />
        )}
      </header>

      {/* Модальное окно с политикой конфиденциальности */}
      <PrivacyConsentModal
        isOpen={showPrivacyModal}
        onClose={handlePrivacyModalClose}
        onAccept={handlePrivacyAccept}
      />
    </>
  )
}

export default Header