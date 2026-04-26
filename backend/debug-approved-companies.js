const pool = require('./src/config/db');

async function debugApprovedCompanies() {
  try {
    console.log('\n=== Debugging Approved Companies ===\n');
    
    // 1. Check which companies are approved
    console.log('1. Checking approved companies in database:\n');
    const [approvedCompanies] = await pool.query(
      "SELECT c.id_company, c.nom, c.email, c.status, c.id_user, u.email as user_email, u.status as user_status, u.role FROM company c LEFT JOIN user u ON c.id_user = u.id_user WHERE c.status = 'approved'"
    );
    
    if (approvedCompanies.length === 0) {
      console.log('   ✗ No approved companies found');
    } else {
      approvedCompanies.forEach((company, index) => {
        console.log(`${index + 1}. Company: ${company.nom}`);
        console.log(`   - Company email: ${company.email}`);
        console.log(`   - Company status: ${company.status}`);
        console.log(`   - Link to user ID: ${company.id_user || 'NULL'}`);
        
        if (company.id_user) {
          console.log(`   - User email: ${company.user_email}`);
          console.log(`   - User status: ${company.user_status || 'NULL'}`);
          console.log(`   - User role: ${company.user_role}`);
          
          if (company.user_status !== 'approved') {
            console.log(`   ⚠️ MISMATCH: Company approved but user NOT approved!`);
          }
        } else {
          console.log(`   ❌ ERROR: Company not linked to any user!`);
        }
        console.log();
      });
    }
    
    // 2. Check users with company email trying to login
    console.log('\n2. Checking users by company email:\n');
    const [usersByEmail] = await pool.query(
      "SELECT id_user, nom, email, role, status FROM user WHERE email IN ('aeros@gmail.com', 'clubafrican@test.com')"
    );
    
    usersByEmail.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log(`  - User ID: ${user.id_user}`);
      console.log(`  - Name: ${user.nom}`);
      console.log(`  - Role: ${user.role}`);
      console.log(`  - Status: ${user.status}`);
      
      if (user.role === 'ENTREPRISE' && user.status !== 'approved') {
        console.log(`  ❌ ERROR: Company user NOT approved - login will fail!`);
      }
      console.log();
    });
    
    // 3. Check if there are duplicate company/user records
    console.log('\n3. Checking for duplicate records:\n');
    const [duplicates] = await pool.query(
      "SELECT email, COUNT(*) as count FROM user GROUP BY email HAVING count > 1"
    );
    
    if (duplicates.length > 0) {
      console.log(`⚠️ Found ${duplicates.length} duplicate email addresses:`);
      duplicates.forEach(dup => {
        console.log(`   - ${dup.email}: ${dup.count} records`);
      });
    } else {
      console.log('✓ No duplicate email addresses');
    }
    
    console.log('\n=== Debug Complete ===\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
}

debugApprovedCompanies();
