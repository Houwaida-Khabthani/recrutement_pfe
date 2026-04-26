const mysql = require("mysql2/promise");
require("dotenv").config();

async function runMigration() {
  const config = require("./src/config/env");

  const connection = await mysql.createConnection({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  });

  try {
    console.log("Starting migration...");

    // Check if status column already exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM user LIKE 'status'"
    );

    if (columns.length > 0) {
      console.log("✅ Status column already exists");
      return;
    }

    // Add status column
    await connection.query(
      `ALTER TABLE user ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER logo`
    );
    console.log("✅ Added status column");

    // Set existing ENTREPRISE users to 'approved'
    await connection.query(
      `UPDATE user SET status = 'approved' WHERE role = 'ENTREPRISE'`
    );
    console.log("✅ Set existing companies to 'approved'");

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
