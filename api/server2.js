import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST"], allowedHeaders: ["Content-Type"] }));
app.use(bodyParser.json());
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
app.post("/api/gemini", async (req, res) => {
  try {
    const { message, history } = req.body;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            ...history,
            { role: "user", parts: [{ text: message }] },
          ],
        }),
      }
    );

    const data = await response.json();

    // 🔍 Add this log to inspect what Gemini actually returns
    console.log("Gemini API Raw Response:", JSON.stringify(data, null, 2));

    res.json(data);
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Gemini connection failed." });
  }
});

export default app;
