import express from "express";
import cors from "cors";
import  updateCarbonData  from "./updateCarbonData.js";

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

export default app;
