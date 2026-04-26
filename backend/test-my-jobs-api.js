const http = require("http");

function testApi() {
  console.log("=== TESTING /jobs/my-jobs API ===\n");
  console.log("⏳ Fetching from http://localhost:5000/api/jobs/my-jobs...\n");

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/jobs/my-jobs",
    method: "GET",
    headers: {
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJhZXJvc0BnbWFpbC5jb20iLCJyb2xlIjoiRU5URVBSSVNFRSJ9.rWOwGfx3-PEL9wv2ShS2dYVp0zCRG5fk1jLPAbIfEqA",
      "Content-Type": "application/json",
    },
  };

  const req = http.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log(`Status: ${res.statusCode}\n`);
      try {
        const jobs = JSON.parse(data);
        console.log(`Found ${jobs.length} jobs:\n`);
        jobs.forEach((job) => {
          console.log(
            `  Job ${job.id_offre}: "${job.titre}" (Company: ${job.id_entreprise})`
          );
        });
        
        console.log("\n🔍 Looking for Job 12 (Senior Full Stack Developer)...");
        const job12 = jobs.find(j => j.id_offre === 12);
        if (job12) {
          console.log("✅ FOUND!");
        } else {
          console.log("❌ NOT FOUND in API response");
        }
      } catch (e) {
        console.log("Response:", data);
      }
    });
  });

  req.on("error", (error) => {
    console.error("Error:", error.message);
  });

  req.end();
}

testApi();
