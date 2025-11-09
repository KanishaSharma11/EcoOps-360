// ✅ api/updateCarbonData.js — FIXED for Vercel (Node 18+, CommonJS)

const admin = require("firebase-admin");

// ✅ Dynamic import for node-fetch (since it's ESM)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// ✅ Parse Firebase credentials
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// ✅ Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ✅ Region mapping
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

// ✅ Fetch and update data in Firestore
async function updateCarbonData() {
  const ElectricityAPIKey = process.env.ElectricityAPIKey;

  if (!ElectricityAPIKey) throw new Error("Missing ELECTRICITYMAP_API_KEY");
  if (!process.env.FIREBASE_SERVICE_ACCOUNT)
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");

  for (const [region, code] of Object.entries(regions)) {
    try {
      console.log(`🌍 Fetching data for ${region} (${code})`);

      const response = await fetch(
        `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${code}`,
        {
          headers: { "auth-token": ElectricityAPIKey },
        }
      );

      if (!response.ok) {
        console.error(`❌ Failed to fetch data for ${region} (${response.status})`);
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
