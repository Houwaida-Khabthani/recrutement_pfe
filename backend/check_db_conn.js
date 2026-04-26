const mysql = require("mysql2/promise");
async function check() {
  try {
    const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'pfe_recruitment' });
    console.log("Connected successfully to pfe_recruitment");
    const [rows] = await conn.query("SHOW TABLES");
    console.log(rows);
    process.exit(0);
  } catch (e) {
    console.error("Error connecting to pfe_recruitment", e.message);
  }
}
check();
