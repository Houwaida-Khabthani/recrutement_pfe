const pool = require('./src/config/db');
pool.query("SELECT c.id_candidature, c.entretien_lieu, i.id_interview, i.meeting_link FROM interviews i JOIN candidature c ON i.id_candidature = c.id_candidature WHERE i.meeting_link LIKE '%placeholder%' OR i.meeting_link LIKE '%yourapp.com%' ORDER BY i.id_interview")
  .then(([rows]) => console.log(JSON.stringify(rows, null, 2)))
  .catch(console.error)
  .finally(() => process.exit());