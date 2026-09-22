import axios from 'axios'
import mockApi from './mockApi'

// Определяем, использовать ли mock API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' ||
                     localStorage.getItem('useMockApi') === 'true'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Создаем экземпляр axios для реальных запросов
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000
})

// Добавляем token в заголовки
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Обрабатываем ошибки
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw error.response?.data || error
  }
)

// API адаптер - выбирает между реальным и mock API
export const api = {
  isUsingMock: () => USE_MOCK_API,

  setMockMode: (use) => {
    localStorage.setItem('useMockApi', use ? 'true' : 'false')
    window.location.reload()
  },

  // Auth endpoints
  login: (email, password) =>
    USE_MOCK_API
      ? mockApi.login(email, password)
      : apiClient.post('/auth/login', { email, password }),

  register: (email, password, fullName) =>
    USE_MOCK_API
      ? mockApi.register(email, password, fullName)
      : apiClient.post('/auth/register', { email, password, full_name: fullName }),

  getMe: () =>
    USE_MOCK_API
      ? mockApi.getMe()
      : apiClient.get('/auth/me'),

  // Materials endpoints
  getMaterials: (filters) =>
    USE_MOCK_API
      ? mockApi.getMaterials(filters)
      : apiClient.get('/materials', { params: filters }),

  getMaterial: (id) =>
    USE_MOCK_API
      ? mockApi.getMaterial(id)
      : apiClient.get(`/materials/${id}`),

  createMaterial: (data) =>
    USE_MOCK_API
      ? mockApi.createMaterial(data)
      : apiClient.post('/materials', data),

  updateMaterial: (id, data) =>
    USE_MOCK_API
      ? mockApi.updateMaterial(id, data)
      : apiClient.put(`/materials/${id}`, data),

  deleteMaterial: (id) =>
    !USE_MOCK_API
      ? apiClient.delete(`/materials/${id}`)
      : Promise.resolve({ message: 'Deleted' }),

  // Suppliers endpoints
  getSuppliers: (filters) =>
    USE_MOCK_API
      ? mockApi.getSuppliers(filters)
      : apiClient.get('/suppliers', { params: filters }),

  getSupplier: (id) =>
    USE_MOCK_API
      ? mockApi.getSupplier(id)
      : apiClient.get(`/suppliers/${id}`),

  createSupplier: (data) =>
    USE_MOCK_API
      ? mockApi.createSupplier(data)
      : apiClient.post('/suppliers', data),

  updateSupplier: (id, data) =>
    USE_MOCK_API
      ? mockApi.updateSupplier(id, data)
      : apiClient.put(`/suppliers/${id}`, data),

  // Warehouse endpoints
  getInventory: () =>
    USE_MOCK_API
      ? mockApi.getInventory()
      : apiClient.get('/warehouse/inventory'),

  getCriticalMaterials: () =>
    USE_MOCK_API
      ? mockApi.getCriticalMaterials()
      : apiClient.get('/warehouse/critical-materials'),

  recordReceipt: (data) =>
    USE_MOCK_API
      ? Promise.resolve({ id: Date.now(), ...data })
      : apiClient.post('/warehouse/receipt', data),

  // Orders endpoints
  getOrders: (filters) =>
    USE_MOCK_API
      ? mockApi.getOrders(filters)
      : apiClient.get('/orders', { params: filters }),

  getOrder: (id) =>
    USE_MOCK_API
      ? mockApi.getOrder(id)
      : apiClient.get(`/orders/${id}`),

  createOrder: (data) =>
    USE_MOCK_API
      ? mockApi.createOrder(data)
      : apiClient.post('/orders', data),

  updateOrderStatus: (id, status) =>
    USE_MOCK_API
      ? mockApi.updateOrderStatus(id, status)
      : apiClient.patch(`/orders/${id}/status`, { status }),

  // Procurement endpoints
  getProcurementRequests: (filters) =>
    USE_MOCK_API
      ? mockApi.getProcurementRequests(filters)
      : apiClient.get('/procurement/requests', { params: filters }),

  createProcurementRequest: (data) =>
    USE_MOCK_API
      ? mockApi.createProcurementRequest(data)
      : apiClient.post('/procurement/requests', data),

  approveProcurementRequest: (id) =>
    USE_MOCK_API
      ? mockApi.approveProcurementRequest(id)
      : apiClient.patch(`/procurement/requests/${id}/approve`),

  // Reports endpoints
  getMaterialUsageSummary: () =>
    USE_MOCK_API
      ? mockApi.getMaterialUsageSummary()
      : apiClient.get('/reports/material-usage'),

  getABCAnalysis: () =>
    USE_MOCK_API
      ? mockApi.getABCAnalysis()
      : apiClient.get('/reports/abc-analysis'),

  getInventoryReport: () =>
    USE_MOCK_API
      ? mockApi.getInventoryReport()
      : apiClient.get('/reports/inventory'),

  getOrdersReport: (filters) =>
    USE_MOCK_API
      ? Promise.resolve(mockApi.getOrders(filters))
      : apiClient.get('/reports/orders', { params: filters })
}

export default api
