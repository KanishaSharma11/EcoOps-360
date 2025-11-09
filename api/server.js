// ✅ api/server.js — Express + Vercel (CommonJS)
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
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
  console.log("✅ Health check called");
  res.status(200).json({ message: "EcoOps 360 Carbon API is running 🚀" });
});

// ✅ Route to trigger carbon data update
app.get("/api/update-carbon", async (req, res) => {
  try {
    console.log("🔄 Updating carbon data...");
    await updateCarbonData();
    console.log("✅ Carbon data updated successfully");
    res.status(200).json({ message: "Carbon data updated successfully" });
  } catch (error) {
    console.error("❌ Error updating carbon data:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to update carbon data" });
  }
});

// ✅ Export as serverless handler for Vercel
module.exports = serverless(app);
