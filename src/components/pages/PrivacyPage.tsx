import React from 'react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { address, email } from '../../constants'
import { Link } from 'react-router-dom'

const PrivacyPage: React.FC = () => {
    useDocumentTitle('Политика конфиденциальности')
    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Политика конфиденциальности
            </h1>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">1. Общие положения</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Настоящая Политика регулирует порядок сбора, хранения и использования персональных данных пользователей сайта (указать домен/название).</li>
                <li>Используя сайт, вы подтверждаете согласие с данной Политикой.</li>
                <li>Обработка персональных данных осуществляется в соответствии с Законом Республики Узбекистан «О персональных данных» № ЗРУ-547 от 02.07.2019.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">2. Какие данные мы собираем</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Данные для авторизации через Google (имя, e-mail, фото профиля).</li>
                <li>Информация, которую пользователь указывает при добавлении учреждения.</li>
                <li>Cookies и техническая информация (IP-адрес, тип устройства, браузер).</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">3. Цели обработки данных</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Обеспечение входа и работы личного кабинета.</li>
                <li>Сохранение «Избранных» учреждений.</li>
                <li>Обеспечение работы форм добавления учреждений и обратной связи.</li>
                <li>Улучшение работы сайта и аналитика.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">4. Хранение и локализация данных</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Персональные данные граждан Узбекистана хранятся на серверах, расположенных на территории Республики Узбекистан.</li>
                <li>База персональных данных зарегистрирована в Государственном реестре операторов персональных данных.</li>
                <li>Срок хранения данных определяется целями обработки, но не дольше, чем это необходимо по закону.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">5. Передача данных третьим лицам</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Мы не передаём ваши персональные данные третьим лицам без вашего согласия.</li>
                <li>Исключение: использование сервисов Google (авторизация, аналитика).</li>
                <li>В случаях, предусмотренных законодательством Республики Узбекистан, данные могут быть переданы государственным органам.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">6. Права пользователей</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Запросить информацию о том, какие данные о вас хранятся.</li>
                <li>Требовать исправления или удаления ваших данных.</li>
                <li>Отозвать согласие на обработку персональных данных.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">7. Cookies и технологии</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Сайт использует cookies для сохранения пользовательских настроек и аналитики.</li>
                <li>Вы можете отключить cookies в настройках браузера, однако это может повлиять на работу сайта.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">8. Изменение политики</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Мы вправе вносить изменения в Политику конфиденциальности.</li>
                <li>Актуальная версия всегда доступна на сайте.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">9. Контакты</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>E-mail: {email}</li>
                <li>Форма обратной связи: <Link to={'/contacts'} className="text-blue-600 hover:underline">Здесь</Link></li>
                <li>Адрес офиса (если есть): {address}</li>
                <li>База персональных данных хранится на сервере «ahost.uz» (Адрес: 100007, г.Ташкент, ул. Олмачи, 25).</li>
                </ul>
            </div>
            </div>
        </div>
    )


}

export default PrivacyPage