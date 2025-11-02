import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './providers/AuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'

import ScrollToTop from './components/ScrollToTop'
import HomePage from './components/pages/HomePage'
import InstitutionsPage from './components/pages/InstitutionsPage'
import InstitutionDetailPage from './components/pages/InstitutionDetailPage'
// import LoginPage from './components/pages/auth/LoginPage'
// import RegisterPage from './components/pages/auth/RegisterPage'
import ProfilePage from './components/pages/ProfilePage'
import FavoritesPage from './components/pages/FavoritesPage'
import SubmitPage from './components/pages/SubmitPage'
import MySubmissionsPage from './components/pages/MySubmissionsPage'
import SubmissionDetailPage from './components/pages/SubmissionDetailPage'
import EditSubmissionPage from './components/pages/EditSubmissionPage'
import ModerationPage from './components/pages/moderation/ModerationPage'
import AboutPage from './components/pages/AboutPage'
import NotFoundPage from './components/pages/errors/NotFoundPage'
import ForbiddenPage from './components/pages/errors/ForbiddenPage'
import Layout from './components/Layout'
import HelpPage from './components/pages/HelpPage'
import RulesPage from './components/pages/RulesPage'
import PrivacyPage from './components/pages/PrivacyPage'
import ContactsPage from './components/pages/ContactsPage'
import QRSection from './components/QRCode'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <ScrollToTop />
        <Routes>
          {/* Публичные маршруты с Layout */}
          <Route path="/" element={<Layout />}>
            {/* Главная страница */}
            <Route index element={<HomePage />} />
            
            {/* Каталог учреждений */}
            <Route path="institutions" element={<InstitutionsPage />} />
            <Route path="institutions/:id" element={<InstitutionDetailPage />} />
            
            {/* О проекте */}
            <Route path="about" element={<AboutPage />} />

            {/* Помощь */}
            <Route path='help' element={<HelpPage />}/>

            {/* Правила */}
            <Route path='rules' element={<RulesPage />} />

            {/* Конфиденциальность */}
            <Route path='privacy' element={<PrivacyPage />} />

            {/* Контакты */}
            <Route path='contacts' element={<ContactsPage />} />
            
            {/* Защищенные маршруты для авторизованных пользователей */}
            <Route path="profile" element={
              <ProtectedRoute requireAuth>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="favorites" element={
              <ProtectedRoute requireAuth>
                <FavoritesPage />
              </ProtectedRoute>
            } />
            
            <Route path="submit" element={
              <ProtectedRoute>
                <SubmitPage />
              </ProtectedRoute>
            } />
            
            <Route path="my-submissions" element={
              <ProtectedRoute requireAuth>
                <MySubmissionsPage />
              </ProtectedRoute>
            } />
            
            <Route path="my-submissions/:id" element={
              <ProtectedRoute requireAuth>
                <SubmissionDetailPage />
              </ProtectedRoute>
            } />

            <Route path="edit-submission/:id" element={
              <ProtectedRoute requireAuth>
                <EditSubmissionPage />
              </ProtectedRoute>
            } />
            
            {/* Маршруты для модераторов */}
            <Route path="moderation/*" element={
              <ProtectedRoute requireModerator>
                <ModerationPage />
              </ProtectedRoute>
            } />
          </Route>
          <Route path='qr' element={<QRSection />} />
          {/* Страницы ошибок */}
          <Route path="403" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App