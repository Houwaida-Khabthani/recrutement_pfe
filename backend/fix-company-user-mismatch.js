const pool = require('./src/config/db');

async function fixCompanyUserStatusMismatch() {
  try {
    console.log('\n=== Fixing Company & User Status Mismatches ===\n');
    
    // Get all companies with approved status but pending user status
    const [mismatches] = await pool.query(
      `SELECT c.id_company, c.nom, c.status, c.id_user, u.email, u.status as user_status
       FROM company c
       LEFT JOIN user u ON c.id_user = u.id_user
       WHERE c.status = 'approved' AND u.status != 'approved' AND c.id_user IS NOT NULL`
    );
    
    console.log(`Found ${mismatches.length} mismatches to fix:\n`);
    
    mismatches.forEach((m, idx) => {
      console.log(`${idx + 1}. ${m.nom} (${m.email})`);
      console.log(`   Company status: ${m.status}`);
      console.log(`   User status: ${m.user_status}`);
    });
    
    if (mismatches.length === 0) {
      console.log('✓ No mismatches found - all approved companies have approved users!');
      process.exit(0);
    }
    
    // Fix: Update all mismatched users to 'approved'
    console.log(`\n\nFixing ${mismatches.length} user records...\n`);
    
    for (const mismatch of mismatches) {
      const [result] = await pool.query(
        "UPDATE user SET status = 'approved' WHERE id_user = ?",
        [mismatch.id_user]
      );
      
      console.log(`✓ Updated ${mismatch.nom}: user status → approved`);
    }
    
    // Verify the fix
    console.log('\n\nVerifying fix...\n');
    const [afterFix] = await pool.query(
      `SELECT c.id_company, c.nom, c.status, u.status as user_status
       FROM company c
       LEFT JOIN user u ON c.id_user = u.id_user
       WHERE c.status = 'approved' AND c.id_user IS NOT NULL`
    );
    
    const stillMismatched = afterFix.filter(row => row.user_status !== 'approved');
    
    if (stillMismatched.length === 0) {
      console.log('✓ All mismatches fixed!');
      console.log(`✓ ${afterFix.length} approved companies now have approved users\n`);
    } else {
      console.log(`⚠️ Still ${stillMismatched.length} mismatches found`);
    }
    
    console.log('=== Fix Complete ===\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
}

fixCompanyUserStatusMismatch();
