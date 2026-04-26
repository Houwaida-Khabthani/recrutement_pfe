const mysql = require("mysql2/promise");
require("dotenv").config({ path: "c:/Users/Wael_/Downloads/adem pfe/wael/backend/.env" });

async function check() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pfe_recruitment'
  });

  try {
    const [rows] = await pool.query(`
      SELECT c.id_candidature, c.statut, u.email 
      FROM candidature c 
      JOIN user u ON c.id_user = u.id_user 
      JOIN offre o ON c.id_offre = o.id_offre
      WHERE o.id_entreprise = (SELECT id_company FROM company WHERE id_user = 8)
      LIMIT 10;
    `);
    console.log("AEROS CANDIDATES:");
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await pool.end();
  }
}

check();
