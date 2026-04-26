require('dotenv').config();
const db = require('./src/config/db');

async function checkJobData() {
  try {
    const [rows] = await db.query(
      'SELECT id_offre, titre, date_expiration, DATE_FORMAT(date_expiration, "%Y-%m-%d") as formatted_date FROM offre WHERE id_offre = 6'
    );
    
    if (rows.length > 0) {
      console.log('Raw value:', JSON.stringify(rows[0], null, 2));
      console.log('date_expiration type:', typeof rows[0].date_expiration);
      console.log('date_expiration value:', rows[0].date_expiration);
      console.log('formatted_date:', rows[0].formatted_date);
    } else {
      console.log('No job found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkJobData();
