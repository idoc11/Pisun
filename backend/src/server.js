const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import routes
const authRoutes = require('./routes/auth');
const materialsRoutes = require('./routes/materials');
const suppliersRoutes = require('./routes/suppliers');
const ordersRoutes = require('./routes/orders');
const warehouseRoutes = require('./routes/warehouse');
const procurementRoutes = require('./routes/procurement');
const reportsRoutes = require('./routes/reports');
const usersRoutes = require('./routes/users');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 5000;

// Start server
db.pool.connect().then(() => {
  console.log('Database connected successfully');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

module.exports = app;
