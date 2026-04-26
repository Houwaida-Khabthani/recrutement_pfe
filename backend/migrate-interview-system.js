const mysql = require("mysql2/promise");
require("dotenv").config();

async function runInterviewMigration() {
  const config = require("./src/config/env");

  const connection = await mysql.createConnection({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  });

  try {
    console.log("Starting interview system migration...");

    // Check if expected_interviews column already exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM candidature LIKE 'expected_interviews'"
    );

    if (columns.length === 0) {
      // Add expected_interviews column to candidature table after statut
      await connection.query(
        `ALTER TABLE candidature ADD COLUMN expected_interviews INT DEFAULT 1 AFTER statut`
      );
      console.log("✅ Added expected_interviews column to candidature table");
    } else {
      console.log("✅ expected_interviews column already exists");
    }

    // Check if interviews table already exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'interviews'"
    );

    if (tables.length === 0) {
      // Create interviews table
      await connection.query(`
        CREATE TABLE interviews (
          id_interview INT PRIMARY KEY AUTO_INCREMENT,
          id_candidature INT NOT NULL,
          step INT NOT NULL,
          date DATETIME NOT NULL,
          location VARCHAR(255),
          meeting_link VARCHAR(500),
          status ENUM('scheduled', 'confirmed', 'passed', 'failed', 'cancelled') DEFAULT 'scheduled',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (id_candidature) REFERENCES candidature(id_candidature) ON DELETE CASCADE,
          UNIQUE KEY unique_interview (id_candidature, step),
          INDEX idx_candidature_step (id_candidature, step),
          INDEX idx_status (status),
          INDEX idx_date (date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("✅ Created interviews table");
    } else {
      console.log("✅ interviews table already exists");
    }

    console.log("✅ Interview system migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runInterviewMigration();