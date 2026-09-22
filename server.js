// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path'); 

// Initialize the Express application
const app = express();
const port = process.env.PORT || 5000;

// Middleware configuration
app.use(cors()); // Allows frontend to make requests to this backend
app.use(express.json()); // Allows parsing JSON data

// Configure PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for securely connecting to Neon
  }
});

// Endpoint 1: Get unique presidents and their political parties
app.get('/api/presidents', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT president_name, party 
      FROM economy_metrics 
      ORDER BY president_name;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Database query error:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Endpoint 2: Get full historical time series
app.get('/api/metrics/historical', async (req, res) => {
  try {
    const query = `
      SELECT 
        e.date, e.inflation, e.unemployment, e.gdp_growth, 
        e.president_name, e.party, e.debt_gdp, e.fed_funds_rate,
        m.sp500_close
      FROM economy_metrics e
      LEFT JOIN market_metrics m ON e.date = m.date
      ORDER BY e.date ASC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Database query error:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Endpoint 3: Calculate the "Delta Effect" (Performance summary per president)
app.get('/api/metrics/summary/:president', async (req, res) => {
  try {
    const presidentName = decodeURIComponent(req.params.president);
    
    const query = `
      WITH MandateEdges AS (
        SELECT 
          MIN(date) as start_date,
          MAX(date) as end_date
        FROM economy_metrics
        WHERE president_name = $1
      )
      SELECT 
        start_date, end_date,
        (SELECT inflation FROM economy_metrics WHERE date = start_date AND president_name = $1 LIMIT 1) as inflation_start,
        (SELECT inflation FROM economy_metrics WHERE date = end_date AND president_name = $1 LIMIT 1) as inflation_end,
        (SELECT unemployment FROM economy_metrics WHERE date = start_date AND president_name = $1 LIMIT 1) as unemployment_start,
        (SELECT unemployment FROM economy_metrics WHERE date = end_date AND president_name = $1 LIMIT 1) as unemployment_end,
        (SELECT gdp_growth FROM economy_metrics WHERE date = start_date AND president_name = $1 LIMIT 1) as gdp_start,
        (SELECT gdp_growth FROM economy_metrics WHERE date = end_date AND president_name = $1 LIMIT 1) as gdp_end,
        (SELECT debt_gdp FROM economy_metrics WHERE date = start_date AND president_name = $1 LIMIT 1) as debt_start,
        (SELECT debt_gdp FROM economy_metrics WHERE date = end_date AND president_name = $1 LIMIT 1) as debt_end
      FROM MandateEdges;
    `;
    
    const result = await pool.query(query, [presidentName]);
    
    if (result.rows.length === 0 || !result.rows[0].start_date) {
      return res.status(404).json({ error: 'President not found or no data available' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database query error:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// --- FRONTEND / BACKEND INTEGRATION (STEP 5.1) ---

// 1. Serve static files from the React 'dist' folder
app.use(express.static(path.join(__dirname, 'client/dist')));

// 2. Catch-all route to serve the React frontend for any non-API request (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

// -------------------------------------------------

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});