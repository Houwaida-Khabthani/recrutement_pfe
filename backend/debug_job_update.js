const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function debugJobUpdate() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ Database connected\n");

    // Test 1: Check recruiter exists
    console.log("📝 Test 1: Checking recruiter...");
    const [recruiters] = await connection.execute(
      "SELECT id_user, email, role FROM user WHERE email = 'recruiter@test.com'"
    );
    if (recruiters.length === 0) {
      console.log("❌ Recruiter not found!");
      return;
    }
    const recruiter = recruiters[0];
    console.log(`✅ Recruiter found: ${recruiter.email} (ID: ${recruiter.id_user}, Role: ${recruiter.role})`);

    // Test 2: Check company link
    console.log("\n📝 Test 2: Checking company link...");
    const [company] = await connection.execute(
      "SELECT id_company, id_user, nom FROM company WHERE id_user = ?",
      [recruiter.id_user]
    );
    if (company.length === 0) {
      console.log("❌ Company not linked to recruiter!");
      return;
    }
    console.log(`✅ Company found: ${company[0].nom} (ID: ${company[0].id_company})`);

    // Test 3: Check if job exists
    console.log("\n📝 Test 3: Checking job...");
    const [job] = await connection.execute(
      "SELECT id_offre, titre, id_entreprise, description FROM offre WHERE id_offre = 6"
    );
    if (job.length === 0) {
      console.log("❌ Job 6 not found!");
      return;
    }
    console.log(`✅ Job found: ${job[0].titre}`);
    console.log(`   Current: Description="${job[0].description}"`);
    console.log(`   Company: ${job[0].id_entreprise}`);

    // Test 4: Verify authorization would work
    console.log("\n📝 Test 4: Checking authorization...");
    if (job[0].id_entreprise === company[0].id_company) {
      console.log(`✅ Authorization would pass (Job company ${job[0].id_entreprise} matches recruiter company ${company[0].id_company})`);
    } else {
      console.log(`❌ Authorization would fail! Job company ${job[0].id_entreprise} doesn't match recruiter company ${company[0].id_company}`);
      return;
    }

    // Test 5: Try the actual update
    console.log("\n📝 Test 5: Testing update query...");
    try {
      const updateData = {
        titre: "Senior Full-Stack Developer",
        type_contrat: "CDI",
        localisation: "Tunisia",
        description: "Updated description - this is a test update",
        salaire: 5000.00,
        experience: "2+ years",
        date_expiration: "2026-05-12",
        statut: "OUVERT"
      };

      // Build the update query
      const allowedFields = ['titre', 'type_contrat', 'localisation', 'description', 'salaire', 'experience', 'date_expiration', 'statut'];
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
      values.push(6); // Job ID

      const query = `UPDATE offre SET ${fields.join(", ")} WHERE id_offre = ?`;
      console.log(`   Query: ${query}`);
      
      const [result] = await connection.execute(query, values);
      console.log(`✅ Update executed successfully!`);
      console.log(`   Affected rows: ${result.affectedRows}`);
      
      if (result.affectedRows > 0) {
        console.log("✅ Job updated!");
        
        // Verify the update
        const [updated] = await connection.execute(
          "SELECT description FROM offre WHERE id_offre = 6"
        );
        console.log(`   New description: "${updated[0].description}"`);
      } else {
        console.log("❌ No rows affected - something went wrong");
      }
    } catch (error) {
      console.log(`❌ Update failed: ${error.message}`);
      throw error;
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ All checks passed!");
    console.log("=".repeat(60));
    console.log("\nIf the API still returns 500:");
    console.log("1. Make sure the backend server is running (npm run dev)");
    console.log("2. Check the backend console for error messages");
    console.log("3. Try refreshing the page and logging in again");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\nThis error suggests:");
    if (error.message.includes("Unknown column")) {
      console.error("- Database schema mismatch or column doesn't exist");
    } else if (error.message.includes("Connection")) {
      console.error("- Database connection issue");
    }
    process.exit(1);
  } finally {
    if (connection) await connection.release();
  }
}

console.log("🧪 Testing Job Update Flow\n");
debugJobUpdate();
