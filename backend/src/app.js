const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
require("dotenv").config();

const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

/* ========================
   CORS CONFIGURATION
======================== */

app.use(
  cors({
    origin: true, // allow all localhost dev ports (5173, 5174, 5175...)
    credentials: true,
  })
);

/* ========================
   GLOBAL MIDDLEWARES
======================== */

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sanitizeMiddleware = require("./middlewares/sanitize.middleware");
app.use(sanitizeMiddleware);

/* ========================
   STATIC FILES
======================== */

const UPLOADS_PATH = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(UPLOADS_PATH));
console.log("Serving uploads from:", UPLOADS_PATH);
/* ========================
   API ROUTES
======================== */

app.use("/api", routes);

/* ========================
   ROOT ROUTE
======================== */

app.get("/", (req, res) => {
  res.json({
    message: "PFE Recruitment API Server",
    version: "1.0.0",
    status: "running",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      jobs: "/api/jobs",
      applications: "/api/applications",
      companies: "/api/companies",
      interviews: "/api/interviews",
      visas: "/api/visas"
    }
  });
});

/* ========================
   ERROR HANDLING
======================== */

app.use(errorMiddleware);

module.exports = app;