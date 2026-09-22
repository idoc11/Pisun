// Mock API для демонстрации без подключения к БД
// Содержит примеры данных для всех основных сущностей системы

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const mockData = {
  user: {
    id: '1',
    email: 'manager@zakupki-dr.ru',
    full_name: 'Иван Петров',
    role: 'manager'
  },

  materials: [
    {
      id: '1',
      name: 'Сосна доска 50х100',
      code: 'MAT-001',
      category: 'wood',
      unit_of_measure: 'м³',
      min_stock: 10,
      max_stock: 100,
      unit_price: 5000.00,
      is_active: true
    },
    {
      id: '2',
      name: 'Ель доска 40х80',
      code: 'MAT-002',
      category: 'wood',
      unit_of_measure: 'м³',
      min_stock: 5,
      max_stock: 50,
      unit_price: 4500.00,
      is_active: true
    },
    {
      id: '3',
      name: 'Петли мебельные 10см',
      code: 'HAR-001',
      category: 'hardware',
      unit_of_measure: 'шт',
      min_stock: 500,
      max_stock: 2000,
      unit_price: 25.00,
      is_active: true
    },
    {
      id: '4',
      name: 'Клей ПВА 1л',
      code: 'CHM-001',
      category: 'paint',
      unit_of_measure: 'л',
      min_stock: 20,
      max_stock: 100,
      unit_price: 150.00,
      is_active: true
    },
    {
      id: '5',
      name: 'Саморезы 4х50',
      code: 'FAT-001',
      category: 'fasteners',
      unit_of_measure: 'кг',
      min_stock: 10,
      max_stock: 50,
      unit_price: 120.00,
      is_active: true
    }
  ],

  suppliers: [
    {
      id: '1',
      name: 'ООО "Лесопродукты"',
      contact_person: 'Александр Смирнов',
      email: 'info@lesoproducts.ru',
      phone: '+7-495-123-4567',
      city: 'Москва',
      delivery_time_days: 7,
      is_active: true
    },
    {
      id: '2',
      name: 'ЗАО "Фурнитура-Плюс"',
      contact_person: 'Мария Иванова',
      email: 'zakupki@furnitura-plus.ru',
      phone: '+7-495-234-5678',
      city: 'Тверь',
      delivery_time_days: 5,
      is_active: true
    },
    {
      id: '3',
      name: 'ПАО "Химпродукт"',
      contact_person: 'Сергей Петров',
      email: 'sales@chimproduct.ru',
      phone: '+7-495-345-6789',
      city: 'Московская область',
      delivery_time_days: 3,
      is_active: true
    }
  ],

  inventory: [
    {
      id: '1',
      material_id: '1',
      quantity_on_hand: 35,
      quantity_reserved: 10,
      quantity_available: 25
    },
    {
      id: '2',
      material_id: '2',
      quantity_on_hand: 8,
      quantity_reserved: 2,
      quantity_available: 6
    },
    {
      id: '3',
      material_id: '3',
      quantity_on_hand: 450,
      quantity_reserved: 100,
      quantity_available: 350
    },
    {
      id: '4',
      material_id: '4',
      quantity_on_hand: 15,
      quantity_reserved: 5,
      quantity_available: 10
    },
    {
      id: '5',
      material_id: '5',
      quantity_on_hand: 8,
      quantity_reserved: 3,
      quantity_available: 5
    }
  ],

  orders: [
    {
      id: '1',
      order_number: 'ORD-2026-001',
      customer_name: 'Клиент А',
      order_date: '2026-09-15',
      required_date: '2026-09-30',
      status: 'draft',
      total_cost: 45000.00,
      created_by: '1'
    },
    {
      id: '2',
      order_number: 'ORD-2026-002',
      customer_name: 'Клиент Б',
      order_date: '2026-09-18',
      required_date: '2026-10-05',
      status: 'pending',
      total_cost: 67500.00,
      created_by: '1'
    },
    {
      id: '3',
      order_number: 'ORD-2026-003',
      customer_name: 'Клиент В',
      order_date: '2026-09-20',
      required_date: '2026-10-10',
      status: 'completed',
      total_cost: 32000.00,
      created_by: '1'
    }
  ],

  procurementRequests: [
    {
      id: '1',
      request_number: 'PR-2026-001',
      material_id: '1',
      quantity_needed: 20,
      supplier_id: '1',
      status: 'approved',
      order_date: '2026-09-20',
      expected_delivery_date: '2026-09-27',
      created_by: '1'
    },
    {
      id: '2',
      request_number: 'PR-2026-002',
      material_id: '2',
      quantity_needed: 10,
      supplier_id: '1',
      status: 'draft',
      order_date: '2026-09-21',
      expected_delivery_date: '2026-09-28',
      created_by: '1'
    },
    {
      id: '3',
      request_number: 'PR-2026-003',
      material_id: '3',
      quantity_needed: 1000,
      supplier_id: '2',
      status: 'sent',
      order_date: '2026-09-19',
      expected_delivery_date: '2026-09-24',
      created_by: '1'
    }
  ]
}

