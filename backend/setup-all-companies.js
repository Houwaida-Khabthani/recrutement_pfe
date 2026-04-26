const db = require('./src/config/db');
const bcrypt = require('bcrypt');

(async () => {
  try {
    console.log('🔄 Setting up complete company structure with recruiters...\n');

    // Restore jobs to their original companies
    console.log('1️⃣ Restoring jobs to their original companies...');
    await db.query('UPDATE offre SET id_entreprise = 12 WHERE id_offre = 6');
    await db.query('UPDATE offre SET id_entreprise = 13 WHERE id_offre = 7');
    await db.query('UPDATE offre SET id_entreprise = 14 WHERE id_offre = 8');
    await db.query('UPDATE offre SET id_entreprise = 15 WHERE id_offre = 9');
    console.log('✅ Jobs restored\n');

    // Check existing recruiters
    console.log('2️⃣ Checking existing recruiters...');
    const [existingUsers] = await db.query('SELECT id_user, email, nom FROM user WHERE role = "ENTREPRISE" ORDER BY id_user');
    console.log(`Found ${existingUsers.length} existing recruiters:`);
    existingUsers.forEach(u => {
      console.log(`  - User ${u.id_user}: ${u.email} (${u.nom})`);
    });

    // Create recruiters for each company if they don't exist
    console.log('\n3️⃣ Creating recruiters for each company...');
    
    const recruiters = [
      { email: 'recruiter1@test.com', password: 'test123456', nom: 'Recruiter 1', company_id: 12 },
      { email: 'recruiter2@test.com', password: 'test123456', nom: 'Recruiter 2', company_id: 13 },
      { email: 'recruiter3@test.com', password: 'test123456', nom: 'Recruiter 3', company_id: 14 },
      { email: 'recruiter4@test.com', password: 'test123456', nom: 'Recruiter 4', company_id: 15 }
    ];

    for (const recruiter of recruiters) {
      const [existing] = await db.query('SELECT id_user FROM user WHERE email = ?', [recruiter.email]);
      
      if (existing.length === 0) {
        const hashedPassword = await bcrypt.hash(recruiter.password, 10);
        const [result] = await db.query(
          'INSERT INTO user (email, mot_de_passe, nom, role) VALUES (?, ?, ?, ?)',
          [recruiter.email, hashedPassword, recruiter.nom, 'ENTREPRISE']
        );
        
        const userId = result.insertId;
        
        // Link recruiter to their company
        await db.query(
          'UPDATE company SET id_user = ? WHERE id_company = ?',
          [userId, recruiter.company_id]
        );
        
        console.log(`✅ Created ${recruiter.email} (User ${userId}) → Company ${recruiter.company_id}`);
      } else {
        console.log(`⏭️  ${recruiter.email} already exists`);
      }
    }

    // Display final setup
    console.log('\n4️⃣ Final Setup Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const [companies] = await db.query(
      `SELECT c.id_company, c.nom, u.email as recruiter_email, 
              COUNT(o.id_offre) as job_count
       FROM company c
       LEFT JOIN user u ON c.id_user = u.id_user
       LEFT JOIN offre o ON c.id_company = o.id_entreprise
       WHERE c.id_company IN (12,13,14,15)
       GROUP BY c.id_company
       ORDER BY c.id_company`
    );

    companies.forEach(c => {
      console.log(`🏢 Company ${c.id_company}: ${c.nom}`);
      console.log(`   Recruiter: ${c.recruiter_email}`);
      console.log(`   Password: test123456`);
      console.log(`   Jobs: ${c.job_count}`);
      console.log();
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Setup complete! Each recruiter can now log in and see only their company\'s jobs.\n');

    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
