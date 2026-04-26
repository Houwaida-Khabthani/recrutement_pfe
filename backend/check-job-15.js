const pool = require('./src/config/db');

async function checkJob() {
  try {
    const [job] = await pool.query('SELECT id_offre, titre, statut FROM offre WHERE id_offre = ?', [15]);
    console.log('Job 15:', job[0]);
    
    const [allJobs] = await pool.query('SELECT id_offre, titre, statut FROM offre LIMIT 5');
    console.log('\nFirst 5 jobs:');
    allJobs.forEach(j => console.log(`  ID: ${j.id_offre}, Titre: ${j.titre}, Status: ${j.statut}`));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkJob();
