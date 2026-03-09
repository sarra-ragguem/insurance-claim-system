const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'person_c',
  host: process.env.DB_HOST || 'localhost', // Defaults to localhost if not in Docker
  database: process.env.DB_NAME || 'insurance_db',
  password: process.env.DB_PASSWORD || 'password123',
  port: 5432,
});

module.exports = pool;