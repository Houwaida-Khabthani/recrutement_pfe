const pool = require("./src/config/db");

async function createTestJob() {
  try {
    console.log("=== CREATING TEST JOB FOR COMPANY 16 ===\n");

    // Check if company 16 exists
    const [companies] = await pool.query(
      "SELECT id_company, nom FROM company WHERE id_company = 16"
    );

    if (companies.length === 0) {
      console.log("❌ Company 16 not found!");
      await pool.end();
      return;
    }

    console.log(`✅ Found company: ${companies[0].nom}`);

    // Create a test job
    const [result] = await pool.query(
      `INSERT INTO offre (
        titre, 
        type_contrat, 
        localisation, 
        description, 
        salaire, 
        experience, 
        date_pub, 
        statut, 
        id_entreprise,
        date_expiration
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Senior Full Stack Developer",
        "CDI",
        "Remote",
        "We are looking for an experienced Full Stack Developer to join our growing team. You will work on modern web technologies and have the opportunity to lead technical projects.",
        5500,
        "5 years",
        new Date(),
        "Active",
        16,
        "2025-12-31",
      ]
    );

    console.log(`\n✅ TEST JOB CREATED`);
    console.log(`   Job ID: ${result.insertId}`);
    console.log(`   Company: 16 (aeros)`);
    console.log(`   Title: Senior Full Stack Developer`);
    console.log(`\n🔗 Try updating this job: http://localhost:5173/jobs/${result.insertId}/edit`);
    console.log(`\n📝 You should be able to edit this job because it belongs to your company.`);

  } catch (error) {
    console.error("❌ ERROR:", error);
  } finally {
    await pool.end();
  }
}

createTestJob();
