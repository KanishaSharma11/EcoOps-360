// ✅ api/server2.js — Gemini API backend for Vercel (Node.js CommonJS version)

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

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

if (!GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in environment variables!");
}

// ✅ Route handler for Gemini model
app.post("/api/gemini", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing 'message' in request body." });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
      contents: [
        ...(Array.isArray(history) ? history : []),
        { role: "user", parts: [{ text: message }] },
      ],
    };

    // 🔗 Call Gemini API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // 🔍 Log for debugging in Vercel
    console.log("🌍 Gemini API Request Payload:", JSON.stringify(payload, null, 2));
    console.log("🤖 Gemini API Raw Response:", JSON.stringify(data, null, 2));

    // ✅ Handle API-level errors (Google returns `error` object)
    if (data.error) {
      console.error("🚨 Gemini API Error:", data.error);
      return res.status(500).json({ error: data.error });
    }

    res.json(data);
  } catch (err) {
    console.error("💥 Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Export for Vercel serverless deployment
module.exports = app;
