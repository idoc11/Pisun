const express = require('express');
const { pool } = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get warehouse inventory
router.get('/inventory', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT wi.*, m.name, m.code, m.unit_of_measure, m.min_stock, m.max_stock
      FROM warehouse_inventory wi
      JOIN materials m ON wi.material_id = m.id
      ORDER BY m.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to get inventory' });
  }
});

// Get critical materials (low stock)
router.get('/critical-materials', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM critical_materials');
    res.json(result.rows);
  } catch (error) {
    console.error('Get critical materials error:', error);
    res.status(500).json({ error: 'Failed to get critical materials' });
  }
});

// Record receipt
router.post('/receipt', authenticateToken, authorizeRole('admin', 'warehouse'), async (req, res) => {
  try {
    const { receipt_number, supplier_order_id, receipt_date, items, notes } = req.body;

    if (!receipt_number || !receipt_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const receiptResult = await pool.query(
      `INSERT INTO warehouse_receipts (receipt_number, supplier_order_id, receipt_date, created_by, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [receipt_number, supplier_order_id, receipt_date, req.user.id, notes]
    );

    const receiptId = receiptResult.rows[0].id;

    // Process items
    if (items && Array.isArray(items)) {
      for (const item of items) {
        // Add receipt item
        await pool.query(
          `INSERT INTO warehouse_receipt_items (receipt_id, material_id, quantity_received)
           VALUES ($1, $2, $3)`,
          [receiptId, item.material_id, item.quantity_received]
        );

        // Update warehouse inventory
        await pool.query(
          `UPDATE warehouse_inventory
           SET quantity_on_hand = quantity_on_hand + $1
           WHERE material_id = $2`,
          [item.quantity_received, item.material_id]
        );
      }
    }

    res.status(201).json(receiptResult.rows[0]);
  } catch (error) {
    console.error('Create receipt error:', error);
    res.status(500).json({ error: 'Failed to create receipt' });
  }
});

module.exports = router;
