const pool = require("./src/config/db");

async function checkJob12() {
  try {
    console.log("=== CHECKING JOB 12 ===\n");

    // Check if job 12 exists
    const [jobs] = await pool.query(
      "SELECT * FROM offre WHERE id_offre = 12"
    );

    if (jobs.length === 0) {
      console.log("❌ Job 12 NOT FOUND in database!");
    } else {
      const job = jobs[0];
      console.log("✅ Job 12 FOUND:");
      console.log(`   Title: ${job.titre}`);
      console.log(`   Company: ${job.id_entreprise}`);
      console.log(`   Status: ${job.statut}`);
      console.log(`   Created: ${job.date_pub}`);
    }

    console.log("\n=== ALL JOBS IN DATABASE ===\n");
    const [allJobs] = await pool.query(
      "SELECT id_offre, titre, id_entreprise, statut FROM offre ORDER BY id_offre DESC"
    );
    
    allJobs.forEach(job => {
      console.log(`Job ${job.id_offre}: "${job.titre}" | Company: ${job.id_entreprise} | Status: ${job.statut}`);
    });

  } catch (error) {
    console.error("❌ ERROR:", error);
  } finally {
    await pool.end();
  }
}

checkJob12();
