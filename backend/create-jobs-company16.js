const pool = require("./src/config/db");

async function createJobsForCompany16() {
  try {
    console.log("=== CREATING JOBS FOR COMPANY 16 (AEROS) ===\n");

    const jobs = [
      {
        titre: "UX/UI Designer",
        type_contrat: "CDI",
        localisation: "Tunisia",
        description: "Exciting opportunity for UX/UI Designer position",
        salaire: 3000,
        experience: "2+ years",
        date_pub: "2026-02-11",
        date_expiration: "2026-05-11",
        statut: "OUVERT",
        id_entreprise: 16
      },
      {
        titre: "Data Scientist",
        type_contrat: "CDI",
        localisation: "Tunisia",
        description: "Exciting opportunity for Data Scientist position",
        salaire: 4000,
        experience: "2+ years",
        date_pub: "2026-02-10",
        date_expiration: "2026-05-10",
        statut: "OUVERT",
        id_entreprise: 16
      },
      {
        titre: "Project Manager",
        type_contrat: "CDI",
        localisation: "Tunisia",
        description: "Exciting opportunity for Project Manager position",
        salaire: 3500,
        experience: "2+ years",
        date_pub: "2026-01-15",
        date_expiration: "2026-04-15",
        statut: "FERME",
        id_entreprise: 16
      }
    ];

    let createdCount = 0;

    for (const job of jobs) {
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
          job.titre,
          job.type_contrat,
          job.localisation,
          job.description,
          job.salaire,
          job.experience,
          job.date_pub,
          job.statut,
          job.id_entreprise,
          job.date_expiration
        ]
      );

      console.log(`✅ Created Job ${result.insertId}: ${job.titre}`);
      createdCount++;
    }

    console.log(`\n=== TOTAL CREATED: ${createdCount} JOBS ===`);

  } catch (error) {
    console.error("❌ ERROR:", error);
  } finally {
    await pool.end();
  }
}

createJobsForCompany16();
