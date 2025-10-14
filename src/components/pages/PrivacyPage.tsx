import React from 'react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { email, phoneNumber } from '../../constants'
import { Link } from 'react-router-dom'

const PrivacyPage: React.FC = () => {
  useDocumentTitle('Политика конфиденциальности')

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Политика конфиденциальности
        </h1>

        {/* 1. Общие положения */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">1. Общие положения</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок сбора,
              обработки, хранения и защиты персональных данных пользователей сайта
              <strong> https://uchrejdeniya.uz/</strong>.
            </li>
            <li>
              Политика разработана индивидуальным предпринимателем <strong>Минкиным Артёмом Эриковичем</strong>,
              зарегистрированным в соответствии с законодательством Республики Узбекистан
              (регистрационный номер <strong>7197719</strong>, дата регистрации — <strong>08.10.2025</strong>,
              орган регистрации — <strong>Миробод тумани давлат хизматлари маркази</strong>, г. Ташкент).
            </li>
            <li>
              Обработка персональных данных осуществляется в соответствии с
              Законом Республики Узбекистан «О персональных данных» № ЗРУ-547 от 02.07.2019 г.
            </li>
            <li>
              Авторизация на сайте с использованием Google или других сервисов
              является подтверждением согласия пользователя с настоящей Политикой
              и согласием на обработку его персональных данных
              в соответствии с законодательством Республики Узбекистан.
            </li>
            <li>
              В случае несогласия с условиями настоящей Политики пользователь обязан прекратить
              использование сайта и его сервисов.
            </li>
          </ul>
        </div>

        {/* 2. Какие данные мы собираем */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">2. Какие данные мы собираем</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Имя, фамилия, адрес электронной почты (указанные при регистрации или обратной связи).</li>
            <li>Данные для авторизации через Google (имя, e-mail, фото профиля).</li>
            <li>Информация, предоставленная пользователем при добавлении учреждений или отзывов.</li>
            <li>Cookies и технические данные (IP-адрес, тип устройства, браузер, дата и время доступа, геолокация — при согласии пользователя).</li>
          </ul>
        </div>

        {/* 3. Цели обработки данных */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">3. Цели обработки данных</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Обеспечение функционирования личного кабинета и сервисов сайта.</li>
            <li>Обратная связь, уведомления о работе сайта и ответы на запросы пользователей.</li>
            <li>Соблюдение требований законодательства Республики Узбекистан.</li>
            <li>Проведение аналитики, улучшение качества предоставляемых услуг и пользовательского опыта.</li>
          </ul>
        </div>

        {/* 4. Хранение и локализация данных */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">4. Хранение и локализация данных</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Персональные данные граждан Республики Узбекистан хранятся на серверах, расположенных на территории Республики Узбекистан.</li>
            <li>База персональных данных зарегистрирована (или подлежит регистрации) в Государственном реестре операторов персональных данных.</li>
            <li>Данные хранятся до достижения целей их обработки, но не дольше сроков, установленных законодательством.</li>
          </ul>
        </div>

        {/* 5. Передача данных */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">5. Передача данных третьим лицам</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Мы не передаём персональные данные третьим лицам без согласия пользователя.</li>
            <li>Исключение — передача данных сервисам Google (авторизация, аналитика) и в случаях, предусмотренных законодательством Республики Узбекистан.</li>
            <li>Все партнёры и подрядчики обязаны обеспечивать защиту данных на уровне, не ниже предусмотренного законом.</li>
          </ul>
        </div>

        {/* 6. Права пользователей */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">6. Права пользователей</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Запрашивать информацию о том, какие персональные данные хранятся и как обрабатываются.</li>
            <li>Требовать исправления или удаления своих данных (если нет законных оснований для хранения).</li>
            <li>Ограничивать обработку данных или отзывать согласие на их обработку.</li>
            <li>Обратиться по вопросам обработки данных через форму обратной связи или по e-mail.</li>
          </ul>
        </div>

        {/* 7. Cookies */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">7. Cookies и технологии</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Сайт использует cookies для сохранения пользовательских настроек, авторизации и аналитики.</li>
            <li>Пользователь может отключить cookies в настройках браузера, но это может ограничить функциональность сайта.</li>
          </ul>
        </div>

        {/* 8. Безопасность данных */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">8. Безопасность персональных данных</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Мы принимаем технические и организационные меры для защиты персональных данных от несанкционированного доступа, изменения, утраты или уничтожения.</li>
            <li>Доступ к персональным данным ограничен и предоставляется только уполномоченным лицам.</li>
            <li>Ответственным за обработку персональных данных является ИП Минкин А. Э.</li>
          </ul>
        </div>

        {/* 9. Изменения политики */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">9. Изменения политики</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Мы оставляем за собой право изменять настоящую Политику в одностороннем порядке.</li>
            <li>Актуальная версия Политики всегда доступна на сайте.</li>
            <li>Продолжение использования сайта после внесения изменений означает согласие с новой редакцией Политики.</li>
          </ul>
        </div>

        {/* 10. Контакты */}
        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">10. Контактная информация</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>E-mail: {email}</li>
            <li>Форма обратной связи: <Link to={'/contacts'} className="text-blue-600 hover:underline">здесь</Link></li>
            <li>База персональных данных хранится на сервере «ahost.uz» (г. Ташкент, ул. Олмачи, 25).</li>
          </ul>
        </div>

        {/* 11. Сведения об ИП */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-lg font-semibold mb-4">11. Сведения о правообладателе</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Индивидуальный предприниматель: <strong>Минкин А. Э.</strong></li>
            <li>Регистрационный номер: <strong>7197719</strong></li>
            <li>Дата регистрации: <strong>08.10.2025</strong></li>
            <li>Орган регистрации: <strong>Миробод тумани давлат хизматлари маркази</strong> (г. Ташкент)</li>
          </ul>
        </div>

      </div>
    </div>
  )
}

export default PrivacyPage
