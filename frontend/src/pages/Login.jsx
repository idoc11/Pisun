import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login, register, isUsingMock } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let success
    if (isRegister) {
      success = await register(email, password, fullName)
    } else {
      success = await login(email, password)
    }

    if (success) {
      navigate('/')
    } else {
      const { error: authError } = useAuthStore.getState()
      setError(authError || 'An error occurred')
    }
    setLoading(false)
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    const success = await login('demo@zakupki-dr.ru', 'demo')
    if (success) {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Закупки-ДР</h1>
          <p>Система планирования закупок материалов</p>
          {isUsingMock && (
            <div className="demo-badge">
              🎭 ДЕМОНСТРАЦИОННЫЙ РЕЖИМ
            </div>
          )}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="fullName">ФИО</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Введите ваше полное имя"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Введите email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Введите пароль"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : (isRegister ? 'Зарегистрироваться' : 'Войти')}
          </button>
        </form>

        {isUsingMock && (
          <div className="quick-login">
            <button
              type="button"
              className="btn-demo"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              ⚡ Быстрый вход (Demo)
            </button>
          </div>
        )}

        <div className="login-footer">
          <p>
            {isRegister ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
            <button 
              type="button"
              className="toggle-btn"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>
        </div>
      </div>

      <div className="login-info">
        <h2>Добро пожаловать!</h2>
        <p>Система "Закупки-ДР" предназначена для автоматизации процесса планирования и учета закупок материалов для студии мебели "Деревянные решения".</p>
        <ul>
          <li>✓ Управление справочниками материалов и поставщиков</li>
          <li>✓ Планирование закупок на основе заказов</li>
          <li>✓ Контроль остатков на складе в режиме реального времени</li>
          <li>✓ Аналитические отчеты и ABC-анализ</li>
          <li>✓ Разграничение прав доступа по ролям</li>
        </ul>

        {isUsingMock && (
          <div className="demo-info">
            <h3>🎭 Демонстрационный режим активен</h3>
            <p>Вы используете встроенные демонстрационные данные. В этом режиме:</p>
            <ul>
              <li>Подходят любые данные для входа</li>
              <li>Все данные хранятся в памяти браузера</li>
              <li>При обновлении страницы данные вернутся к исходному состоянию</li>
              <li>Сервер базы данных не требуется</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
