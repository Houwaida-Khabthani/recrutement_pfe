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

async function debugLogin() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ Database connected\n");

    const email = "recruiter@test.com";
    const password = "test123456";

    console.log("📝 Step 1: Looking up user...");
    const [rows] = await connection.execute(
      "SELECT id_user, email, mot_de_passe, role, nom FROM user WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      console.log(`❌ User not found: ${email}`);
      console.log("\nLet me recreate the recruiter...");
      
      // Recreate recruiter
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await connection.execute(
        `INSERT INTO user (nom, email, mot_de_passe, role, date_inscription) 
         VALUES (?, ?, ?, 'ENTREPRISE', NOW())`,
        ["Test Recruiter", email, hashedPassword]
      );
      
      console.log(`✅ Recreated recruiter with ID: ${result.insertId}`);
      
      // Query again
      const [newRows] = await connection.execute(
        "SELECT id_user, email, mot_de_passe, role, nom FROM user WHERE email = ?",
        [email]
      );
      rows.push(newRows[0]);
    }

    const user = rows[0];
    console.log(`✅ User found: ${user.nom} (ID: ${user.id_user})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Hashed password length: ${user.mot_de_passe.length} chars`);

    console.log("\n📝 Step 2: Verifying password...");
    const isMatch = await bcrypt.compare(password, user.mot_de_passe);
    
    if (!isMatch) {
      console.log(`❌ Password mismatch!`);
      console.log(`   Input: "${password}"`);
      console.log(`   Stored hash: ${user.mot_de_passe.substring(0, 20)}...`);
      console.log("\n💡 This might mean:");
      console.log("   1. Password was stored incorrectly");
      console.log("   2. Different password was used");
      return;
    }

    console.log(`✅ Password verified correctly!`);

    console.log("\n📝 Step 3: Simulating JWT creation...");
    console.log(`   JWT payload would be:`);
    console.log(`   {`);
    console.log(`     id_user: ${user.id_user},`);
    console.log(`     role: "${user.role}",`);
    console.log(`     email: "${user.email}"`);
    console.log(`   }`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ Login flow should work!");
    console.log("=".repeat(60));

    console.log("\n🔑 Credentials that work:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

    console.log("\n⚠️ Still getting 500 error? Check:");
    console.log("   1. Backend server is actually running");
    console.log("   2. Backend console shows error details");
    console.log("   3. Network tab shows actual error response");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) await connection.release();
  }
}

console.log("🧪 Testing Login Flow\n");
debugLogin();
