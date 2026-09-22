import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './Common.css'

function Reports() {
  const [abcAnalysis, setAbcAnalysis] = useState([])
  const [inventory, setInventory] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setIsLoading(true)
    try {
      const abc = await api.getABCAnalysis()
      const inv = await api.getInventory()
      setAbcAnalysis(abc)
      setInventory(inv)
    } catch (error) {
      console.error('Error loading reports:', error)
    }
    setIsLoading(false)
  }

  const getClassBadge = (classe) => {
    const colors = { 'A': 'success', 'B': 'warning', 'C': 'danger' }
    return <span className={`badge badge-${colors[classe] || 'info'}`}>{classe}</span>
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
        <h1>Отчеты</h1>
        <p>Аналитические отчеты и ABC-анализ</p>
      </div>

      <div className="card">
        <h2>📊 ABC-Анализ материалов</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Материал</th>
                <th>Код</th>
                <th>Стоимость</th>
                <th>Класс</th>
              </tr>
            </thead>
            <tbody>
              {abcAnalysis.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.code}</td>
                  <td>{item.total_cost?.toLocaleString('ru-RU') || '0'} ₽</td>
                  <td>{getClassBadge(item.class)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>📦 Состояние складских остатков</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Материал</th>
                <th>Остаток</th>
                <th>Мин. остаток</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.material_name}</strong></td>
                  <td>{item.quantity_available}</td>
                  <td>{item.min_stock}</td>
                  <td>{getStatusBadge(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports
