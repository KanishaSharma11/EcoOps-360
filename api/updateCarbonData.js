// ✅ updateCarbonData.js — fixed CommonJS version for Vercel

const fetch = require("node-fetch");
const admin = require("firebase-admin");

// ✅ Check Firebase credentials
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("❌ Missing FIREBASE_SERVICE_ACCOUNT env variable.");
  throw new Error("FIREBASE_SERVICE_ACCOUNT not set");
}

// ✅ Parse service account JSON
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (err) {
  console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:", err);
  throw err;
}

// ✅ Initialize Firebase Admin once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ✅ Define regions
const regions = {
  "US-Central1": "US-MIDW-MISO",
  "Europe-West1": "DE",
  "Asia-South1": "IN-WE",
  "Australia-SE1": "AU-NSW",
  "NorthAmerica-Northeast1": "CA-QC",
  "SouthAmerica-East1": "BR-CS",
  "Africa-South1": "ZA",
  "Me-Central2": "SA",
  "Asia-Northeast2": "JP-KN",
};

// ✅ Fetch and update Firestore
async function updateCarbonData() {
  const ElectricityAPIKey = process.env.ElectricityAPIKey;

  if (!ElectricityAPIKey) {
    console.error("❌ Missing ELECTRICITYMAP_API_KEY env variable");
    throw new Error("Missing ELECTRICITYMAP_API_KEY");
  }

  for (const [region, code] of Object.entries(regions)) {
    try {
      const response = await fetch(
        `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${code}`,
        {
          headers: { "auth-token": ElectricityAPIKey },
        }
      );

      if (!response.ok) {
        console.error(`❌ Failed to fetch data for ${region}`);
        continue;
      }

      const data = await response.json();
      const intensityValue = data.carbonIntensity || 0;

      let intensityLevel = "Low";
      if (intensityValue > 170) intensityLevel = "Medium";
      if (intensityValue >= 350) intensityLevel = "High";

      await db.collection("carbon-regions").doc(region).set({
        name: region,
        intensityValue,
        intensityLevel,
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ Updated ${region}: ${intensityValue} gCO₂/kWh (${intensityLevel})`);
    } catch (error) {
      console.error(`⚠️ Error updating ${region}:`, error);
    }
  }
}

module.exports = updateCarbonData;
