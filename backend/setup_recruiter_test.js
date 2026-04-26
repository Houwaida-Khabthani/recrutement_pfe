const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
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

async function setupRecruiterTestAccount() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ Database connected successfully\n");

    // First create companies if they don't exist
    const companies = [
      { id: 12, nom: "Tech Corp 1", email: "company1@techcorp.com" },
      { id: 13, nom: "Design Studio", email: "company2@designstudio.com" },
      { id: 14, nom: "Data Analytics Inc", email: "company3@dataanalytics.com" },
      { id: 15, nom: "Project Solutions", email: "company4@projectsolutions.com" }
    ];

    console.log("📝 Ensuring companies exist...");
    for (const company of companies) {
      const [existing] = await connection.execute(
        "SELECT id_company FROM company WHERE id_company = ?",
        [company.id]
      );

      if (existing.length === 0) {
        await connection.execute(
          "INSERT INTO company (id_company, nom, secteur) VALUES (?, ?, ?)",
          [company.id, company.nom, "Technology"]
        );
        console.log(`✅ Created company: ${company.nom} (ID: ${company.id})`);
      } else {
        console.log(`✅ Company exists: ${company.nom} (ID: ${company.id})`);
      }
    }

    // Create a recruiter user
    console.log("\n📝 Creating recruiter test account...");
    const recruiterEmail = "recruiter@test.com";
    const recruiterPassword = "test123456";
    const hashedPassword = await bcrypt.hash(recruiterPassword, 10);

    // Check if recruiter exists
    const [existingRecruiter] = await connection.execute(
      "SELECT id_user FROM user WHERE email = ?",
      [recruiterEmail]
    );

    let recruiterId;
    if (existingRecruiter.length > 0) {
      recruiterId = existingRecruiter[0].id_user;
      console.log(`✅ Recruiter already exists: ${recruiterEmail} (ID: ${recruiterId})`);
    } else {
      const [result] = await connection.execute(
        `INSERT INTO user (nom, email, mot_de_passe, role, date_inscription) 
         VALUES (?, ?, ?, 'ENTREPRISE', NOW())`,
        ["Test Recruiter", recruiterEmail, hashedPassword]
      );
      recruiterId = result.insertId;
      console.log(`✅ Created recruiter: ${recruiterEmail} (ID: ${recruiterId})`);
    }

    // Link recruiter to company 12
    console.log("\n📝 Linking recruiter to company 12...");
    const [companyCheck] = await connection.execute(
      "SELECT id_user FROM company WHERE id_company = 12"
    );

    if (companyCheck[0]?.id_user === recruiterId) {
      console.log("✅ Recruiter already linked to company 12");
    } else {
      await connection.execute(
        "UPDATE company SET id_user = ? WHERE id_company = 12",
        [recruiterId]
      );
      console.log("✅ Recruiter linked to company 12");
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 Setup Complete!");
    console.log("=".repeat(60));
    console.log("\n📧 Login Credentials:");
    console.log(`   Email: ${recruiterEmail}`);
    console.log(`   Password: ${recruiterPassword}`);
    console.log("\n📌 What you can now do:");
    console.log("   1. Log in as the recruiter");
    console.log("   2. Go to Jobs page");
    console.log("   3. Edit or create jobs");
    console.log("   4. All jobs for company 12 will work");
    console.log("\n💡 The recruiter is linked to company: 12 (Tech Corp 1)");
    console.log("   Jobs in this company can now be edited:\n");
    
    const [companyjobs] = await connection.execute(
      "SELECT id_offre, titre FROM offre WHERE id_entreprise = 12"
    );
    
    if (companyjobs.length > 0) {
      companyjobs.forEach(job => {
        console.log(`   - ID ${job.id_offre}: ${job.titre}`);
      });
    }

    console.log("\n=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.release();
  }
}

setupRecruiterTestAccount();
