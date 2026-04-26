#!/usr/bin/env node
/**
 * Enhanced Backend Server with Debugging
 * This script starts the backend with detailed logging
 */

require("dotenv").config();
const app = require("./src/app");
const config = require("./src/config/env");

const PORT = config.PORT || 5000;

// Add request logging
app.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.path}`);
  
  // Log response status
  const originalJson = res.json;
  res.json = function(data) {
    console.log(`✅ Response: ${res.statusCode}`);
    return originalJson.call(this, data);
  };
  
  next();
});

// Start server
const server = app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 SERVER STARTED");
  console.log("=".repeat(60));
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log("=".repeat(60) + "\n");
});

// Error handling
server.on("error", (error) => {
  console.error("❌ Server error:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("SIGTERM", () => {
  console.log("\n✋ Shutting down server...");
  server.close(() => {
    process.exit(0);
  });
});

console.log("💡 Type CTRL+C to stop the server");
console.log("💡 All API requests will be logged above\n");
