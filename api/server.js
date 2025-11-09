// ✅ api/server.js — Node.js (CommonJS) version for Vercel

const express = require("express");
const cors = require("cors");
const updateCarbonData = require("./updateCarbonData"); // Ensure this file exists in /api folder

const app = express();

// ✅ Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ Test route (for checking server health)
app.get("/", (req, res) => {
  res.json({ message: "EcoOps 360 Carbon API is running 🚀" });
});

// ✅ Main route: update carbon data
app.get("/api/update-carbon", async (req, res) => {
  try {
    console.log("🔄 Updating carbon data...");
    await updateCarbonData();
    console.log("✅ Carbon data updated successfully");
    res.json({ message: "Carbon data updated successfully" });
  } catch (error) {
    console.error("❌ Error updating carbon data:", error);
    res.status(500).json({ error: "Failed to update carbon data" });
  }
});

// ✅ Export app for Vercel
module.exports = app;
