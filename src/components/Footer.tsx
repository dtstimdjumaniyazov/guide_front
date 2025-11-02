// src/components/Footer.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import QRSection from './QRCode'
import { useAuth} from '../providers/AuthProvider'
import { telegramId } from '../constants'
import { FaTelegram } from "react-icons/fa";


const Footer: React.FC = () => {
  const { t } = useTranslation("footer")
  
  const { isAuthenticated } = useAuth()

  const footerLinks = {
    main: [
      { label: t("main_links.home"), path: '/' },
      { label: t("main_links.institutions"), path: '/institutions' },
      { label: t("main_links.about"), path: '/about' },
    ],
    user: [
      { label: t("user_links.submit"), path: '/submit' },
      { label: t("user_links.favorites"), path: '/favorites' },
      { label: t("user_links.my_submissions"), path: '/my-submissions' },
    ],
    support: [
      { label: t("support_links.help"), path: '/help' },
      { label: t("support_links.rules"), path: '/rules' },
      { label: t("support_links.privacy"), path: '/privacy' },
      { label: t("support_links.contacts"), path: '/contacts' },
    ]
  }

  const socialLinks = [
    {
      name: 'Telegram',
      icon: (
        <FaTelegram />
      ),
      url: telegramId,
    },
    // {
    //   name: 'Instagram',
    //   icon: (
    //     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    //       <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    //     </svg>
    //   ),
    //   url: '#'
    // },
    // {
    //   name: 'Facebook',
    //   icon: (
    //     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    //       <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    //     </svg>
    //   ),
    //   url: '#'
    // }
  ]

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Логотип и описание */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <span className="text-white font-bold text-xl">🏫</span>
              </div>
              <span className="text-xl font-bold text-white">{t("logo_title")}</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              {t("logo_description")}
            </p>
            
              {/* Социальные сети */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    target='_blank'
                    key={social.name}
                    href={social.url}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                    aria-label={social.name}
                  >
                    {social.icon} {''} {social.name}
                  </a>
                ))}
              </div>
          </div>

          {/* Основные ссылки */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t("navigation")}</h3>
            <ul className="space-y-2">
              {footerLinks.main.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Пользовательские ссылки */}
          {isAuthenticated && (
            <div>
            <h3 className="text-white font-semibold mb-4">{t("for_users")}</h3>
            <ul className="space-y-2">
              {footerLinks.user.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          )}
          
          {/* QR code */}
          <div>
              <QRSection />
          </div> 
        </div>


        {/* Нижняя часть */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-wrap items-center space-x-6 mb-4 md:mb-0">
              {footerLinks.support.map((link, index) => (
                <React.Fragment key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                  {index < footerLinks.support.length - 1 && (
                    <span className="text-gray-600">•</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <div className="text-sm text-gray-400">
              © 2025 {t("logo_title")}. {t("copyright")}
            </div>
          </div>
        </div>
      </div>

      {/* Информация о технологиях */}
      <div className="bg-gray-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
            <div>
              {t("tech_info")}
            </div>
            <div className="mt-2 sm:mt-0">
              {t("version")}: 1.0.1 Бета | {t("last_update")}: {new Date().toLocaleDateString('ru-RU')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer