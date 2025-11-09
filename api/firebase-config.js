// This is a pure Vercel Serverless Function, no Express needed.

// Standard handler function for Vercel. 
// Vercel routes the public URL /api/firebase-config to this function.
export default function handler(req, res) {
  
  // Set CORS headers manually to allow your front-end (even on a different domain/port) to fetch this config.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS requests from the browser
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // OPTIONAL: Basic check for environment variables to return a useful server error.
  if (!process.env.VITE_FIREBASE_API_KEY) {
      res.status(500).json({ error: "Server error: Firebase API Key not configured in Vercel environment variables." });
      return;
  }

  // Return the environment variables as a JSON payload
  res.status(200).json({
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
  });
}
