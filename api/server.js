// ✅ api/index.js — Node.js (CommonJS) version for Vercel

const express = require("express");
const cors = require("cors");
const updateCarbonData = require("./updateCarbonData"); // adjust path if needed

const app = express();

// ✅ Allow all origins (for local dev only)
app.use(cors());

app.get("/update-carbon", async (req, res) => {
  try {
    await updateCarbonData();
    res.json({ message: "Carbon data updated successfully" });
  } catch (error) {
    console.error("Error updating carbon data:", error);
    res.status(500).json({ error: "Failed to update carbon data" });
  }
});

// ✅ Export the Express app (Vercel automatically creates a serverless function)
module.exports = app;
