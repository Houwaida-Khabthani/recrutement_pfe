const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pfe_recruitment'
  });
  const [users] = await conn.query('SELECT * FROM user WHERE email = ?', ['aeros@gmail.com']);
  console.log('USER=', users);
  if (!users[0]) { await conn.end(); return; }
  const [companies] = await conn.query('SELECT * FROM company WHERE id_user = ?', [users[0].id_user]);
  console.log('COMPANY=', companies);
  if (!companies[0]) { await conn.end(); return; }
  const [offres] = await conn.query('SELECT * FROM offre WHERE id_entreprise = ?', [companies[0].id_company]);
  console.log('OFFRES=', offres);
  const [cands] = await conn.query('SELECT * FROM candidature WHERE id_offre IN (?)', [offres.map(o => o.id_offre)]);
  console.log('CANDIDATURE COUNT=', cands.length);
  await conn.end();
})();
