const express = require('express');
const { pool } = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all suppliers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { is_active } = req.query;
    let query = 'SELECT * FROM suppliers WHERE 1=1';
    const params = [];

    if (is_active !== undefined) {
      query += ' AND is_active = $' + (params.length + 1);
      params.push(is_active === 'true');
    }

    query += ' ORDER BY name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ error: 'Failed to get suppliers' });
  }
});

// Get supplier by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM suppliers WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ error: 'Failed to get supplier' });
  }
});

// Create supplier
router.post('/', authenticateToken, authorizeRole('admin', 'manager'), async (req, res) => {
  try {
    const { name, contact_person, email, phone, address, city, country, payment_terms, delivery_time_days, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }

    const result = await pool.query(
      `INSERT INTO suppliers (name, contact_person, email, phone, address, city, country, payment_terms, delivery_time_days, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, contact_person, email, phone, address, city, country, payment_terms, delivery_time_days || 7, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// Update supplier
router.put('/:id', authenticateToken, authorizeRole('admin', 'manager'), async (req, res) => {
  try {
    const { name, contact_person, email, phone, address, city, country, payment_terms, delivery_time_days, is_active, notes } = req.body;

    const result = await pool.query(
      `UPDATE suppliers
       SET name = COALESCE($1, name),
           contact_person = COALESCE($2, contact_person),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           address = COALESCE($5, address),
           city = COALESCE($6, city),
           country = COALESCE($7, country),
           payment_terms = COALESCE($8, payment_terms),
           delivery_time_days = COALESCE($9, delivery_time_days),
           is_active = COALESCE($10, is_active),
           notes = COALESCE($11, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [name, contact_person, email, phone, address, city, country, payment_terms, delivery_time_days, is_active, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

module.exports = router;
