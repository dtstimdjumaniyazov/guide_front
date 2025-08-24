import React from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { email } from '../../constants'

const RulesPage: React.FC = () => {
    useDocumentTitle('Правила пользования сайтом')
    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Правила пользования сайтом
            </h1>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">1. Общие положения</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Настоящие правила регулируют порядок использования сайта (укажите название/домен).</li>
                <li>Используя сайт, вы соглашаетесь с настоящими правилами.</li>
                <li>Если вы не согласны — пожалуйста, прекратите использование сайта.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">2. Услуги сайта</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Сайт предназначен для поиска и выбора образовательных, развивающих и иных учреждений для детей.</li>
                <li>Информация об учреждениях предоставляется администрацией сайта, а также самими пользователями и представителями организаций.</li>
                <li>Сайт не является организатором услуг и не несёт ответственности за их качество.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">3. Регистрация и аккаунт</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Вход и регистрация осуществляются через Google-аккаунт.</li>
                <li>Пользователь обязуется предоставлять достоверную информацию.</li>
                <li>Администрация вправе ограничить или заблокировать доступ при нарушении правил.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">4. Добавление учреждений</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Учреждения могут добавлять представители организаций или пользователи.</li>
                <li>Перед публикацией данные проходят модерацию.</li>
                <li>Администрация вправе отклонить или удалить информацию, если она недостоверна или нарушает правила.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">5. Отзывы и комментарии</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Пользователи могут оставлять отзывы (функция будет добавлена в будущем).</li>
                <li>Запрещено размещать оскорбления, ложные сведения и рекламу.</li>
                <li>Администрация вправе удалять такие отзывы без объяснения причин.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">6. Ответственность</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Администрация сайта не несёт ответственности за достоверность информации, предоставленной учреждениями или пользователями.</li>
                <li>Администрация не несёт ответственности за качество услуг, оказываемых учреждениями.</li>
                <li>Пользователь несёт ответственность за публикуемую им информацию.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">7. Конфиденциальность и данные</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Сбор и обработка персональных данных осуществляется в соответствии с Политикой конфиденциальности.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">8. Ограничения</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Запрещено размещать ложную или вводящую в заблуждение информацию.</li>
                <li>Запрещено использовать сайт для спама или рекламы без согласия администрации.</li>
                <li>Запрещено пытаться нарушить работу сайта (взлом, боты и пр.).</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">9. Изменение правил</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Администрация вправе изменять настоящие правила в любое время.</li>
                <li>Актуальная версия всегда доступна на сайте.</li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                <p className="text-lg font-semibold mb-4">10. Контакты</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>E-mail: {email}</li>
                <li>Форма обратной связи: <Link to={'/contacts'} className="text-blue-600 hover:underline">Здесь</Link></li>
                </ul>
            </div>
            </div>
        </div>
    )
}

export default RulesPage