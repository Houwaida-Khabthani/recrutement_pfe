const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updateAdminPassword() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pfe_recruitment'
  });

  try {
    // Check current admin password
    console.log('\n🔍 Checking admin user:');
    const [admin] = await connection.query(
      'SELECT id_user, nom, email, role, mot_de_passe FROM user WHERE email = ?',
      ['admin@company.com']
    );
    
    console.log('Current admin:', admin[0]);
    console.log('Password is empty:', !admin[0].mot_de_passe);

    // Hash and update password
    console.log('\n🔄 Updating password...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const [result] = await connection.query(
      'UPDATE user SET mot_de_passe = ?, nom = ? WHERE id_user = ?',
      [hashedPassword, 'Admin User', admin[0].id_user]
    );

    console.log('✅ Admin password updated!');
    console.log('   Email: admin@company.com');
    console.log('   Password: Admin@123');
    console.log('   Role: ADMIN');
    
    // Verify
    const [updated] = await connection.query(
      'SELECT id_user, nom, email, role FROM user WHERE email = ?',
      ['admin@company.com']
    );
    console.log('\n✓ Verified:', updated[0]);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

updateAdminPassword();
