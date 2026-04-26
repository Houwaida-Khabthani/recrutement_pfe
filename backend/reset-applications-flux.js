const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pfe_recruitment'
};

async function resetFlux() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    console.log('--- RE-INITIALIZING RECRUITMENT FLUX ---');
    
    // Status distribution: PENDING, UNDER_REVIEW, INTERVIEW, ACCEPTED, REJECTED
    const [apps] = await connection.execute('SELECT id_candidature FROM candidature ORDER BY id_candidature ASC');
    
    const statuses = ['PENDING', 'UNDER_REVIEW', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'PENDING'];
    
    for (let i = 0; i < apps.length; i++) {
        const newStatus = statuses[i % statuses.length];
        await connection.execute('UPDATE candidature SET statut = ? WHERE id_candidature = ?', [newStatus, apps[i].id_candidature]);
        console.log(`Reset Application #${apps[i].id_candidature} to [${newStatus}]`);
    }

    console.log('\n--- DATA RECOVERY COMPLETE ---');
  } catch (error) {
    console.error('Reset Failed:', error);
  } finally {
    await connection.end();
  }
}

resetFlux();
