const pool = require("./src/config/db");

async function diagnose() {
  try {
    console.log("=== DATABASE DIAGNOSTIC ===\n");

    // Check all users with ENTREPRISE role
    console.log("1️⃣ USERS WITH ENTREPRISE ROLE:");
    const [users] = await pool.query(
      "SELECT id_user, email, nom, nom_entreprise, role FROM user WHERE role = 'ENTREPRISE'"
    );
    console.log(`Found ${users.length} company users:\n`);
    users.forEach((user) => {
      console.log(`  ID: ${user.id_user} | Email: ${user.email} | Company: ${user.nom_entreprise}`);
    });

    console.log("\n2️⃣ COMPANIES IN DATABASE:");
    const [companies] = await pool.query(
      "SELECT id_company, nom, id_user FROM company"
    );
    console.log(`Found ${companies.length} companies:\n`);
    companies.forEach((company) => {
      console.log(`  ID: ${company.id_company} | Name: ${company.nom} | User ID: ${company.id_user || '❌ NULL'}`);
    });

    console.log("\n3️⃣ RELATIONSHIPS:");
    console.log("Checking which users have companies...\n");
    for (const user of users) {
      const [userCompanies] = await pool.query(
        "SELECT id_company FROM company WHERE id_user = ?",
        [user.id_user]
      );
      if (userCompanies.length === 0) {
        console.log(`  ❌ User ${user.id_user} (${user.email}) - NO company found`);
      } else {
        console.log(`  ✅ User ${user.id_user} (${user.email}) - Has company ID: ${userCompanies[0].id_company}`);
      }
    }

    console.log("\n4️⃣ JOBS OWNED BY EACH COMPANY:");
    const [jobs] = await pool.query(
      "SELECT id_offre, titre, id_entreprise FROM offre"
    );
    console.log(`Found ${jobs.length} jobs:\n`);
    jobs.forEach((job) => {
      console.log(`  Job ${job.id_offre}: "${job.titre}" | Company: ${job.id_entreprise}`);
    });

    console.log("\n✅ DIAGNOSIS COMPLETE");
    console.log("\n📋 ACTION NEEDED:");
    if (companies.length === 0 || companies.some(c => !c.id_user)) {
      console.log("  ⚠️  Some or all companies don't have id_user set!");
      console.log("  Run: node migrate-company-user-link.js");
    } else {
      console.log("  ✅ All companies have users linked correctly");
    }

  } catch (error) {
    console.error("ERROR:", error.message);
  } finally {
    await pool.end();
  }
}

diagnose();
