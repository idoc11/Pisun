-- Material Procurement Planning System Database Schema
-- System: "Закупки-ДР" (Material Procurement for "Wooden Solutions")

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'warehouse', 'director');
CREATE TYPE order_status AS ENUM ('draft', 'pending', 'approved', 'sent', 'completed', 'cancelled');
CREATE TYPE material_category AS ENUM ('wood', 'hardware', 'paint', 'fasteners', 'other');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'manager',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  payment_terms TEXT,
  delivery_time_days INT DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Materials table
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  category material_category NOT NULL,
  unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'шт',
  min_stock INT DEFAULT 0,
  max_stock INT DEFAULT 1000,
  unit_price DECIMAL(10, 2),
  preferred_supplier_id UUID REFERENCES suppliers(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouse inventory
CREATE TABLE warehouse_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL UNIQUE REFERENCES materials(id) ON DELETE CASCADE,
  quantity_on_hand INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,
  quantity_available INT GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer orders (from furniture studio)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255),
  description TEXT,
  order_date DATE NOT NULL,
  required_date DATE,
  status order_status DEFAULT 'draft',
  total_cost DECIMAL(12, 2),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order line items (materials needed for order)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id),
  quantity_required INT NOT NULL,
  quantity_used INT DEFAULT 0,
  unit_price DECIMAL(10, 2),
  line_total DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Procurement requests
CREATE TABLE procurement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number VARCHAR(50) UNIQUE NOT NULL,
  status order_status DEFAULT 'draft',
  material_id UUID NOT NULL REFERENCES materials(id),
  quantity_needed INT NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  order_date DATE,
  expected_delivery_date DATE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approval_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase orders to suppliers
CREATE TABLE supplier_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  status order_status DEFAULT 'draft',
  total_amount DECIMAL(12, 2),
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supplier order line items
CREATE TABLE supplier_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_order_id UUID NOT NULL REFERENCES supplier_orders(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id),
  quantity_ordered INT NOT NULL,
  quantity_received INT DEFAULT 0,
  unit_price DECIMAL(10, 2),
  line_total DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouse receipt transactions
CREATE TABLE warehouse_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_order_id UUID REFERENCES supplier_orders(id),
  receipt_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouse receipt items
CREATE TABLE warehouse_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES warehouse_receipts(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id),
  quantity_received INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Material consumption records
CREATE TABLE material_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  material_id UUID NOT NULL REFERENCES materials(id),
  quantity_consumed INT NOT NULL,
  consumption_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  description TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_materials_code ON materials(code);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_by ON orders(created_by);
CREATE INDEX idx_warehouse_inventory_material_id ON warehouse_inventory(material_id);
CREATE INDEX idx_procurement_requests_status ON procurement_requests(status);
CREATE INDEX idx_procurement_requests_supplier ON procurement_requests(supplier_id);
CREATE INDEX idx_supplier_orders_supplier_id ON supplier_orders(supplier_id);
CREATE INDEX idx_supplier_orders_status ON supplier_orders(status);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);

-- Create views for analytics
CREATE VIEW material_usage_summary AS
SELECT
  m.id,
  m.name,
  m.code,
  COALESCE(wi.quantity_on_hand, 0) as current_stock,
  COALESCE(SUM(mc.quantity_consumed), 0) as total_consumed,
  m.min_stock,
  m.max_stock
FROM materials m
LEFT JOIN warehouse_inventory wi ON m.id = wi.material_id
LEFT JOIN material_consumption mc ON m.id = mc.material_id
GROUP BY m.id, m.name, m.code, wi.quantity_on_hand, m.min_stock, m.max_stock;

CREATE VIEW critical_materials AS
SELECT
  m.id,
  m.name,
  m.code,
  COALESCE(wi.quantity_on_hand, 0) as current_stock,
  m.min_stock
FROM materials m
LEFT JOIN warehouse_inventory wi ON m.id = wi.material_id
WHERE COALESCE(wi.quantity_on_hand, 0) <= m.min_stock
AND m.is_active = true;

CREATE VIEW supplier_order_summary AS
SELECT
  so.id,
  so.order_number,
  s.name as supplier_name,
  so.status,
  COUNT(soi.id) as item_count,
  so.total_amount,
  so.order_date,
  so.expected_delivery_date
FROM supplier_orders so
JOIN suppliers s ON so.supplier_id = s.id
LEFT JOIN supplier_order_items soi ON so.id = soi.supplier_order_id
GROUP BY so.id, so.order_number, s.name, so.status, so.total_amount, so.order_date, so.expected_delivery_date;
