const mysql = require("mysql2/promise");

async function checkDatabases() {
  try {
    // Connect without specifying a database
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
    });

    const [rows] = await connection.query("SHOW DATABASES");
    console.log("Available databases:");
    rows.forEach((row) => {
      console.log(`  - ${row.Database}`);
    });

    // Check for our specific databases
    console.log("\nLooking for:");
    console.log("  pfe_recruitment:", rows.some(r => r.Database === "pfe_recruitment") ? "✅ EXISTS" : "❌ NOT FOUND");
    console.log("  recrutement_db:", rows.some(r => r.Database === "recrutement_db") ? "✅ EXISTS" : "❌ NOT FOUND");

    await connection.end();
  } catch (error) {
    console.error("❌ Connection error:", error.message);
  }
}

checkDatabases();
