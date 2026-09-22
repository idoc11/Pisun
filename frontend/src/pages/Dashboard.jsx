import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    materials: 0,
    suppliers: 0,
    activeOrders: 0,
    lowStockItems: 0
  })

  useEffect(() => {
    // TODO: Fetch dashboard stats from API
  }, [])

  return (
    <div>
      <div className="page-header">
        <h1>Главная панель</h1>
        <p>Добро пожаловать, {user?.full_name}!</p>
      </div>

      <div className="grid">
        <div className="stat-card">
          <h3>Материалы</h3>
          <div className="value">{stats.materials}</div>
          <p className="subtitle">Всего позиций в системе</p>
        </div>
        <div className="stat-card">
          <h3>Поставщики</h3>
          <div className="value">{stats.suppliers}</div>
          <p className="subtitle">Активных поставщиков</p>
        </div>
        <div className="stat-card">
          <h3>Активные заказы</h3>
          <div className="value">{stats.activeOrders}</div>
          <p className="subtitle">Текущих заказов на производство</p>
        </div>
        <div className="stat-card">
          <h3>Низкие остатки</h3>
          <div className="value" style={{ color: '#ea580c' }}>{stats.lowStockItems}</div>
          <p className="subtitle">Материалов требуют пополнения</p>
        </div>
      </div>

      <div className="card">
        <h2>Быстрый доступ</h2>
        <p>Используйте меню навигации выше для доступа к различным разделам системы:</p>
        <ul>
          <li><strong>Материалы</strong> - Управление справочником материалов</li>
          <li><strong>Поставщики</strong> - Управление поставщиками и их условиями</li>
          <li><strong>Заказы</strong> - Просмотр заказов на производство</li>
          <li><strong>Закупки</strong> - Формирование и управление заявками на закупку</li>
          <li><strong>Склад</strong> - Управление остатками на складе</li>
          <li><strong>Отчеты</strong> - Аналитические отчеты и ABC-анализ</li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
