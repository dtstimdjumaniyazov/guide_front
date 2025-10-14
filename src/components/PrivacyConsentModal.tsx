import React, { useState } from 'react'

interface PrivacyConsentModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({ 
  isOpen, 
  onClose, 
  onAccept 
}) => {
  const [isChecked, setIsChecked] = useState(false)

  if (!isOpen) return null

  const handleAccept = () => {
    if (isChecked) {
      onAccept()
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Политика конфиденциальности
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="prose prose-sm max-w-none">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  1. Общие положения
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Настоящая{' '}
                  <a href='/privacy' onClick={onClose} className="text-blue-600 hover:underline">Политика конфиденциальности</a> определяет порядок обработки и защиты персональных данных пользователей веб-сайта "Детский Гид" (далее - Сайт). Используя Сайт и авторизуясь через Google, вы соглашаетесь с условиями данной Политики.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  2. Собираемые данные
                </h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  При авторизации через Google мы получаем следующие данные:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Имя и фамилия</li>
                  <li>Адрес электронной почты</li>
                  <li>Фотография профиля (аватар)</li>
                  <li>Уникальный идентификатор Google ID</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  3. Цели обработки данных
                </h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  Ваши персональные данные используются для:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Идентификации пользователя на Сайте</li>
                  <li>Предоставления доступа к функционалу Сайта</li>
                  <li>Управления избранными учреждениями и заявками</li>
                  <li>Связи с вами по вопросам использования Сайта</li>
                  <li>Улучшения качества предоставляемых услуг</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  4. Хранение и защита данных
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Мы храним ваши данные на защищенных серверах и применяем технические и организационные меры безопасности для предотвращения несанкционированного доступа, изменения или раскрытия информации. Данные хранятся до момента удаления вашего аккаунта или отзыва согласия на обработку.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  5. Передача данных третьим лицам
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Мы не передаем ваши персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством Республики Узбекистан. Авторизация через Google осуществляется в соответствии с{' '}
                  <a 
                    href="https://policies.google.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Политикой конфиденциальности Google
                  </a>.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  6. Ваши права
                </h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  В соответствии с законодательством РУз, вы имеете право:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Получать информацию о хранящихся данных</li>
                  <li>Требовать исправления неточных данных</li>
                  <li>Требовать удаления ваших данных</li>
                  <li>Отозвать согласие на обработку данных</li>
                  <li>Ограничить обработку данных</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  7. Файлы cookie
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Сайт использует файлы cookie для обеспечения работы авторизации и улучшения пользовательского опыта. Вы можете настроить свой браузер для блокировки cookie, однако это может ограничить функциональность Сайта.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  8. Изменения в Политике
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. Актуальная версия всегда доступна на данной странице. Продолжение использования Сайта после внесения изменений означает ваше согласие с обновленной Политикой.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  9. Контактная информация
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  По вопросам обработки персональных данных вы можете связаться с нами по адресу:{' '}<a href='/contacts' onClick={onClose} className="text-blue-600 hover:underline">здесь</a>
                    
                </p>
                {/* <p className="text-sm text-gray-600 mt-3">
                  Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
                </p> */}
              </section>
            </div>
          </div>

          {/* Footer with Checkbox and Buttons */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
            <div className="flex items-start space-x-3 mb-4">
              <input
                type="checkbox"
                id="privacy-consent"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label 
                htmlFor="privacy-consent" 
                className="text-sm text-gray-700 leading-relaxed cursor-pointer select-none"
              >
                Я ознакомлен(а) с Политикой конфиденциальности и даю согласие на обработку моих персональных данных в соответствии с условиями, изложенными выше
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAccept}
                disabled={!isChecked}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  isChecked
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Принять и продолжить
              </button>
              <button
                onClick={onClose}
                className="flex-1 sm:flex-initial py-3 px-6 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyConsentModal