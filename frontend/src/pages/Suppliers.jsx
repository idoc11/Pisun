import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './Common.css'

function Suppliers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    city: '',
    delivery_time_days: 5
  })

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    setIsLoading(true)
    try {
      const data = await api.getSuppliers()
      setSuppliers(data)
    } catch (error) {
      console.error('Error loading suppliers:', error)
    }
    setIsLoading(false)
  }

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      city: '',
      delivery_time_days: 5
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.updateSupplier(editingId, formData)
      } else {
        await api.createSupplier(formData)
      }
      loadSuppliers()
      resetForm()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleEdit = (supplier) => {
    setFormData(supplier)
    setEditingId(supplier.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Удалить поставщика?')) {
      try {
        await api.deleteSupplier(id)
        loadSuppliers()
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }

  if (isLoading) return <div>Загрузка...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Поставщики</h1>
        <p>Управление поставщиками материалов</p>
      </div>

      {showForm && (
        <div className="card">
          <h2>{editingId ? 'Редактировать поставщика' : 'Добавить поставщика'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Наименование *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Контактное лицо *</label>
                <input
                  type="text"
                  required
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Телефон *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Город *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Дней доставки *</label>
                <input
                  type="number"
                  required
                  value={formData.delivery_time_days}
                  onChange={(e) => setFormData({...formData, delivery_time_days: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Сохранить' : 'Добавить'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="toolbar">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Добавить поставщика
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Наименование</th>
                <th>Контактное лицо</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Город</th>
                <th>Дн. доставки</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map(supplier => (
                <tr key={supplier.id}>
                  <td><strong>{supplier.name}</strong></td>
                  <td>{supplier.contact_person}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.city}</td>
                  <td>{supplier.delivery_time_days}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(supplier)}
                      >
                        ✏️ Ред.
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(supplier.id)}
                      >
                        🗑️ Удал.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-muted">Всего поставщиков: {filteredSuppliers.length}</p>
      </div>
    </div>
  )
}

export default Suppliers
