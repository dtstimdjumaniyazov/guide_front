import React from 'react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

const HelpPage: React.FC = () => {
    useDocumentTitle('Помощь')
    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-2-7xl mx-auto px-4 sm:px-6 ls:px-8 py-12'>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Помощь
                </h1>
                <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                    <p className="text-lg font-semibold mb-4">1. Как искать учреждения</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>
                            На главной странице введите ключевое значение — например, возраст ребёнка (3–6 лет) или стоимость.
                        </li>
                        <li>
                            В результатах выберите подходящее учреждение.
                        </li>
                        <li>
                            Чтобы не потерять его, нажмите на значок сердечка — учреждение добавится в «Избранное».
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                    <p className="text-lg font-semibold mb-4">2. Регистрация и личный кабинет</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>
                            Вход и регистрация происходят через Google-аккаунт — это самый простой и безопасный способ.
                        </li>
                        <li>
                            Чтобы посмотреть свои сохранённые учреждения, нажмите на профиль и выберите пункт «Избранные».
                        </li>
                        <li>
                            Если хотите добавить новое учреждение, в профиле выберите «+ Добавить учреждение» и заполните форму.
                            <ul className="list-none text-gray-700 pl-10">
                                <li className="relative before:content-['-'] before:absolute before:-left-4">
                                    Наши модераторы проверят заявку.
                                </li>
                                <li className="relative before:content-['-'] before:absolute before:-left-4">
                                    Если чего-то не хватает, они оставят комментарий.
                                </li>
                                <li className="relative before:content-['-'] before:absolute before:-left-4">
                                    Если всё заполнено правильно — учреждение будет одобрено и появится в общем списке.
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                    <p className="text-lg font-semibold mb-4">3. Отзывы</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>
                            Функция отзывов пока в разработке, но скоро появится.
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                    <p className="text-lg font-semibold mb-4">4. Контакты учреждений</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>
                            У каждого учреждения обязательно указан номер телефона.
                        </li>
                        <li>
                            Если телефон неактуален — напишите нам, и мы обновим данные.
                        </li>
                        <li>
                            Дополнительно учреждения могут добавить свои соцсети (Telegram, Instagram, Facebook).
                        </li>
                        <li>
                            Вы можете звонить/писать учреждениям напрямую.
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                    <p className="text-lg font-semibold mb-4">5. Добавление учреждения</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>
                            Авторизуйтесь через Google.
                        </li>
                        <li>
                            В профиле выберите «+ Добавить новое учреждение».
                        </li>
                        <li>
                            Заполните все поля формы.
                        </li>
                        <li>
                            Статус вашей заявки:
                            <ul className="list-none text-gray-700 pl-10">
                                <li className="relative before:content-['-'] before:absolute before:-left-4">«Ожидает рассмотрение» — заявка отправлена.</li>
                                <li className="relative before:content-['-'] before:absolute before:-left-4">«Требует доработки» — модератор оставил комментарий, что нужно исправить.</li>
                                <li className="relative before:content-['-'] before:absolute before:-left-4">«Одобрено» — учреждение опубликовано и доступно другим пользователям.</li>
                            </ul>
                        </li>
                        <li>
                            Проверка занимает 1–3 рабочих дня.
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
                    <p className="text-lg font-semibold mb-4">6. Технические вопросы</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>
                            Если сайт работает некорректно (страницы не открываются, поиск не работает):
                            <ul className="list-none text-gray-700 pl-10">
                                <li className="relative before:content-['-'] before:absolute before:-left-4">попробуйте обновить страницу (F5 или Ctrl + F5)</li>
                                <li className="relative before:content-['-'] before:absolute before:-left-4">очистите кэш и cookies браузера</li>
                                <li className="relative before:content-['-'] before:absolute before:-left-4">попробуйте открыть сайт с другого устройства или браузера.</li>
                            </ul>
                        </li>
                        <li>
                            Если проблема сохраняется, напишите нам через форму обратной связи или на e-mail () и мы постараемся быстро помочь.
                        </li>
                    </ul>
                </div>
            </div>

        </div>
    )
}

export default HelpPage