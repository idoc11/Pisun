const express = require('express');
const { pool } = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status);
    }

    query += ' ORDER BY order_date DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Get order by ID with items
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [req.params.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await pool.query(
      'SELECT oi.*, m.name as material_name FROM order_items oi JOIN materials m ON oi.material_id = m.id WHERE oi.order_id = $1',
      [req.params.id]
    );

    res.json({
      ...orderResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

// Create order
router.post('/', authenticateToken, authorizeRole('admin', 'manager', 'director'), async (req, res) => {
  try {
    const { order_number, customer_name, description, order_date, required_date, items } = req.body;

    if (!order_number || !order_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderResult = await pool.query(
      `INSERT INTO orders (order_number, customer_name, description, order_date, required_date, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft')
       RETURNING *`,
      [order_number, customer_name, description, order_date, required_date, req.user.id]
    );

    const orderId = orderResult.rows[0].id;

    // Add items if provided
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await pool.query(
          `INSERT INTO order_items (order_id, material_id, quantity_required, unit_price, line_total)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, item.material_id, item.quantity_required, item.unit_price, item.line_total]
        );
      }
    }

    res.status(201).json(orderResult.rows[0]);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.patch('/:id/status', authenticateToken, authorizeRole('admin', 'manager', 'director'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = router;
