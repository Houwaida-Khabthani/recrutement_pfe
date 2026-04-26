const mysql = require('mysql2/promise');
require('dotenv').config();

async function diagnoseDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  });

  try {
    console.log('\n📊 DATABASE DIAGNOSTIC REPORT\n');
    console.log('=' .repeat(60));
    
    // Check users
    console.log('\n1️⃣  USERS:');
    const [users] = await connection.query(`SELECT id_user, nom, role FROM user LIMIT 10`);
    if (users.length === 0) {
      console.log('   ❌ No users found - You need to sign up first');
    } else {
      console.log(`   ✅ Found ${users.length} user(s):`);
      users.forEach(u => {
        console.log(`      - ID: ${u.id_user}, Name: ${u.nom}, Role: ${u.role}`);
      });
    }
    
    // Check companies
    console.log('\n2️⃣  COMPANIES:');
    const [companies] = await connection.query(`SELECT id_company, nom, id_user FROM company LIMIT 10`);
    if (companies.length === 0) {
      console.log('   ❌ No companies found - Company admins need to create a company profile');
    } else {
      console.log(`   ✅ Found ${companies.length} company(ies):`);
      companies.forEach(c => {
        console.log(`      - ID: ${c.id_company}, Name: ${c.nom || 'N/A'}, User ID: ${c.id_user || 'NULL ⚠️'}`);
      });
    }
    
    // Check jobs
    console.log('\n3️⃣  JOB OFFERS:');
    const [jobs] = await connection.query(`SELECT id_offre, titre, id_entreprise FROM offre LIMIT 10`);
    if (jobs.length === 0) {
      console.log('   ℹ️  No jobs found yet - This is normal if you just set up');
    } else {
      console.log(`   ✅ Found ${jobs.length} job(s):`);
      jobs.forEach(j => {
        console.log(`      - ID: ${j.id_offre}, Title: ${j.titre}, Company: ${j.id_entreprise}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n💡 TROUBLESHOOTING:\n');
    
    if (users.length === 0) {
      console.log('❌ PROBLEM: No users exist');
      console.log('   SOLUTION: Sign up in the application first\n');
    }
    
    const empresaUsers = users.filter(u => u.role === 'ENTREPRISE');
    if (empresaUsers.length === 0) {
      console.log('❌ PROBLEM: No company users (ENTREPRISE role) found');
      console.log('   SOLUTION: Sign up as a company/recruiter\n');
    }
    
    const companiesWithUser = companies.filter(c => c.id_user !== null);
    if (companiesWithUser.length === 0) {
      console.log('❌ PROBLEM: No companies linked to users');
      console.log('   SOLUTION: Company admin needs to complete profile setup\n');
    }
    
    if (users.length > 0 && empresaUsers.length > 0 && companiesWithUser.length > 0) {
      console.log('✅ DATABASE LOOKS GOOD!');
      console.log('   Your setup should work. Check browser console for more details.\n');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  } finally {
    await connection.end();
  }
}

diagnoseDatabase();
