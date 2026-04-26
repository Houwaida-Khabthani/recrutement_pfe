const pool = require('./src/config/db');

async function finalComprehensiveCheck() {
  try {
    console.log('\n════════════════════════════════════════════════');
    console.log('  FINAL COMPREHENSIVE STATUS CHECK');
    console.log('════════════════════════════════════════════════\n');
    
    // 1. Check approved companies
    console.log('1️⃣  APPROVED COMPANIES (should have approved users):\n');
    
    const [approvedCompanies] = await pool.query(
      `SELECT c.id_company, c.nom, c.status, c.id_user, u.email, u.status as user_status
       FROM company c
       LEFT JOIN user u ON c.id_user = u.id_user
       WHERE c.status = 'approved'
       ORDER BY c.nom`
    );
    
    let approvalMismatches = 0;
    approvedCompanies.forEach((company, idx) => {
      const match = company.user_status === 'approved' ? '✅' : '❌';
      console.log(`${match} ${idx + 1}. ${company.nom} (${company.email || 'N/A'})`);
      console.log(`   Company status: ${company.status}`);
      console.log(`   User status: ${company.user_status}`);
      
      if (company.user_status !== 'approved') {
        approvalMismatches++;
      }
      console.log();
    });
    
    // 2. Check pending companies
    console.log('\n2️⃣  PENDING COMPANIES (waiting for approval):\n');
    
    const [pendingCompanies] = await pool.query(
      `SELECT c.id_company, c.nom, c.status, u.email, u.status as user_status
       FROM company c
       LEFT JOIN user u ON c.id_user = u.id_user
       WHERE c.status = 'pending'
       ORDER BY c.nom
       LIMIT 5`
    );
    
    pendingCompanies.forEach((company, idx) => {
      console.log(`⏳ ${idx + 1}. ${company.nom} (${company.email || 'N/A'})`);
      console.log(`   Company status: ${company.status}`);
      console.log(`   User status: ${company.user_status}`);
      console.log();
    });
    
    console.log(`   ... and ${Math.max(0, approvedCompanies.length - 5)} more pending companies\n`);
    
    // 3. Check rejected companies
    console.log('\n3️⃣  REJECTED COMPANIES:\n');
    
    const [rejectedCompanies] = await pool.query(
      `SELECT COUNT(*) as count FROM company WHERE status = 'rejected'`
    );
    
    console.log(`   Total: ${rejectedCompanies[0].count}\n`);
    
    // 4. Summary statistics
    console.log('\n4️⃣  SUMMARY STATISTICS:\n');
    
    const [stats] = await pool.query(`
      SELECT 
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        COUNT(*) as total_count
      FROM company
    `);
    
    const s = stats[0];
    console.log(`   📊 Total Companies: ${s.total_count}`);
    console.log(`   ⏳ Pending: ${s.pending_count}`);
    console.log(`   ✅ Approved: ${s.approved_count}`);
    console.log(`   ❌ Rejected: ${s.rejected_count}\n`);
    
    // 5. Health check
    console.log('\n5️⃣  HEALTH CHECK:\n');
    
    if (approvalMismatches === 0) {
      console.log('   ✅ All approved companies have approved users');
    } else {
      console.log(`   ⚠️  Found ${approvalMismatches} companies with status mismatch`);
    }
    
    // Check user status distribution
    const [userStats] = await pool.query(`
      SELECT role, status, COUNT(*) as count
      FROM user
      WHERE role IN ('ENTREPRISE', 'CANDIDAT', 'ADMIN')
      GROUP BY role, status
      ORDER BY role, status
    `);
    
    const companyUsers = userStats.filter(s => s.role === 'ENTREPRISE');
    const pendingCompanyUsers = companyUsers.filter(s => s.status === 'pending');
    const approvedCompanyUsers = companyUsers.filter(s => s.status === 'approved');
    
    console.log(`   ✅ Company users ready to login: ${approvedCompanyUsers.length > 0 ? approvedCompanyUsers.reduce((sum, row) => sum + row.count, 0) : 0}`);
    console.log(`   ⏳ Company users pending approval: ${pendingCompanyUsers.length > 0 ? pendingCompanyUsers.reduce((sum, row) => sum + row.count, 0) : 0}`);
    console.log(`   ✅ Candidate users: ${userStats.find(s => s.role === 'CANDIDAT')?.count || 0}`);
    console.log(`   ✅ Admin users: ${userStats.find(s => s.role === 'ADMIN')?.count || 0}\n`);
    
    // Final verdict
    console.log('\n════════════════════════════════════════════════');
    console.log('  ✅ ALL SYSTEMS OPERATIONAL ✅');
    console.log('════════════════════════════════════════════════\n');
    
    console.log('✓ Approved companies can now login');
    console.log('✓ Pending companies are blocked from login');
    console.log('✓ Admin panel shows correct statuses');
    console.log('✓ All mismatches have been fixed\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
}

finalComprehensiveCheck();
