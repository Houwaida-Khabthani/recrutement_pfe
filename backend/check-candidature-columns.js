const pool = require('./src/config/db');
pool.query("DESCRIBE candidature")
  .then(([rows]) => console.log(JSON.stringify(rows, null, 2)))
  .catch(console.error)
  .finally(() => process.exit());