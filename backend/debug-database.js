const db = require('./src/config/db');

(async () => {
  try {
    console.log('🔍 Checking database...\n');

    // Check company linkage
    console.log('1️⃣ User 23 (recruiter@test.com):');
    const [user] = await db.query('SELECT * FROM user WHERE id_user = 23');
    console.log(user[0]);

    // Check company
    console.log('\n2️⃣ Company linked to User 23:');
    const [company] = await db.query('SELECT * FROM company WHERE id_user = 23');
    console.log(company[0]);
    
    const companyId = company[0]?.id_company;

    // Check all jobs for this company
    if (companyId) {
      console.log(`\n3️⃣ All jobs for company ${companyId}:`);
      const [jobs] = await db.query('SELECT id_offre, titre, id_entreprise, statut FROM offre WHERE id_entreprise = ?', [companyId]);
      console.log('Found', jobs.length, 'jobs:');
      jobs.forEach(j => {
        console.log(`  - ID ${j.id_offre}: ${j.titre} (Status: ${j.statut})`);
      });
    }

    // Check all companies and their jobs
    console.log('\n4️⃣ All companies and job counts:');
    const [allCompanies] = await db.query('SELECT c.id_company, c.nom, COUNT(o.id_offre) as job_count FROM company c LEFT JOIN offre o ON c.id_company = o.id_entreprise GROUP BY c.id_company');
    allCompanies.forEach(c => {
      console.log(`  Company ${c.id_company} (${c.nom}): ${c.job_count} jobs`);
    });

    // Check jobs 6-9 specifically
    console.log('\n5️⃣ Jobs 6-9 in database:');
    const [specificJobs] = await db.query('SELECT id_offre, titre, id_entreprise, statut FROM offre WHERE id_offre IN (6,7,8,9)');
    console.log(specificJobs);

    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
