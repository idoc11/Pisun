const express = require('express');
const { pool } = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Material usage summary
router.get('/material-usage', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM material_usage_summary ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get material usage error:', error);
    res.status(500).json({ error: 'Failed to get material usage' });
  }
});

// Inventory report
router.get('/inventory', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id, m.name, m.code, m.category, m.unit_of_measure,
        COALESCE(wi.quantity_on_hand, 0) as quantity_on_hand,
        COALESCE(wi.quantity_reserved, 0) as quantity_reserved,
        m.min_stock, m.max_stock,
        (COALESCE(wi.quantity_on_hand, 0) <= m.min_stock) as is_low_stock
      FROM materials m
      LEFT JOIN warehouse_inventory wi ON m.id = wi.material_id
      WHERE m.is_active = true
      ORDER BY m.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({ error: 'Failed to get inventory report' });
  }
});

// Orders report
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (start_date) {
      query += ' AND order_date >= $' + (params.length + 1);
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND order_date <= $' + (params.length + 1);
      params.push(end_date);
    }

    query += ' ORDER BY order_date DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders report error:', error);
    res.status(500).json({ error: 'Failed to get orders report' });
  }
});

// ABC analysis
router.get('/abc-analysis', authenticateToken, authorizeRole('admin', 'manager', 'director'), async (req, res) => {
  try {
    const result = await pool.query(`
      WITH material_cost AS (
        SELECT 
          m.id, m.name, m.code,
          COALESCE(SUM(mc.quantity_consumed * m.unit_price), 0) as total_cost,
          COALESCE(SUM(mc.quantity_consumed), 0) as total_quantity
        FROM materials m
        LEFT JOIN material_consumption mc ON m.id = mc.material_id
        GROUP BY m.id, m.name, m.code, m.unit_price
      ),
      ranked_materials AS (
        SELECT *,
          SUM(total_cost) OVER (ORDER BY total_cost DESC) as cumulative_cost,
          (SUM(total_cost) OVER ()) as total_all_costs
        FROM material_cost
        WHERE total_cost > 0
      )
      SELECT *,
        CASE 
          WHEN cumulative_cost / total_all_costs <= 0.8 THEN 'A'
          WHEN cumulative_cost / total_all_costs <= 0.95 THEN 'B'
          ELSE 'C'
        END as abc_class
      FROM ranked_materials
      ORDER BY total_cost DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('ABC analysis error:', error);
    res.status(500).json({ error: 'Failed to get ABC analysis' });
  }
});

module.exports = router;
