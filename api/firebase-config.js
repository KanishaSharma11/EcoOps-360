import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

// FIX APPLIED: Changed the route from "/api/firebase-config" to "/"
// When Vercel routes the request for "/api/firebase-config" to this function,
// the path seen by Express is just "/" (the root of the function).
app.get("/", (req, res) => {
  res.json({
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
  });
});

export default app;
