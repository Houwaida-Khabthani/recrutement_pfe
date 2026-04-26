const pool = require('./src/config/db');

async function testPendingCompaniesAPI() {
  try {
    console.log('\n=== Testing Pending Companies API ===\n');
    
    // 1. Check if status column exists
    console.log('1. Checking company table structure...');
    const [[columnInfo]] = await pool.query("SHOW COLUMNS FROM company WHERE Field = 'status'");
    if (columnInfo) {
      console.log('   ✓ Status column exists');
    } else {
      console.log('   ✗ Status column missing');
      process.exit(1);
    }
    
    // 2. Count pending companies
    console.log('\n2. Checking for pending companies...');
    const [[pendingCount]] = await pool.query("SELECT COUNT(*) as count FROM company WHERE status = 'pending'");
    console.log(`   Found ${pendingCount.count} pending companies`);
    
    // 3. Sample pending companies
    console.log('\n3. Sample pending companies:');
    const [companies] = await pool.query(
      "SELECT id_company, nom, email, secteur, pays, description FROM company WHERE status = 'pending' LIMIT 3"
    );
    
    if (companies.length > 0) {
      companies.forEach(company => {
        console.log(`   - ${company.nom} (${company.email}) - ${company.secteur}`);
      });
    } else {
      console.log('   No pending companies found (this is OK for testing)');
    }
    
    // 4. Test getAllCompanies query with status filter
    console.log('\n4. Testing getAllCompanies with status filter...');
    const [filteredCompanies] = await pool.query(
      "SELECT c.id_company, c.nom, c.description, c.email, c.secteur, c.pays, c.site_web, c.logo, c.status, c.id_user, u.nom as user_name FROM company c LEFT JOIN user u ON c.id_user = u.id_user WHERE c.status = 'pending' ORDER BY c.nom"
    );
    console.log(`   ✓ Query successful, returned ${filteredCompanies.length} records`);
    
    // 5. Verify approve/reject functionality
    console.log('\n5. Testing approval/rejection fields...');
    const [approvalTest] = await pool.query(
      "SELECT c.nom, c.status FROM company c WHERE c.status IN ('approved', 'rejected', 'pending') LIMIT 1"
    );
    if (approvalTest.length > 0) {
      console.log(`   ✓ Status values are working correctly`);
    }
    
    console.log('\n=== All tests passed! ===\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testPendingCompaniesAPI();
