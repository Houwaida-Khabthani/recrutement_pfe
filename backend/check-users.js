const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pfe_recruitment'
  });

  // Check user table columns
  const [userColumns] = await conn.query('DESCRIBE user');
  console.log('user table columns:');
  console.log(userColumns.map(col => col.Field));

  // Check company users
  const [rows] = await conn.query(`
    SELECT u.id_user, u.nom, u.email, u.role, u.status, c.nom as company_name
    FROM user u
    LEFT JOIN company c ON u.id_user = c.id_user
    WHERE u.role = "ENTREPRISE"
  `);

  console.log('\nCompany users:');
  rows.forEach(row => {
    console.log(`${row.id_user}: ${row.nom} - ${row.email} - Status: ${row.status} - Company: ${row.company_name}`);
  });

  conn.end();
}

checkUsers();