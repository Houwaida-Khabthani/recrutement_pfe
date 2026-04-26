const authService = require('./src/modules/auth/auth.service');
const pool = require('./src/config/db');

async function testApprovedCompanyLogins() {
  try {
    console.log('\n=== Testing Login for Approved Companies ===\n');
    
    const testEmails = ['aeros@gmail.com', 'clubafrican@test.com', 'beja@gmail.com'];
    
    for (const email of testEmails) {
      console.log(`Testing login: ${email}`);
      
      // Get user to verify status
      const [users] = await pool.query(
        "SELECT id_user, nom, email, role, status FROM user WHERE email = ?",
        [email]
      );
      
      if (users.length === 0) {
        console.log('  ✗ User not found\n');
        continue;
      }
      
      const user = users[0];
      console.log(`  - Name: ${user.nom}`);
      console.log(`  - Role: ${user.role}`);
      console.log(`  - Status: ${user.status}`);
      
      // Try to login (we'll assume password 'password123' for testing)
      try {
        const result = await authService.login(email, 'password123');
        console.log(`  ✓ Login check would PASS\n`);
      } catch (error) {
        if (error.message === 'Mot de passe incorrect') {
          // Password is wrong, but status check passed
          console.log(`  ✓ Status check would PASS (password check fails - expected)\n`);
        } else if (error.message === 'Your account is pending admin approval') {
          console.log(`  ❌ ERROR: User still can't login - status mismatch!\n`);
        } else {
          console.log(`  ❌ ERROR: ${error.message}\n`);
        }
      }
    }
    
    // Summary
    console.log('\n=== Summary ===\n');
    const [summary] = await pool.query(
      `SELECT c.nom, c.status, u.email, u.status as user_status
       FROM company c
       LEFT JOIN user u ON c.id_user = u.id_user
       WHERE c.status = 'approved' AND u.role = 'ENTREPRISE'`
    );
    
    console.log(`Approved companies with correct user status: ${summary.length}`);
    summary.forEach(row => {
      const match = row.status === row.user_status ? '✓' : '✗';
      console.log(`  ${match} ${row.nom} (${row.email}): company=${row.status}, user=${row.user_status}`);
    });
    
    console.log('\n=== Test Complete ===\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
}

testApprovedCompanyLogins();
