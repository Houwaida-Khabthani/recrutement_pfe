const authService = require('./src/modules/auth/auth.service');
const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

async function createTestUserAndLogin() {
  try {
    console.log('\n=== Creating Test User & Testing Login ===\n');
    
    // 1. Create a test candidate user
    console.log('1. Creating test candidate user...');
    const testEmail = `test-candidate-${Date.now()}@example.com`;
    const testPassword = 'testPassword123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const [result] = await pool.query(
      `INSERT INTO user (nom, email, mot_de_passe, role, status) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Test Candidate', testEmail, hashedPassword, 'CANDIDAT', 'approved']
    );
    
    const userId = result.insertId;
    console.log(`   ✓ Created test user: ${testEmail}`);
    console.log(`   - User ID: ${userId}`);
    console.log(`   - Password: ${testPassword}`);
    
    // 2. Test login with correct password
    console.log('\n2. Testing login with correct password...');
    try {
      const user = await authService.login(testEmail, testPassword);
      console.log('   ✓ Login successful!');
      console.log(`   - User: ${user.nom}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Status: ${user.status}`);
    } catch (error) {
      console.log(`   ✗ Error: ${error.message}`);
    }
    
    // 3. Test login with wrong password
    console.log('\n3. Testing login with wrong password...');
    try {
      await authService.login(testEmail, 'wrongPassword');
    } catch (error) {
      if (error.message === 'Mot de passe incorrect') {
        console.log('   ✓ Correctly rejected wrong password');
      } else {
        console.log(`   ✗ Unexpected error: ${error.message}`);
      }
    }
    
    // 4. Create a test company user
    console.log('\n4. Creating test company user (pending)...');
    const testCompanyEmail = `test-company-${Date.now()}@example.com`;
    const companyPassword = 'companyPass123';
    const companyHashedPassword = await bcrypt.hash(companyPassword, 10);
    
    const [companyResult] = await pool.query(
      `INSERT INTO user (nom, email, mot_de_passe, role, status) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Test Company', testCompanyEmail, companyHashedPassword, 'ENTREPRISE', 'pending']
    );
    
    console.log(`   ✓ Created pending company: ${testCompanyEmail}`);
    
    // 5. Try to login with pending company
    console.log('\n5. Testing login with pending company...');
    try {
      await authService.login(testCompanyEmail, companyPassword);
    } catch (error) {
      if (error.message === 'Your account is pending admin approval') {
        console.log('   ✓ Correctly blocked pending company');
      } else {
        console.log(`   ✗ Unexpected error: ${error.message}`);
      }
    }
    
    // 6. Approve the company and try again
    console.log('\n6. Approving company and testing login...');
    await pool.query(
      "UPDATE user SET status = 'approved' WHERE email = ?",
      [testCompanyEmail]
    );
    
    try {
      const user = await authService.login(testCompanyEmail, companyPassword);
      console.log('   ✓ Approved company can now login!');
      console.log(`   - User: ${user.nom}`);
      console.log(`   - Status: ${user.status}`);
    } catch (error) {
      console.log(`   ✗ Error: ${error.message}`);
    }
    
    console.log('\n=== All Tests Complete ===\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createTestUserAndLogin();
