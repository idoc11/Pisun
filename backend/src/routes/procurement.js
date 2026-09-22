const express = require('express');
const { pool } = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all procurement requests
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT pr.*, m.name as material_name, s.name as supplier_name, u.full_name as created_by_name
      FROM procurement_requests pr
      JOIN materials m ON pr.material_id = m.id
      JOIN users u ON pr.created_by = u.id
      LEFT JOIN suppliers s ON pr.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND pr.status = $' + (params.length + 1);
      params.push(status);
    }

    query += ' ORDER BY pr.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Create procurement request
router.post('/requests', authenticateToken, authorizeRole('admin', 'manager'), async (req, res) => {
  try {
    const { request_number, material_id, quantity_needed, supplier_id, order_date, expected_delivery_date, notes } = req.body;

    if (!request_number || !material_id || !quantity_needed) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO procurement_requests (request_number, material_id, quantity_needed, supplier_id, order_date, expected_delivery_date, notes, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft')
       RETURNING *`,
      [request_number, material_id, quantity_needed, supplier_id, order_date, expected_delivery_date, notes, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Approve procurement request
router.patch('/requests/:id/approve', authenticateToken, authorizeRole('admin', 'director'), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE procurement_requests
       SET status = 'approved', approved_by = $1, approval_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [req.user.id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

module.exports = router;
