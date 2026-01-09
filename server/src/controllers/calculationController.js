const { pool } = require('../db/pool');
const { validationResult } = require('express-validator');

const createCalculation = async (req, res) => {
  try {
    console.log('📊 Create calculation request');
    console.log('User:', req.user ? `ID ${req.user.id}` : 'Guest');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      glucose_volume,
      glucose_concentration,
      amino_acids_volume,
      amino_acids_concentration,
      lipids_volume,
      lipids_concentration,
      glucose_grams,
      glucose_calories,
      amino_acids_grams,
      amino_acids_calories,
      lipids_grams,
      lipids_calories,
      total_calories,
      total_volume,
    } = req.body;

    // For guest users, user_id will be null
    const userId = req.user ? req.user.id : null;
    console.log(`💾 Saving calculation for user_id: ${userId || 'NULL (guest)'}`);

    const result = await pool.query(
      `INSERT INTO calculations (
        user_id, glucose_volume, glucose_concentration,
        amino_acids_volume, amino_acids_concentration,
        lipids_volume, lipids_concentration,
        glucose_grams, glucose_calories,
        amino_acids_grams, amino_acids_calories,
        lipids_grams, lipids_calories,
        total_calories, total_volume
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        userId,
        glucose_volume,
        glucose_concentration,
        amino_acids_volume,
        amino_acids_concentration,
        lipids_volume,
        lipids_concentration,
        glucose_grams,
        glucose_calories,
        amino_acids_grams,
        amino_acids_calories,
        lipids_grams,
        lipids_calories,
        total_calories,
        total_volume,
      ]
    );

    console.log('✅ Calculation saved:', result.rows[0].id);
    
    res.status(201).json({
      message: userId ? 'Calculation saved successfully' : 'Calculation processed (not saved - guest mode)',
      calculation: result.rows[0],
      isGuest: !userId,
    });
  } catch (error) {
    console.error('❌ Create calculation error:', error);
    res.status(500).json({ error: 'Failed to save calculation', details: error.message });
  }
};

const getCalculations = async (req, res) => {
  try {
    console.log('📋 Get calculations request');
    console.log('User:', req.user ? `ID ${req.user.id}` : 'Guest');
    
    // Guest users cannot retrieve history
    if (!req.user) {
      console.log('⚠️  Guest user - returning empty history');
      return res.json({ 
        calculations: [],
        message: 'Login to save and view calculation history'
      });
    }

    console.log(`🔍 Fetching calculations for user_id: ${req.user.id}`);
    
    const result = await pool.query(
      `SELECT * FROM calculations 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [req.user.id]
    );
    
    console.log(`✅ Found ${result.rows.length} calculations`);
    
    if (result.rows.length > 0) {
      console.log('📅 Sample timestamp from DB:', result.rows[0].created_at, 'Type:', typeof result.rows[0].created_at);
    }

    // Transform database rows to match frontend format
    const calculations = result.rows.map((row) => ({
      id: row.id.toString(),
      timestamp: row.created_at ? row.created_at.toISOString() : new Date().toISOString(),
      input: {
        glucose: {
          volume: parseFloat(row.glucose_volume),
          concentration: parseFloat(row.glucose_concentration),
        },
        aminoAcids: {
          volume: parseFloat(row.amino_acids_volume),
          concentration: parseFloat(row.amino_acids_concentration),
        },
        lipids: {
          volume: parseFloat(row.lipids_volume),
          concentration: parseFloat(row.lipids_concentration),
        },
      },
      result: {
        glucose: {
          grams: parseFloat(row.glucose_grams),
          calories: parseFloat(row.glucose_calories),
        },
        aminoAcids: {
          grams: parseFloat(row.amino_acids_grams),
          calories: parseFloat(row.amino_acids_calories),
        },
        lipids: {
          grams: parseFloat(row.lipids_grams),
          calories: parseFloat(row.lipids_calories),
        },
        total: {
          calories: parseFloat(row.total_calories),
          volume: parseFloat(row.total_volume),
        },
      },
    }));

    res.json({ calculations });
  } catch (error) {
    console.error('Get calculations error:', error);
    res.status(500).json({ error: 'Failed to get calculations' });
  }
};

const deleteCalculation = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify calculation belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM calculations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Calculation not found' });
    }

    await pool.query('DELETE FROM calculations WHERE id = $1 AND user_id = $2', [
      id,
      req.user.id,
    ]);

    res.json({ message: 'Calculation deleted successfully' });
  } catch (error) {
    console.error('Delete calculation error:', error);
    res.status(500).json({ error: 'Failed to delete calculation' });
  }
};

const clearCalculations = async (req, res) => {
  try {
    await pool.query('DELETE FROM calculations WHERE user_id = $1', [req.user.id]);

    res.json({ message: 'All calculations cleared successfully' });
  } catch (error) {
    console.error('Clear calculations error:', error);
    res.status(500).json({ error: 'Failed to clear calculations' });
  }
};

module.exports = {
  createCalculation,
  getCalculations,
  deleteCalculation,
  clearCalculations,
};
