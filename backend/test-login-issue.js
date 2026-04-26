const authService = require('./src/modules/auth/auth.service');

async function testLogin() {
  try {
    console.log('\n=== Testing Login Flow ===\n');
    
    // Test with different users
    const testEmails = [
      'admin@example.com',
      'testcompany@example.com',
      'candidate@example.com'
    ];
    
    for (const email of testEmails) {
      try {
        console.log(`\nTesting login with: ${email}`);
        
        // Try to login (this will fail with wrong password but we'll see the user data)
        await authService.login(email, 'wrongpassword');
      } catch (error) {
        // Expected to fail, but check the error message
        console.log(`  Error: ${error.message}`);
        
        // If error is password related, user was found
        if (error.message === 'Mot de passe incorrect') {
          console.log('  ✓ User found in database');
        } else if (error.message.includes('pending admin approval')) {
          console.log('  ⚠️ User pending approval');
        } else if (error.message === 'Utilisateur non trouvé') {
          console.log('  ✗ User not found');
        } else {
          console.log('  ❌ Unexpected error');
        }
      }
    }
    
    // Now let's check the database directly to see the user records
    console.log('\n\n=== Checking User Records ===\n');
    
    const pool = require('./src/config/db');
    const [users] = await pool.query(
      "SELECT id_user, nom, email, role, status FROM user LIMIT 5"
    );
    
    console.log('Sample users in database:');
    users.forEach(user => {
      console.log(`  - ${user.nom} (${user.email}): role=${user.role}, status=${user.status}`);
    });
    
    console.log('\n=== Test Complete ===\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testLogin();
