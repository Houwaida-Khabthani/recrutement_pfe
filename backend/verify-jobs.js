const db = require('./src/config/db');

(async () => {
  const [jobs] = await db.query('SELECT id_offre, titre, id_entreprise FROM offre WHERE id_offre IN (6,7,8,9) ORDER BY id_offre');
  console.log('Jobs distribution:');
  jobs.forEach(j => {
    console.log(`  Job ${j.id_offre}: ${j.titre} → Company ${j.id_entreprise}`);
  });
  process.exit(0);
})();
