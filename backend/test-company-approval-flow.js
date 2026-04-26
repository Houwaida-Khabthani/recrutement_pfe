const pool = require('./src/config/db');

async function testCompanyApprovalFlow() {
  try {
    console.log('\n=== Testing Company Approval Flow ===\n');
    
    // 1. Get a pending company
    console.log('1. Finding a pending company...');
    const [pendingCompanies] = await pool.query(
      "SELECT c.id_company, c.nom, c.id_user, u.nom as user_name, u.status as user_status FROM company c LEFT JOIN user u ON c.id_user = u.id_user WHERE c.status = 'pending' LIMIT 1"
    );
    
    if (pendingCompanies.length === 0) {
      console.log('   No pending companies found. Creating test data...');
      
      // Create test user
      const hashedPassword = await require('bcrypt').hash('password123', 10);
      const [userRes] = await pool.query(
        "INSERT INTO user (nom, email, mot_de_passe, role, status) VALUES (?, ?, ?, ?, ?)",
        ['Test Company', 'testcompany@example.com', hashedPassword, 'ENTREPRISE', 'pending']
      );
      const userId = userRes.insertId;
      
      // Create test company
      const [companyRes] = await pool.query(
        "INSERT INTO company (nom, email, id_user, status) VALUES (?, ?, ?, ?)",
        ['Test Company', 'testcompany@example.com', userId, 'pending']
      );
      const companyId = companyRes.insertId;
      
      console.log(`   ✓ Created test company ID: ${companyId}, user ID: ${userId}`);
      
      // Continue with the new data
      const [rows] = await pool.query(
        "SELECT c.id_company, c.nom, c.id_user, u.nom as user_name, u.status as user_status FROM company c LEFT JOIN user u ON c.id_user = u.id_user WHERE c.id_company = ?",
        [companyId]
      );
      
      if (rows.length > 0) {
        pendingCompanies.push(rows[0]);
      }
    }
    
    if (pendingCompanies.length === 0) {
      console.log('   ✗ Failed to find or create test data');
      process.exit(1);
    }
    
    const testCompany = pendingCompanies[0];
    console.log(`   ✓ Found company: ${testCompany.nom}`);
    console.log(`   - Company ID: ${testCompany.id_company}`);
    console.log(`   - User ID: ${testCompany.id_user}`);
    console.log(`   - User status BEFORE: ${testCompany.user_status}`);
    
    // 2. Simulate approval
    console.log('\n2. Simulating company approval...');
    
    // Update company status
    let query = "UPDATE company SET status = ?";
    const params = ['approved'];
    query += " WHERE id_company = ?";
    params.push(testCompany.id_company);
    
    const [companyUpdateRes] = await pool.query(query, params);
    console.log(`   ✓ Company status updated`);
    
    // Update user status
    if (testCompany.id_user) {
      const [userUpdateRes] = await pool.query(
        "UPDATE user SET status = ? WHERE id_user = ?",
        ['approved', testCompany.id_user]
      );
      console.log(`   ✓ User status updated`);
    }
    
    // 3. Verify both are updated
    console.log('\n3. Verifying approval...');
    const [verifyCompany] = await pool.query(
      "SELECT c.status, u.status as user_status FROM company c LEFT JOIN user u ON c.id_user = u.id_user WHERE c.id_company = ?",
      [testCompany.id_company]
    );
    
    if (verifyCompany.length > 0) {
      const result = verifyCompany[0];
      console.log(`   - Company status AFTER: ${result.status}`);
      console.log(`   - User status AFTER: ${result.user_status}`);
      
      if (result.status === 'approved' && result.user_status === 'approved') {
        console.log('   ✅ Both company and user status properly updated!');
      } else {
        console.log('   ❌ Status mismatch - approval did not sync properly');
      }
    }
    
    // 4. Test login simulation
    console.log('\n4. Testing login check logic...');
    const [loginTest] = await pool.query(
      "SELECT role, status FROM user WHERE id_user = ?",
      [testCompany.id_user]
    );
    
    if (loginTest.length > 0) {
      const user = loginTest[0];
      console.log(`   - User role: ${user.role}`);
      console.log(`   - User status: ${user.status}`);
      
      if (user.role === "ENTREPRISE" && user.status === "approved") {
        console.log('   ✅ Login check would PASS (company verified)');
      } else if (user.role === "ENTREPRISE" && user.status !== "approved") {
        console.log('   ❌ Login check would FAIL (pending approval)');
      } else {
        console.log('   ✅ Non-company user (login would proceed)');
      }
    }
    
    console.log('\n=== Test Complete ===\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testCompanyApprovalFlow();
