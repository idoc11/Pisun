import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './Common.css'

function Procurement() {
  const [statusFilter, setStatusFilter] = useState('')
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProcurement()
  }, [])

  const loadProcurement = async () => {
    setIsLoading(true)
    try {
      const data = await api.getProcurementRequests()
      setRequests(data)
    } catch (error) {
      console.error('Error loading procurement:', error)
    }
    setIsLoading(false)
  }

  const filteredRequests = requests.filter(r =>
    statusFilter === '' || r.status === statusFilter
  )

  const getStatusBadge = (status) => {
    const colors = { draft: 'warning', approved: 'success', sent: 'info' }
    const labels = { draft: 'Черновик', approved: 'Одобрена', sent: 'Отправлена' }
    return <span className={`badge badge-${colors[status] || 'info'}`}>{labels[status]}</span>
  }

  if (isLoading) return <div>Загрузка...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Закупки</h1>
        <p>Формирование и управление заявками на закупку</p>
      </div>

      <div className="card">
        <div className="toolbar">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Все статусы</option>
            <option value="draft">Черновик</option>
            <option value="approved">Одобрена</option>
            <option value="sent">Отправлена</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Номер заявки</th>
                <th>Материал</th>
                <th>Кол-во</th>
                <th>Поставщик</th>
                <th>Статус</th>
                <th>Ожид. доставка</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => (
                <tr key={req.id}>
                  <td><strong>{req.number}</strong></td>
                  <td>{req.material}</td>
                  <td>{req.quantity}</td>
                  <td>{req.supplier}</td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td>{req.expected_delivery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-muted">Всего заявок: {filteredRequests.length}</p>
      </div>
    </div>
  )
}

export default Procurement
