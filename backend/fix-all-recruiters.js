const pool = require("./src/config/db");

async function fixAllRecruiters() {
  try {
    console.log("=== FIXING ALL RECRUITER ACCOUNTS ===\n");

    // Get all users with ENTREPRISE role who don't have companies
    const [usersWithoutCompanies] = await pool.query(`
      SELECT u.id_user, u.email, u.nom_entreprise 
      FROM user u
      WHERE u.role = 'ENTREPRISE' 
      AND u.id_user NOT IN (SELECT id_user FROM company WHERE id_user IS NOT NULL)
    `);

    console.log(`Found ${usersWithoutCompanies.length} recruiters without companies\n`);

    for (const user of usersWithoutCompanies) {
      console.log(`Processing: ${user.email}`);
      
      const companyName = user.nom_entreprise || `Company of ${user.email}`;
      
      // Create a new company for this user
      const [result] = await pool.query(
        "INSERT INTO company (nom, id_user) VALUES (?, ?)",
        [companyName, user.id_user]
      );
      
      console.log(`  ✅ Created company ID ${result.insertId} for user ${user.id_user}`);
    }

    console.log(`\n=== ALL RECRUITERS FIXED ===`);
    console.log("Now all recruiter accounts have associated companies!");

  } catch (error) {
    console.error("❌ ERROR:", error);
  } finally {
    await pool.end();
  }
}

fixAllRecruiters();
