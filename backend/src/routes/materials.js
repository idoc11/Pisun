const express = require('express');
const { pool } = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all materials
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, is_active } = req.query;
    let query = 'SELECT * FROM materials WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }

    if (is_active !== undefined) {
      query += ' AND is_active = $' + (params.length + 1);
      params.push(is_active === 'true');
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ error: 'Failed to get materials' });
  }
});

// Get material by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM materials WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ error: 'Failed to get material' });
  }
});

// Create material
router.post('/', authenticateToken, authorizeRole('admin', 'manager'), async (req, res) => {
  try {
    const { name, code, category, unit_of_measure, min_stock, max_stock, unit_price, preferred_supplier_id, description } = req.body;

    if (!name || !code || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO materials (name, code, category, unit_of_measure, min_stock, max_stock, unit_price, preferred_supplier_id, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, code, category, unit_of_measure || 'шт', min_stock || 0, max_stock || 1000, unit_price, preferred_supplier_id, description]
    );

    // Create warehouse inventory entry
    await pool.query(
      'INSERT INTO warehouse_inventory (material_id, quantity_on_hand) VALUES ($1, 0)',
      [result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create material error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Material code already exists' });
    }
    res.status(500).json({ error: 'Failed to create material' });
  }
});

// Update material
router.put('/:id', authenticateToken, authorizeRole('admin', 'manager'), async (req, res) => {
  try {
    const { name, category, unit_of_measure, min_stock, max_stock, unit_price, preferred_supplier_id, description, is_active } = req.body;

    const result = await pool.query(
      `UPDATE materials
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           unit_of_measure = COALESCE($3, unit_of_measure),
           min_stock = COALESCE($4, min_stock),
           max_stock = COALESCE($5, max_stock),
           unit_price = COALESCE($6, unit_price),
           preferred_supplier_id = COALESCE($7, preferred_supplier_id),
           description = COALESCE($8, description),
           is_active = COALESCE($9, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, category, unit_of_measure, min_stock, max_stock, unit_price, preferred_supplier_id, description, is_active, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ error: 'Failed to update material' });
  }
});

// Delete material
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM materials WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

module.exports = router;
