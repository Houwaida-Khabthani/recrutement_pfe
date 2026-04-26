const pool = require('./src/config/db');

// Fix interviews that have placeholder links but should use entretien_lieu from application
async function fixMeetingLinks() {
  // Get all interviews with placeholder links that have a valid entretien_lieu in the application
  const [rows] = await pool.query(`
    UPDATE interviews i
    JOIN candidature c ON i.id_candidature = c.id_candidature
    SET i.meeting_link = c.entretien_lieu
    WHERE (i.meeting_link LIKE '%placeholder%' OR i.meeting_link LIKE '%yourapp.com%')
      AND c.entretien_lieu IS NOT NULL
      AND c.entretien_lieu != ''
  `);
  
  console.log('Updated', rows.affectedRows, 'interviews');
  
  // Verify the fix
  const [updated] = await pool.query(`
    SELECT c.id_candidature, c.entretien_lieu, i.id_interview, i.meeting_link 
    FROM interviews i 
    JOIN candidature c ON i.id_candidature = c.id_candidature 
    ORDER BY i.id_interview DESC LIMIT 10
  `);
  
  console.log('\nUpdated interviews:');
  console.log(JSON.stringify(updated, null, 2));
  
  process.exit();
}

fixMeetingLinks().catch(console.error);