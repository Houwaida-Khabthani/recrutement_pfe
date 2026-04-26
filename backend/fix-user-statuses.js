const pool = require('./src/config/db');

async function fixUserStatuses() {
  try {
    console.log('\n=== Fixing User Statuses ===\n');
    
    // Fix candidates and admins - they should be 'approved'
    const [result1] = await pool.query(
      "UPDATE user SET status = 'approved' WHERE role IN ('CANDIDAT', 'ADMIN')"
    );
    
    console.log(`✓ Updated ${result1.affectedRows} candidates/admins to 'approved'`);
    
    // Keep only companies as 'pending'
    const [companyPending] = await pool.query(
      "SELECT COUNT(*) as count FROM user WHERE role = 'ENTREPRISE' AND status = 'pending'"
    );
    
    const [companyApproved] = await pool.query(
      "SELECT COUNT(*) as count FROM user WHERE role = 'ENTREPRISE' AND status = 'approved'"
    );
    
    console.log(`\nCompany users:`);
    console.log(`  - Pending: ${companyPending[0].count}`);
    console.log(`  - Approved: ${companyApproved[0].count}`);
    
    console.log('\n=== Fix Complete ===\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
}

fixUserStatuses();
