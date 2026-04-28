const pool = require('./src/config/db');

async function checkUsers() {
  try {
    const [rows] = await pool.query('SELECT id, email, role FROM users LIMIT 10');
    console.log('All users:', rows);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();