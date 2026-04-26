const mysql = require('mysql2/promise');

async function setupAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pfe_recruitment'
  });

  try {
    // Check table structure
    console.log('\n📋 User table structure:');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'user'
    `);
    console.table(columns);

    // Check existing admin
    console.log('\n🔍 Checking for admin@company.com:');
    const [existing] = await connection.query(
      'SELECT id_user, nom, email, role FROM user WHERE email = ?',
      ['admin@company.com']
    );
    
    if (existing.length > 0) {
      console.log('✅ Admin already exists:', existing[0]);
      return;
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Insert admin user with correct field names
    console.log('\n➕ Creating admin user...');
    const [result] = await connection.query(
      `INSERT INTO user (nom, email, mot_de_passe, role) 
       VALUES (?, ?, ?, ?)`,
      ['Admin User', 'admin@company.com', hashedPassword, 'ADMIN']
    );

    console.log('✅ Admin user created successfully!');
    console.log('   ID:', result.insertId);
    console.log('   Email: admin@company.com');
    console.log('   Password: Admin@123');
    console.log('   Role: ADMIN');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

setupAdmin();
