const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkCompanies() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const [rows] = await conn.query(
    'SELECT u.email, c.nom, c.statut FROM user u JOIN company c ON u.id_user = c.id_user WHERE u.role = "ENTREPRISE"'
  );

  console.log('Company users:');
  console.log(rows);

  conn.end();
}

checkCompanies();