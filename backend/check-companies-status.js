const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkCompanies() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pfe_recruitment'
  });

  const [rows] = await conn.query(`
    SELECT c.id_company, c.nom, c.statut, u.email, u.role
    FROM company c
    JOIN user u ON c.id_user = u.id_user
    WHERE u.role = "ENTREPRISE"
  `);

  console.log('Company users:');
  rows.forEach(row => {
    console.log(`${row.id_company}: ${row.nom} - ${row.email} - Status: ${row.statut}`);
  });

  conn.end();
}

checkCompanies();