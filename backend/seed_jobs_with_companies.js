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

const companies = [
  {
    id_company: 12,
    nom: "Tech Corp 1",
    secteur: "Technology",
    email: "company1@techcorp.com"
  },
  {
    id_company: 13,
    nom: "Design Studio",
    secteur: "Design",
    email: "company2@designstudio.com"
  },
  {
    id_company: 14,
    nom: "Data Analytics Inc",
    secteur: "Analytics",
    email: "company3@dataanalytics.com"
  },
  {
    id_company: 15,
    nom: "Project Solutions",
    secteur: "Consulting",
    email: "company4@projectsolutions.com"
  }
];

const jobsToInsert = [
  {
    titre: "Senior Full-Stack Developer",
    type_contrat: "CDI",
    localisation: "Tunisia",
    description: "Exciting opportunity for Senior Full-Stack Developer position with modern tech stack",
    salaire: 5000.00,
    experience: "2+ years",
    date_pub: "2026-02-12",
    statut: "OUVERT",
    nombre_vues: 0,
    date_expiration: "2026-05-12",
    id_entreprise: 12
  },
  {
    titre: "UX/UI Designer",
    type_contrat: "CDI",
    localisation: "Tunisia",
    description: "Exciting opportunity for UX/UI Designer position creating beautiful user experiences",
    salaire: 3000.00,
    experience: "2+ years",
    date_pub: "2026-02-11",
    statut: "OUVERT",
    nombre_vues: 0,
    date_expiration: "2026-05-11",
    id_entreprise: 13
  },
  {
    titre: "Data Scientist",
    type_contrat: "CDI",
    localisation: "Tunisia",
    description: "Exciting opportunity for Data Scientist position working with machine learning models",
    salaire: 4000.00,
    experience: "2+ years",
    date_pub: "2026-02-10",
    statut: "OUVERT",
    nombre_vues: 0,
    date_expiration: "2026-05-10",
    id_entreprise: 14
  },
  {
    titre: "Project Manager",
    type_contrat: "CDI",
    localisation: "Tunisia",
    description: "Exciting opportunity for Project Manager position leading cross-functional teams",
    salaire: 3500.00,
    experience: "2+ years",
    date_pub: "2026-01-15",
    statut: "FERME",
    nombre_vues: 0,
    date_expiration: "2026-04-15",
    id_entreprise: 15
  }
];

async function seedData() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ Database connected successfully");

    // First, create companies if they don't exist
    console.log("\n📝 Creating companies...");
    for (const company of companies) {
      try {
        // Check if company exists
        const [existing] = await connection.execute(
          "SELECT id_company FROM company WHERE id_company = ?",
          [company.id_company]
        );

        if (existing.length > 0) {
          console.log(`✅ Company already exists: ${company.nom} (ID: ${company.id_company})`);
          continue;
        }

        // Insert company
        const [result] = await connection.execute(
          "INSERT INTO company (id_company, nom, secteur) VALUES (?, ?, ?)",
          [company.id_company, company.nom, company.secteur]
        );
        
        console.log(`✅ Created company: ${company.nom} (ID: ${company.id_company})`);
      } catch (error) {
        console.error(`⚠️  Error creating company "${company.nom}":`, error.message);
      }
    }

    // Now insert jobs
    console.log("\n📝 Inserting jobs...");
    for (const job of jobsToInsert) {
      try {
        // Check if job already exists
        const [existing] = await connection.execute(
          "SELECT id_offre FROM offre WHERE titre = ? AND id_entreprise = ?",
          [job.titre, job.id_entreprise]
        );

        if (existing.length > 0) {
          console.log(`✅ Job already exists: ${job.titre} (ID: ${existing[0].id_offre})`);
          continue;
        }

        const query = `
          INSERT INTO offre 
          (titre, type_contrat, localisation, description, salaire, experience, date_pub, statut, nombre_vues, date_expiration, id_entreprise) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
          job.titre,
          job.type_contrat,
          job.localisation,
          job.description,
          job.salaire,
          job.experience,
          job.date_pub,
          job.statut,
          job.nombre_vues,
          job.date_expiration,
          job.id_entreprise
        ];

        const [result] = await connection.execute(query, values);
        console.log(`✅ Inserted job: ${job.titre} (ID: ${result.insertId})`);
      } catch (error) {
        console.error(`❌ Error inserting job "${job.titre}":`, error.message);
      }
    }

    console.log("\n✅ All data has been seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.release();
  }
}

seedData();
