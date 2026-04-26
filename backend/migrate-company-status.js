const mysql = require('mysql2/promise');

async function addStatusColumn() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pfe_recruitment'
  });

  try {
    // Add status column to company table
    await pool.query(`
      ALTER TABLE company 
      ADD COLUMN IF NOT EXISTS status ENUM('pending', 'approved', 'rejected') 
      DEFAULT 'pending'
    `);

    console.log('✅ Status column added to company table');

    // Verify column exists
    const [columns] = await pool.query('DESCRIBE company');
    const hasStatus = columns.some(col => col.Field === 'status');
    console.log('✅ Status column verified:', hasStatus ? 'EXISTS' : 'MISSING');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addStatusColumn();