export const mockApi = {
  // Authentication
  async login(email, password) {
    await delay(500)
    if (email === 'demo@zakupki-dr.ru' && password === 'demo') {
      return {
        token: 'demo-token-' + Date.now(),
        user: mockData.user
      }
    }
    throw new Error('Invalid credentials')
  },

  async register(email, password, fullName) {
    await delay(500)
    return { message: 'User registered successfully' }
  },

  async getMe() {
    await delay(300)
    return mockData.user
  },

  // Materials
  async getMaterials(filters = {}) {
    await delay(500)
    let results = [...mockData.materials]

    if (filters.category) {
      results = results.filter(m => m.category === filters.category)
    }
    if (filters.is_active !== undefined) {
      results = results.filter(m => m.is_active === filters.is_active)
    }

    return results
  },

  async getMaterial(id) {
    await delay(300)
    return mockData.materials.find(m => m.id === id)
  },

  async createMaterial(data) {
    await delay(500)
    const newMaterial = { id: String(Date.now()), ...data }
    mockData.materials.push(newMaterial)
    return newMaterial
  },

  async updateMaterial(id, data) {
    await delay(500)
    const idx = mockData.materials.findIndex(m => m.id === id)
    if (idx !== -1) {
      mockData.materials[idx] = { ...mockData.materials[idx], ...data }
      return mockData.materials[idx]
    }
    throw new Error('Material not found')
  },

  // Suppliers
  async getSuppliers(filters = {}) {
    await delay(500)
    let results = [...mockData.suppliers]

    if (filters.is_active !== undefined) {
      results = results.filter(s => s.is_active === filters.is_active)
    }

    return results
  },

  async getSupplier(id) {
    await delay(300)
    return mockData.suppliers.find(s => s.id === id)
  },

  async createSupplier(data) {
    await delay(500)
    const newSupplier = { id: String(Date.now()), ...data }
    mockData.suppliers.push(newSupplier)
    return newSupplier
  },

  async updateSupplier(id, data) {
    await delay(500)
    const idx = mockData.suppliers.findIndex(s => s.id === id)
    if (idx !== -1) {
      mockData.suppliers[idx] = { ...mockData.suppliers[idx], ...data }
      return mockData.suppliers[idx]
    }
    throw new Error('Supplier not found')
  },

  // Warehouse Inventory
  async getInventory() {
    await delay(500)
    return mockData.inventory.map(inv => ({
      ...inv,
      material_name: mockData.materials.find(m => m.id === inv.material_id)?.name,
      material_code: mockData.materials.find(m => m.id === inv.material_id)?.code,
      unit_of_measure: mockData.materials.find(m => m.id === inv.material_id)?.unit_of_measure
    }))
  },

  async getCriticalMaterials() {
    await delay(500)
    return mockData.inventory
      .filter(inv => {
        const mat = mockData.materials.find(m => m.id === inv.material_id)
        return inv.quantity_on_hand <= mat.min_stock
      })
      .map(inv => {
        const mat = mockData.materials.find(m => m.id === inv.material_id)
        return {
          ...mat,
          current_stock: inv.quantity_on_hand
        }
      })
  },

  // Orders
  async getOrders(filters = {}) {
    await delay(500)
    let results = [...mockData.orders]

    if (filters.status) {
      results = results.filter(o => o.status === filters.status)
    }

    return results
  },

  async getOrder(id) {
    await delay(300)
    return mockData.orders.find(o => o.id === id)
  },

  async createOrder(data) {
    await delay(500)
    const newOrder = {
      id: String(Date.now()),
      ...data,
      status: 'draft',
      created_by: mockData.user.id
    }
    mockData.orders.push(newOrder)
    return newOrder
  },

  async updateOrderStatus(id, status) {
    await delay(500)
    const idx = mockData.orders.findIndex(o => o.id === id)
    if (idx !== -1) {
      mockData.orders[idx].status = status
      return mockData.orders[idx]
    }
    throw new Error('Order not found')
  },

  // Procurement Requests
  async getProcurementRequests(filters = {}) {
    await delay(500)
    let results = [...mockData.procurementRequests]

    if (filters.status) {
      results = results.filter(r => r.status === filters.status)
    }

    return results.map(r => ({
      ...r,
      material_name: mockData.materials.find(m => m.id === r.material_id)?.name,
      supplier_name: mockData.suppliers.find(s => s.id === r.supplier_id)?.name
    }))
  },

  async createProcurementRequest(data) {
    await delay(500)
    const newRequest = {
      id: String(Date.now()),
      ...data,
      status: 'draft',
      created_by: mockData.user.id
    }
    mockData.procurementRequests.push(newRequest)
    return newRequest
  },

  async approveProcurementRequest(id) {
    await delay(500)
    const idx = mockData.procurementRequests.findIndex(r => r.id === id)
    if (idx !== -1) {
      mockData.procurementRequests[idx].status = 'approved'
      return mockData.procurementRequests[idx]
    }
    throw new Error('Request not found')
  },

  // Reports
  async getMaterialUsageSummary() {
    await delay(500)
    return mockData.materials.map(m => {
      const inv = mockData.inventory.find(i => i.material_id === m.id)
      return {
        ...m,
        current_stock: inv?.quantity_on_hand || 0,
        total_consumed: Math.floor(Math.random() * 100)
      }
    })
  },

  async getABCAnalysis() {
    await delay(500)
    return mockData.materials.map((m, idx) => ({
      ...m,
      total_cost: Math.random() * 100000,
      abc_class: idx < 2 ? 'A' : idx < 4 ? 'B' : 'C'
    })).sort((a, b) => b.total_cost - a.total_cost)
  },

  async getInventoryReport() {
    await delay(500)
    return mockData.materials.map(m => {
      const inv = mockData.inventory.find(i => i.material_id === m.id)
      return {
        ...m,
        quantity_on_hand: inv?.quantity_on_hand || 0,
        quantity_reserved: inv?.quantity_reserved || 0,
        is_low_stock: (inv?.quantity_on_hand || 0) <= m.min_stock
      }
    })
  }
}

export default mockApi
