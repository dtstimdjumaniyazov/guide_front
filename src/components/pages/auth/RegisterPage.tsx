// import React, { useState, useEffect } from 'react'
// import axios from 'axios'
// import { Link, useNavigate, useLocation } from 'react-router-dom'
// import { useRegisterMutation } from '../../../store/api/authApi'
// import { useAuth } from '../../../providers/AuthProvider'
// import { LoadingSpinner } from '../../../components/Loading'
// import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
// import { GoogleOAuthProvider } from '@react-oauth/google'
// import GoogleSignInButton from '../../GoogleSignInButton'
// import { BASE_URL } from '../../../constants'

// const GOOGLE_AUTH_CLIENT_ID = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID

// const RegisterPage: React.FC = () => {
//   useDocumentTitle('Регистрация')
//   const navigate = useNavigate()
//   const location = useLocation()
//   const { login, isAuthenticated } = useAuth()
//   const [registerMutation, { isLoading }] = useRegisterMutation()
  
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     password_confirm: '',
//     first_name: '',
//     last_name: '',
//     phone: ''
//   })
//   const [errors, setErrors] = useState<Record<string, string>>({})

//   // Редирект если уже авторизован
//   useEffect(() => {
//     if (isAuthenticated) {
//       const from = location.state?.from?.pathname || '/'
//       navigate(from, { replace: true })
//     }
//   }, [isAuthenticated, navigate, location])

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }))
//     // Очищаем ошибку для конкретного поля
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }))
//     }
//   }

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {}

//     if (!formData.email) {
//       newErrors.email = 'Email обязателен'
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Некорректный email'
//     }

//     if (!formData.password) {
//       newErrors.password = 'Пароль обязателен'
//     } else if (formData.password.length < 8) {
//       newErrors.password = 'Пароль должен содержать минимум 8 символов'
//     }

//     if (formData.password !== formData.password_confirm) {
//       newErrors.password_confirm = 'Пароли не совпадают'
//     }

//     if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
//       newErrors.phone = 'Некорректный номер телефона'
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (!validateForm()) {
//       return
//     }

//     try {
//       const response = await registerMutation(formData).unwrap()
//       // ОБНОВЛЕНО: используем новый формат токенов OAuth2
//       login(response.access_token, response.user)
      
//       // Редирект на страницу, с которой пришли, или на главную
//       const from = location.state?.from?.pathname || '/'
//       navigate(from, { replace: true })
//     } catch (err: any) {
//       if (err.data?.email) {
//         setErrors(prev => ({ ...prev, email: err.data.email[0] }))
//       } else {
//         setErrors(prev => ({ ...prev, general: 'Ошибка регистрации. Попробуйте еще раз.' }))
//       }
//     }
//   }

//   const handleGoogleSignIn = async (response: any) => {
//     try {
//       const res = await axios.post(`${BASE_URL}/auth/convert-token/`, {
//         grant_type: 'convert_token',
//         client_id: import.meta.env.VITE_CLIENT_ID,
//         backend: 'google-oauth2',
//         token: response.access_token,
//       });
//       console.log('Data: ', res.data)
//     } catch (error) {
//       console.error('Google sign in failed', error);
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         {/* Логотип */}
//         <div className="text-center">
//           <div className="flex justify-center">
//             <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
//               <span className="text-white font-bold text-2xl">🏫</span>
//             </div>
//           </div>
//           <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
//             Создать аккаунт
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Уже есть аккаунт?{' '}
//             <Link
//               to="/auth/login"
//               className="font-medium text-blue-600 hover:text-blue-500"
//             >
//               Войти
//             </Link>
//           </p>
//           <div>
//             <GoogleOAuthProvider clientId={GOOGLE_AUTH_CLIENT_ID}>
//               <GoogleSignInButton handleGoogleSignIn={handleGoogleSignIn} />
//             </GoogleOAuthProvider>
//           </div>
//         </div>

//         {/* Форма */}
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             {/* Email */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                 Email адрес *
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 value={formData.email}
//                 onChange={handleChange}
//                 className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
//                   errors.email ? 'border-red-300' : 'border-gray-300'
//                 } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                 placeholder="your@email.com"
//               />
//               {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
//             </div>

//             {/* Имя и Фамилия */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
//                   Имя
//                 </label>
//                 <input
//                   id="first_name"
//                   name="first_name"
//                   type="text"
//                   autoComplete="given-name"
//                   value={formData.first_name}
//                   onChange={handleChange}
//                   className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   placeholder="Имя"
//                 />
//               </div>
              
//               <div>
//                 <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
//                   Фамилия
//                 </label>
//                 <input
//                   id="last_name"
//                   name="last_name"
//                   type="text"
//                   autoComplete="family-name"
//                   value={formData.last_name}
//                   onChange={handleChange}
//                   className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   placeholder="Фамилия"
//                 />
//               </div>
//             </div>

//             {/* Телефон */}
//             <div>
//               <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
//                 Номер телефона
//               </label>
//               <input
//                 id="phone"
//                 name="phone"
//                 type="tel"
//                 autoComplete="tel"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
//                   errors.phone ? 'border-red-300' : 'border-gray-300'
//                 } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                 placeholder="+998 90 123 45 67"
//               />
//               {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
//             </div>

//             {/* Пароль */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Пароль *
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="new-password"
//                 required
//                 value={formData.password}
//                 onChange={handleChange}
//                 className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
//                   errors.password ? 'border-red-300' : 'border-gray-300'
//                 } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                 placeholder="Минимум 8 символов"
//               />
//               {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
//             </div>

//             {/* Подтверждение пароля */}
//             <div>
//               <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
//                 Подтвердите пароль *
//               </label>
//               <input
//                 id="password_confirm"
//                 name="password_confirm"
//                 type="password"
//                 autoComplete="new-password"
//                 required
//                 value={formData.password_confirm}
//                 onChange={handleChange}
//                 className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
//                   errors.password_confirm ? 'border-red-300' : 'border-gray-300'
//                 } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                 placeholder="Повторите пароль"
//               />
//               {errors.password_confirm && <p className="mt-1 text-sm text-red-600">{errors.password_confirm}</p>}
//             </div>
//           </div>

//           {/* Общая ошибка */}
//           {errors.general && (
//             <div className="bg-red-50 border border-red-200 rounded-md p-3">
//               <p className="text-sm text-red-600">{errors.general}</p>
//             </div>
//           )}

//           {/* Кнопка регистрации */}
//           <div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <LoadingSpinner size="sm" className="mr-2" />
//               ) : null}
//               {isLoading ? 'Создаем аккаунт...' : 'Создать аккаунт'}
//             </button>
//           </div>

//           {/* Соглашение */}
//           <div className="text-center">
//             <p className="text-xs text-gray-600">
//               Создавая аккаунт, вы соглашаетесь с{' '}
//               <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
//                 Политикой конфиденциальности
//               </Link>{' '}
//               и{' '}
//               <Link to="/terms" className="text-blue-600 hover:text-blue-500">
//                 Условиями использования
//               </Link>
//             </p>
//           </div>
//         </form>

//         {/* Возврат на главную */}
//         <div className="text-center">
//           <Link
//             to="/"
//             className="font-medium text-gray-600 hover:text-gray-500"
//           >
//             ← Вернуться на главную
//           </Link>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default RegisterPage