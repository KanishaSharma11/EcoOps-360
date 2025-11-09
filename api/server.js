// ✅ api/server.js — Express for Vercel (CommonJS)

const express = require("express");
const cors = require("cors");
const updateCarbonData = require("./updateCarbonData");

const app = express();

// ✅ Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({ message: "EcoOps 360 Carbon API is running 🚀" });
});

// ✅ Update carbon data route
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

// ✅ Convert Express app into a handler Vercel understands
const serverless = require("serverless-http");
module.exports = serverless(app);
