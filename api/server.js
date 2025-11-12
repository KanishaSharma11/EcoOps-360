// ✅ api/server.js — Full Debug Version for Vercel
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const updateCarbonData = require("./updateCarbonData.js");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ Health check route
app.get("/", (req, res) => {
  console.log("✅ Health check route hit");
  res.status(200).json({ message: "EcoOps 360 Carbon API is running 🚀" });
});

// ✅ Carbon update route (simplified path)
app.get("/update-carbon", async (req, res) => {
  console.log("⚙️ /update-carbon endpoint called");

  try {
    console.log("🧩 Checking environment variables...");
    console.log("ElectricityAPIKey exists:", !!process.env.ElectricityAPIKey);
    console.log("FIREBASE_SERVICE_ACCOUNT exists:", !!process.env.FIREBASE_SERVICE_ACCOUNT);

    console.log("🚀 Starting updateCarbonData()...");
    await updateCarbonData();
    console.log("✅ Finished updateCarbonData() successfully");

    res.status(200).json({ message: "Carbon data updated successfully ✅" });
  } catch (error) {
    console.error("❌ Error inside /update-carbon route:", error);
    res.status(500).json({
      error: "Failed to update carbon data",
      details: error.message || error.toString(),
    });
  }
});

// ✅ Export for Vercel
module.exports = serverless(app);
