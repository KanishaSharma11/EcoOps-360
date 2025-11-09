// ✅ api/gemini.js — Node.js (CommonJS) version for Vercel

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();

// ✅ Middleware setup
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(bodyParser.json());

// ✅ Gemini API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ✅ Route handler for Gemini model
app.post("/api/gemini", async (req, res) => {
  try {
    const { message, history } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            ...(history || []),
            { role: "user", parts: [{ text: message }] },
          ],
        }),
      }
    );

    const data = await response.json();

    // 🔍 Log Gemini response for debugging in Vercel logs
    console.log("Gemini API Raw Response:", JSON.stringify(data, null, 2));

    res.json(data);
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Gemini connection failed." });
  }
});

// ✅ Export for Vercel serverless function
module.exports = app;
