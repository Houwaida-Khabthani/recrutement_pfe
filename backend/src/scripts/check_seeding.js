const mysql = require('mysql2/promise');
async function run() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'pfe_recruitment'
    });
    
    const [users] = await conn.execute("SELECT id_user, nom, email, role FROM user WHERE role = 'CANDIDAT' LIMIT 5");
    console.log('Candidates:', JSON.stringify(users));
    
    const [offers] = await conn.execute("SELECT id_offre, titre FROM offre WHERE id_entreprise = 16 LIMIT 5");
    console.log('Offers:', JSON.stringify(offers));
    
    await conn.end();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
