import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import './Navigation.css'

function Navigation() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <h2>Закупки-ДР</h2>
        </Link>
      </div>

      <ul className="nav-menu">
        <li><Link to="/">Главная</Link></li>
        <li><Link to="/materials">Материалы</Link></li>
        <li><Link to="/suppliers">Поставщики</Link></li>
        <li><Link to="/orders">Заказы</Link></li>
        <li><Link to="/procurement">Закупки</Link></li>
        <li><Link to="/warehouse">Склад</Link></li>
        <li><Link to="/reports">Отчеты</Link></li>
      </ul>

      <div className="navbar-user">
        <span className="user-name">{user?.full_name}</span>
        <div className="user-menu">
          <Link to="/settings">Настройки</Link>
          <button onClick={handleLogout} className="btn-logout">Выход</button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
