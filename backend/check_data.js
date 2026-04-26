const mysql = require('mysql2/promise');
const config = require('./src/config/env');

async function checkData() {
  const connection = await mysql.createConnection({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME
  });

  try {
    console.log('=== CANDIDATES ===');
    const [candidates] = await connection.execute(
      'SELECT id_user, nom, email, specialite FROM user WHERE role = ?',
      ['CANDIDAT']
    );
    console.table(candidates);

    console.log('\n=== APPLICATIONS ===');
    const [apps] = await connection.execute(
      'SELECT c.id_candidature, u.nom as candidate, o.titre as job, c.statut, m.score FROM candidature c JOIN user u ON c.id_user = u.id_user JOIN offre o ON c.id_offre = o.id_offre LEFT JOIN matching m ON c.id_candidature = m.id_candidature'
    );
    console.table(apps);

    console.log('\n=== NOTIFICATIONS ===');
    const [notifs] = await connection.execute(
      'SELECT n.type, n.date, u.nom as user FROM notification n JOIN user u ON n.id_user = u.id_user ORDER BY n.date DESC'
    );
    console.table(notifs);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkData();