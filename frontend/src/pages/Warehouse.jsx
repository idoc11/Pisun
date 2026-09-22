import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './Common.css'

function Warehouse() {
  const [inventory, setInventory] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    setIsLoading(true)
    try {
      const data = await api.getInventory()
      setInventory(data)
    } catch (error) {
      console.error('Error loading inventory:', error)
    }
    setIsLoading(false)
  }

  const getStatusBadge = (status) => {
    const colors = { ok: 'success', low: 'warning', critical: 'danger' }
    const labels = { ok: 'OK', low: 'Низкий', critical: 'Критично' }
    return <span className={`badge badge-${colors[status] || 'info'}`}>{labels[status]}</span>
  }

  if (isLoading) return <div>Загрузка...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Склад</h1>
        <p>Управление остатками на складе</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Материал</th>
                <th>Код</th>
                <th>В наличии</th>
                <th>Зарезервировано</th>
                <th>Доступно</th>
                <th>Мин.</th>
                <th>Макс.</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.material_name}</strong></td>
                  <td>{item.code}</td>
                  <td>{item.quantity_on_hand}</td>
                  <td>{item.quantity_reserved}</td>
                  <td>{item.quantity_available}</td>
                  <td>{item.min_stock}</td>
                  <td>{item.max_stock}</td>
                  <td>{getStatusBadge(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-muted">Всего позиций: {inventory.length}</p>
      </div>
    </div>
  )
}

export default Warehouse
