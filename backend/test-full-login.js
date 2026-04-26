const authService = require('./src/modules/auth/auth.service');
const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

async function testFullLoginFlow() {
  try {
    console.log('\n=== Testing Full Login Flow ===\n');
    
    // 1. Check we have test data
    console.log('1. Checking test users...');
    const [users] = await pool.query(
      "SELECT id_user, email, role, status FROM user ORDER BY id_user DESC LIMIT 5"
    );
    
    if (users.length === 0) {
      console.log('   ✗ No users in database');
      process.exit(1);
    }
    
    console.log(`   ✓ Found ${users.length} users\n`);
    
    // 2. Get a candidate and admin user to test
    const [candidateUsers] = await pool.query(
      "SELECT id_user, email, mot_de_passe FROM user WHERE role = 'CANDIDAT' LIMIT 1"
    );
    
    const [adminUsers] = await pool.query(
      "SELECT id_user, email, mot_de_passe FROM user WHERE role = 'ADMIN' LIMIT 1"
    );
    
    const [companyUsers] = await pool.query(
      "SELECT id_user, email, mot_de_passe FROM user WHERE role = 'ENTREPRISE' AND status = 'approved' LIMIT 1"
    );
    
    // 3. Test candidate login
    if (candidateUsers.length > 0) {
      console.log('2. Testing candidate login...');
      const candidate = candidateUsers[0];
      console.log(`   Email: ${candidate.email}`);
      
      // We don't know the password, but we can check if the user exists
      try {
        // Try with common test passwords
        for (const pwd of ['password123', 'password', 'test123', '12345678']) {
          try {
            const user = await authService.login(candidate.email, pwd);
            console.log(`   ✓ Login successful with password: ${pwd}`);
            break;
          } catch (e) {
            if (e.message === 'Mot de passe incorrect') {
              // Password is wrong, but user exists
              continue;
            }
            throw e;
          }
        }
      } catch (error) {
        if (error.message === 'Mot de passe incorrect') {
          console.log('   ⚠️ User exists but password is incorrect');
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
    }
    
    // 4. Test company login
    if (companyUsers.length > 0) {
      console.log('\n3. Testing approved company login...');
      const company = companyUsers[0];
      console.log(`   Email: ${company.email}`);
      
      try {
        for (const pwd of ['password123', 'password', 'test123', '12345678']) {
          try {
            const user = await authService.login(company.email, pwd);
            console.log(`   ✓ Approved company can login!`);
            break;
          } catch (e) {
            if (e.message === 'Mot de passe incorrect') {
              continue;
            }
            throw e;
          }
        }
      } catch (error) {
        if (error.message === 'Mot de passe incorrect') {
          console.log('   ⚠️ User exists but password is incorrect');
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
    }
    
    // 5. Check status distribution
    console.log('\n4. User status distribution:');
    const [statusReport] = await pool.query(`
      SELECT role, status, COUNT(*) as count 
      FROM user 
      GROUP BY role, status 
      ORDER BY role, status
    `);
    
    statusReport.forEach(row => {
      console.log(`   ${row.role} / ${row.status}: ${row.count} users`);
    });
    
    console.log('\n=== Test Complete ===\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testFullLoginFlow();
