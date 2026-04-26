const db = require('./src/config/db');

(async () => {
  try {
    console.log('🔄 Moving jobs 7, 8, 9 to Company 12...\n');

    // Update jobs 7, 8, 9 to company 12
    const [result] = await db.query(
      'UPDATE offre SET id_entreprise = 12 WHERE id_offre IN (7, 8, 9)'
    );

    console.log(`✅ Updated ${result.affectedRows} jobs\n`);

    // Verify
    const [jobs] = await db.query(
      'SELECT id_offre, titre, id_entreprise FROM offre WHERE id_offre IN (6,7,8,9) ORDER BY id_offre'
    );

    console.log('Verification - Jobs for Company 12:');
    jobs.forEach(j => {
      console.log(`  Job ${j.id_offre}: ${j.titre} → Company ${j.id_entreprise}`);
    });

    console.log('\n✅ All done! Now when you fetch /api/jobs/my-jobs, you\'ll get all 4 jobs');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
