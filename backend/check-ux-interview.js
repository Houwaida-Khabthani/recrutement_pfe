const pool = require('./src/config/db');
pool.query("SELECT i.id_interview, i.meeting_link, i.date, i.location, i.status, c.entretien_lieu as app_meeting_link, u.name, u.email, o.titre as poste FROM interviews i JOIN candidature c ON i.id_candidature = c.id_candidature JOIN users u ON c.id_user = u.id JOIN offre o ON c.id_offre = o.id_offre ORDER BY i.id_interview DESC LIMIT 10")
  .then(([rows]) => console.log(JSON.stringify(rows, null, 2)))
  .catch(console.error)
  .finally(() => process.exit());