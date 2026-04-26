const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pfe_recruitment'
  });

  // Check offre table
  const [offreColumns] = await conn.query('DESCRIBE offre');
  console.log('offre table columns:');
  console.log(offreColumns.map(col => col.Field));

  // Check candidature table
  const [candidatureColumns] = await conn.query('DESCRIBE candidature');
  console.log('\ncandidature table columns:');
  console.log(candidatureColumns.map(col => col.Field));

  // Check if there's data
  const [offreCount] = await conn.query('SELECT COUNT(*) as count FROM offre');
  console.log('\nOffre count:', offreCount[0].count);

  const [candidatureCount] = await conn.query('SELECT COUNT(*) as count FROM candidature');
  console.log('Candidature count:', candidatureCount[0].count);

  conn.end();
}

checkTables();