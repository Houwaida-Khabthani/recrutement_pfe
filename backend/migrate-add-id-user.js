const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  });

  try {
    console.log('🔄 Checking if id_user column exists...');
    
    // Check if column already exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'company' AND COLUMN_NAME = 'id_user' AND TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );

    if (columns.length > 0) {
      console.log('✅ id_user column already exists');
      return;
    }

    console.log('📝 Adding id_user column to company table...');
    
    // Add the column
    await connection.query(`
      ALTER TABLE company ADD COLUMN id_user INT AFTER telephone
    `);
    
    console.log('✅ Successfully added id_user column');
    
    // Try to associate existing companies with admin/first user
    console.log('🔗 Linking companies to users...');
    
    const [companies] = await connection.query(`
      SELECT id_company FROM company WHERE id_user IS NULL LIMIT 1
    `);
    
    if (companies.length > 0) {
      const [users] = await connection.query(`
        SELECT id_user FROM user WHERE role = 'ENTREPRISE' LIMIT 1
      `);
      
      if (users.length > 0) {
        await connection.query(`
          UPDATE company SET id_user = ? WHERE id_user IS NULL
        `, [users[0].id_user]);
        console.log('✅ Linked companies to users');
      } else {
        console.log('⚠️  No company users found to link');
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
