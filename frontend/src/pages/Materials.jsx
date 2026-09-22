import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './Common.css'

function Materials() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [materials, setMaterials] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'wood',
    unit_of_measure: 'м³',
    min_stock: 10,
    max_stock: 100,
    unit_price: 0
  })

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    setIsLoading(true)
    try {
      const data = await api.getMaterials()
      setMaterials(data)
    } catch (error) {
      console.error('Error loading materials:', error)
    }
    setIsLoading(false)
  }

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === '' || m.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category: 'wood',
      unit_of_measure: 'м³',
      min_stock: 10,
      max_stock: 100,
      unit_price: 0
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.updateMaterial(editingId, formData)
      } else {
        await api.createMaterial(formData)
      }
      loadMaterials()
      resetForm()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleEdit = (material) => {
    setFormData(material)
    setEditingId(material.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Удалить материал?')) {
      try {
        await api.deleteMaterial(id)
        loadMaterials()
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }

  const categories = {
    wood: 'Древесина',
    hardware: 'Фурнитура',
    paint: 'Краска',
    fasteners: 'Крепеж'
  }

  if (isLoading) return <div>Загрузка...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Материалы</h1>
        <p>Управление справочником материалов</p>
      </div>

      {showForm && (
        <div className="card">
          <h2>{editingId ? 'Редактировать материал' : 'Добавить материал'}</h2>
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
                <label>Код *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Категория *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="wood">Древесина</option>
                  <option value="hardware">Фурнитура</option>
                  <option value="paint">Краска</option>
                  <option value="fasteners">Крепеж</option>
                </select>
              </div>
              <div className="form-group">
                <label>Единица измерения *</label>
                <input
                  type="text"
                  required
                  value={formData.unit_of_measure}
                  onChange={(e) => setFormData({...formData, unit_of_measure: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Минимальный остаток *</label>
                <input
                  type="number"
                  required
                  value={formData.min_stock}
                  onChange={(e) => setFormData({...formData, min_stock: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Максимальный остаток *</label>
                <input
                  type="number"
                  required
                  value={formData.max_stock}
                  onChange={(e) => setFormData({...formData, max_stock: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Цена за единицу *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.unit_price}
                onChange={(e) => setFormData({...formData, unit_price: parseFloat(e.target.value)})}
              />
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
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Все категории</option>
            <option value="wood">Древесина</option>
            <option value="hardware">Фурнитура</option>
            <option value="paint">Краска</option>
            <option value="fasteners">Крепеж</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Добавить материал
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Код</th>
                <th>Наименование</th>
                <th>Категория</th>
                <th>Ед. изм.</th>
                <th>Цена</th>
                <th>Мин./Макс.</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map(material => (
                <tr key={material.id}>
                  <td><strong>{material.code}</strong></td>
                  <td>{material.name}</td>
                  <td>{categories[material.category]}</td>
                  <td>{material.unit_of_measure}</td>
                  <td>{material.unit_price.toLocaleString('ru-RU')} ₽</td>
                  <td>{material.min_stock}/{material.max_stock}</td>
                  <td>
                    <span className={`badge ${material.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {material.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(material)}
                      >
                        ✏️ Ред.
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(material.id)}
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

        <p className="text-muted">Всего материалов: {filteredMaterials.length}</p>
      </div>
    </div>
  )
}

export default Materials
