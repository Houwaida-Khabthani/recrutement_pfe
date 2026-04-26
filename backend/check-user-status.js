const pool = require('./src/config/db');

async function checkUserStatus() {
  try {
    console.log('\n=== Checking User Status Column ===\n');
    
    // Check if status column exists
    const [columns] = await pool.query(
      "SHOW COLUMNS FROM user WHERE Field = 'status'"
    );
    
    if (columns.length === 0) {
      console.log('❌ Status column does NOT exist in user table!');
      console.log('Run migration first: migrate-add-user-status.sql');
      process.exit(1);
    }
    
    console.log('✓ Status column exists');
    
    // Check all users
    const [users] = await pool.query(
      "SELECT id_user, nom, email, role, status, is_verified FROM user ORDER BY id_user"
    );
    
    console.log(`\nTotal users: ${users.length}\n`);
    
    let statusIssues = 0;
    let nullStatuses = 0;
    
    users.forEach(user => {
      const statusCheck = user.status ? '✓' : '✗ (NULL)';
      console.log(`[${user.id_user}] ${user.email} - role=${user.role}, status=${user.status || 'NULL'} ${statusCheck}`);
      
      if (!user.status) {
        nullStatuses++;
      }
    });
    
    if (nullStatuses > 0) {
      console.log(`\n⚠️ Found ${nullStatuses} users with NULL status!`);
      console.log('Fixing NULL statuses...\n');
      
      // Fix company users with NULL status to 'pending'
      await pool.query(
        "UPDATE user SET status = 'pending' WHERE status IS NULL AND role = 'ENTREPRISE'"
      );
      
      // Fix candidate/admin users with NULL status to 'approved'
      await pool.query(
        "UPDATE user SET status = 'approved' WHERE status IS NULL AND role IN ('CANDIDAT', 'ADMIN')"
      );
      
      console.log('✓ Fixed NULL statuses');
      
      // Verify
      const [fixedUsers] = await pool.query(
        "SELECT COUNT(*) as nullCount FROM user WHERE status IS NULL"
      );
      
      console.log(`\n✓ Remaining NULL statuses: ${fixedUsers[0].nullCount}`);
    }
    
    console.log('\n=== Check Complete ===\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkUserStatus();
