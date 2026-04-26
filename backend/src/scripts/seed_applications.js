const mysql = require('mysql2/promise');

async function seed() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pfe_recruitment'
  });

  try {
    console.log('--- SEEDING REAL APPLICATIONS ---');

    const applications = [
      { id_user: 16, id_offre: 16, status: 'PENDING', score: 94 },
      { id_user: 17, id_offre: 14, status: 'UNDER_REVIEW', score: 87 },
      { id_user: 18, id_offre: 16, status: 'INTERVIEW', score: 91 },
      { id_user: 19, id_offre: 13, status: 'PENDING', score: 89 },
      { id_user: 20, id_offre: 16, status: 'ACCEPTED', score: 82 },
      { id_user: 21, id_offre: 15, status: 'REJECTED', score: 75 }
    ];

    for (const app of applications) {
      // 1. Insert Candidature
      const [result] = await conn.execute(
        `INSERT INTO candidature (cv, date_postule, statut, id_user, id_offre) 
         VALUES (?, NOW(), ?, ?, ?)`,
        [`cv_candidate_${app.id_user}.pdf`, app.status, app.id_user, app.id_offre]
      );
      
      const candidatureId = result.insertId;

      // 2. Insert Matching Score
      await conn.execute(
        `INSERT INTO matching (score, note, date, id_candidature, id_offre)
         VALUES (?, 5, NOW(), ?, ?)`,
        [app.score, candidatureId, app.id_offre]
      );
      
      console.log(`Inserted app for candidate ${app.id_user} (Score: ${app.score})`);
    }

    console.log('--- SEEDING COMPLETED ---');
  } catch (err) {
    console.error('Seeding error:', err.message);
  } finally {
    await conn.end();
  }
}

seed();
