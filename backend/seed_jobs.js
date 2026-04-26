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

const jobsToInsert = [
  {
    titre: "Senior Full-Stack Developer",
    type_contrat: "CDI",
    localisation: "Tunisia",
    description: "Exciting opportunity for Senior Full-Stack Developer position",
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
    description: "Exciting opportunity for UX/UI Designer position",
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
    description: "Exciting opportunity for Data Scientist position",
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
    description: "Exciting opportunity for Project Manager position",
    salaire: 3500.00,
    experience: "2+ years",
    date_pub: "2026-01-15",
    statut: "FERME",
    nombre_vues: 0,
    date_expiration: "2026-04-15",
    id_entreprise: 15
  }
];

async function seedJobs() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");

    for (const job of jobsToInsert) {
      try {
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

    await connection.release();
    console.log("\n✅ All jobs have been seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

seedJobs();
