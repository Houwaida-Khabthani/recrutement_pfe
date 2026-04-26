const mysql = require('mysql2/promise');

async function checkOffreTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pfe_recruitment'
  });

  try {
    console.log('\n📋 Offre table structure:');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'offre'
      ORDER BY ORDINAL_POSITION
    `);
    console.table(columns.map(c => ({
      column: c.COLUMN_NAME,
      type: c.COLUMN_TYPE,
      nullable: c.IS_NULLABLE
    })));

    console.log('\n📊 Sample offre data:');
    const [data] = await connection.query('SELECT * FROM offre LIMIT 1');
    if (data.length > 0) {
      console.log('Columns in first row:', Object.keys(data[0]));
    } else {
      console.log('No data in offre table');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkOffreTable();
