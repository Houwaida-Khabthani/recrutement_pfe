const pool = require("./src/config/db");

async function migrateCompanyUserLink() {
  try {
    console.log("=== MIGRATING COMPANY-USER LINKS ===\n");

    // First, get all users with ENTREPRISE role
    const [users] = await pool.query(
      "SELECT id_user, nom_entreprise FROM user WHERE role = 'ENTREPRISE'"
    );

    console.log(`Found ${users.length} company users to process\n`);

    let updated = 0;
    let created = 0;

    for (const user of users) {
      console.log(`Processing user ${user.id_user}: ${user.nom_entreprise}`);

      // Check if this user already has a company
      const [existingCompanies] = await pool.query(
        "SELECT id_company FROM company WHERE id_user = ?",
        [user.id_user]
      );

      if (existingCompanies.length > 0) {
        console.log(`  ✅ Already has company ID: ${existingCompanies[0].id_company}`);
        continue;
      }

      // Check if there's a company with this name
      const [companiesByName] = await pool.query(
        "SELECT id_company FROM company WHERE nom = ?",
        [user.nom_entreprise]
      );

      if (companiesByName.length > 0) {
        // Link existing company to user
        const companyId = companiesByName[0].id_company;
        await pool.query("UPDATE company SET id_user = ? WHERE id_company = ?", [
          user.id_user,
          companyId,
        ]);
        console.log(`  ✅ Linked user to existing company ID: ${companyId}`);
        updated++;
      } else {
        // Create new company for this user
        const [result] = await pool.query(
          "INSERT INTO company (nom, id_user) VALUES (?, ?)",
          [user.nom_entreprise, user.id_user]
        );
        console.log(`  ✅ Created new company ID: ${result.insertId}`);
        created++;
      }
    }

    console.log(`\n=== MIGRATION COMPLETE ===`);
    console.log(`Updated: ${updated} companies`);
    console.log(`Created: ${created} new companies`);
    console.log(`Total processed: ${updated + created} users`);

  } catch (error) {
    console.error("❌ ERROR:", error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

migrateCompanyUserLink();
