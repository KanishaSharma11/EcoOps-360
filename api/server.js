// ✅ api/server.js — Debug version for Vercel
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const updateCarbonData = require("./updateCarbonData");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ Health check
app.get("/", (req, res) => {
  console.log("✅ Health check route hit");
  res.status(200).json({ message: "EcoOps 360 Carbon API is running 🚀" });
});

// ✅ Main update route
app.get("/api/update-carbon", async (req, res) => {
  console.log("⚙️ /api/update-carbon endpoint called");

  try {
    // Log important environment variables
    console.log("🧩 Checking environment variables...");
    console.log("ELECTRICITYMAP_API_KEY exists:", !!process.env.ELECTRICITYMAP_API_KEY);
    console.log("FIREBASE_SERVICE_ACCOUNT exists:", !!process.env.FIREBASE_SERVICE_ACCOUNT);

    await updateCarbonData();

    console.log("✅ Carbon data updated successfully");
    res.status(200).json({ message: "Carbon data updated successfully" });
  } catch (error) {
    console.error("❌ Server crashed inside update-carbon route:");
    console.error(error);

    res.status(500).json({
      error: "Failed to update carbon data",
      details: error.message || error.toString(),
    });
  }
});

// ✅ Export for Vercel
module.exports = serverless(app);
