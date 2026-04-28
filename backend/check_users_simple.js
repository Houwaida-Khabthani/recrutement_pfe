const db = require('./src/config/db');

async function checkUsers() {
  try {
    const [rows] = await db.query('SELECT id_user, nom, email, role FROM user LIMIT 10');
    console.log('Available users:');
    rows.forEach(row => {
      console.log(`${row.id_user}: ${row.email} (${row.role}) - ${row.nom}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUsers();