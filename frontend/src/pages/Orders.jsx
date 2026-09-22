import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './Common.css'

function Orders() {
  const [statusFilter, setStatusFilter] = useState('')
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      const data = await api.getOrders()
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
    }
    setIsLoading(false)
  }

  const filteredOrders = orders.filter(o =>
    statusFilter === '' || o.status === statusFilter
  )

  const getStatusBadge = (status) => {
    const colors = { draft: 'warning', pending: 'info', completed: 'success' }
    const labels = { draft: 'Черновик', pending: 'В ожидании', completed: 'Завершен' }
    return <span className={`badge badge-${colors[status] || 'info'}`}>{labels[status]}</span>
  }

  if (isLoading) return <div>Загрузка...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Заказы</h1>
        <p>Заказы на производство мебели</p>
      </div>

      <div className="card">
        <div className="toolbar">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Все статусы</option>
            <option value="draft">Черновик</option>
            <option value="pending">В ожидании</option>
            <option value="completed">Завершен</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Номер</th>
                <th>Клиент</th>
                <th>Дата заказа</th>
                <th>Требуемая дата</th>
                <th>Статус</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td><strong>{order.number}</strong></td>
                  <td>{order.customer}</td>
                  <td>{order.date}</td>
                  <td>{order.required_date}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{order.total.toLocaleString('ru-RU')} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-muted">Всего заказов: {filteredOrders.length}</p>
      </div>
    </div>
  )
}

export default Orders
