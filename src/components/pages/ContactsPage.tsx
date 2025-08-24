import React, { useState } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { email, FORMSPREE_ENDPOINT_GUIDE, phoneNumber } from '../../constants';
import { useAuth } from '../../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

const capitalize = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
const FORMSPREE_ENDPOINT = FORMSPREE_ENDPOINT_GUIDE;

const ContactsPage: React.FC = () => {
  useDocumentTitle('Контакты');
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [status, setStatus] = useState<{ loading: boolean; ok: boolean | null; msg: string }>({
    loading: false,
    ok: null,
    msg: '',
  });
  

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);

    if (!fd.get('agree')) {
      setStatus({ loading: false, ok: false, msg: 'Пожалуйста, подтвердите согласие на обработку данных.' });
      return;
    }

    try {
      setStatus({ loading: true, ok: null, msg: '' });
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: fd,
      }).then((r) => r.json());

      if (res.ok) {
        setStatus({ loading: false, ok: true, msg: 'Сообщение отправлено. Спасибо! Мы свяжемся с вами.' });
        formEl.reset();
        setTimeout(() => navigate('/'), 3000)
      } else {
        throw new Error('Formspree error');
      }
    } catch {
      setStatus({ loading: false, ok: false, msg: 'Не удалось отправить. Попробуйте позже.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Контакты</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
          <p className="text-lg font-semibold mb-4">Свяжитесь с нами</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <strong>Электронная почта:</strong>{' '}
              <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
                {email}
              </a>
            </li>
            <li>
              <strong>Номер телефона:</strong>{' '}
              <a href={`tel:${phoneNumber}`} className="text-blue-600 hover:underline">
                {phoneNumber}
              </a>
            </li>
          </ul>
        </div>

        {/* состояние загрузки аутентификации */}
        {isLoading && (
          <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
            <p className="text-gray-700">Проверяем авторизацию…</p>
          </div>
        )}

        {/* если не авторизован — просим авторизоваться */}
        {!isLoading && !isAuthenticated && (
          <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
            <p className="text-lg font-semibold mb-2">Форма обратной связи</p>
            <p className="text-gray-700 mb-4">
              Чтобы отправить сообщение, пожалуйста, войдите в аккаунт (Google). Так мы быстрее свяжемся с вами.
            </p>
          </div>
        )}

        {/* если авторизован — показываем форму */}
        {!isLoading && isAuthenticated && (
          <div className="bg-white p-6 rounded-lg shadow mb-[5px]">
            <p className="text-lg font-semibold mb-4">Форма обратной связи</p>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="name"
                  type="text"
                  placeholder="Ваше имя"
                  defaultValue={`${capitalize(user?.first_name)} ${capitalize(user?.last_name)}`.trim()}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Ваш e-mail"
                  defaultValue={user?.email ?? ''}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>

              <input
                name="subject"
                type="text"
                placeholder="Тема сообщения"
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              />

              <textarea
                name="message"
                rows={4}
                placeholder="Ваше сообщение"
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              />

              {/* honeypot от спама */}
              <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input type="checkbox" name="agree" className="mt-1" />
                <span>
                  Согласен(а) на обработку персональных данных и с{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">
                    Политикой конфиденциальности
                  </a>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={status.loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {status.loading ? 'Отправка…' : 'Отправить'}
              </button>

              {status.ok === true && <p className="text-green-600 text-sm">{status.msg}</p>}
              {status.ok === false && <p className="text-red-600 text-sm">{status.msg}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;
